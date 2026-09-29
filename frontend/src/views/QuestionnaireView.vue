<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ContractQuestionnairePreview from './ContractQuestionnairePreview.vue'
import { ref } from 'vue'
import networkBackImg from '@/assets/images/network-back.png'
import LoadingStageVisual from '@/components/visual/LoadingStageVisual.vue'
import DataCanvas from '@/components/visual/DataCanvas.vue'
import '@/assets/questionnaire/questionnaire.css'
import {
  useQuestionnaire,
  optionSets,
  allergyOptions,
} from './useQuestionnaire'

const dataCanvasRef = ref<InstanceType<typeof DataCanvas> | null>(null)
const networkBackRef = ref<HTMLElement | null>(null)
const appRef = ref<HTMLElement | null>(null)
const questionPanelRef = ref<HTMLElement | null>(null)
const analysisErrorRef = ref<HTMLElement | null>(null)

const route = useRoute()
const isContractFixture = computed(() => {
  return route.path === '/preview/questionnaire' && route.query.source === 'contract-fixture'
})

const {
  activeScreen,
  currentMode,
  currentQuestion,
  currentStep,
  answers,
  validationMessage,
  isSubmitting,
  panelAnimationKey,
  progressPercent,
  questionHeaderInfo,
  isCurrentStepValid,
  analysisStatusText,
  isAnalysisChanging,
  isAnalysisErrorVisible,
  isDemoPanelOpen,

  // Live Integration State & Handlers
  isLiveMode,
  isPlanLoading,
  planError,
  isLivePlanStep,
  isLiveCompleteStep,
  liveStepIndex,
  currentLiveGroupQuestions,
  rawAnswers,
  setLiveSingle,
  setLiveNum,
  toggleLiveNumUnknown,
  setLiveText,
  toggleLiveMulti,
  updateLiveDetail,
  isLiveMultiSelected,
  retryLoadPlan,



  updateBasicField,
  setSingleChoice,
  updateWaist,
  toggleWaistUnknown,
  cancelWaistUnknown,
  updateSystolic,
  updateDiastolic,
  toggleBpUnknown,
  cancelBpUnknown,
  toggleAllergy,
  updateAllergyOther,
  updateSafetyField,
  handlePrevious,
  handleNext,
  handleRetryAnalysis,
  handleReturnQuestionnaire,
  toggleDemoPanel,
  handleDemoAction,
} = useQuestionnaire({

  networkBackRef,
  appRef,
  questionPanelRef,
  analysisErrorRef,
})

const onPointerMove = (e: PointerEvent) => {
  dataCanvasRef.value?.handlePointerMove(e)
}

const onPointerLeave = () => {
  dataCanvasRef.value?.handlePointerLeave()
}
</script>

