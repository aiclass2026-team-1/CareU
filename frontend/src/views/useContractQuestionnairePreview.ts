import { ref, computed, onMounted } from 'vue'
import {
  adaptTargetQuestionnairePlan,
  adaptTargetAnswersToSubmission,
} from '@/adapters/questionnaireAdapter'
import { mockQuestionnaireService } from '@/services/mockQuestionnaireService'
import type { QuestionnaireRequestStatus } from '@/services/questionnaireService'
import type { QuestionnaireAnswerValue, TargetQuestionnaireSubmissionPayload, TargetQuestionnairePlan } from '@/types'

export function useContractQuestionnairePreview() {
  const planStatus = ref<QuestionnaireRequestStatus>('idle')
  const submissionStatus = ref<QuestionnaireRequestStatus>('idle')
  const errorMessage = ref<string | null>(null)

  const rawPlan = ref<TargetQuestionnairePlan | null>(null)
  const viewModel = computed(() => {
    if (!rawPlan.value) {
      return adaptTargetQuestionnairePlan({ reportId: null, mode: 'full', recognizedMetrics: [], missingMetrics: [], questions: [] })
    }
    return adaptTargetQuestionnairePlan(rawPlan.value)
  })

  const groupKeys = computed(() => {
    const keys: string[] = []
    viewModel.value.questions.forEach(q => {
      const gk = q.groupKey || 'default'
      if (!keys.includes(gk)) keys.push(gk)
    })
    return keys
  })

  const currentGroupIndex = ref(0)
  const totalGroups = computed(() => groupKeys.value.length)
  const currentGroupKey = computed(() => groupKeys.value[currentGroupIndex.value] || 'default')
  const currentGroupQuestions = computed(() => viewModel.value.questions.filter(q => (q.groupKey || 'default') === currentGroupKey.value))
  const progressPercent = computed(() => Math.round(((currentGroupIndex.value + 1) / totalGroups.value) * 100))

  const rawAnswers = ref<Record<number, { value: QuestionnaireAnswerValue; detailText?: string }>>({})

  onMounted(async () => {
    planStatus.value = 'loading'
    errorMessage.value = null
    try {
      rawPlan.value = await mockQuestionnaireService.getPlan({ mode: 'full', reportId: null })
      planStatus.value = 'success'
      viewModel.value.questions.forEach(q => {
        rawAnswers.value[q.id] = { value: q.controlType === 'multi_choice' ? [] : '' }
      })
    } catch (err: any) {
      planStatus.value = 'error'
      errorMessage.value = err?.message || 'PLAN_LOAD_FAILED'
    }
  })

  const validationMessage = ref('')
  const isCurrentGroupValid = computed(() => {
    for (const q of currentGroupQuestions.value) {
      if (!q.required) continue
      const ans = rawAnswers.value[q.id]
      if (!ans) return false
      if (q.controlType === 'multi_choice') {
        const arr = ans.value as (string | number)[]
        if (!arr || arr.length === 0) return false
        for (const optKey of arr) {
          const opt = q.options.find(o => o.key === optKey)
          if (opt?.detailInput?.required && !ans.detailText?.trim()) return false
        }
      } else {
        if (ans.value === '' || ans.value === undefined || ans.value === null) return false
      }
    }
    return true
  })

  const setSingle = (id: number, key: string | number) => { rawAnswers.value[id] = { value: key }; validationMessage.value = '' }
  const setNum = (id: number, val: string | number) => { rawAnswers.value[id] = { value: val }; validationMessage.value = '' }
  const toggleMulti = (id: number, optKey: string | number, isEx?: boolean) => {
    const cur = rawAnswers.value[id] || { value: [] }
    let arr = Array.isArray(cur.value) ? [...(cur.value as (string | number)[])] : []
    if (isEx) {
      arr = arr.includes(optKey) ? [] : [optKey]
    } else {
      const q = viewModel.value.questions.find(i => i.id === id)
      const exKeys = q?.options.filter(o => o.exclusive).map(o => o.key) || []
      arr = arr.filter(k => !exKeys.includes(k))
      arr = arr.includes(optKey) ? arr.filter(k => k !== optKey) : [...arr, optKey]
    }
    rawAnswers.value[id] = { ...cur, value: arr as QuestionnaireAnswerValue }
    validationMessage.value = ''
  }
  const updateDetail = (id: number, text: string) => {
    rawAnswers.value[id] = { ...(rawAnswers.value[id] || { value: [] }), detailText: text }
    validationMessage.value = ''
  }
  const handlePrev = () => { if (currentGroupIndex.value > 0) { currentGroupIndex.value--; validationMessage.value = '' } }

  const isComplete = ref(false)
  const submissionPayload = ref<TargetQuestionnaireSubmissionPayload | null>(null)
  const handleNext = async () => {
    if (!isCurrentGroupValid.value) {
      validationMessage.value = '請完成這個步驟的必填項目後再繼續。'
      return
    }
    validationMessage.value = ''
    if (currentGroupIndex.value < totalGroups.value - 1) {
      currentGroupIndex.value++
    } else {
      const payload = adaptTargetAnswersToSubmission(viewModel.value.reportId, viewModel.value.mode, rawAnswers.value)
      submissionStatus.value = 'loading'
      errorMessage.value = null
      try {
        await mockQuestionnaireService.submitAnswers(payload)
        submissionStatus.value = 'success'
        submissionPayload.value = payload
        isComplete.value = true
      } catch (err: any) {
        submissionStatus.value = 'error'
        errorMessage.value = err?.message || 'SUBMISSION_FAILED'
        validationMessage.value = '作答提交失敗，請重試。'
      }
    }
  }
  const handleRestart = () => {
    isComplete.value = false
    submissionPayload.value = null
    currentGroupIndex.value = 0
    submissionStatus.value = 'idle'
    viewModel.value.questions.forEach(q => { rawAnswers.value[q.id] = { value: q.controlType === 'multi_choice' ? [] : '' } })
  }

  return {
    viewModel,
    planStatus,
    submissionStatus,
    errorMessage,
    currentGroupIndex,
    totalGroups,
    currentGroupQuestions,
    progressPercent,
    rawAnswers,
    validationMessage,
    isComplete,
    submissionPayload,
    setSingle,
    setNum,
    toggleMulti,
    updateDetail,
    handlePrev,
    handleNext,
    handleRestart,
  }
}
