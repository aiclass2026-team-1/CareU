# Care U｜Frontend Migration Audit Report

- **執行日期**：2026-09-27
- **專案根目錄**：`C:\Users\User\Desktop\CareU`
- **來源基準 Commit**：`ba4a60eff2eca656b3c9b7d49828b725d417d22e`（`chore: establish Care U source baseline`）
- **報告性質**：Phase 1 靜態程式碼與規格審計報告（Static Migration Audit）
- **標記規範**：
  - `[CODE_OBSERVED]`：自 HTML／CSS／JS 原始碼直接檢驗之代碼事實。
  - `[SPEC_STATED]`：自 5 份頁面規格或網站流程文件載明之規範。
  - `[INFERRED]`：基於代碼與規格比對所產生之後續工程推論。
  - `[PROPOSED]`：供後續規格制定與前端工程化參考之候選提案（非定案架構）。
  - `[RUNTIME_UNVERIFIED]`：靜態代碼雖具備結構，但未經瀏覽器執行、無障礙輔助工具或真機操作驗證之項目。

---

## 1. 範圍、方法與限制

### 1.1 稽核範圍與方法
本審計針對 `source/prototypes/` 內 5 份完成版 HTML 原型、`source/page-specs/` 內 5 份頁面規格、`source/flows/` 網站流程圖與說明文件、`source/assets/brand/` 官方 VIS 品牌資產，以及 `source/data/` 題庫與商品資料集進行全面靜態代碼與跨文件一致性審計。

### 1.2 限制說明
- **純靜態檢查限制**：靜態代碼掃描未發現外部網路載入依賴，但**靜態檢查不能證明瀏覽器環境下完全無 Console error、鍵盤焦點實際導航順暢或畫面完全無溢出**。
- **獨立檔案邊界**：5 份原型為各自獨立之 HTML 原型檔案，原型間的跳轉與轉場僅為展示示意，**不代表整站路由已串接完成**。
- **非正式架構定案**：本文所提及之 Route 路徑、元件階層與狀態結構皆為**遷移分析與候選提案（`[PROPOSED]`）**，不代表正式架構或後端 API 規格。

---

## 2. 逐檔頁面盤點

### 2.1 入口頁（Splash Page）
- **原始碼路徑**：`source/prototypes/CareU_入口頁原型.html`（共 384 行）
- **對應規格與流程**：`source/page-specs/CareU_入口頁_頁面規格.md`、`source/flows/CareU_網站流程說明.md` §3.1
- **正式畫面職責**：
  - `[CODE_OBSERVED]` `#splash`（L292 `<main class="screen splash" id="splash" role="region" aria-label="Care U 開場動畫" tabindex="0">`）：呈現品牌開場動畫，包含 Logo 幾何圖騰拆解組合、品牌標準字浮現與 Slogan 漸入。
- **內嵌 Demo／Placeholder**：
  - `[CODE_OBSERVED]` `#home`（L281 `<section class="screen home-placeholder" id="home" aria-hidden="true">`）：內含文字「［你的身體］正在輸入訊息……」與「首頁銜接示意，非首頁設計定案」，僅用於展示開場動畫結束後的淡出轉場效果，**非正式首頁**。
  - `[CODE_OBSERVED]` `#replay`（L286 `<button class="replay-button" id="replay" type="button">重新播放入口動畫</button>`）：重新播放開場動畫按鈕，僅供原型展示重複驗證。
- **核心互動與時序**：
  - `[CODE_OBSERVED]` L334-339 `scheduleAutoEnter()`：一般模式下透過 `window.setTimeout(enterHome, 2850)` 設定 **2850ms** 自動觸發進入首頁；在 Reduced Motion 模式下不安排自動進入（`if (!reduceMotion.matches)`）。
  - `[CODE_OBSERVED]` L341-354 `enterHome()`：為 `#splash` 加入 `.is-leaving` 類別，在一般模式下延遲 **170ms** 顯示示意首頁（`reduceMotion.matches ? 0 : 170`），並將 `#home` 設為 `.is-visible` 及轉移焦點至 `#replay`；Reduced Motion 模式下手動進入延遲為 0ms。
  - `[CODE_OBSERVED]` L367-372 支援點擊 `#splash` 或於其上按下 `Enter` / `Space` 鍵立即略過動畫進入示意首頁。
- **樣式與動畫定義**：
  - `[CODE_OBSERVED]` L10-14 CSS 變數：`--brand-blue: #197afc;`, `--brand-orange: #fb8f54;`, `--brand-navy: #07295c;`, `--surface: #f7f8fa;`。
  - `[CODE_OBSERVED]` L29 字體宣告：`font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;`（未內嵌 `@font-face`）。
  - `[CODE_OBSERVED]` Keyframes 名稱：`@keyframes blue-clear` (L207), `@keyframes sunrise` (L224), `@keyframes copy-in` (L235)。
  - `[CODE_OBSERVED]` 斷點：`@media (max-width: 480px)` (L242), `@media (prefers-reduced-motion: reduce)` (L257)。

---

### 2.2 首頁（Home & Upload Page）
- **原始碼路徑**：`source/prototypes/CareU_首頁原型.html`（共 1074 行）
- **對應規格與流程**：`source/page-specs/CareU_首頁_頁面規格.md`、`source/flows/CareU_網站流程說明.md` §3.2, §4.1, §7.1
- **正式畫面職責**：
  - `[CODE_OBSERVED]` Hero 標題區（L767-788）：包含主標題「如果身體會說話，<br>最近想跟你說什麼？」、副標「從身體資料找到屬於你的保健方向」、主操作按鈕 `#chooseFileButton`（`<span class="primary-cta__label">從體檢資料開始瞭解</span>`）與輔助入口 `#questionnaireLink`（`沒有資料？先從問卷開始 →`）。
  - `[CODE_OBSERVED]` `#uploadSheet`（L838 `<div class="upload-sheet" id="uploadSheet" role="dialog" aria-modal="true" aria-labelledby="uploadTitle">`）：健檢檔案上傳面板，包含標題「準備讀取資料」、說明「確認檔案後再按「開始讀取」，目前尚未上傳。」、檔案清單列表 `#fileList`、按鈕 `#addFiles`（`新增或重新選擇`）、`#startReading`（`開始讀取`）及關閉按鈕 `#closeUpload`（`×`）。
  - `[CODE_OBSERVED]` 第二屏說明區（L791-834 `#trust`）：包含標題「讓資料的來源、用途與界線，都清楚可見。」與三大專業說明卡片。
- **內嵌 Demo／Placeholder**：
  - `[CODE_OBSERVED]` `#memberLogin`（L869 `<button class="member-login" id="memberLogin" type="button" aria-label="會員登入" title="會員登入">`）：L975 點擊事件僅綁定 `showToast('原型提示：此處將開啟會員登入')`，**首頁原始碼中無任何登入 Modal 視窗之 HTML 或驗證邏輯**。
  - `[CODE_OBSERVED]` `#questionnaireLink`：L973 點擊僅觸發 `showToast('原型提示：此處將前往健康問卷頁')`。
  - `[CODE_OBSERVED]` `#routeScreen`（L861 `<div class="route-screen" id="routeScreen" role="dialog" aria-modal="true" aria-labelledby="routeTitle">`）：L968 點擊「開始讀取」後彈出的模擬轉場面板（標題「正在前往資料辨識頁」，標註「此為原型轉場示範，將進入 Loading 頁-1」），內含 `#returnHome` 按鈕（`返回首頁原型`）。
