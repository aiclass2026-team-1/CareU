# Care U｜前端工程需求規範（Frontend Requirements & Standards）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 工程需求草案（待 Technical PM 審閱）
- **主要依據**：
  - `source/project-brief/CareU_Technical_PM_AI_Agent_Prompt_v2.txt` `[SPEC_STATED]`
  - 5 份完成版頁面規格書 `source/page-specs/` `[SPEC_STATED]`
  - 5 份 HTML 原型實作事實 `[CODE_OBSERVED]`

---

## 1. 前端技術棧與工程架構約束

### 1.1 核心技術棧清單
- **核心框架**：Vue 3 (SFC `<script setup>`, Composition API) `[CONFIRMED]`
- **建置工具**：Vite `[CONFIRMED]`
- **路由管理**：Vue Router（History 模式選型如 HTML5 History 保持 `[PROPOSED]`）`[CONFIRMED]`
- **狀態管理**：Pinia `[CONFIRMED]`
- **TypeScript 策略**：尚未定案，保持 `[TBD]`；Phase 3 骨架建立前依架構評估決定。
- **UI 元件庫選型**：以專案自建 Design Tokens 與輕量封裝為主，不預設引入大型臃腫 UI 庫（保持 `[TBD]`）。

### 1.2 專案分階段推進基準（Phase 3 ~ Phase 16 嚴格對齊）`[SPEC_STATED]`
依據 Technical PM 管理指引，後續工程推進順序如下：
- **Phase 3**：Frontend Scaffold（Vue 3 + Vite 專案 Scaffold）
- **Phase 4**：Page Implementation（5 大頁面 HTML 轉為 Vue View）
- **Phase 5**：Shared Components & Visuals（抽取共用元件、圖示與 Canvas）
- **Phase 6**：Routing & Page Flow（串接整站 Vue Router 流程與守衛）
- **Phase 7**：Data Model & Alignment（商品資料模型、問卷 32 題題庫與推薦對齊）
- **Phase 8**：Global State Management（建立正式 Pinia Stores 與暫存持久化）
- **Phase 9**：Mock Service Worker / Mock API（定義前端期望的 Mock 服務）
- **Phase 10**：Backend API Contract（定義 OpenAPI 規格與後端契約）
- **Phase 11**：Error / Edge States（網路異常、重試與邊界狀態處理）
- **Phase 12**：Privacy / Security（資安審查、資料去識別化與保留政策）
- **Phase 13**：Frontend QA（全平台響應式、無障礙與跨瀏覽器測試）
- **Phase 14**：Backend Implementation（真正後端實作支援）
- **Phase 15**：Frontend ↔ Backend Integration（前後端即時聯調）
- **Phase 16**：End-to-End QA（全系統端到端驗收）

---

## 2. 視覺還原與互動行為規範

### 2.1 像素級視覺還原要求
- 嚴格保留原型中的品牌漸層、毛玻璃背景（`backdrop-filter`）、按鈕膠囊造型與陰影層級。
- 未經使用者確認，不得擅自修改既有定案之視覺文案、Slogan、色值或排版比例。

### 2.2 Demo 邏輯與控制面板隔離規範
- 原型中的固定假資料、小安受試者資料、Demo 控制面板（`#demoPanel`）在 Phase 4 頁面遷移時應**環境隔離**（例如僅在 `import.meta.env.DEV` 模式下可用，或於正式打包時排除）。
- 嚴禁將展示用 Demo 程式碼混入生產業務邏輯。

### 2.3 元件生命週期與記憶體清理
- **Canvas 動畫**：`DataCanvas.vue` 必須在 `onUnmounted` 中取消 `requestAnimationFrame` 循環，並移除 `resize` 與 `pointermove` 監聽器。
- **計時器清理**：所有 `setTimeout` / `setInterval` 必須在元件銷毀前明確 `clearTimeout` / `clearInterval`。

---

## 3. 無障礙（Accessibility）與鍵盤操作標準

### 3.1 既有實作事實與候選改善 `[SPEC_STATED]`
- **ARIA 語意關聯**：Modal 視窗具備 `role="dialog"` 與 `aria-modal="true"`；警示訊息具備 `role="alert"`；狀態更新具備 `aria-live="polite"`。
- **可見焦點外框**：所有互動按鈕與輸入框皆具備可見焦點外框（`:focus-visible`）。
- **Focus Trap（焦點囚禁）**：開啟 Modal 時焦點自動移入首個可操作元件，Tab / Shift+Tab 循環鎖定於視窗內。
- **合規邊界說明**：靜態檢查具備無障礙屬性**不等於已符合 WCAG 2.1 AA**，正式無障礙驗收留待 Phase 13 配合螢幕閱讀器實測。

