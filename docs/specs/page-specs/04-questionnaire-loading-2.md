# Care U｜問卷頁與 Loading頁-2 工程規格（Questionnaire & Loading-2 Specification）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 工程頁面規格（待 Technical PM 審閱）
- **主要依據**：
  - `source/page-specs/CareU_問卷頁_Loading頁-2_頁面規格.md` `[SPEC_STATED]`
  - `source/prototypes/CareU_問卷頁_Loading頁-2_原型.html`（共 838 行）`[CODE_OBSERVED]`
  - `[CONFIRMED]` DEC-02 問卷遷移範圍與進度槽位決策

---

## 1. 來源與適用範圍

- **對應原型檔案**：`source/prototypes/CareU_問卷頁_Loading頁-2_原型.html`
- **適用範圍**：健康問卷雙模式填答、表單校驗與暫存、Loading-2 報告生成等待、分析失敗卡片重試。
- **邊界說明（`[CONFIRMED]` DEC-02）**：現階段僅遷移原型所實作之 6~7 個填答步驟；完整 12 類 32 題題庫留待 Phase 7 資料對齊，不把現行 Demo 認定為正式推薦所需的完整問卷。

---

## 2. 雙模式架構、步驟與畫面數規範（落實事實精確性）

本規格嚴格區分「填答步驟（Step）」與「畫面數（Screen）」：

| 模式 | 填答步驟清單 | 完成頁 | 總畫面數 | 固定進度槽數 | 說明 |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **資料補充模式 (`supplement`)** | 1. 蔬果<br>2. 活動<br>3. 睡眠<br>4. 測量(腰圍)<br>5. 過敏原<br>6. 安全資訊(懷孕/哺乳) | 1 個 (`complete`) | **7 個** | **7 槽** | 跳過健檢已有的基本資料題。 |
| **完整問卷模式 (`full` - 非女性)** | 1. 基本資料(年齡/性別/體重)<br>2. 蔬果<br>3. 活動<br>4. 睡眠<br>5. 測量(腰圍/血壓)<br>6. 過敏原 | 1 個 (`complete`) | **7 個** | **8 槽** | 生理性別為男性/非女性時，略過安全資訊步驟。 |
| **完整問卷模式 (`full` - 女性)** | 1. 基本資料<br>2. 蔬果<br>3. 活動<br>4. 睡眠<br>5. 測量<br>6. 過敏原<br>7. 安全資訊 | 1 個 (`complete`) | **8 個** | **8 槽** | `basic.sex === 'female'` 時動態插入第 7 步安全資訊。 |

- **固定進度槽防倒退原則**：完整模式統一以 8 槽計算，條件頁略過時完成頁仍對應第 8 槽，確保進度條絕不倒退或縮短。

---

## 3. 表單互動、輸入校驗與暫存機制 `[CODE_OBSERVED]`

### 3.1 題型互動與互斥規則
1. **基本資料（第 1 步，僅完整模式）**：
   - 年齡（`basic.age`，數值，必填）、生理性別（`basic.sex`，單選，必選）、體重（`basic.weight`，數值，必填）。
2. **身體測量資料（步驟 4 或步驟 5）**：
   - **`supplement` 模式**：僅包含腰圍 `measurements.waist`（HTML 屬性 `min="1" step="0.1"`，無 `max` `[CODE_OBSERVED]`）。
   - **`full` 模式**：包含腰圍 `measurements.waist`（`min="1" step="0.1"`，無 `max`）、居家血壓收縮壓 `measurements.systolic`（`min="1"`，無 `max`）與舒張壓 `measurements.diastolic`（`min="1"`，無 `max` `[CODE_OBSERVED]`）。
   - **JS 驗證邏輯 `[CODE_OBSERVED]`**：`isStepValid('measurements')` 檢查該項是否已有數值輸入，或已勾選「目前不知道（`waistUnknown` / `bpUnknown`）」，並非執行特定醫學數值區間範圍驗證。
   - 點選「目前不知道」時，自動清除同組數值輸入（`data-clears-fields`）；數值輸入框獲得焦點或輸入時，自動取消「目前不知道」勾選（`data-cancels-unknown`）。
3. **過敏原多選清單（步驟 5 或步驟 6）**：
   - 項目包含牛奶、大豆、芝麻、黑豆、魚類、麩質、乳糖不耐、真菌類、花生/堅果、其他、無已知過敏。
   - 點選「無已知過敏」時，**自動取消所有已勾選項目**。
   - 點選任一具體項目時，**自動取消「無已知過敏」**。
   - 勾選「其他」時展開文字輸入框；取消「其他」時隱藏並清空文字；**JS 驗證要求若勾選「其他」，輸入框必須有非空白文字 `[CODE_OBSERVED]`**。
4. **防禦性校驗與焦點移動 `[CODE_OBSERVED]`**：若目前步驟未填寫完整，「下一題」按鈕維持停用（`disabled`）；若以特殊操作觸發點擊，提示「請完成這個步驟，或選擇『目前不知道』。」並將焦點移至面板內第一個未停用的輸入控制項（`questionPanel.querySelector('input:not([disabled])')?.focus()`，L765 `[CODE_OBSERVED]`）。

