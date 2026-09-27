# Care U｜整站流程與路由架構規格（Site Flow & Routing Specification）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 工程規格草案（待 Technical PM 審閱）
- **主要依據**：
  - `source/flows/CareU_網站流程說明.md` `[SPEC_STATED]`
  - `source/flows/CareU_網站流程圖.png` `[SPEC_STATED]`
  - `source/project-brief/CareU_Technical_PM_AI_Agent_Prompt_v2.txt` `[SPEC_STATED]`
  - 5 份 HTML 完成版原型代碼事實 `[CODE_OBSERVED]`
- **標記規範**：
  - `[CONFIRMED]`：使用者已確認的決策或已有明確依據的需求
  - `[CODE_OBSERVED]`：自原始碼直接查核之代碼事實
  - `[SPEC_STATED]`：來源規格或流程文件載明之規範
  - `[PROPOSED]`：供後續工程實作之候選提案（非定案架構）
  - `[TBD]`：尚缺資料或決策之待確認項目
  - `[RUNTIME_UNVERIFIED]`：未經瀏覽器／真機執行驗證之項目

---

## 1. 核心決策與共用規範引用

本流程規格嚴格落實以下已確認決策與共用規範：

- **`[CONFIRMED]` DEC-01（排除視窗分支）**：
  - 排除視窗保留「返回首頁」（`#modalHome`）與「直接填寫問卷」（`#modalQuestionnaire`）雙按鈕。
  - 在工程流程中明確補齊「直接填寫問卷」分支；被排除之健檢檔案**不得視為已成功解析的健檢資料**，點擊直接填寫問卷將銜接「無有效健檢資料之完整問卷流程（`full` 模式）」。
  - 來源流程圖 PNG 與說明 MD 保持原始檔案不修改。
- **`[CONFIRMED]` DEC-02（問卷遷移範圍）**：
  - 先依現有原型遷移「資料補充（`supplement`）」與「完整問卷（`full`）」兩種模式與既有互動邏輯。
  - 完整 12 類 32 題題庫留待 Phase 7 資料對齊，不將現有 6~7 步 Demo 問卷認定為正式推薦所需之完整題庫。
  - 資料驅動渲染（Schema-driven Questionnaire）僅列為候選架構方案（`[PROPOSED]`），不承諾僅替換 Schema 即可完成後端整合。
- **`[CONFIRMED]` DEC-03（字體策略）**：
  - 記錄共用 Typography Token 候選並保留各頁字體宣告差異（首頁 `"LINE Seed TW"`、Loading-1/問卷/報告 `"CareU LINE Seed TW"`、入口頁系統無襯線字體）。
  - 現階段不進行字體檔合併或轉換為統一 WOFF2 檔案。
- **`[CONFIRMED]` DEC-04（排除視窗 Escape 行為）**：
  - 保留原型代碼事實：**排除視窗不支援 `Escape` 鍵關閉**，使用者必須點擊「返回首頁」或「直接填寫問卷」按鈕做出明確選擇。
  - 共用 Modal 元件不得以預設行為意外覆蓋此規則。
- **`[CONFIRMED]` 共用登入視窗行為規範**：
  - 首頁呼叫 Login Modal 登入成功後：關閉 Modal 並留在首頁（`returnTo: 'home'`），不跳轉專屬畫面。
  - 報告頁呼叫 Login Modal 登入成功後：關閉 Modal 並原地解鎖會員內容（`returnTo: 'report'`，前 2 名指標與自選品項解鎖），保留使用者當前閱讀位置與焦點，**絕不重新執行問卷或 Loading 分析**。
  - Login Modal 嚴格定位為「全域共用模態視窗元件」，不是獨立路由頁面。正式後端驗證與 Session 機制定案屬 Phase 10（API 契約）。

---

## 2. 整站流程圖解（Site Flow Diagram）

