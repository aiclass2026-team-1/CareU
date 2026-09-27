# Care U｜狀態與資料模型筆記（State Management & Data Notes）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 架構與資料筆記草案（待 Technical PM 審閱）
- **主要依據**：
  - 問卷頁 `sessionStorage` 實作事實 `[CODE_OBSERVED]`
  - 報告頁 `CareUAuth`、`profiles`、`catalog` 內嵌資料結構 `[CODE_OBSERVED]`
  - `source/data/products/raw/` 與 `derived/` 資料集 `[SPEC_STATED]`
  - `source/data/questionnaire/` 12 項完整問卷題庫 `[SPEC_STATED]`

---

## 1. 狀態分層原則與架構概述

本專案狀態管理依生命週期與跨元件共享程度分為兩層：
1. **元件內部區域狀態 (Local UI State)**：
   - 包含：Accordion 展開/收合、Modal 開閉狀態、按鈕載入動畫、表單本地校驗錯誤文字、密碼明文切換眼睛狀態等。
   - 保留在 Vue 元件內部（`ref` / `reactive`），不放入全域 Store。
2. **全域共享狀態 (Global Stores - Pinia)**：
   - 包含：會員認證狀態、健檢上傳檔案暫存、問卷作答進度、健康分析報告、自選商品組合與購物車清單。
   - 於 Phase 8 由 Pinia Store 統一管理。

---

## 2. 現有原型狀態儲存機制查核 `[CODE_OBSERVED]`

| 狀態項目 | 儲存位置 | 鍵名 / 變數名 | 結構範例 | 說明與邊界 |
| :--- | :--- | :--- | :--- | :--- |
| **問卷填答進度** | `sessionStorage` | `careu-questionnaire` | `{ mode: currentMode, answers, currentQuestion }` | **保存時機**：`persistState()` 在題型選取與換題時呼叫。<br>**還原機制**：`restoreState(mode)` 檢查 `saved?.mode === mode && saved.answers`，模式相符才還原，不符則重設。<br>**清除時機**：僅 Demo 控制面板點擊 `restart` 時清除；**送出問卷時不清除**。 |
| **會員登入狀態** | 記憶體全域物件 | `window.CareUAuth`, `state.member`, `authMember` | `{ demo: true, member: boolean }` | 僅存於 JS 記憶體，不持久化，`authMember` 與 `state.member` 透過 `careu:auth-change` 事件同步，重新整理即恢復未登入。 |
| **報告展示資料** | 記憶體物件 | `state.profile` (小安/小晴/阿哲/小柔) | `{ id, name, summaryPublic, summaryMember, results: [...] }` | 內嵌於報告頁之示範受試者 profiles，非 API 動態回傳。 |
| **自選商品組合** | 記憶體物件 | `state.selection` | `{ [categoryId]: productId }` | 記錄使用者為各重點方向選定之品項 ID；`selectProduct` 具備跨方向重複選用阻擋。 |
| **購物車商品清單**| 記憶體陣列 | `state.cart` | `Array<string>` (品項 ID 陣列) | 確認購買示範後寫入 `state.cart = [...new Set([...state.cart, ...uniqueSelected().map(p => p.id)])]`。 |
| **上傳檔案清單** | 記憶體陣列 | `selectedFiles` | `Array<File>` | 首頁上傳視窗暫存於記憶體，最多 10 檔。 |

---

## 3. 候選 Pinia Store 規劃 `[PROPOSED]`

在 Phase 8 正式建立 Pinia Store 前，建議之 Store 劃分候選如下：

### 3.1 `useAuthStore`（認證狀態）`[PROPOSED]`
- **State**：`isLoggedIn: boolean`, `user: UserProfile | null`, `token: string | null`
- **Actions**：`login(credentials)`, `logout()`, `register(data)`
- **行為規範**：支援記錄呼叫來源（`returnFocusTarget`, `returnRoute`），登入後發出解鎖通知。

### 3.2 `useUploadStore`（健檢上傳狀態）`[PROPOSED]`
- **State**：`files: File[]`, `status: 'idle' | 'uploading' | 'analyzing' | 'success' | 'rejected' | 'error'`
- **Actions**：`addFiles(newFiles)`, `removeFile(index)`, `clearFiles()`, `startAnalysis()`

### 3.3 `useQuestionnaireStore`（問卷作答狀態）`[PROPOSED]`
- **State**：`mode: 'supplement' | 'full'`, `currentStep: number`, `answers: Record<string, any>`, `isComplete: boolean`
- **Actions**：`setMode(mode)`, `saveAnswer(field, value)`, `nextStep()`, `prevStep()`, `resetAnswers()`
- **持久化**：於 Action 中同步寫入 `sessionStorage`，初始化時讀取還原。