### 3.2 答案暫存管理（`sessionStorage` 實作細節）`[CODE_OBSERVED]`
- **原碼引文**：`sessionStorage.setItem('careu-questionnaire', JSON.stringify({ mode: currentMode, answers, currentQuestion }))` (L549 `[CODE_OBSERVED]`)。
- **保存時機**：`persistState()` 在選項點選、數值輸入及換題（`nextQuestion`）時即時寫入。
- **還原機制**：`restoreState(mode)` 檢查 `saved?.mode === mode && saved.answers`，**只有在請求模式與暫存模式相符時才恢復作答**；模式不符時重設為空。
- **清除時機**：**送出問卷時不會清除 `sessionStorage`**（送出後僅進入 Loading-2，暫存保留以便分析失敗時能「返回問卷」）；僅在 Demo 控制面板點擊「重新開始（`restart`）」時才執行 `sessionStorage.removeItem('careu-questionnaire')`。

---

## 4. Loading-2 四階段推進與時序細項 `[CODE_OBSERVED]`

Loading-2 動畫包含送出按鈕旋轉 `@keyframes button-spin`、橘點跳動 `@keyframes logo-dot-hop`、打字三點 `@keyframes dot-hop` 與面板進場 `@keyframes panel-in`。其示範計時細項如下：

| 階段 / 事件 | 狀態文案 `[CODE_OBSERVED]` | 原型持續時間 `[CODE_OBSERVED]` | 後端業務語意映射候選 `[PROPOSED]` |
| :---: | :--- | :---: | :--- |
| **送出延遲** | （按鈕顯示「正在送出」） | 0.45 秒 (450ms) | 問卷完成點擊送出後的微過渡 |
| **階段 1** | `正在整理你提供的資料……` | 1.6 秒 (1600ms) | 資料格式整合 (Pending) |
| **階段 2** | `正在理解你的身體訊息……` | 1.8 秒 (1800ms) | 特徵比對與模型運算 (Processing) |
| **階段 3** | `正在整理適合你的保健方向……` | 1.8 秒 (1800ms) | 12 項關注方向計分 (Analyzing) |
| **階段 4** | `正在準備你的個人化報告……` | 1.2 秒 (1200ms) | 候選品項組合配對 (Finalizing) |
| **完成轉場** | `報告準備完成` | 0.65 秒 (650ms) | 停留後淡出 Loading，轉入報告 |

- **時序精確說明**：四階段 duration 合計為 **6400ms**（1600+1800+1800+1200=6400ms）；文字切換各含 230ms 動畫；加計送出延遲 450ms 與完成轉場 650ms，總展示時長約 7.5 秒。上述特徵分析與計分僅為後端業務映射候選；正式環境由後端分析非同步完成事件驅動。

### 4.1 分析失敗狀態卡片
- 模擬在前兩個 Loading 階段後發生網路/系統異常時，彈出錯誤卡（`這次分析沒有順利完成`）。
- **「返回問卷」按鈕（`#returnQuestionnaire`）**：返回問卷填答頁，完整保留已填答案。
- **「再試一次」按鈕（`#retryAnalysis`）**：重新發起分析請求並重播 Loading-2 動畫。

---

## 5. 原型行為 vs 工程化目標區分

| 項目 | 原型現況 `[CODE_OBSERVED]` | 正式工程化目標 `[PROPOSED]` |
| :--- | :--- | :--- |
| **報告頁銜接** | 轉入原型內嵌 `#reportScreen` 占位卡片 | 使用 Vue Router 跳轉至 `/report` |
| **題型渲染** | 原型硬編碼 DOM 結構切換 | 封裝題型元件，採資料驅動配置（`[PROPOSED]`） |
| **Demo 控制** | 提供切換雙模式、模擬失敗、重播面板 | 正式上線移除 Demo 控制面板 |

---

## 6. 元件與資料相依

- **元件相依**：`StepProgress.vue`, `QuestionRadioGroup.vue`, `AllergySelector.vue`, `DataCanvas.vue`。
- **狀態相依**：`useQuestionnaireStore`（管理模式、當前步驟、answers 物件與暫存）。

---

## 7. 逐項驗收條件清單

- [ ] 補充模式共 6 步驟＋complete（7 畫面，7 槽）；完整模式共 6/7 步驟＋complete（7/8 畫面，8 槽）。
- [ ] 完整模式下女性勾選時安全資訊步驟動態插入，進度條總槽位維持 8 槽不倒退。
- [ ] 過敏原多選中「無已知過敏」與具體項目互斥邏輯正確；「其他」能正常展開文字輸入。
- [ ] 測量資料「目前不知道」與數值輸入框雙向互斥切換正常。
- [ ] 頁面重新整理（F5）能自 `sessionStorage` 完整還原填答狀態。
- [ ] Loading-2 分析失敗時，點擊「返回問卷」能正確保留作答進度。
- [ ] 650px 以下排版自動轉為單欄，按鈕平分寬度。
- [ ] **`[RUNTIME_UNVERIFIED]`**：iOS 虛擬鍵盤彈起時，年齡/體重數值輸入框的視窗滾動置中體驗。