```mermaid
flowchart TD
    Splash["入口頁 (Splash Page)<br><code>/</code> 或 <code>/splash</code>"]
    Home["首頁 (Home & Upload)<br><code>/home</code>"]
    Loading1["Loading頁-1 (健檢解析)<br><code>/loading-analysis</code>"]
    Questionnaire["問卷頁 (Questionnaire)<br><code>/questionnaire</code>"]
    Loading2["Loading頁-2 (報告生成)<br><code>/loading-report</code>"]
    Report["報告頁 (Personalized Report)<br><code>/report</code>"]

    UploadModal["上傳抽屜視窗<br><code>UploadSheet</code>"]
    ExcludeModal["排除視窗<br><code>ExcludeModal</code><br>(不支援 Esc)"]
    LoginModal["共用登入視窗<br><code>LoginModal</code><br>(支援 Esc)"]
    CartModal["確認購買/選購結果視窗<br><code>CartModal</code><br>(支援 Esc)"]

    Splash -->|動畫播畢自動跳轉 / 點擊略過| Home
    Home -->|點擊「從體檢資料開始瞭解」| UploadModal
    UploadModal -->|選擇檔案後點擊「開始讀取」| Loading1
    UploadModal -->|點擊關閉 / Esc / 遮罩| Home
    Home -->|點擊「沒有資料？先從問卷開始」| Questionnaire
    Home -->|點擊右下「會員登入」| LoginModal

    Loading1 -->|資料解析可使用 (成功)| Questionnaire
    Loading1 -->|資料無法讀取 / 不符需求 (異常)| ExcludeModal
    ExcludeModal -->|點擊「返回首頁」| Home
    ExcludeModal -->|DEC-01 點擊「直接填寫問卷」<br>(無有效健檢資料)| Questionnaire

    Questionnaire -->|完成填答點擊「送出問卷」| Loading2
    Loading2 -->|分析完成| Report
    Loading2 -->|分析失敗 (異常)| Loading2Retry["分析失敗狀態卡片"]
    Loading2Retry -->|點擊「返回問卷」| Questionnaire
    Loading2Retry -->|點擊「再試一次」| Loading2

    Report -->|未登入點擊「登入」/ 鎖定卡片 / 換品項| LoginModal
    Report -->|點擊「將組合加入購物車」/ 購物車圖示| CartModal
    CartModal -->|確認購買示範 / 繼續查看報告| Report

    LoginModal -->|首頁呼叫登入成功| Home
    LoginModal -->|報告頁呼叫登入成功| Report
    LoginModal -->|點擊關閉 / Esc / 遮罩| PrevCaller["返回原呼叫頁面 (原焦點)"]
```

---

## 3. 頁面（Routes）與模態視窗（Modals）層級界定

為確保架構乾淨，本專案嚴格區分「獨立 URL 路由頁面」與「頁內模態視窗／抽屜元件」：

| 介面層級 | 名稱 | 原型來源 | 畫面與元件角色 | 路由建議 `[PROPOSED]` |
| :--- | :--- | :--- | :--- | :--- |
| **獨立頁面** | 入口頁 (Splash) | `CareU_入口頁原型.html` | 品牌動畫、點擊略過、自動進場 | `/`（或根路由導向） |
| **獨立頁面** | 首頁 (Home) | `CareU_首頁原型.html` | 品牌視覺、分流入口、信任說明、頁尾 | `/home` |
| **獨立頁面** | Loading頁-1 | `CareU_Loading頁-1_排除視窗_原型.html` | 健檢檔案解析過渡、4 階段狀態推進 | `/loading-analysis` |
| **獨立頁面** | 問卷頁 (Questionnaire) | `CareU_問卷頁_Loading頁-2_原型.html` | 題目填答（補充/完整模式）、進度條 | `/questionnaire` |
| **獨立頁面** | Loading頁-2 | `CareU_問卷頁_Loading頁-2_原型.html` | 問卷整合與報告分析等待、失敗重試 | `/loading-report` |
| **獨立頁面** | 報告頁 (Report) | `CareU_報告頁_會員登入視窗_原型.html` | 關注指標清單、方向卡片、品項調整 | `/report` |
| **模態視窗** | 上傳面板 (UploadSheet) | `CareU_首頁原型.html` L838 | 首頁上傳檔案選擇、格式檢查、清單管理 | 頁內 Modal（不設獨立路由） |
| **模態視窗** | 排除視窗 (ExcludeModal) | `CareU_Loading頁-1_排除視窗_原型.html` L410 | 健檢解析失敗之分流決策（雙按鈕） | 頁內 Modal（不設獨立路由） |
| **模態視窗** | 共用登入視窗 (LoginModal) | `CareU_報告頁_會員登入視窗_原型.html` L171 | 登入、註冊、忘記密碼共用視窗 | 全域 Modal（不設獨立路由） |
| **模態視窗** | 購買示範視窗 (CartModal) | `CareU_報告頁_會員登入視窗_原型.html` L22 | 選購清單去重核對、模擬結帳確認 | 頁內 Dialog（不設獨立路由） |

