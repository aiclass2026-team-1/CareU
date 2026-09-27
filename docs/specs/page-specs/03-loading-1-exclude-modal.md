# Care U｜Loading頁-1 與排除視窗工程規格（Loading-1 & Exclude Modal Specification）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 工程頁面規格（待 Technical PM 審閱）
- **主要依據**：
  - `source/page-specs/CareU_Loading頁-1_排除視窗_頁面規格.md` `[SPEC_STATED]`
  - `source/prototypes/CareU_Loading頁-1_排除視窗_原型.html`（共 670 行）`[CODE_OBSERVED]`
  - `[CONFIRMED]` DEC-01 排除視窗雙分支與 DEC-04 Escape 行為決策

---

## 1. 來源與適用範圍

- **對應原型檔案**：`source/prototypes/CareU_Loading頁-1_排除視窗_原型.html`
- **適用範圍**：健檢檔案上傳後的讀取分析等待過渡頁、4 階段狀態推進、解析失敗排除視窗。
- **邊界說明**：原型中之 `#homeScreen`（簡易首頁外殼）、示範問卷與右下角 Demo 控制面板僅供展示驗證，不屬於本頁正式規格。

---

## 2. 畫面職責與視覺保留要求

### 2.1 畫面核心職責
- 承接首頁檔案上傳後的非同步等待期，傳達系統正在解析資料。
- 支援正常推進至「資料補充問卷」與異常彈出「排除視窗」兩大結果。

### 2.2 視覺規格保留 `[CODE_OBSERVED]`
- **字體宣告與大小**：`"CareU LINE Seed TW"`（`400` 解碼 86,584 bytes / `700` 解碼 85,704 bytes）`[CODE_OBSERVED]`。
- **Logo 動畫與 Keyframes**：品牌藍 U 型與十字搭配暖橘圓點，橘點執行 `@keyframes logo-dot-hop` 上下跳動動畫，打字三點執行 `@keyframes dot-hop`，面板進場執行 `@keyframes panel-in` `[CODE_OBSERVED]`。
- **狀態對話框**：毛玻璃白底、細藍邊框、18px 圓角、`backdrop-filter: blur(12px)`，左下保留對話框小尾巴。
- **動態打字三點**：三點依序小幅上跳與透明度變化，`aria-hidden="true"`。
- **文字防拖曳**：Loading 畫面內文案套用 `user-select: none;` 禁止反白拖曳。
- **底部固定提示**：`請保持頁面開啟，我們正在整理你提供的資料。`，納入 `safe-area-inset-bottom`。

---

## 3. Loading-1 四階段推進與示範時序 `[CODE_OBSERVED]`

| 階段 | 狀態文案 `[CODE_OBSERVED]` | 原型停留時間 `[CODE_OBSERVED]` | 後端業務語意映射候選 `[PROPOSED]` |
| :---: | :--- | :---: | :--- |
| **1** | `讀取檔案中……` | 1.8 秒 (1800ms) | 接收檔案並進行完整性校驗 (Pending) |
| **2** | `正在分析資料……` | 2.4 秒 (2400ms) | OCR 辨識與健康數值萃取 (Processing) |
| **3** | `正在整理需補充資訊……` | 2.2 秒 (2200ms) | 評估缺漏資料，決定補充題目 (Analyzing) |
| **4** | `正在準備下一步……` | 1.1 秒 (1100ms) | 準備轉入資料補充問卷 (Finalizing) |

- **原型展示總時長**：正常流程四階段合計 7.5 秒；排除流程播放至第 2 階段（約 4.2 秒）後開啟排除視窗。
- **工程化要求**：上述 OCR 與特徵分析僅為後端業務映射候選；正式環境應由後端真實進度事件驅動，計時器僅作為 UI 文字過渡防抖使用。


---

## 4. 排除視窗（ExcludeModal）規格（落實 DEC-01 與 DEC-04）

### 4.1 視窗內容與雙按鈕操作 `[CONFIRMED]` DEC-01
- **標題與文案**：標題「目前無法使用這份資料」，副標說明可能因格式、模糊或非健檢資料導致無法辨識。
- **主要操作按鈕（`#modalHome`）**：藍底實心按鈕「返回首頁」，點擊後路由返回 `/home`，允許重新上傳。
- **次要操作按鈕（`#modalQuestionnaire`）**：淺灰藍按鈕「直接填寫問卷」。
  - **重要業務約束**：被排除的檔案**不得視為已成功解析的健檢資料**；點擊後路由導向 `/questionnaire` 並進入**無有效健檢資料之完整問卷流程（`full` 模式）**。

### 4.2 鍵盤焦點、Escape 與遮罩點擊行為 `[CONFIRMED]` DEC-04
- **Escape 鍵與遮罩點擊行為**：**本輪嚴格保留原型事實，不支援按 `Escape` 鍵關閉排除視窗，亦不支援點擊遮罩空白處關閉**（L614 `[CODE_OBSERVED]`）。使用者必須明確點選雙按鈕之一做出分流選擇。
- **Focus Trap 與初始焦點**：`openExclude()` 呼叫後延遲 80ms 執行 `excludeModal.focus()`（L511 `[CODE_OBSERVED]`）；視窗開啟時，`Tab` / `Shift+Tab` 循環鎖定在 `#modalHome` 與 `#modalQuestionnaire` 之間。

---

## 5. 原型行為 vs 工程化目標區分

| 項目 | 原型現況 `[CODE_OBSERVED]` | 正式工程化目標 `[PROPOSED]` |
| :--- | :--- | :--- |
| **推進機制** | `setTimeout` 依固定時間切換文案 | 由後端非同步 API 事件驅動階段流轉 |
| **轉場至問卷** | 原型同頁切換至示範問卷 DOM | 使用 Vue Router 跳轉至 `/questionnaire` |
| **Demo 控制** | 右下角面板可切換播放正常/排除流程 | 正式上線移除 Demo 面板 |

---

## 6. 元件與資料相依

- **元件相依**：`DataCanvas.vue`（全螢幕模式）、`ExcludeModal.vue`（封裝雙按鈕與 Focus Trap）。
- **狀態相依**：`useUploadStore`（管理上傳進度與解析結果）、`useQuestionnaireStore`（初始化問卷模式）。

---

## 7. 逐項驗收條件清單

- [ ] 頁面載入後 Logo 橘點上下跳動，打字三點依序起伏。
- [ ] 4 階段狀態文字切換時具備 230ms 平滑淡入淡出，對話框無閃爍。
- [ ] 正常解析完成後正確導向 `/questionnaire`（`supplement` 模式）。
- [ ] 排除視窗開啟時，按下 `Escape` 鍵無法關閉視窗（符合 DEC-04）。
- [ ] 排除視窗點擊「直接填寫問卷」能正確進入 `full` 模式完整問卷（符合 DEC-01）。
- [ ] Loading 畫面文字不可被滑鼠選取拖曳反白。
- [ ] 排除視窗在 650px 以下自動轉為單欄垂直按鈕排列。
- [ ] **`[RUNTIME_UNVERIFIED]`**：後端解析超時或伺服器斷線時的前端自癒與重試提示表現。
