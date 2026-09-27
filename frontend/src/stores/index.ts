import { createPinia } from 'pinia'

/**
 * Care U - Phase 3 Scaffold Pinia Instance
 *
 * 【階段規範與邊界】
 * 1. 本階段僅建立並匯出 Pinia 實例以完成 Vue 實例註冊與技術驗證。
 * 2. 嚴禁在此階段建立業務 Store（如 Auth、Questionnaire、Report、Cart）。
 * 3. 不加入 localStorage / sessionStorage 持久化外掛。
 * 4. 正式 Store 規劃與建置留待 Phase 8（Global State Management）。
 */
export const pinia = createPinia()

export default pinia