---

## 4. 關鍵業務分支與操作流程規範

### 4.1 健檢上傳分流與 Loading-1 流程
1. 使用者在首頁點擊主操作按鈕「從體檢資料開始瞭解」（`#chooseFileButton`），開啟 `UploadSheet` 視窗。
2. 使用者在視窗內點擊「新增或重新選擇」（`#addFiles`）選擇本機檔案（支援 PDF、JPG、PNG，累加最多 10 檔，單檔限制 25MB `[CODE_OBSERVED]`）。
3. 點擊「開始讀取」（`#startReading`）後，路由導向 `/loading-analysis`。
4. **狀態推進**：Loading-1 畫面依序呈現 4 階段狀態文字：
   - 階段 1：`讀取檔案中……`
   - 階段 2：`正在分析資料……`
   - 階段 3：`正在整理需補充資訊……`
   - 階段 4：`正在準備下一步……`
5. **成功結果**：進入問卷頁 `/questionnaire`，模式設定為 `supplement`（資料補充模式），頁首顯示「我們已讀取你提供的體檢資料」。

### 4.2 排除流程與「直接填寫問卷」分支（DEC-01）
1. **觸發機制**：原型中排除流程在播放至第 2 階段（約 4.2 秒）後模擬判定資料不可使用並彈出 `ExcludeModal`；**正式系統中排除流程由後端 Error 事件觸發，不限制固定於第二階段結束後發生**（格式不支援、非目標資料、解析損毀等錯誤事件皆可觸發）。
2. **分支 A（返回首頁）**：點擊「返回首頁」（`#modalHome`），路由返回 `/home`，清除上傳狀態，允許使用者重新選檔。
3. **分支 B（直接填寫問卷，`[CONFIRMED]` DEC-01）**：
   - 點擊「直接填寫問卷」（`#modalQuestionnaire`）。
   - 被排除之檔案**不得被標記為有效健檢資料**。
   - 路由導向 `/questionnaire`，模式設定為 `full`（完整問卷模式），頁首顯示「先從幾個日常問題開始」，自基礎題型開始填答。
4. **鍵盤約束（`[CONFIRMED]` DEC-04）**：排除視窗開啟時，**按 `Escape` 鍵不關閉視窗，點擊遮罩空白處亦不關閉視窗**，焦點鎖定於 `#modalHome` 與 `#modalQuestionnaire` 之間。

### 4.3 問卷填答流程（DEC-02）
- **雙模式架構**：
  - **資料補充模式 (`supplement`)**：跳過健檢已取得的基本資料題，共 **6 個填答步驟 ＋ 1 個完成確認畫面 ＝ 7 個畫面**，對應 **7 個固定進度槽**。
  - **完整問卷模式 (`full`)**：包含基本資料（年齡/性別/體重）、生活型態、測量資料、過敏原；
    - 生理性別為男性/非女性：**6 個填答步驟 ＋ 1 個完成確認畫面 ＝ 7 個畫面**，對應 **8 個固定進度槽**。
    - 生理性別為女性：動態插入安全資訊頁（懷孕/哺乳），**7 個填答步驟 ＋ 1 個完成確認畫面 ＝ 8 個畫面**，對應 **8 個固定進度槽**。
- **作答保存**：填答過程中即時保存進度至 `sessionStorage`（鍵名 `careu-questionnaire` `[CODE_OBSERVED]`）。
- **送出與跳轉**：完成頁點擊「送出問卷」，延遲約 450ms 後路由導向 `/loading-report`。


### 4.4 Loading-2 與分析失敗重試流程
1. **正常分析流程**：Loading-2 依序呈現 4 階段狀態（四階段 duration 原型各為 1600ms, 1800ms, 1800ms, 1200ms，合計 6400ms `[CODE_OBSERVED]`）：
   - 階段 1：`正在整理你提供的資料……`
   - 階段 2：`正在理解你的身體訊息……`
   - 階段 3：`正在整理適合你的保健方向……`
   - 階段 4：`正在準備你的個人化報告……`
   - 完成階段：顯示 `報告準備完成`，延遲約 650ms 轉入報告頁 `/report`。