- **核心互動與驗證**：
  - `[CODE_OBSERVED]` L931-936 開啟上傳面板流程：點擊主 CTA `#chooseFileButton` 先開啟 `#uploadSheet`（`uploadSheet.classList.add('is-open')`）；進入面板後點擊 `#addFiles` 才呼叫 `openPicker()` 開啟原生檔案選擇器。
  - `[CODE_OBSERVED]` L954-956 檔案累加與上限：支援多次累加選擇檔案，單次最多保留 **10 個檔案**（`Math.max(0, 10 - selectedFiles.length)`，超過提示「一次最多保留 10 個檔案。」）。
  - `[CODE_OBSERVED]` L903 `validFile` 驗證：檢查 `/^(application\/pdf|image\/(jpeg|png))$/` 或附檔名 `.pdf`、`.jpg`、`.jpeg`、`.png`。
  - `[CODE_OBSERVED]` L949 單檔大小限制：`file.size <= 25 * 1024 * 1024`（25MB 前端原型防呆，不可視為正式後端契約）。
  - `[CODE_OBSERVED]` L909 `showToast` 計時器：Toast 提示顯示 **2800ms** 後自動隱藏（`setTimeout(..., 2800)`）。
  - `[CODE_OBSERVED]` L977 `updateMemberLoginPosition`：監聽 `scroll` 事件，當滾動超過視窗高度 50%（`scrollY >= innerHeight * .5`）時為 `#memberLogin` 切換 `.is-on-explanation` 樣式。
  - `[CODE_OBSERVED]` L986 鍵盤監聽：按下 `Escape` 鍵關閉 `#uploadSheet` 與 `#routeScreen`。
  - `[CODE_OBSERVED]` L991-1070 Canvas 粒子網絡背景：`#dataField` 根據 Hero 容器尺寸（`hero.getBoundingClientRect()`）透過 `requestAnimationFrame` 與指針互動繪製動態資料節點。
- **樣式與字體定義**：
  - `[CODE_OBSERVED]` L10-23 `@font-face` 宣告字體 `"LINE Seed TW"`（字重宣告範圍 `100 600` 與 `700 900`，內嵌 Base64 WOFF）。
  - `[CODE_OBSERVED]` 斷點：`@media (max-width: 820px)` (L681), `@media (min-width: 821px)` (L687), `@media (max-width: 520px)` (L706), `@media (prefers-reduced-motion: reduce)` (L738)。

---

### 2.3 Loading頁-1 與排除視窗（Loading Intake & Exclude Modal）
- **原始碼路徑**：`source/prototypes/CareU_Loading頁-1_排除視窗_原型.html`（共 692 行）
- **對應規格與流程**：`source/page-specs/CareU_Loading頁-1_排除視窗_頁面規格.md`、`source/flows/CareU_網站流程說明.md` §4.2, §4.3, §5
- **正式畫面職責**：
  - `[CODE_OBSERVED]` `#loadingScreen`（L345 `<section class="screen is-active" id="loadingScreen" aria-labelledby="loadingStatus">`）：Loading-1 健檢讀取中畫面，包含 4 階段狀態文字輪播（L446 `stages`）：
    1. `讀取檔案中`（1800ms）
    2. `正在分析資料`（2400ms）
    3. `正在整理需補充資訊`（2200ms）
    4. `正在準備下一步`（1100ms）
  - `[CODE_OBSERVED]` `#excludeModal`（L410 `<div class="exclude-modal" id="excludeModal" role="dialog" aria-modal="true" aria-labelledby="excludeTitle" aria-describedby="excludeDescription" tabindex="-1">`）：資料無法讀取時的排除視窗，包含警告圖示、說明文案、主要按鈕 `#modalHome`（L421 `返回首頁`）與次要按鈕 `#modalQuestionnaire`（L425 `直接填寫問卷`）。
