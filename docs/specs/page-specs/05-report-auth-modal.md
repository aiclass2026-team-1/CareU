# Care U｜報告頁與會員登入視窗工程規格（Report & Auth Modal Specification）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 工程頁面規格（待 Technical PM 審閱）
- **主要依據**：
  - `source/page-specs/CareU_報告頁_會員登入視窗_頁面規格.md` `[SPEC_STATED]`
  - `source/prototypes/CareU_報告頁_會員登入視窗_原型.html`（共 342 行，字集範圍未確認與 Mock 資料）`[CODE_OBSERVED]`
  - `[CONFIRMED]` 共用登入視窗規範與原位解鎖決策

---

## 1. 來源與適用範圍

- **對應原型檔案**：`source/prototypes/CareU_報告頁_會員登入視窗_原型.html`（字體 `400` 解碼 4,370,584 bytes / `700` 解碼 4,531,228 bytes，字集範圍未確認 `[CODE_OBSERVED]`）
- **適用範圍**：個人化健康報告展示、身體關注指標長條圖、重點保健方向卡片、頁內候選品項更換、自選組合去重計價、共用會員登入視窗（`LoginModal`）、購買示範視窗（`CartModal`）。
- **邊界說明**：原型內之受試者切換（小安/小晴/阿哲/小柔）、示範登入（`authMember` 與 `state.member` 透過 `careu:auth-change` 事件同步 `[CODE_OBSERVED]`）及 28 筆展示商品資料（包含提供的來源資料集欄位、展示價格與模擬配對）皆為展示資料；正式環境由後端推薦引擎與會員 API 接入。

---

## 2. 畫面資訊架構與視覺保留要求

### 2.1 畫面資訊架構與 DOM ID 清冊 `[CODE_OBSERVED]`
1. **頂部導覽列**：官方 Logo 組合（`CareU_VIS-logogroup-01.svg`）、購物車圖示（`#cartButton`）、會員登入入口（`#accountButton`）。
2. **報告 Hero 摘要區**：主標「你的健康分析報告」、英文小標、個人化公開/會員摘要（`#reportSummary`）、通用健康提醒。
3. **身體優先關注方向圖表區 (`#chartSection`)**：橫向長條指標清單容器（`#chartList`，**注意：全站無雷達圖，為純橫向長條圖 `[CODE_OBSERVED]`**）。
4. **重點保健方向區 (`#insightSection`)**：前 5 項方向展開卡片區段（結構摘要：`<section id="insightSection"><div id="insights"></div></section>`，原碼 ID 為 `#insightSection` 與 `#insights` `[CODE_OBSERVED]`）與就醫警示。
5. **推薦與專屬組合區 (`#recommendSection`)**：推薦品項清單（`<div id="recommendations"></div>`）與專屬保健組合（結構摘要：`<div id="bundleAnchor"><div id="bundleSection"></div></div>` `[CODE_OBSERVED]`）。
6. **月組合摘要置底區**：深藍色卡片展示去重總額（`uniqueSelected()`）與「將組合加入購物車」按鈕（`#addToCart`）。
7. **左側節點導覽**：4 個圓形節點垂直串接（連結錨點分別為 `#chartSection`, `#insightSection`, `#recommendSection`, `#bundleAnchor` `[CODE_OBSERVED]`）。

### 2.2 動畫與 Keyframes 清冊 `[CODE_OBSERVED]`
- 報告頁包含長條圖寬度增長 `@keyframes grow`、Logo 光點懸浮 `@keyframes float`、卡片進場 `@keyframes enter`、視窗進場 `@keyframes modal-in` 與 Loading 橘點跳動 `@keyframes dot-hop` `[CODE_OBSERVED]`。
- 報告頁 Toast 提示顯示時間為 **3600ms**（`function toast` 位於 L244，內部執行 `setTimeout(..., 3600)` `[CODE_OBSERVED]`）。

---

## 3. 核心業務互動與資料渲染邏輯 `[CODE_OBSERVED]`

### 3.1 關注指標長條圖渲染機制
- **長條圖渲染**：`renderChart()` 依據傳入之 `profile.results` 順序選取**前 8 筆**渲染橫條寬度與分數；`CareUReport.loadReport()` 載入資料時依 `score` (0~100) 降冪排序。
- **未登入狀態**：前 2 名覆蓋「登入會員查看」鎖定遮罩，隱藏名稱、分數與橫條長度；第 3~8 名公開展示。
- **點選互動**：點選長條項目展開下方說明，再次點擊收合，僅重播該項目之橫條動畫。

### 3.2 重點保健方向與就醫警示
- 展示前 5 項重點方向，未登入時前 2 名方向呈現鎖定卡片與登入 CTA。
- **警示標記**：接近提醒門檻顯示黃色三角驚嘆號；就醫警告顯示紅色圓形驚嘆號（以 HTML/CSS `.alert-badge` 渲染，非 SVG symbol `[CODE_OBSERVED]`）。警示獨立於優先度分數，由資料屬性決定。