<template>
  <ContractQuestionnairePreview v-if="isContractFixture" />
  <div v-else class="questionnaire-container" @pointermove="onPointerMove" @pointerleave="onPointerLeave">
    <main class="app" id="app" ref="appRef">
      <DataCanvas ref="dataCanvasRef" :fullscreen="true" canvas-id="dataField" />
      <div class="network-layer network-layer--back" id="networkBack" ref="networkBackRef" aria-hidden="true">
        <img :src="networkBackImg" alt="" />
      </div>
      <div class="soft-orb soft-orb--one" aria-hidden="true"></div>
      <div class="soft-orb soft-orb--two" aria-hidden="true"></div>

      <!-- Questionnaire Screen -->
      <section
        class="screen"
        :class="{ 'is-active': activeScreen === 'question' }"
        id="questionScreen"
        aria-labelledby="questionTitle"
      >
        <div class="question-shell">
          <header class="question-header">
            <p class="eyebrow" id="questionSource">{{ questionHeaderInfo.eyebrow }}</p>
            <h1 id="questionTitle">{{ questionHeaderInfo.title }}</h1>
            <p id="questionIntro">{{ questionHeaderInfo.intro }}</p>
          </header>
          <div id="questionContent">
            <div class="progress-row" aria-label="問卷進度">
              <div class="progress-track">
                <div class="progress-fill" id="progressFill" :style="{ width: progressPercent + '%' }"></div>
              </div>
            </div>

            <div
              class="question-panel"
              id="questionPanel"
              ref="questionPanelRef"
              role="region"
              aria-live="polite"
              :key="panelAnimationKey"
            >
              <!-- Plan Loading State -->
              <div v-if="isPlanLoading" class="plan-loading-state" style="text-align: center; padding: 40px 0;">
                <p style="color: var(--muted); font-size: 1.1rem;">正在取得問卷題目，請稍候...</p>
              </div>

              <!-- Plan Error State -->
              <div v-else-if="planError" class="plan-error-state" style="text-align: center; padding: 30px 0;">
                <h2 style="color: #a6403a; margin-bottom: 12px;">載入問卷題目時發生問題</h2>
                <p style="color: var(--muted); margin-bottom: 24px;">{{ planError }}</p>
                <button class="button primary" type="button" @click="retryLoadPlan">重新載入問卷</button>
              </div>

              <!-- Step 1: Basic (Full Mode only) -->
              <div v-else-if="currentStep === 'basic'">
                <h2 id="activeQuestion" tabindex="-1">先提供幾項基本資料</h2>
                <div class="field-grid three basic-grid">
                  <label class="field">
                    <span class="field-label">年齡</span>
                    <input
                      class="text-input"
                      inputmode="numeric"
                      type="number"
                      min="1"
                      placeholder="歲"
                      :value="answers.basic?.age || ''"
                      @input="e => updateBasicField('age', (e.target as HTMLInputElement).value)"
                    />
                  </label>
                  <div class="field selection-field" role="group" aria-labelledby="basicSexLabel">
                    <span class="field-label" id="basicSexLabel">生理性別</span>
                    <div class="inline-options" role="radiogroup" aria-labelledby="basicSexLabel">
                      <button
                        type="button"
                        role="radio"
                        :aria-checked="answers.basic?.sex === 'female'"
                        class="choice-chip"
                        :class="{ 'is-checked': answers.basic?.sex === 'female' }"
                        @click="updateBasicField('sex', 'female')"
                      >
                        <span>女性</span>
                      </button>
                      <button
                        type="button"
                        role="radio"
                        :aria-checked="answers.basic?.sex === 'male'"
                        class="choice-chip"
                        :class="{ 'is-checked': answers.basic?.sex === 'male' }"
                        @click="updateBasicField('sex', 'male')"
                      >
                        <span>男性</span>
                      </button>
                      <button
                        type="button"
                        role="radio"
                        :aria-checked="answers.basic?.sex === 'other'"
                        class="choice-chip"
                        :class="{ 'is-checked': answers.basic?.sex === 'other' }"
                        @click="updateBasicField('sex', 'other')"
                      >
                        <span>其他</span>
                      </button>
                    </div>
                  </div>
                  <label class="field">
                    <span class="field-label">體重</span>
                    <input
                      class="text-input"
                      inputmode="decimal"
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="kg"
                      :value="answers.basic?.weight || ''"
                      @input="e => updateBasicField('weight', (e.target as HTMLInputElement).value)"
                    />
                  </label>
                </div>
              </div>



              <!-- Live Dynamic Plan Steps (Full / Supplement) -->
              <div v-else-if="isLiveMode && isLivePlanStep">

                <div v-for="q in currentLiveGroupQuestions" :key="q.id" class="question-block" style="margin-bottom: 28px;">
                  <h2 id="activeQuestion" tabindex="-1" style="margin-bottom: 12px;">
                    {{ q.questionText }} <span v-if="q.required" style="color: var(--coral);">*</span>
                  </h2>
                  <p v-if="q.scoringDesc" style="color: var(--muted); font-size: 0.9rem; margin-top: -6px; margin-bottom: 16px;">
                    {{ q.scoringDesc }}
                  </p>

                  <!-- Single Choice -->
                  <div v-if="q.controlType === 'single_choice'" class="option-grid" role="radiogroup">
                    <button
                      v-for="opt in q.options"
                      :key="opt.key"
                      type="button"
                      role="radio"
                      :aria-checked="rawAnswers[q.id]?.value === opt.key"
                      class="option"
                      :class="{ 'is-checked': rawAnswers[q.id]?.value === opt.key }"
                      @click="setLiveSingle(q.id, opt.key)"
                    >
                      <span class="option-mark" aria-hidden="true"></span>
                      <span>{{ opt.label }}</span>
                    </button>
                  </div>

                  <!-- Number Control -->
                  <div v-if="q.controlType === 'number'" class="field-grid measurement-fields single">
                    <div class="field-block">
                      <span class="field-label" v-if="q.numericConfig?.unit">{{ q.numericConfig.unit }}</span>
                      <input
                        class="text-input"
                        inputmode="decimal"
                        type="number"
                        :min="q.numericConfig?.min"
                        :max="q.numericConfig?.max"
                        :step="q.numericConfig?.step || 0.1"
                        :disabled="rawAnswers[q.id]?.value === q.numericConfig?.unknownOption?.key"
                        :value="rawAnswers[q.id]?.value === q.numericConfig?.unknownOption?.key ? '' : (rawAnswers[q.id]?.value ?? '')"
                        @input="e => setLiveNum(q.id, (e.target as HTMLInputElement).value)"
                        placeholder="請輸入數值"
                      />
                      <button
                        v-if="q.numericConfig?.unknownOption"
                        type="button"
                        role="checkbox"
                        :aria-checked="rawAnswers[q.id]?.value === q.numericConfig.unknownOption.key"
                        class="choice-chip unknown-row"
                        :class="{ 'is-checked': rawAnswers[q.id]?.value === q.numericConfig.unknownOption.key }"
                        @click="toggleLiveNumUnknown(q.id, q.numericConfig.unknownOption.key)"
                      >
                        <span>{{ q.numericConfig.unknownOption.label }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Text Control -->
                  <div v-if="q.controlType === 'text'" class="field-grid measurement-fields single">
                    <div class="field-block">
                      <input
                        class="text-input"
                        type="text"
                        :value="rawAnswers[q.id]?.value ?? ''"
                        @input="e => setLiveText(q.id, (e.target as HTMLInputElement).value)"
                        placeholder="請輸入內容 (如：120/80)"
                      />
                    </div>
                  </div>

                  <!-- Multi Choice Control -->
                  <div v-if="q.controlType === 'multi_choice'" class="option-grid" role="group">
                    <template v-for="opt in q.options" :key="opt.key">
                      <button
                        type="button"
                        role="checkbox"
                        :aria-checked="isLiveMultiSelected(q.id, opt.key)"
                        class="option check-option"
                        :class="{ 'is-checked': isLiveMultiSelected(q.id, opt.key) }"
                        @click="toggleLiveMulti(q.id, opt.key, opt.exclusive)"
                      >
                        <span class="option-mark" aria-hidden="true"></span>
                        <span>{{ opt.label }}</span>
                      </button>
                      <label v-if="opt.detailInput && isLiveMultiSelected(q.id, opt.key)" class="field other-field conditional-field">
                        <input
                          class="text-input"
                          type="text"
                          :placeholder="opt.detailInput.placeholder || '請輸入說明'"
                          :value="rawAnswers[q.id]?.detailText || ''"
                          @input="e => updateLiveDetail(q.id, (e.target as HTMLInputElement).value)"
                        />
                      </label>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Step: Diet -->
              <div v-else-if="currentStep === 'diet'">

                <h2 id="activeQuestion" tabindex="-1">每日蔬果攝取是否充足？</h2>
                <div class="option-grid" role="radiogroup" aria-labelledby="activeQuestion">
                  <button
                    v-for="(option, idx) in optionSets.diet"
                    :key="idx"
                    type="button"
                    role="radio"
                    :aria-checked="String(answers.diet) === String(idx)"
                    class="option"
                    :class="{ 'is-checked': String(answers.diet) === String(idx) }"
                    @click="setSingleChoice('diet', idx)"
                  >
                    <span class="option-mark" aria-hidden="true"></span>
                    <span>{{ option }}</span>
                  </button>
                </div>
              </div>


              <!-- Step: Activity -->
              <div v-else-if="currentStep === 'activity'">
                <h2 id="activeQuestion" tabindex="-1">每週中高強度活動總時數？</h2>
                <div class="option-grid" role="radiogroup" aria-labelledby="activeQuestion">
                  <button
                    v-for="(option, idx) in optionSets.activity"
                    :key="idx"
                    type="button"
                    role="radio"
                    :aria-checked="String(answers.activity) === String(idx)"
                    class="option"
                    :class="{ 'is-checked': String(answers.activity) === String(idx) }"
                    @click="setSingleChoice('activity', idx)"
                  >
                    <span class="option-mark" aria-hidden="true"></span>
                    <span>{{ option }}</span>
                  </button>
                </div>
              </div>

              <!-- Step: Sleep -->
              <div v-else-if="currentStep === 'sleep'">
                <h2 id="activeQuestion" tabindex="-1">近一個月主觀睡眠品質如何？</h2>
                <div class="option-grid" role="radiogroup" aria-labelledby="activeQuestion">
                  <button
                    v-for="(option, idx) in optionSets.sleep"
                    :key="idx"
                    type="button"
                    role="radio"
                    :aria-checked="String(answers.sleep) === String(idx)"
                    class="option"
                    :class="{ 'is-checked': String(answers.sleep) === String(idx) }"
                    @click="setSingleChoice('sleep', idx)"
                  >
                    <span class="option-mark" aria-hidden="true"></span>
                    <span>{{ option }}</span>
                  </button>
                </div>
              </div>

              <!-- Step: Measurements -->
              <div v-else-if="currentStep === 'measurements'">
                <h2 id="activeQuestion" tabindex="-1">補充目前知道的身體測量資料</h2>
                <div class="field-grid measurement-fields" :class="{ single: currentMode === 'supplement' }">
                  <div class="field-block">
                    <span class="field-label">腰圍實測值</span>
                    <input
                      class="text-input"
                      inputmode="decimal"
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="cm"
                      :value="answers.measurements?.waist || ''"
                      @focus="cancelWaistUnknown"
                      @input="e => updateWaist((e.target as HTMLInputElement).value)"
                    />
                    <button
                      type="button"
                      role="checkbox"
                      :aria-checked="Boolean(answers.measurements?.waistUnknown)"
                      class="choice-chip unknown-row"
                      :class="{ 'is-checked': answers.measurements?.waistUnknown }"
                      @click="toggleWaistUnknown(!answers.measurements?.waistUnknown)"
                    >
                      <span>目前不知道</span>
                    </button>
                  </div>
                  <div v-if="currentMode === 'full'" class="field-block">
                    <span class="field-label">居家血壓實測值</span>
                    <div class="bp-grid">
                      <label>
                        <small>收縮壓</small>
                        <input
                          class="text-input"
                          inputmode="numeric"
                          type="number"
                          min="1"
                          placeholder="mmHg"
                          :value="answers.measurements?.systolic || ''"
                          @focus="cancelBpUnknown"
                          @input="e => updateSystolic((e.target as HTMLInputElement).value)"
                        />
                      </label>
                      <label>
                        <small>舒張壓</small>
                        <input
                          class="text-input"
                          inputmode="numeric"
                          type="number"
                          min="1"
                          placeholder="mmHg"
                          :value="answers.measurements?.diastolic || ''"
                          @focus="cancelBpUnknown"
                          @input="e => updateDiastolic((e.target as HTMLInputElement).value)"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      role="checkbox"
                      :aria-checked="Boolean(answers.measurements?.bpUnknown)"
                      class="choice-chip unknown-row"
                      :class="{ 'is-checked': answers.measurements?.bpUnknown }"
                      @click="toggleBpUnknown(!answers.measurements?.bpUnknown)"
                    >
                      <span>目前不知道</span>
                    </button>
                  </div>
                </div>
              </div>


              <!-- Step: Allergies -->
              <div v-else-if="currentStep === 'allergies'">
                <h2 id="activeQuestion" tabindex="-1">是否對下列任一項目有已知過敏反應？</h2>
                <div class="option-grid" role="group" aria-labelledby="activeQuestion">
                  <button
                    v-for="option in allergyOptions"
                    :key="option"
                    type="button"
                    role="checkbox"
                    :aria-checked="Boolean((answers.allergies || []).includes(option))"
                    class="option check-option"
                    :class="{ 'is-checked': (answers.allergies || []).includes(option) }"
                    @click="toggleAllergy(option, !(answers.allergies || []).includes(option))"
                  >
                    <span class="option-mark" aria-hidden="true"></span>
                    <span>{{ option }}</span>
                  </button>
                </div>
                <label class="field other-field conditional-field" :hidden="!(answers.allergies || []).includes('其他')">
                  <span class="field-label">其他已知過敏</span>
                  <input
                    class="text-input"
                    type="text"
                    placeholder="請輸入項目"
                    :value="answers.allergyOther || ''"
                    @input="e => updateAllergyOther((e.target as HTMLInputElement).value)"
                  />
                </label>
              </div>

              <!-- Step: Safety -->
              <div v-else-if="currentStep === 'safety'">
                <h2 id="activeQuestion" tabindex="-1">最後確認兩項安全資訊</h2>
                <div class="field-grid safety-grid">
                  <div class="field selection-field" role="group" aria-labelledby="pregnantLabel">
                    <span class="field-label" id="pregnantLabel">您目前是否懷孕？</span>
                    <div class="inline-options" role="radiogroup" aria-labelledby="pregnantLabel">
                      <button
                        type="button"
                        role="radio"
                        :aria-checked="answers.safety?.pregnant === '是'"
                        class="choice-chip"
                        :class="{ 'is-checked': answers.safety?.pregnant === '是' }"
                        @click="updateSafetyField('pregnant', '是')"
                      >
                        <span>是</span>
                      </button>
                      <button
                        type="button"
                        role="radio"
                        :aria-checked="answers.safety?.pregnant === '否'"
                        class="choice-chip"
                        :class="{ 'is-checked': answers.safety?.pregnant === '否' }"
                        @click="updateSafetyField('pregnant', '否')"
                      >
                        <span>否</span>
                      </button>
                    </div>
                  </div>
                  <div class="field selection-field" role="group" aria-labelledby="breastfeedingLabel">
                    <span class="field-label" id="breastfeedingLabel">您目前是否正在哺乳（授乳）中？</span>
                    <div class="inline-options" role="radiogroup" aria-labelledby="breastfeedingLabel">
                      <button
                        type="button"
                        role="radio"
                        :aria-checked="answers.safety?.breastfeeding === '是'"
                        class="choice-chip"
                        :class="{ 'is-checked': answers.safety?.breastfeeding === '是' }"
                        @click="updateSafetyField('breastfeeding', '是')"
                      >
                        <span>是</span>
                      </button>
                      <button
                        type="button"
                        role="radio"
                        :aria-checked="answers.safety?.breastfeeding === '否'"
                        class="choice-chip"
                        :class="{ 'is-checked': answers.safety?.breastfeeding === '否' }"
                        @click="updateSafetyField('breastfeeding', '否')"
                      >
                        <span>否</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>


              <!-- Step: Complete -->
              <div v-else-if="currentStep === 'complete' || isLiveCompleteStep" class="completion-state">
                <div class="completion-mark" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path
                      d="m13 25 7 7 15-17"
                      stroke="currentColor"
                      stroke-width="5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 id="activeQuestion" tabindex="-1">問卷填寫完成</h2>
                <p>
                  已完成目前所有題目。<br />
                  確認送出後，將整合資料並準備個人化報告。
                </p>
              </div>


            </div>
            <p class="validation-message" id="validationMessage" role="alert" aria-live="assertive">
              {{ validationMessage }}
            </p>

            <div class="question-actions">
              <button
                class="button secondary"
                id="previousQuestion"
                type="button"
                :disabled="isLiveMode ? liveStepIndex === 0 : currentQuestion === 0"
                @click="handlePrevious"
              >
                上一題
              </button>
              <button
                class="button primary"
                id="nextQuestion"
                type="button"
                :class="{ 'is-busy': isSubmitting }"
                :disabled="!isCurrentStepValid || isSubmitting || isPlanLoading"
                @click="handleNext"
              >
                {{ (isLiveMode ? isLiveCompleteStep : currentStep === 'complete') ? '送出問卷' : '下一步' }}
              </button>
            </div>



          </div>
        </div>
      </section>
      <!-- Loading-2 Screen -->
      <section
        class="screen"
        :class="{ 'is-active': activeScreen === 'analysis' }"
        id="analysisScreen"
        aria-labelledby="analysisStatus"
      >
        <div class="analysis-card" id="analysisCard" v-show="!isAnalysisErrorVisible">
          <LoadingStageVisual
            variant="loading-2"
            :status-text="analysisStatusText"
            :is-status-changing="isAnalysisChanging"
            status-id="analysisStatus"
            :aria-label="`${analysisStatusText}，請稍候`"
          />
        </div>

        <p class="loading-note" v-show="!isAnalysisErrorVisible">請保持頁面開啟，完成後將自動進入報告頁。</p>


        <div
          class="analysis-error"
          :class="{ 'is-visible': isAnalysisErrorVisible }"
          id="analysisError"
          ref="analysisErrorRef"
          tabindex="-1"
        >
          <h2>這次分析沒有順利完成</h2>
          <p>可能是網路或系統暫時忙碌。你的問卷內容已保留，可以再試一次。</p>
          <div class="question-actions">
            <button
              class="button secondary"
              id="returnQuestionnaire"
              type="button"
              @click="handleReturnQuestionnaire"
            >
              返回問卷
            </button>
            <button
              class="button primary"
              id="retryAnalysis"
              type="button"
              @click="handleRetryAnalysis"
            >
              再試一次
            </button>
          </div>
        </div>
      </section>

      <!-- Report Placeholder Screen -->
      <section
        class="screen"
        :class="{ 'is-active': activeScreen === 'report' }"
        id="reportScreen"
        aria-labelledby="reportTitle"
      >
        <div class="report-shell">
          <div class="report-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path
                d="m13 25 7 7 15-17"
                stroke="currentColor"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <p class="eyebrow">REPORT READY</p>
          <h1 id="reportTitle">你的個人化報告已準備完成</h1>
          <p>此處將進入正式報告頁。報告內容會在後續原型中製作。</p>
        </div>
      </section>
    </main>

    <!-- Demo Controller -->
    <aside class="demo-controller" aria-label="原型情境控制">
      <div class="demo-panel" id="demoPanel" :hidden="!isDemoPanelOpen">
        <p>此面板只供原型展示，不屬於正式網站介面。</p>
        <div class="demo-buttons">
          <button type="button" @click="handleDemoAction('supplement')">資料補充模式</button>
          <button type="button" @click="handleDemoAction('full')">完整問卷模式</button>
          <button type="button" @click="handleDemoAction('analysis')">直接開啟 Loading頁-2</button>
          <button type="button" @click="handleDemoAction('analysis-error')">模擬分析失敗</button>
          <button type="button" @click="handleDemoAction('restart')">重新開始</button>
        </div>
      </div>
      <button
        class="demo-toggle"
        id="demoToggle"
        type="button"
        :aria-expanded="isDemoPanelOpen"
        aria-controls="demoPanel"
        @click="toggleDemoPanel"
      >
        Demo
      </button>
    </aside>
  </div>
</template>