- **內嵌 Demo／Placeholder**：
  - `[CODE_OBSERVED]` `#homeScreen`（L388 `<section class="screen" id="homeScreen" aria-labelledby="homeTitle">`）：簡易首頁外殼（`.home-shell`），僅供排除視窗展示返回首頁轉場，**非正式首頁**。
  - `[CODE_OBSERVED]` `#questionScreen`（L355 `<section class="screen" id="questionScreen" aria-labelledby="questionTitle">`）：示範問卷畫面，依 L451 `questions` 陣列實際包含 3 題（**無年齡區間題**）：
    1. `近一個月主觀睡眠品質如何？`（選項：很好、尚可、不好、很差）
    2. `每週中高強度活動總時數？`（選項：150 分鐘以上、75～150 分鐘、少於 75 分鐘、幾乎沒有）
    3. `一等親是否有高血脂或心血管病史？`（選項：無、有、不確定）
  - `[CODE_OBSERVED]` `#prototypeEnd`（L379 `<div class="prototype-end" id="prototypeEnd">`）：示範問卷完成提示卡與按鈕 `#endReturnHome`（`返回首頁`）。
  - `[CODE_OBSERVED]` `#demoPanel`（L433 `<div class="demo-panel" id="demoPanel" hidden>`）與 `#demoToggle`（L441，按鈕文字為 `Demo`）：展示控制器，提供 3 個按鈕：`播放正常流程` (`data-demo="success"`), `播放排除流程` (`data-demo="reject"`), `重新開始` (`data-demo="restart"`）。（**無其他不存在的 ID 或示範首頁按鈕**）。
- **核心互動與焦點管理**：
  - `[CODE_OBSERVED]` L514 `runLoading(mode)`：根據模式（`success` 或 `reject`）推進狀態文字，`reject`模式在第 2 階段結束後呼叫 `openExclude()`。
  - `[CODE_OBSERVED]` L511 `openExclude()` 開啟 Modal 後，延遲 80ms 執行 `excludeModal.focus()`。
  - `[CODE_OBSERVED]` L613-619 鍵盤焦點限制（Focus Trap）：監聽 `keydown` 事件，當排除視窗開啟時，`Tab` 與 `Shift+Tab` 循環鎖定於 Modal 內的兩個操作按鈕（`#modalHome`、`#modalQuestionnaire`）之間。
  - `[CODE_OBSERVED]` **代碼檢驗事實**：L614 明確僅檢查 `if (!excludeBackdrop.classList.contains('is-open') || event.key !== 'Tab') return;`，**原始碼中並未實作 `Escape` 鍵關閉排除視窗之邏輯**（此為原件現況，是否支援 Escape 屬 Phase 2 待決策事項，不預先判定為缺陷）。
- **樣式與字體定義**：
  - `[CODE_OBSERVED]` L13-26 `@font-face` 宣告字體 `"CareU LINE Seed TW"`（字重宣告 `400` 與 `700`）。
  - `[CODE_OBSERVED]` 斷點：`@media (max-width: 650px)` (L316), `@media (prefers-reduced-motion: reduce)` (L331)。

---

### 2.4 問卷頁與 Loading頁-2（Questionnaire & Loading Analysis）
- **原始碼路徑**：`source/prototypes/CareU_問卷頁_Loading頁-2_原型.html`（共 865 行）
- **對應規格與流程**：`source/page-specs/CareU_問卷頁_Loading頁-2_頁面規格.md`、`source/flows/CareU_網站流程說明.md` §6.1, §6.2, §6.3
- **正式畫面職責**：
  - `[CODE_OBSERVED]` `#questionScreen`（L425 `<section class="screen is-active" id="questionScreen" aria-labelledby="questionTitle">`）：問卷主表單，支援 `supplement`（資料補充模式）與 `full`（完整問卷模式），包含頂部進度條 `#progressFill`、問題卡片 `#questionPanel`、驗證提示 `#validationMessage`、上一題 `#previousQuestion` 與下一題 `#nextQuestion`。
  - `[CODE_OBSERVED]` `#analysisScreen`（L446 `<section class="screen" id="analysisScreen" aria-labelledby="analysisStatus">`）：Loading-2 分析等待畫面，包含 4 階段進度文字（L508 `analysisStages`）：
    1. `正在整理你提供的資料`（1600ms）
    2. `正在理解你的身體訊息`（1800ms）
    3. `正在整理適合你的保健方向`（1800ms）
    4. `正在準備你的個人化報告`（1200ms）
  - `[CODE_OBSERVED]` `#analysisError`（L456 `<div class="analysis-error" id="analysisError" tabindex="-1">`）：分析失敗狀態卡，包含標題「這次分析沒有順利完成」、說明「可能是網路或系統暫時忙碌。你的問卷內容已保留，可以再試一次。」及雙按鈕 `#returnQuestionnaire`（`返回問卷`）與 `#retryAnalysis`（`再試一次`）（**無任何聯繫客服按鈕**）。
- **內嵌 Demo／Placeholder**：
  - `[CODE_OBSERVED]` `#reportScreen`（L470 `<section class="screen" id="reportScreen" aria-labelledby="reportTitle">`）：報告頁預告外殼（`.report-shell`），包含 Eyebrow `REPORT READY`、標題「你的個人化報告已準備完成」、說明「此處將進入正式報告頁。報告內容會在後續原型中製作。」（**無查看報告跳轉按鈕，無自動倒數跳轉**，為純靜態 Placeholder）。
  - `[CODE_OBSERVED]` `#demoPanel`（L484 `<div class="demo-panel" id="demoPanel" hidden>`）與 `#demoToggle`（L494）：展示控制器，提供按鈕：`資料補充模式` (`data-demo="supplement"`), `完整問卷模式` (`data-demo="full"`), `直接開啟 Loading頁-2` (`data-demo="analysis"`), `模擬分析失敗` (`data-demo="analysis-error"`), `重新開始` (`data-demo="restart"`）。
- **表單題型、畫面數與進度槽對照**：
  - `[CODE_OBSERVED]` L501-505 步驟定義與畫面數統計：

| 流程模式 | 填答步驟清單 | complete 確認畫面 | 總畫面數 | 進度槽數量 (`progressOrder`) | 說明 |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **資料補充模式 (supplement)** | 6 個 (`diet`, `activity`, `sleep`, `measurements`, `allergies`, `safety`) | 1 個 | **7 個** | **7 個** (`supplementProgressOrder`) | 預設包含 safety 安全確認填答步驟。 |
| **完整問卷模式 (full - 非 female)** | 6 個 (`basic`, `diet`, `activity`, `sleep`, `measurements`, `allergies`) | 1 個 | **7 個** | **8 個** (`fullProgressOrder`) | `safety` 槽位固定保留於進度槽中，非 female 跳過 safety。 |
| **完整問卷模式 (full - female)** | 7 個 (`basic`, `diet`, `activity`, `sleep`, `measurements`, `allergies`, `safety`) | 1 個 | **8 個** | **8 個** (`fullProgressOrder`) | `basic.sex === 'female'` 時動態加入 safety 填答步驟。 |

  - `[CODE_OBSERVED]` L549 暫存管理原碼：`sessionStorage.setItem('careu-questionnaire', JSON.stringify({ mode: currentMode, answers, currentQuestion }))`。
  - `[CODE_OBSERVED]` 題目欄位與 HTML/JS 驗證細節：
    - `basic`（僅完整模式）：
      - `basic.age`：`type="number" min="1" inputmode="numeric" placeholder="歲"`
      - `basic.sex`：`female`（女性）、`male`（男性）、`other`（其他）單選
      - `basic.weight`：`type="number" min="1" step="0.1" inputmode="decimal" placeholder="kg"`
      - **注意**：無身高題；體重位於 basic 填答步驟而非 measurements；JS 驗證 `isStepValid('basic')` 僅檢查 `Boolean(answers.basic?.age && answers.basic?.sex && answers.basic?.weight)`，未在 JS 端做數值上限與邏輯範圍檢查。
    - `diet` / `activity` / `sleep`：單選卡片（`radioCards`），驗證 `answers[step] !== undefined`。
    - `measurements`：
      - `waist`（腰圍，cm）或勾選 `waistUnknown`（目前不知道）。
      - 完整模式另有 `systolic`（收縮壓，mmHg）與 `diastolic`（舒張壓，mmHg）或勾選 `bpUnknown`（目前不知道）。補充模式僅包含腰圍。
      - 聚焦數值輸入框時自動取消「目前不知道」勾選；勾選「目前不知道」時自動清空數值欄位。
    - `allergies`：
      - 11 項選項，勾選「無已知過敏」自動清除其他具體過敏原；勾選具體項目自動清除「無已知過敏」。
      - 勾選「其他」時條件顯示文字框 `allergyOther`（必填，未填時無法通過驗證）；取消勾選「其他」時隱藏並清空 `allergyOther`。
    - `safety`：
      - 補充模式預設包含 safety；完整模式僅在 `answers.basic?.sex === 'female'` 時動態加入 activeSteps。
      - `pregnant`（是/否）、`breastfeeding`（是/否）是非單選（`yesNo`）。
    - `complete`：問卷完成確認頁，顯示完成打勾圖示與送出確認提示。
  - `[CODE_OBSERVED]` L632 `nextQuestion.disabled = !isStepValid(...)`：未完成該步驟時下一題按鈕處於 `disabled` 狀態（正常使用者點擊不會觸發事件）；L763-766 於按鈕點擊處理函式中設置防禦性檢查：`validationMessage.textContent = '請完成這個步驟，或選擇「目前不知道」。'` 並將焦點移至可用輸入框。
- **樣式與字體定義**：
  - `[CODE_OBSERVED]` L13-26 `@font-face` 宣告字體 `"CareU LINE Seed TW"`（字重宣告 `400` 與 `700`）。
  - `[CODE_OBSERVED]` 斷點：`@media (max-width: 650px)` (L391), `@media (prefers-reduced-motion: reduce)` (L411)。

---

### 2.5 報告頁與會員登入視窗（Report & Auth Modal）
- **原始碼路徑**：`source/prototypes/CareU_報告頁_會員登入視窗_原型.html`（共 333 行）
- **對應規格與流程**：`source/page-specs/CareU_報告頁_會員登入視窗_頁面規格.md`、`source/flows/CareU_網站流程說明.md` §6.4, §7.2
- **正式畫面職責**：
  - `[CODE_OBSERVED]` 關注指標總覽區（L143 `<section class="chart-section" id="chartSection">`）：關注指標排行清單（`#chartList`），renderChart() 依既有 `profile.results` 順序取前 8 筆渲染長條項目（`CareUReport.loadReport()` 載入資料時依 score 降冪排序；未登入時前 2 名為鎖定遮罩）。
  - `[CODE_OBSERVED]` 優先關注三大方向（L148 `<section class="insight-section" id="insightSection">`）：呈現前 3 項優先指標卡片，未登入前部分卡片呈現鎖定遮罩與提示（`.locked-card`），登入後解鎖顯示完整分析文案。
  - `[CODE_OBSERVED]` 個人化保健品候選與自選組合（L154 `<section class="recommend-section" id="recommendSection">`）：依方向推薦保健品卡片、頁內展開更換候選品項（非 auxDialog）、自選組合清單、去重總額試算與購買示範按鈕。
  - `[CODE_OBSERVED]` 共用會員視窗（L171 `<section class="dialog-card" id="authDialog" role="dialog" aria-modal="true" aria-labelledby="authTitle">`）：位於 `#authLayer` 遮罩內，支援登入／註冊／忘記密碼 Tab 切換、Email 與密碼輸入、密碼顯示切換按鈕、表單驗證與送出解鎖。
  - `[CODE_OBSERVED]` 輔助資訊視窗（L176 `<section class="dialog-card cart-dialog" id="auxDialog" role="dialog" aria-modal="true">`）：位於 `#auxLayer` 內，供購物車彈窗與品項說明彈窗使用（**為 Dialog Card 彈窗，非 Drawer**）。
- **內嵌 Demo／Placeholder 與素材標記**：
  - `[CODE_OBSERVED]` 展示用假資料（L201-235）：`const blueprint = { ... }`（指標分析文案）、`const profiles = { a: makeProfile('a','小安',...), b: makeProfile('b','小晴',...), c: makeProfile('c','阿哲',...), g: makeProfile('g','小柔',...) }`（小安、小晴、阿哲、小柔模擬數據與警示等級）。
  - `[CODE_OBSERVED]` 商品型錄資料：`catalog.products` 包含來源健康食品資料欄位（品名、成分、宣稱等），但展示價格（`price`、`unitPrice`）與模擬推薦配對為前端示範資料。
  - `[CODE_OBSERVED]` 劑型視覺圖示：`productArt(id, compact)` (L247) 依商品名稱與分類動態生成膠囊／錠劑之 HTML DOM 與 CSS 樣式示意（`.capsule-art` / `.tablet-art`，`aria-label="膠囊與錠劑示意，非實際商品外觀"`），**非實際商品外觀照片，非向量圖形**。
  - `[CODE_OBSERVED]` 展示控制器（L170 `<aside class="demo-controller" id="demoController" aria-label="原型展示控制"><div class="demo-panel" id="demoPanel" hidden>` 與 `#demoToggle`）：提供切換不同受試者 Profile、直接切換會員登入/登出狀態、示範購買等按鈕（*更正：原始碼 ID 為 `#demoPanel` 與 `#demoToggle`，非 demoDock*）。
- **核心互動、表單驗證與選品計算**：
  - `[CODE_OBSERVED]` 共用 Modal 管理器（L269-284）：提供 Focus Trap、背景 `inert` 鎖定、`Escape` 鍵監聽關閉（L281）；捲動鎖定與還原實作在 `openModal()` 與 `closeModal()` 內部，使用 `document.body.style.position = 'fixed'`、`document.body.style.top = '-' + lockedScroll + 'px'` 與 `document.body.style.width = '100%'`（**無 `dialog-open` class 實作**）。
  - `[CODE_OBSERVED]` 會員表單驗證（`#authForm` submit handler）：
    - Email：使用原生 `authEmail.validity.valid` 進行格式驗證。
    - 密碼：在登入或註冊模式下長度需 `>= 8` 字元（未達顯示「密碼至少需要 8 個字元」）。
    - 忘記密碼模式：不要求輸入密碼。
    - 註冊模式：確認密碼需與密碼一致（不一致顯示「兩次輸入的密碼不一致」）。
    - 快速示範登入：`#quickDemoLogin` 按鈕可略過手動輸入直接以示範身分完成登入。
  - `[CODE_OBSERVED]` 自選組合與價格計算（L245-265）：
    - `resetSelection()`：初始化各方向候選品項選取，避免不同方向重複選取相同商品。
    - `selectProduct(cid, pid)`：點擊更換候選品項（頁內展開，非彈窗），若該品項已於其他方向選取，提示「這個品項已在組合中，不會重複加入。」並阻擋重複加入。
    - 總額計算：`total = () => uniqueSelected().reduce((n, p) => n + p.price, 0)`（去重後加總價格，**無除以 30 每日花費計算**）；每粒單價取自 `p.unitPrice`。
  - `[CODE_OBSERVED]` 購物車與購買示範：`#cartButton` 呼叫 `showCart()`，未登入引導登入；確認購買彈出 `#auxDialog` 示範確認視窗（不扣款、不建立訂單）。
- **樣式與字體定義**：
  - `[CODE_OBSERVED]` L8-9 `@font-face` 宣告字體 `"CareU LINE Seed TW"`（字重宣告 `400` 與 `700`，內嵌 Base64 WOFF）。
  - `[CODE_OBSERVED]` 斷點：包含 29 組響應式斷點宣告（含 1500px, 1250px, 1100px, 1000px, 850px, 720px, 600px, 420px 等不同區塊之細緻適配）。

---

## 3. 網站流程與狀態對照（Flows & State Transitions）

### 3.1 跨文件流程與分支對照表
`[SPEC_STATED]` 網站流程由 `source/flows/CareU_網站流程說明.md` 與 `CareU_網站流程圖.png` 共同定義；`[CODE_OBSERVED]` 為 5 份獨立 HTML 原型之實際實作行為：

| 流程節點／觸發 | 原型實作行為 (`[CODE_OBSERVED]`) | 頁面規格描述 (`[SPEC_STATED]`) | 流程文件規範 (`[SPEC_STATED]`) | 差異分析與後續處置 |
| :--- | :--- | :--- | :--- | :--- |
| **開場動畫結束** | 2850ms 後自動進入示意首頁；點擊畫面或按 Enter/Space 立即跳過。 | 播放品牌開場動畫後進入首頁。 | 完成開場動畫後進入首頁。 | 行為一致，轉場時序於規格定案時配置。 |
| **首頁選擇檔案** | 點擊主 CTA 先開啟 uploadSheet，點「新增或重新選擇」才開啟原生選檔器。最多保留 10 個檔案，支援累加選檔。 | 點擊主 CTA 先開啟 uploadSheet，點「新增或重新選擇」才開啟原生選檔器。 | 選擇並上傳健檢資料。 | 一致。 |
| **首頁點擊問卷** | 點擊「沒有資料？先從問卷開始 →」觸發 Toast「原型提示：此處將前往健康問卷頁」。 | 點擊次要連結直接進入問卷流程（無健檢來源）。 | 沒有體檢資料：直接問卷頁。 | 原型僅有 Toast 示意，需由 Vue Router 導航接軌。 |
| **首頁會員登入** | 點擊 `#memberLogin` 僅觸發 Toast「原型提示：此處將開啟會員登入」。 | 首頁可呼叫共用 Login Modal。 | 首頁可呼叫共用 Login Modal，登入後返回首頁。 | **D-08 差異**：首頁原檔無 Modal DOM，需於 Phase 5 整合共用元件。 |
| **Loading-1 異常** | 健檢資料無法讀取時彈出排除視窗，提供「返回首頁」（`#modalHome`）與「直接填寫問卷」（`#modalQuestionnaire`）雙按鈕。 | 排除視窗提供返回首頁重新上傳，或直接進入問卷。 | 異常流程：排除視窗（Modal）→ 返回首頁（未載明直接問卷按鈕）。 | **D-01 差異**：流程圖未載明次要問卷分支，留待 Phase 2 裁決。 |
| **問卷送出分析** | 送出後進入 Loading-2 4 階段推進，完成後顯示報告預告 Placeholder；失敗顯示重試卡片。 | 問卷完成後進入 Loading-2；分析失敗顯示重試狀態。 | 問卷頁 → Loading頁-2 → 報告頁。 | 失敗重試分支於原型已實作，流程圖未展開異常分支。 |
| **報告頁登入解鎖** | 點擊「會員登入」或鎖定卡片開啟 Login Modal，登入成功直接將 `state.member = true` 解鎖內容。 | 登入成功後直接解鎖會員內容，不重跑問卷或 Loading。 | 報告頁登入成功後直接解鎖會員內容。 | 一致。 |

### 3.2 路由候選清單（Route Candidates，`[PROPOSED]`）
*註：原型為獨立檔案，目前整站路由尚未串接。以下為後續 Phase 2 規格制定與 Phase 3 Vue Router 之建議候選提案：*

| 路由路徑候選 | 頁面名稱 | 對應原型基準 | 狀態與參數候選 (`[PROPOSED]`) | 說明 |
| :--- | :--- | :--- | :--- | :--- |
| **`/`** | 入口開場／首頁 | `CareU_入口頁原型.html` + `CareU_首頁原型.html` | `?splash=skip` | 開場動畫結束後平滑轉入首頁，或由 Session 記錄略過。 |
| **`/loading/intake`** | 健檢讀取等待頁 | `CareU_Loading頁-1_排除視窗_原型.html` | `?mode=reject` | 承接首頁檔案上傳後的等待與排除轉場。 |
| **`/questionnaire`** | 健康問卷頁 | `CareU_問卷頁_Loading頁-2_原型.html` | `?source=intake` 或 `?source=direct` | 動態決定補充模式（6 個填答步驟＋complete＝7 畫面，7 個進度槽）或完整模式（非 female 為 6 個填答步驟＋complete＝7 畫面、female 為 7 個填答步驟＋complete＝8 畫面，8 個進度槽）。 |
| **`/loading/analysis`** | 個人化分析中 | `CareU_問卷頁_Loading頁-2_原型.html` | `?retry=1` | 問卷送出後的分析等待與重試轉場。 |
| **`/report`** | 個人化健康報告 | `CareU_報告頁_會員登入視窗_原型.html` | `?auth=login` | 完整個人化報告、圖表展示與選品組合。 |

---

## 4. 表單、驗證與條件邏輯清冊

### 4.1 表單輸入與驗證清單
`[CODE_OBSERVED]` 各頁面表單之驗證機制與觸發方式盤點如下：

| 表單位置 | 欄位／輸入項 | 驗證規則 (`[CODE_OBSERVED]`) | 觸發方式與錯誤呈現 | 備註與邊界 |
| :--- | :--- | :--- | :--- | :--- |
| **首頁**<br>`#uploadSheet` | 健檢檔案 (`#fileInput`) | 1. 格式：PDF, JPG, JPEG, PNG<br>2. 容量：單檔 `<= 25MB` | 檔案選擇後立即過濾：<br>• 不符格式：Toast 紅字「檔案格式不符合」<br>• 超過 25MB：Toast 紅字「檔案容量超過限制」 | 25MB 限制為前端原型設定，不可直接視為正式後端契約。 |
| **問卷頁**<br>`basic` | 年齡 (`age`)、生理性別 (`sex`)、體重 (`weight`) | `Boolean(age && sex && weight)` | 未填時 `#nextQuestion` 處於 `disabled`；點擊觸發 `#validationMessage` 防禦性提示 | `sex` 選項包含 `female`、`male`、`other`；體重於此步驟輸入（無身高題）；JS 端未設數值範圍上限檢查。 |
| **問卷頁**<br>`diet` / `activity` / `sleep` | 飲食、活動量、睡眠品質 | 單選卡片（`radioCards`）必選其一 (`answers[step] !== undefined`) | 未選時 `#nextQuestion.disabled = true` | 補充模式與完整模式皆包含。 |
| **問卷頁**<br>`measurements` | 腰圍 (`waist`)，完整模式另有收縮壓 (`systolic`)、舒張壓 (`diastolic`) | 需填寫數值或勾選對應之「目前不知道」（`waistUnknown`、`bpUnknown`） | 未填且未勾選未知時停用下一題按鈕 | 聚焦數值欄位自動取消未知勾選；勾選未知自動清空數值。 |
| **問卷頁**<br>`allergies` | 過敏原清單 (`checkbox`) + 其他文字框 (`allergyOther`) | 1. 至少選擇一項<br>2. 「無已知過敏」與具體過敏原互斥<br>3. 勾選「其他」時文字框為必填 | 勾選互斥項目即時連動切換；「其他」未填文字時無法通過驗證 | 取消勾選「其他」時自動清空 `allergyOther` 欄位值。 |
| **問卷頁**<br>`safety` | 懷孕 (`pregnant`)、哺乳 (`breastfeeding`) 狀態 | `pregnant`（是/否）、`breastfeeding`（是/否）是非單選 | 兩項皆須完成選擇 | 補充模式必填；完整模式僅在 `basic.sex === 'female'` 時顯示。 |
| **報告頁**<br>`#authDialog` | 電子郵件 (`#authEmail`)、密碼 (`#authPassword`)、確認密碼 (`#authConfirm`) | 1. Email：符合原生 `authEmail.validity.valid` 格式驗證<br>2. 密碼：登入/註冊模式長度 `>= 8`<br>3. 確認密碼：註冊模式需與密碼相符 | 表單送出（Submit）時檢驗，未通過於 `#authError` 顯示紅字提示 | 忘記密碼模式不要求密碼；可透過 `#quickDemoLogin` 示範按鈕快速登入。 |

### 4.2 商品自選組合計算邏輯
- `[CODE_OBSERVED]` 報告頁 `CareU_報告頁_會員登入視窗_原型.html` L245-265 實作了商品加減選、替換與價格即時計算：
  - `resetSelection()`：初始化各方向候選品項選取，避免不同方向重複選取相同商品。
  - `selectProduct(cid, pid)`：點擊更換候選品項（頁內候選展開，非彈窗），若該品項已於其他方向選取，提示「這個品項已在組合中，不會重複加入。」並阻擋重複加入。
  - 總額計算：`total = () => uniqueSelected().reduce((n, p) => n + p.price, 0)`（去重後加總價格，無除以 30 每日花費公式）；每粒單價取自商品資料之 `p.unitPrice`。
  - 購物車確認：點擊 `#cartButton` 開啟 `#auxDialog` 彈窗展示選購品項與去重總額。


---

## 5. 視覺、動畫與無障礙（Visuals, Animations & A11y）

### 5.1 Design Tokens 與樣式變數名稱
`[CODE_OBSERVED]` 5 份 HTML 原型之視覺規格與實際變數名稱盤點如下：

| Token 類別 | 入口頁 (`CareU_入口頁原型.html`) | 首頁 (`CareU_首頁原型.html`) | Loading-1 / 排除視窗 | 問卷頁 / Loading-2 | 報告頁 / 登入視窗 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **品牌主色 (Blue)** | `#197afc` (`--brand-blue`) | `#197AFC` (`--blue`) | `#197AFC` (`--blue`) | `#197AFC` (`--blue`) | `#197AFC` (`--blue`) |
| **主色橘 (Orange)** | `#fb8f54` (`--brand-orange`) | `#FB8F54` (`--orange`) | `#FB8F54` (`--orange`) | `#FB8F54` (`--orange`) | `#FB8F54` (`--orange`) |
| **深藍文字 (Navy)** | `#07295c` (`--brand-navy`) | `#07295C` (`--navy`) | `#07295C` (`--navy`) | `#07295C` (`--navy`) | `#07295C` (`--navy`) |
| **底色／表面色** | `#f7f8fa` (`--surface`) | `#F7F8FA` (`--surface`) | `#F7F8FA` (`--paper`) | `#F7F8FA` (`--paper`) | `#F7F8FA` (`--paper`) |
| **淺藍輔色** | - | `#A3D3F7` (`--sky`) | `#A3D3F7` (`--light-blue`) | `#A3D3F7` (`--light-blue`) | `#A3D3F7` (`--light`) |
| **珊瑚粉輔色** | - | `#EB938E` (`--coral`) | `#EB938E` (`--coral`) | `#EB938E` (`--coral`) | `#EB938E` (`--coral`) |
| **主字體命名** | 系統預設字體 Fallback | `"LINE Seed TW"` | `"CareU LINE Seed TW"` | `"CareU LINE Seed TW"` | `"CareU LINE Seed TW"` |
| **字重宣告** | 系統預設 | `100 600`, `700 900` | `400`, `700` | `400`, `700` | `400`, `700` |
| **內嵌字體格式** | 無 (0 bytes) | Base64 WOFF (99KB+101KB) | Base64 WOFF (86KB+85KB) | Base64 WOFF (86KB+85KB) | Base64 WOFF (4.3MB+4.5MB) |

*字體字集說明：報告頁內嵌之 4.3MB 與 4.5MB WOFF 字體檔，其具體字元涵蓋範圍未經字體內部編碼表結構檢驗，標記為「字集範圍未確認」，不主觀斷定其為完整繁中字集。底色與淺藍變數名稱因頁面而異（`--surface` vs `--paper`、`--sky` vs `--light-blue` vs `--light`），不混寫為單一 `--bg`。*

### 5.2 Canvas 動態背景差異
- `[CODE_OBSERVED]` 首頁（`CareU_首頁原型.html` L991）：Canvas 尺寸由 `hero.getBoundingClientRect()` 取得，**僅侷限於 Hero 容器範圍內**。
- `[CODE_OBSERVED]` Loading-1（`CareU_Loading頁-1_排除視窗_原型.html` L640）與問卷頁（`CareU_問卷頁_Loading頁-2_原型.html` L805）：Canvas 尺寸由 `innerWidth` 與 `innerHeight` 計算，**為全螢幕背景覆蓋**。

### 5.3 響應式斷點與佈局
- `[CODE_OBSERVED]` 入口頁：`480px`（手機垂直微調）。
- `[CODE_OBSERVED]` 首頁：`820px`（直排切換）、`520px`（手機緊湊模式）。
- `[CODE_OBSERVED]` Loading-1 / 問卷頁：`650px`（卡片轉為單欄滿寬、雙按鈕改為直排）。
- `[CODE_OBSERVED]` 報告頁：共包含 29 組媒體查詢規則，核心斷點落在 `1500px`、`1250px`、`1100px`、`1000px`、`850px`、`720px`、`600px`、`420px`。

### 5.4 動畫與 Reduced Motion 降級
- `[CODE_OBSERVED]` 入口頁：`blue-clear`、`sunrise`、`copy-in` 等 Keyframe 動畫；`prefers-reduced-motion` 下不安排自動進入，手動進入延遲為 0ms。
- `[CODE_OBSERVED]` 首頁 & Loading-1 & 問卷頁：Canvas 粒子背景在 `reducedMotion = true` 時停止 `requestAnimationFrame` 循環，僅繪製靜態節點（`pointer.active` 互動關閉）。
- `[CODE_OBSERVED]` 報告頁：卡片滾動揭露（`observeReveal` 使用 `IntersectionObserver`），在 `prefers-reduced-motion` 下關閉平滑滾動與延遲淡入。

### 5.5 無障礙（A11y）與焦點管理現況
- `[CODE_OBSERVED]` 首頁 `#uploadSheet` 與 `#routeScreen` 宣告 `role="dialog" aria-modal="true"`，支援 `Escape` 鍵關閉（L986）。
- `[CODE_OBSERVED]` Loading-1 `#excludeModal` 實作 Tab / Shift+Tab 焦點循環限制（Focus Trap，L613），**原始碼中未實作 Escape 鍵關閉**。
- `[CODE_OBSERVED]` 報告頁 `#authDialog` 與 `#auxDialog` 實作完整 Modal Manager，支援 Focus Trap、`Escape` 鍵關閉（L281）及背景 `inert`，並透過 `document.body.style.position = 'fixed'`、`document.body.style.top` 與 `document.body.style.width = '100%'` 實作捲動鎖定（**無 `dialog-open` class 實作**）。
- `[RUNTIME_UNVERIFIED]` 上述無障礙結構在實際螢幕閱讀器（NVDA / VoiceOver）上的朗讀順序與真機操作無水平溢出狀態，仍待真機與瀏覽器環境驗證。

---

## 6. JavaScript 狀態、事件、計時器與 Demo 邊界

### 6.1 狀態持久化與儲存機制
- `[CODE_OBSERVED]` 全站僅問卷頁（`CareU_問卷頁_Loading頁-2_原型.html` L549）使用 `sessionStorage.setItem('careu-questionnaire', JSON.stringify({ mode: currentMode, answers, currentQuestion }))` 保存作答進度。
- `[INFERRED]` 未來專案工程化時：
  - 「跨頁共享狀態」（如使用者健檢分析結果、問卷答案、會員登入狀態、自選商品組合）應於 Phase 8 由 **Pinia Store** 於前端記憶體中統一管理。
  - 「後端資料保存」與「前端暫存」職責分開；**未經後端架構與資安隱私政策定案前，不得將敏感健檢資料隨意寫入前端 localStorage**。

### 6.2 計時器與生命週期清理風險
- `[CODE_OBSERVED]` 各頁面計時器盤點：
  - 入口頁：`scheduleAutoEnter`（2850ms `setTimeout`）。
  - Loading-1 & Loading-2：4 階段狀態文字推進的累計 `setTimeout`。
  - 首頁：`showToast` 的 2800ms 自動淡出計時器、Canvas 的 `requestAnimationFrame`。
  - 報告頁：Profile 切換與模擬加載轉場計時器。
- `[INFERRED]` 在 Vue 元件化遷移時，所有 `setTimeout`、`setInterval` 與 `requestAnimationFrame` 必須在 `onUnmounted` 生命週期鉤子中執行 `clearTimeout` 與 `cancelAnimationFrame`，避免元件切換時產生記憶體洩漏與無效回呼。

### 6.3 Demo 控制器與 Mock 邏輯分離清單
以下代碼屬於原型展示與測試專用，在正式遷移實作中應被隔離或封裝至開發測試模式（Dev Mode / Mock），**不屬於正式業務代碼**：
1. 入口頁：`#replay` 動畫重播按鈕及節點複製邏輯。
2. 首頁：`#routeScreen` 模擬轉場對話框。
3. Loading-1：`#homeScreen`（簡易首頁）、`#questionScreen`（簡易 3 題示範問卷）、`#prototypeEnd`、`#demoPanel`（展示控制器，按鈕：播放正常流程、播放排除流程、重新開始）。
4. 問卷頁：`#reportScreen`（報告預告）、`#demoPanel`（模式切換器，按鈕：資料補充模式、完整問卷模式、直接開啟 Loading頁-2、模擬分析失敗、重新開始）。
5. 報告頁：`#demoPanel`、`#demoToggle`（展示控制列）、`const profiles`（小安、小晴、阿哲、小柔模擬設定）、`const blueprint`（靜態文案資料庫）、`catalog.products`（包含來源資料欄位與展示模擬價格／劑型圖示）。



---

## 7. 模組化共用元件候選（Component Candidates，`[PROPOSED]`）

`[PROPOSED]` 依據 5 份 HTML 原型重複出現之 UI 結構與互動邏輯，建議於 Phase 5 元件開發時抽取下列候選元件（*註：非正式架構定案，僅為遷移提案*）：

| 候選元件名稱 | 出現原型位置 | 抽取理由與功能定位 | 差異與整合要點 |
| :--- | :--- | :--- | :--- |
| **`DataCanvas.vue`** | 首頁 (L752)、Loading-1 (L341)、問卷頁 (L421) | 動態粒子網絡背景，包含滑鼠/觸控互動與 Reduced Motion 靜態降級。 | 首頁僅侷限於 Hero 容器，Loading 與問卷頁為全螢幕，需封裝為 Props。 |
| **`LoginModal.vue`** | 首頁 (L869 僅入口按鈕)、報告頁 (L171 完整 Modal) | 共用會員登入／註冊／忘記密碼視窗。 | **核心整合點**：首頁僅有按鈕無 Modal，報告頁有完整 Modal；遷移時需將報告頁之 Modal 抽取為全站共用元件。 |
| **`AppHeader.vue`** | 首頁 (L767)、報告頁 (L142) | 頂部導航列，包含 Care U 品牌 Logo、登入狀態與操作入口。 | 報告頁多了購物車入口圖示與錨點連結。 |
| **`BaseDialog.vue`** | 首頁 `#uploadSheet`、Loading-1 `#excludeModal`、報告頁 `#authDialog` / `#auxDialog` | 基礎彈窗外殼，提供背景遮罩、Focus Trap、Escape 鍵關閉與 Body Scroll Lock。 | Loading-1 原始碼未實作 Escape 鍵，是否納入統一規範留待 Phase 2 決策。 |
| **`ToastNotification.vue`** | 首頁 (L876)、報告頁 (L180) | 浮動狀態通知訊息（`aria-live="polite"`）。 | 封裝為全站通知服務或 Store 呼叫。 |
| **`QuestionCard.vue`** | 問卷頁 (L575-603) | 支援單選卡片（`RadioCards`）、是非單選（`YesNo`）、數值輸入與過敏原核取方塊。 | 需支援補充模式與完整模式之動態題型渲染。 |
| **`HealthCategoryBarList.vue`** | 報告頁 (L143) | 橫向長條指標清單元件，renderChart() 依既有 profile.results 順序取前 8 筆渲染（載入資料時依 score 降冪排序）。 | 支援前兩筆鎖定遮罩、未登入鎖定提示與會員登入後即時解鎖。 |
| **`InsightCard.vue`** | 報告頁 (L148) | 優先關注方向卡片，支援解鎖態、鎖定遮罩態（`.locked-card`）與警示等級標籤。 | 需與會員登入狀態聯動。 |
| **`ProductCandidateCard.vue`** | 報告頁 (L154) | 候選保健食品卡片，包含功效標籤、價格、選取按鈕與頁內候選展開切換。 | 支援 `productArt()` (L247) HTML DOM＋CSS 劑型示意渲染、去重選取與組合價格連動。 |

---

## 8. 差異清單與後續處理（Discrepancies Matrix）

| 編號 | 項目描述 | 原始碼／文件證據 | 影響評估 | 建議處理階段 |
| :---: | :--- | :--- | :--- | :---: |
| **D-01** | **排除視窗操作分支** | `CareU_Loading頁-1_排除視窗_原型.html` L421/L425 包含 `#modalHome` 與 `#modalQuestionnaire` 雙按鈕；`CareU_網站流程說明.md` §4.3 僅列「返回首頁」。 | 影響異常流程路由與轉場分支。 | Phase 2 規格定案 |
| **D-02** | **問卷題庫範圍** | `source/data/questionnaire/12項完整問卷...txt` 包含 12 類 29 題評估+3 題安全禁忌；`CareU_問卷頁_Loading頁-2_原型.html` L501 僅實作 6~7 個填答步驟之聚合 Demo。 | 影響問卷題型組件、資料模型與後端契約。 | Phase 2 / Phase 7 |
| **D-03** | **計分與加權演算法** | 問卷 TXT 提及標準化 0~100 分與客觀數值權重，但無精確計算公式；報告頁 L215 為固定 Mock 分數。 | 影響推薦引擎與評分計算邏輯。 | Phase 2 / Phase 7 |
| **D-04** | **Derived CSV 缺網址** | `健康食品資料集_DB欄位版.csv` 無來源網址；`健康食品資料集(膠囊).csv` 有網址欄位。 | 影響商品詳情外部連結功能。 | Phase 7 資料對齊 |
| **D-05** | **CSV 欄位跳脫字元** | 部分文字跳脫字元問題已列入待查；具體類型及範圍待複核，等待組員新版，目前不清洗。 | 等待組員提供新版清洗資料，目前保持原件不清洗。 | Phase 7 資料清洗 |
| **D-06** | **字體命名與字重** | 首頁使用 `"LINE Seed TW"`（`100 600` / `700 900`）；其餘頁使用 `"CareU LINE Seed TW"`（`400` / `700`）。 | 影響 Typography Token 統一規範。 | Phase 2 Token 定案 |
| **D-07** | **流程圖檔副檔名** | `CareU_網站流程圖.png` 實質為 JFIF/JPEG 編碼格式。 | 維持來源原樣，不逕行轉檔。 | Phase 2 / Phase 3 |
| **D-08** | **首頁無登入 Modal** | `CareU_首頁原型.html` L975 僅有 Toast 提示，無登入視窗結構；`CareU_報告頁_會員登入視窗_原型.html` L171 具備完整登入 Modal。 | 需於 Phase 2 定義共用 `LoginModal` 規格。 | Phase 2 / Phase 5 |
| **D-09** | **Loading-1 缺 Escape 關閉** | `CareU_Loading頁-1_排除視窗_原型.html` L614 僅監聽 Tab 鍵，未實作 Escape 鍵關閉排除視窗。 | 是否於排除視窗加入 Escape 關閉屬待確認決策。 | Phase 2 規格決策 |

---

## 9. 5 大獨立 HTML 精簡人工驗收清單（Manual Verification Checklist）

*注意：5 份原型為獨立檔案，驗收時請以瀏覽器個別開啟對應 HTML 檔案進行測試。所有預期行為均標註為 `[RUNTIME_UNVERIFIED]`。*

### 9.1 入口頁 (`CareU_入口頁原型.html`)
1. **正常進入 (`[RUNTIME_UNVERIFIED]`)**：以瀏覽器開啟檔案，觀察開場動畫是否執行，並於約 2.85 秒後自動淡出，延遲約 170ms 後顯示示意首頁。
2. **手動略過 (`[RUNTIME_UNVERIFIED]`)**：重新整理頁面，在動畫播放期間點擊畫面或按 `Enter` / `Space` 鍵，確認是否立即切換至示意首頁。
3. **重新播放 (`[RUNTIME_UNVERIFIED]`)**：在示意首頁點擊「重新播放入口動畫」按鈕，確認動畫是否能重新播放。

### 9.2 首頁 (`CareU_首頁原型.html`)
1. **檔案選擇與上傳 (`[RUNTIME_UNVERIFIED]`)**：點擊「從體檢資料開始瞭解」按鈕先開啟上傳面板；點擊面板內「新增或重新選擇」選擇測試用 PDF 或圖片檔案，確認是否列出檔案（單次最多保留 10 檔）。
2. **錯誤格式防呆 (`[RUNTIME_UNVERIFIED]`)**：嘗試選擇非支援格式（如 `.txt`），確認是否顯示紅字錯誤 Toast 提示「檔案格式不符合：僅支援 PDF、JPG、PNG。」（2800ms 後自動消失）。
3. **視窗關閉 (`[RUNTIME_UNVERIFIED]`)**：在上傳面板開啟時按下 `Escape` 鍵或點擊關閉按鈕「×」，確認面板是否關閉。
4. **滾動互動 (`[RUNTIME_UNVERIFIED]`)**：滾動至第二屏，觀察右下角「會員登入」按鈕是否平滑切換位置（`is-on-explanation`）。

### 9.3 Loading頁-1 與排除視窗 (`CareU_Loading頁-1_排除視窗_原型.html`)
1. **正常流程 (`[RUNTIME_UNVERIFIED]`)**：開啟頁面，觀察 4 階段狀態文字（讀取檔案中 → 正在分析資料 → 正在整理需補充資訊 → 正在準備下一步）是否依序切換，最後進入示範問卷。
2. **排除視窗 (`[RUNTIME_UNVERIFIED]`)**：點擊右下角「Demo」按鈕 → 選擇「播放排除流程」，確認是否在第 2 階段結束後彈出排除視窗。
3. **焦點測試 (`[RUNTIME_UNVERIFIED]`)**：排除視窗開啟時按 `Tab` 與 `Shift+Tab`，確認焦點是否被限制在「返回首頁」（`#modalHome`）與「直接填寫問卷」（`#modalQuestionnaire`）按鈕之間。

### 9.4 問卷頁與 Loading頁-2 (`CareU_問卷頁_Loading頁-2_原型.html`)
1. **步驟填答與防呆 (`[RUNTIME_UNVERIFIED]`)**：在未選擇任何選項時，確認下一題按鈕是否處於 `disabled` 狀態；完成作答後點擊「下一題」，確認進度條推進。
2. **過敏互斥 (`[RUNTIME_UNVERIFIED]`)**：在過敏原題目勾選具體項目後再勾選「無已知過敏」，確認具體項目是否被自動取消；勾選「其他」時確認是否展開文字輸入框。
3. **狀態還原 (`[RUNTIME_UNVERIFIED]`)**：填寫至第 3 步後重新整理瀏覽器（F5），確認作答進度是否自 `sessionStorage` 正確還原。
4. **Loading-2 轉場 (`[RUNTIME_UNVERIFIED]`)**：完成問卷送出，確認是否進入 4 階段分析等待動畫，最後顯示報告預告 Placeholder 卡片。
5. **分析失敗與重試 (`[RUNTIME_UNVERIFIED]`)**：點擊右下角「Demo」按鈕 → 選擇「模擬分析失敗」，確認是否顯示失敗卡片並提供「返回問卷」（`#returnQuestionnaire`）與「再試一次」（`#retryAnalysis`）按鈕。

### 9.5 報告頁與會員登入視窗 (`CareU_報告頁_會員登入視窗_原型.html`)
1. **長條圖指標清單 (`[RUNTIME_UNVERIFIED]`)**：開啟報告頁，觀察關注指標總覽區是否依 `profile.results` 順序顯示前 8 筆橫向長條項目，未登入時前 2 名呈現鎖定遮罩。
2. **會員登入解鎖 (`[RUNTIME_UNVERIFIED]`)**：點擊頂部「會員登入」或點擊「快速示範登入」（`#quickDemoLogin`），確認登入後指標鎖定項目與三大方向鎖定卡片是否立即解鎖。
3. **密碼切換與驗證 (`[RUNTIME_UNVERIFIED]`)**：點擊密碼眼睛圖示切換明文/遮罩；切換至註冊模式測試密碼小於 8 碼或兩次密碼不一致時的錯誤提示。
4. **頁內更換選品 (`[RUNTIME_UNVERIFIED]`)**：在推薦方向點擊「更換品項」，確認是否於頁內展開候選品項清單；選取不同品項時確認總額是否即時更新，且跨方向重複選取時是否跳出防重提示。
5. **購物車與購買示範 (`[RUNTIME_UNVERIFIED]`)**：點擊頂部購物車圖示或底部購買示範按鈕，確認是否彈出 `#auxDialog` 彈窗展示選購品項與去重總額。
6. **無障礙關閉 (`[RUNTIME_UNVERIFIED]`)**：在登入視窗或購物車彈窗開啟時按下 `Escape` 鍵，確認視窗是否關閉且 Body 恢復正常捲動。

---

## 10. 驗證與合規說明

- **代碼事實（CODE_OBSERVED）**：5 份原型檔案皆未發現外部網路依賴；各頁面動畫、Canvas 差異、長條圖清單與表單驗證機制如實記錄；首頁僅有登入 Toast，報告頁具備完整登入 Modal 與頁內候選更換邏輯。
- **推論邊界（INFERRED）**：Vue 模組化工程化時，首頁與報告頁之登入視窗應收斂為共用 `LoginModal.vue`（Phase 5）；問卷與使用者狀態應由 Pinia Store 管理（Phase 8）。
- **建議提案（PROPOSED）**：Phase 1 保持唯讀靜態審計，不修改任何原始檔案；所有 Route 與元件建議均為候選方案。
- **未驗證事項（RUNTIME_UNVERIFIED）**：多設備真機渲染流暢度、螢幕閱讀器完整導覽、真實後端 API 整合可行性。

---
*Frontend Migration Audit 報告完成，請 Technical PM 審閱。*