2. **分析失敗異常流程**：
   - 若發生網路中斷或伺服器異常，顯示分析失敗卡片（`这次分析沒有順利完成`）。
   - **重試分支 1（返回問卷）**：點擊「返回問卷」（`#returnQuestionnaire`），路由返回 `/questionnaire`，保留已作答之 answers 狀態。
   - **重試分支 2（再試一次）**：點擊「再試一次」（`#retryAnalysis`），重新發起分析流程並重播 Loading-2 動畫。

### 4.5 報告頁會員登入、解鎖與閱讀位置保留
1. **未登入狀態**：
   - 報告頂部顯示公開摘要與通用健康提醒。
   - 身體關注指標長條圖：依 `score` 降冪取前 8 筆，前 2 名覆蓋「登入會員查看」鎖定遮罩。
   - 重點保健方向：前 2 名方向呈現鎖定卡片與登入 CTA。
   - 專屬保健組合區：尚未呈現自選品項。
2. **登入觸發點**：
   - 頂部導覽列「會員登入」按鈕（`#accountButton`）。
   - 鎖定卡片內之「登入解鎖」按鈕。
   - 嘗試更換品項或加入購物車之攔截。
3. **登入後行為（`[CONFIRMED]`）**：
   - 登入成功後關閉 Login Modal。
   - 前端狀態 `state.member` 設為 `true`，長條圖與前 2 名方向卡片原地解鎖。
   - **嚴禁重新導向、重新整理頁面、重新執行問卷或重新跑 Loading 分析**。
   - 焦點精確還原至觸發登入之按鈕或該區段標題（`data-anchor` / `section h2`），捲動位置保持不變。

### 4.6 專屬保健組合調整與購買示範
1. 登入後展開「為你準備的專屬保健組合」。
2. 使用者可點擊「更換品項」展開**頁內候選清單**（非 Modal / 非 Drawer `[CODE_OBSERVED]`），點擊候選品項即時替換目前組合；若選取的品項已在其他方向使用，觸發 Toast 提示「這個品項已在組合中，不會重複加入。」並阻擋重複選取（`selectProduct` 跨方向重複阻擋 `[CODE_OBSERVED]`）。
3. 底部月組合摘要即時以 `uniqueSelected()` 針對品項 ID 進行去重計算總額（原型無每日平均花費計算 `[CODE_OBSERVED]`）。
4. 點擊「將組合加入購物車」（`#addToCart`）呼叫 `showCart(true)`，開啟 `#auxDialog` 彈窗展示目前 `uniqueSelected()` 清單、去重總額與「確認購買」按鈕。
5. 點擊「確認購買」（`#confirmCart`）後，將品項 ID 合併去重寫入 `state.cart`，接著在 `#auxDialog` 內直接切換內容顯示「選購結果（示範）」畫面，並提供「繼續查看報告」按鈕（`data-close="aux"`，點擊關閉視窗）。
6. 頂部購物車圖示（`#cartButton`）呼叫 `showCart(false)`，查看的是 `state.cart` 已存入的品項清單（**僅供前端展示體驗，不發起扣款、不產生真實後端訂單 `[CODE_OBSERVED]`**）。

---

## 5. 瀏覽器行為與邊界情境規範（Browser Navigation & Edge Cases）

### 5.1 上一頁／下一頁（History Navigation）`[PROPOSED]`
- **`/` → `/home`**：進入首頁後，上一頁歷史記錄應阻擋返回已播放完畢之 Splash 動畫（可使用 `router.replace` 或檢查動畫已播旗標）。
- **`/loading-analysis` 或 `/loading-report`**：在非同步處理中按上一頁，應觸發中斷確認或安全返回上一填答/上傳頁，避免進度遺失。
- **`/report` 按上一頁**：返回 `/questionnaire` 完成頁，保留填答答案；不應退回 `/loading-report` 造成重複計時。

### 5.2 重新整理（Page Refresh）`[PROPOSED]`
- **問卷頁 (`/questionnaire`) 重新整理**：自 `sessionStorage`（鍵名 `careu-questionnaire`）讀取暫存；若 `saved.mode === mode` 則完整還原填答模式、answers 物件及當前填答步驟索引；模式不符則重設為空。
- **報告頁 (`/report`) 重新整理**：原型依賴記憶體中 `state.profile`，重新整理後若無持久化資料將回到預設狀態。正式工程化時建議候選方案：若記憶體狀態遺失，自 Mock/正式後端重新請求當前分析報告；若無任何有效分析紀錄，導向 `/home` 並提示「請先進行健康評估」（不自行於前端持久化敏感健康資料）。

