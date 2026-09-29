<script setup lang="ts">
import { useContractQuestionnairePreview } from './useContractQuestionnairePreview'
import '@/assets/questionnaire/questionnaire.css'

const {
  currentGroupIndex, totalGroups, currentGroupQuestions, progressPercent,
  rawAnswers, validationMessage, isComplete, submissionPayload,
  setSingle, setNum, toggleMulti, updateDetail, handlePrev, handleNext, handleRestart,
} = useContractQuestionnairePreview()
</script>

<template>
  <div class="questionnaire-container">
    <main class="app" id="app">
      <section class="screen is-active" id="questionScreen">
        <div class="question-shell" v-if="!isComplete">
          <header class="question-header">
            <p class="eyebrow">契約預覽 (Fixture) — 階段 {{ currentGroupIndex + 1 }}/{{ totalGroups }}</p>
            <h1>健康與生活型態對應問卷</h1>
          </header>
          <div id="questionContent">
            <div class="progress-row"><div class="progress-track"><div class="progress-fill" :style="{ width: progressPercent + '%' }"></div></div></div>
            <div class="question-panel">
              <div v-for="q in currentGroupQuestions" :key="q.id" class="question-block">
                <h2>{{ q.questionText }} <span v-if="q.required" class="required-star">*</span></h2>
                <p v-if="q.scoringDesc" class="scoring-desc">{{ q.scoringDesc }}</p>

                <!-- Single Choice -->
                <div v-if="q.controlType === 'single_choice'" class="options-list">
                  <label v-for="opt in q.options" :key="opt.key" class="option-item" :class="{ 'is-selected': rawAnswers[q.id]?.value === opt.key }">
                    <input type="radio" :name="`q_${q.id}`" :value="opt.key" :checked="rawAnswers[q.id]?.value === opt.key" @change="setSingle(q.id, opt.key)" />
                    <span>{{ opt.label }}</span>
                  </label>
                </div>

                <!-- Number -->
                <div v-if="q.controlType === 'number'" class="number-control-group">
                  <div class="number-input-row">
                    <input type="number" :min="q.numericConfig?.min" :max="q.numericConfig?.max" :step="q.numericConfig?.step" :disabled="rawAnswers[q.id]?.value === q.numericConfig?.unknownOption?.key" :value="rawAnswers[q.id]?.value === q.numericConfig?.unknownOption?.key ? '' : (rawAnswers[q.id]?.value as any)" @input="e => setNum(q.id, (e.target as HTMLInputElement).value)" placeholder="請輸入數值" />
                    <span v-if="q.numericConfig?.unit" class="unit-label">{{ q.numericConfig.unit }}</span>
                  </div>
                  <label v-if="q.numericConfig?.unknownOption" class="unknown-label">
                    <input type="checkbox" :checked="rawAnswers[q.id]?.value === q.numericConfig.unknownOption.key" @change="e => setNum(q.id, (e.target as HTMLInputElement).checked ? q.numericConfig!.unknownOption!.key! : '')" />
                    <span>{{ q.numericConfig.unknownOption.label }}</span>
                  </label>
                </div>

                <!-- Composite BP -->
                <div v-if="q.controlType === 'composite_bp'" class="number-control-group">
                  <div class="number-input-row">
                    <input
                      type="text"
                      :disabled="rawAnswers[q.id]?.value === q.bpConfig?.unknownOption?.key || rawAnswers[q.id]?.value === 'unknown'"
                      :value="rawAnswers[q.id]?.value === 'unknown' ? '' : (rawAnswers[q.id]?.value as any)"
                      @input="e => setSingle(q.id, (e.target as HTMLInputElement).value)"
                      placeholder="請輸入血壓 (例如 120/80)"
                    />
                    <span v-if="q.bpConfig?.unit" class="unit-label">{{ q.bpConfig.unit }}</span>
                  </div>
                  <label v-if="q.bpConfig?.unknownOption" class="unknown-label">
                    <input
                      type="checkbox"
                      :checked="rawAnswers[q.id]?.value === q.bpConfig.unknownOption.key || rawAnswers[q.id]?.value === 'unknown'"
                      @change="e => setSingle(q.id, (e.target as HTMLInputElement).checked ? (q.bpConfig!.unknownOption!.key || 'unknown') : '')"
                    />
                    <span>{{ q.bpConfig.unknownOption.label }}</span>
                  </label>
                </div>


                <!-- Multi Choice -->
                <div v-if="q.controlType === 'multi_choice'" class="options-list">
                  <div v-for="opt in q.options" :key="opt.key" class="multi-option-row">
                    <label class="option-item" :class="{ 'is-selected': Array.isArray(rawAnswers[q.id]?.value) && (rawAnswers[q.id].value as (string | number)[]).includes(opt.key) }">
                      <input type="checkbox" :value="opt.key" :checked="Array.isArray(rawAnswers[q.id]?.value) && (rawAnswers[q.id].value as (string | number)[]).includes(opt.key)" @change="toggleMulti(q.id, opt.key, opt.exclusive)" />
                      <span>{{ opt.label }}</span>
                    </label>
                    <div v-if="opt.detailInput && Array.isArray(rawAnswers[q.id]?.value) && (rawAnswers[q.id].value as (string | number)[]).includes(opt.key)" class="detail-input-wrap">
                      <input type="text" placeholder="請輸入說明" :value="rawAnswers[q.id]?.detailText || ''" @input="e => updateDetail(q.id, (e.target as HTMLInputElement).value)" />
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="validationMessage" class="validation-error">{{ validationMessage }}</p>
            </div>
            <div class="question-actions">
              <button class="button secondary" type="button" :disabled="currentGroupIndex === 0" @click="handlePrev">上一題</button>
              <button class="button primary" type="button" @click="handleNext">{{ currentGroupIndex === totalGroups - 1 ? '完成作答' : '下一題' }}</button>
            </div>
          </div>
        </div>
        <div class="question-shell payload-shell" v-else>
          <header class="question-header" style="text-align: center;">
            <p class="eyebrow">CONTRACT PAYLOAD READY</p>
            <h1>作答合約 payload 已準備完成</h1>
          </header>
          <div class="payload-box">
            <pre>{{ JSON.stringify(submissionPayload, null, 2) }}</pre>
          </div>
          <div style="text-align: center;"><button class="button primary" type="button" @click="handleRestart">重新填寫預覽</button></div>
        </div>
      </section>
    </main>
  </div>
</template>