### 3.3 專屬組合與頁內候選品項更換（落實事實精確性）
- **頁內展開清單**：點擊方向卡片內之「更換品項」按鈕，直接在**該卡片下方頁內展開候選清單（非 Modal、非 Drawer `[CODE_OBSERVED]`）**。
- **跨方向重複阻擋**：`selectProduct(cid, pid)` 在選取時若該品項已於其他方向選取，觸發 Toast「這個品項已在組合中，不會重複加入。」並阻擋重複選取（`[CODE_OBSERVED]`）。
- **劑型示意圖（`productArt()`）**：依品名動態渲染膠囊（`.capsule-art`）或錠劑（`.tablet-art`）之 **HTML DOM＋CSS 樣式**（非商品照片，非 SVG 圖片 `[CODE_OBSERVED]`）。
- **去重計價機制**：底部月組合總額透過 `uniqueSelected()` 針對已選品項 ID 進行 Set 去重加總（跨方向重複選取同商品不重複計價；**原型無每日平均花費計算 `[CODE_OBSERVED]`**）。

---

## 4. 共用登入視窗（LoginModal）與原位解鎖規範（落實共用登入規範）`[CONFIRMED]`

### 4.1 視窗模式與表單互動
- 支援三種模式切換：登入（`login`）、註冊（`register`）、忘記密碼（`forgot`）。
- **密碼明文切換**：點擊眼睛圖示切換 `type="password"` / `type="text"`，圖示同步切換 `i-eye` / `i-eye-off`。
- **表單校驗規則 `[CODE_OBSERVED]`**：
  - 登入：Email 格式、密碼長度 `>= 8`。
  - 註冊：Email 格式、密碼長度 `>= 8`、兩次密碼一致。
  - 忘記密碼：Email 格式（不要求密碼）。
  - 錯誤訊息顯示於表單內並聚焦至錯誤欄位。

### 4.2 登入成功後行為規範 `[CONFIRMED]`
- 登入成功後關閉視窗，前端狀態 `state.member = true`, `authMember = true`。
- **原位解鎖**：長條圖前 2 名與方向卡片前 2 名立即解鎖展示完整數值與分析。
- **絕不重新導向**：**不跳轉首頁、不重新執行問卷、不重跑 Loading-2 分析**。
- **閱讀位置與焦點保留**：保持使用者當前頁面滾動位置，焦點精確返回開啟登入視窗之觸發按鈕或該區段標題（`data-anchor` / `section h2`）。
- **視窗關閉**：支援點右上叉叉（`i-close`）、點遮罩空白處、按 `Escape` 鍵關閉。

---

## 5. 購物車與購買示範視窗（CartModal）`[CODE_OBSERVED]`

- **開啟確認購買**：點擊「將組合加入購物車」（`#addToCart`）呼叫 `showCart(true)`，開啟 `#auxDialog` 彈窗展示目前 `uniqueSelected()` 清單、去重總額與「確認購買」按鈕。
- **確認購買示範**：點擊「確認購買」（`#confirmCart`）後，將品項 ID 合併去重寫入 `state.cart`，接著在 `#auxDialog` 內直接切換內容顯示「選購結果（示範）」畫面，並提供「繼續查看報告」按鈕（`data-close="aux"`，點擊關閉視窗）。
- **頂部購物車圖示**：點擊 `#cartButton` 呼叫 `showCart(false)`，查看的是 `state.cart` 已存入的品項清單。
- **注意**：確認購買視窗**不添加原碼不存在的劑型圖**，僅列出品名、數量、單價與合計，且**僅供前端展示體驗，不發起扣款、不產生真實後端訂單 `[CODE_OBSERVED]`**。

---

## 6. 原型行為 vs 工程化目標區分

| 項目 | 原型現況 `[CODE_OBSERVED]` | 正式工程化目標 `[PROPOSED]` |
| :--- | :--- | :--- |
| **報告資料** | 內嵌 4 組受試者 profiles 物件切換 | 串接 `GET /api/reports/:id` 取得真實報告 |
| **會員權限** | 記憶體變數 `authMember = true` 解鎖 | 串接 JWT / Session 權限，後端保護敏感健康數值 |
| **商品資料** | 內嵌 28 筆展示商品 catalog | 串接正式商品庫與庫存 API |
| **Demo 控制** | 提供切換受試者、重播轉場、示範會員按鈕 | 正式上線移除 Demo 面板 |

---

## 7. 元件與資料相依

- **元件相依**：`HealthCategoryBarList.vue`, `DirectionCard.vue`, `ProductCandidateList.vue`, `ProductDoseArt.vue`, `LoginModal.vue`, `CartSummaryModal.vue`。
- **狀態相依**：`useReportStore`（報告資料）、`useAuthStore`（會員狀態與焦點還原）、`useCartStore`（自選組合與去重計價）。

---

## 8. 逐項驗收條件清單

- [ ] 報告頁指標圖表為純橫向長條圖，依分數降冪取前 8 筆渲染，無雷達圖。
- [ ] 未登入時長條圖與重點方向前 2 名套用鎖定遮罩，文字與分數不外露。
- [ ] 登入成功後原地解鎖內容，頁面不重跑問卷或 Loading，閱讀捲動位置與焦點正常保留。
- [ ] 點擊「更換品項」能在卡片下方頁內展開候選清單（非 Modal/Drawer）。
- [ ] 劑型示意圖以 HTML DOM+CSS 渲染，含膠囊與錠劑樣式。
- [ ] 月組合摘要使用 `uniqueSelected()` 針對品項 ID 去重加總。
- [ ] 登入視窗支援 `Escape` 鍵關閉；密碼明文切換眼睛圖示正常。
- [ ] **`[RUNTIME_UNVERIFIED]`**：在窄螢幕行動裝置上，長條圖與候選卡片展開時的流暢度與無重疊渲染表現。
- [ ] **`[RUNTIME_UNVERIFIED]`**：螢幕閱讀器在長條圖項目點選展開時的即時無障礙朗讀反饋。