### 3.4 `useReportStore`（健康報告與分析）`[PROPOSED]`
- **State**：`reportData: HealthReport | null`, `activeCategory: string | null`, `status: 'idle' | 'loading' | 'success' | 'error'`
- **Actions**：`fetchReport(reportId)`, `setDemoProfile(profileName)`

### 3.5 `useCartStore`（自選組合與購物車）`[PROPOSED]`
- **State**：`selections: Record<string, ProductItem>`, `cartItems: ProductItem[]`
- **Getters**：`uniqueSelectedProducts`, `totalAmount`（使用 `uniqueSelected()` 去重計算）
- **Actions**：`selectProduct(categoryId, product)`, `removeProduct(categoryId)`, `checkoutDemo()`


---

## 4. 商品資料與資料欄位來源對齊（Data Provenance & Boundaries）

### 4.1 來源資料與展示欄位之嚴格區分
| 資料欄位類型 | 包含欄位範例 | 來源依據 | 正式環境處置原則 |
| :--- | :--- | :--- | :--- |
| **提供的來源資料集欄位** | 許可證字號、中文品名、申請商、核准功效、保健功效宣稱、警語標示 | `source/data/products/raw/` (169 筆) | 提供的原始資料集基準（未宣稱已全面查核官方即時有效性）。 |
| **衍生加工標籤欄位** | `mechanism_tag`, `evidence_score`, `contraindicated_*` | `source/data/products/derived/` (186 筆) | **衍生資料集欄位，不等於官方來源**；留待 Phase 7 由後端推薦模型複核其演算法依據。 |
| **展示專用假資料** | 展示價格（如 NT$ 1,280）、劑型示意圖、受試者預設推薦配對 | 報告頁原型內嵌 `catalog.products` (28 筆) | **僅供前端 Demo 展示**，不進入正式資料庫，留待 Phase 7 / 10 由正式推薦 API 與商品資料庫替換。 |

### 4.2 推薦演算法與計分界線
- **不自行發明演算法**：本前端規格**絕不自行定義** Priority Score 加權公式、醫療診斷邏輯或危險值門檻。
- **介面只負責渲染契約**：前端僅定義接收 `0~100` 分數數值、警示等級（`urgent` / `near`）、分析依據標籤並呈現對應之長條圖與警告卡片。

---

## 5. 敏感資料持久化與法務隱私待定清冊（TBD 清冊）

| 待定項目 | 目前現況與風險 | 影響範圍 | 最晚需決策階段 |
| :--- | :--- | :--- | :---: |
| **健檢檔案去識別化與保留** | 原型文案提及「保留 30 天自動刪除」，但無後端落實機制 | 資安合規、後端 Storage 刪除排程 | Phase 12 資安隱私 |
| **問卷敏感資料暫存限制** | 現行使用 `sessionStorage`；若擴展至跨分頁需評估安全風險 | 前端狀態持久化策略 | Phase 8 全域狀態 |
| **Derived 缺來源網址** | Derived CSV 缺少 Raw 既有之 `網址` 欄位 | 商品資料庫欄位定義 | Phase 7 資料對齊 |
| **CSV 跳脫字元清洗** | 部分文字跳脫字元問題已列入待查；具體類型及範圍待複核，等待組員新版，目前不清洗。 | 資料庫 Import Script | Phase 7 資料清洗 |
| **就醫警告真實判定門檻** | 目前報告頁僅以 Mock Alert 假資料呈現 | 醫療責任界限、後端檢驗規則 | Phase 7 / 10 |

---

## 6. 驗收清單與未驗證事項

### 6.1 規格驗收清單
- [ ] 完整盤點 Local UI State 與 5 大 Pinia 全域 Store 候選分工。
- [ ] 嚴格區分 Raw 原始資料、Derived 衍生資料與 Mock 展示假資料。
- [ ] 明確記錄敏感健康資料禁止寫入 `localStorage` 之資安原則。
- [ ] 集中列出 5 項資料層 TBD 與最晚需決策之 Phase 階段。

### 6.2 未驗證事項（`[RUNTIME_UNVERIFIED]`）
- 大型問卷 answers 物件在 low-memory 行動裝置上的記憶體佔用。
- 跨分頁（Multi-tab）環境下 sessionStorage 隔離與會員同步行為。