### 3.2 視窗 Escape 關閉與焦點還原規範（落實 DEC-04 與共用登入）
- **排除視窗 (`ExcludeModal`)**：**不支援 `Escape` 鍵關閉**，使用者必須透過雙按鈕決策。
- **其他視窗 (`UploadSheet`, `LoginModal`, `CartModal`)**：支援 `Escape` 鍵關閉；關閉後焦點必須**精確還原至開啟前的觸發元素**。


---

## 4. 響應式適配與現代 CSS 特性規範

### 4.1 視窗高度與安全區域（Viewport & Safe Area）
- 使用 `min-height: 100svh;` 作為全螢幕頁面高度基準，相容行動裝置動態網址列縮放。
- 所有置底浮動提示與導覽元件，必須納入 `padding-bottom: calc(24px + env(safe-area-inset-bottom));`。

### 4.2 現代 CSS 選擇器相容性考量
- 原型中使用之 `:has()` 選擇器（如問卷選項被選中時父容器樣式變更）在現代主流瀏覽器（Chrome 105+, Safari 15.4+, Firefox 121+）支援良好。
- Phase 4 實作時應以 Vue 動態 Class（`:class="{ 'is-selected': isSelected }"`）作為主要狀態表現，提升相容性與可維護性。

---

## 5. 非同步狀態生命週期與計時模型（Async Lifecycle & Timing Models）

### 5.1 UI 動畫計時 vs 業務非同步計時之嚴格區分
| 計時類型 | 涵蓋範疇 | 處理原則 |
| :--- | :--- | :--- |
| **純 UI 過渡動效** | 按鈕 Hover (200ms)、文字切換淡入 (230ms)、題目切換 (380ms)、問卷送出延遲 (450ms) | 保留前端 CSS / JS 動畫時間，確保視覺體驗平滑。 |
| **業務分析計時** | Loading-1 健檢讀取 (7.5s)、Loading-2 報告分析 (6.4s) | **原型計時器僅為展示用途**。正式工程化時由非同步 API 狀態驅動，後端完成即刻推進，不得以純前端計時器判定分析成功。 |

### 5.2 非同步錯誤、重試與逾時模型 `[PROPOSED]`
- **Loading 4 階段推進模型（業務語意映射草案）**：
  - 原型現況為前端 Demo 狀態文案與固定計時；
  - 正式後端業務映射建議為：階段 1 檔案讀取/校驗（Pending）→ 階段 2 OCR/資料解析（Processing）→ 階段 3 健康特徵分析（Analyzing）→ 階段 4 報告與推薦生成（Finalizing）。
  - **重要原則**：原型固定階段與計時不代表實際 OCR、特徵分析或推薦計算已完成，正式環境由後端事件驅動。
- **非同步協議與逾時機制 (`[TBD]`)**：後端非同步進度通訊協議（如 Polling、SSE 或 WebSocket）留待 Phase 10 API 契約定義；當非同步請求超過逾時門檻（如 30 秒 `[PROPOSED]`）且無進度事件時，前端應轉入分析失敗卡片，並提供「返回問卷」與「再試一次」重試按鈕。

---

## 6. 前端資安防護與敏感資料處理原則

### 6.1 敏感健康資料處理規範
- 使用者上傳之體檢檔案內容、問卷中填寫之個人健康數值（血壓、腰圍、過敏原、孕期資訊）屬於高度敏感資料。
- **持久化防護**：問卷作答過程僅允許於瀏覽器分頁生命週期內使用 `sessionStorage` 暫存，**嚴禁在未經資安審查前持久化寫入 `localStorage` 或 Cookie**。
- **上傳檔案生命週期**：原型現況檔案暫存於記憶體變數 `selectedFiles` 陣列中；正式系統中檔案生命週期、去識別化、上傳後清理與暫存保留時點留待 Phase 12 資安隱私階段確認（`[TBD]`）。

### 6.2 會員認證與密碼安全
- 前端登入/註冊表單僅進行格式校驗（Email 格式、密碼長度 `>= 8`、兩次密碼一致），嚴禁在前端儲存明文密碼。
- 正式會員驗證機制作為 Phase 10 API 契約與後端對齊，不在前端硬編碼 Token 鑑權邏輯。

---

## 7. 驗收清單與未驗證事項

### 7.1 規格驗收清單
- [ ] 完整對齊 Phase 3 至 Phase 16 推進順序與邊界定義。
- [ ] 嚴格落實 DEC-04 排除視窗與通用 Modal 的 Escape 與焦點返回規範。
- [ ] 明確區分純 UI 動畫時間與業務非同步狀態驅動之界線。
- [ ] 規範敏感健康資料不得持久化存入 `localStorage` 之安全原則。

### 7.2 未驗證事項（`[RUNTIME_UNVERIFIED]`）
- 行動端真機（iOS Safari / Android Chrome）在長時間非同步 Loading 期間的背景運作與省電模式喚醒表現。
- 弱網環境（3G / 高延遲）下重試機制的穩定性與使用者體驗。