### 5.3 直接輸入 URL（Direct Entry）`[PROPOSED]`
- **直接開啟 `/report?entry=direct`**：允許開發與展示環境直接載入預設示範報告（如受試者小安），方便測試。
- **無資料直接進入 `/questionnaire`**：預設進入 `full`（完整問卷模式），無須強制依賴健檢上傳。
- **無資料直接進入 `/loading-analysis`**：檢測無待讀取檔案時，自動導向 `/home`。

---

## 6. 候選路由架構表（Proposed Vue Router Schema）

| Route Name `[PROPOSED]` | Route Path `[PROPOSED]` | 對應 View 元件 `[PROPOSED]` | 存取守衛與前置條件 `[PROPOSED]` |
| :--- | :--- | :--- | :--- |
| `Splash` | `/` 或 `/splash` | `SplashView.vue` | 預設進場；若已訪問過可設定略過規則。 |
| `Home` | `/home` | `HomeView.vue` | 公開路由，全站主要分流核心。 |
| `LoadingAnalysis` | `/loading-analysis` | `LoadingAnalysisView.vue` | 需有上傳檔案暫存；無檔案時導向 `/home`。 |
| `Questionnaire` | `/questionnaire` | `QuestionnaireView.vue` | 支援 `?mode=supplement` 或 `?mode=full` 參數。 |
| `LoadingReport` | `/loading-report` | `LoadingReportView.vue` | 需有問卷送出資料；無資料時導向 `/questionnaire`。 |
| `Report` | `/report` | `ReportView.vue` | 支援 `?entry=direct` 示範模式或依據分析結果載入。 |

---

## 7. 原型 Demo 行為與正式後端之界線清單

為防止工程實作混淆，以下功能嚴格標記為展示專用：

| 項目 | 原型現況（Demo Logic）`[CODE_OBSERVED]` | 正式系統目標（Production Contract）`[TBD]` |
| :--- | :--- | :--- |
| **健檢讀取** | Loading-1 固定計時器 7.5s 切換狀態；檔案暫存於記憶體變數中 | 後端非同步上傳、安全掃描、OCR 辨識與健康數值萃取 API；檔案清理時點待 Phase 12 確認 |
| **檔案排除** | Demo 面板觸發模擬排除 | 後端根據解析結果（如格式不符、非健檢）回傳 Error Code 觸發 |
| **問卷分析** | Loading-2 固定計時器 6.4s | 後端推薦引擎計算 12 項關注指標分數、警示條件比對（非前端計時器判定） |
| **會員登入** | 記憶體切換 `authMember = true`，密碼前端純格式驗證 | OAuth / JWT / Session Token 驗證，後端回傳使用者報告權限 |
| **自選品項** | 前端 Catalog (28 筆展示商品) 與展示價格 | 正式商品資料庫與價格（待 Phase 7 / 10 對齊） |
| **確認購買** | 彈出示範視窗顯示去重總額，不扣款，僅切換選購結果 | 購物車與後端訂單契約（待後續業務決策） |

---

## 8. 驗收核對清單與未驗證事項

### 8.1 規格驗收清單
- [ ] 完整記錄 DEC-01 排除視窗「直接填寫問卷」分支，且確認銜接無有效健檢資料之 `full` 模式。
- [ ] 完整記錄 DEC-02 現有原型 6~7 步問卷與完整 32 題題庫之用途界線。
- [ ] 完整記錄 DEC-04 排除視窗不支援 `Escape` 鍵之規範。
- [ ] 完整記錄共用 Login Modal 首頁/報告頁呼叫與原位解鎖行為。
- [ ] 獨立 Route 與 Modal 劃分清晰，無將 Modal 誤設為獨立頁面之情況。
- [ ] 購物車與品項更換如實記錄為「頁內候選展開」與「`uniqueSelected()` 去重計算」。

### 8.2 未驗證事項（`[RUNTIME_UNVERIFIED]`）
- 瀏覽器原生上一頁／下一頁在各步驟切換時的歷史堆疊流暢度。
- Safari / 行動瀏覽器在 `sessionStorage` 跨視窗或無痕模式下的還原相容性。
- 真實網路延遲與伺服器斷線時的非同步重試機制體驗。
