# Care U 前端工程（Phase 4 Page Implementation）

本目錄為 Care U 保健食品推薦系統的正式前端工程根目錄。

---

## 1. 技術棧與工程配置

- **核心框架**：Vue 3 (`v3.5.x`, SFC Composition API `<script setup>`)
- **建置工具**：Vite (`v8.x`)
- **語言規範**：TypeScript (`v5.8.x`)
- **路由管理**：Vue Router (`v5.x`，骨架與預覽階段暫採 Hash History)
- **狀態管理**：Pinia (`v4.x`，全域實例註冊，無業務 Store)
- **套件相依**：包含 `@vue/devtools-api` (`v8.x`) 滿足 Pinia 4 peer dependency

---

## 2. 開發與指令說明

請在 `frontend/` 目錄下執行以下指令：

```bash
# 1. 安裝相依套件（產生或依據 package-lock.json）
npm install

# 2. 啟動開發伺服器 (預設 http://127.0.0.1:5173/)
npm run dev

# 3. 型別檢查（零發射，專案參考模式）
npm run type-check

# 4. 生產環境建置
npm run build

# 5. 生產建置預覽
npm run preview
```

---

## 3. 目前階段與預覽路由（Phase 4 第三批）

### 3.1 頁面實作進度
- **入口頁 (Splash Page)**：`src/views/SplashView.vue`（已完成遷移）
  - 預覽路由：`#/preview/splash`
- **首頁 (Home & Upload Page)**：`src/views/HomeView.vue`（已完成遷移）
  - 預覽路由：`#/preview/home`
- **Loading頁-1 與排除視窗 (Loading-1 & Exclude Modal)**：`src/views/LoadingOneView.vue`（已完成遷移）
  - 預覽路由：`#/preview/loading-1`
  - 核心規格：
    - 4 階段狀態文字推進（`讀取檔案中` 1.8s → `正在分析資料` 2.4s → `正在整理需補充資訊` 2.2s → `正在準備下一步` 1.1s），文字具備 230ms 平滑切換淡入淡出。
    - Logo 暖橘圓點跳動（`loading-logo-dot-hop` 1.45s）、動態三點起伏（`loading-dot-hop` 1.2s）、Canvas 全螢幕粒子資料場與後景視差。
    - 排除視窗（`ExcludeModal`）：落實 DEC-01 雙分支（「返回首頁」與「直接填寫問卷」）與 DEC-04（不支援 Escape 鍵與遮罩點擊關閉，Tab 鍵焦點鎖定於雙按鈕間）。
    - 示範問卷與首頁外殼：內嵌 3 題問卷與首頁返回畫面僅供頁內轉場示範（Demo Only），不代表正式跨頁資料。排除後進入之問卷對應未來 `full` 模式，被排除檔案不視為有效健檢資料。
    - 素材抽離至 `src/assets/loading-one/`（2 組 CareU LINE Seed TW WOFF 字體與 1 張後景圖 PNG，解碼雜湊 100% 吻合）。
    - 樣式完整隔離：CSS 選擇器限定於 `.loading-one-container`，Keyframes 前綴為 `loading-*`，卸載時具備 `isDisposed` 保護。
- **骨架驗證頁面**：
  - `#/`：占位首頁 (`src/views/ScaffoldHomeView.vue`)
  - `#/scaffold-verify`：路由切換驗證頁 (`src/views/ScaffoldAboutView.vue`)

---

## 4. Phase 4 第二批驗收紀錄（Home Page Migration）

### 4.1 Agent 指令驗證（全數通過）
- `npm --prefix frontend run type-check`：`vue-tsc -b` 0 錯誤、0 警告。
- `npm --prefix frontend run build`：`vite build` 順利產出，獨立分塊打包正常。
- `docs/audit/source-manifest.csv` 33 份原始資產 SHA-256 雜湊 100% 吻合（33 PASS, 0 FAIL）。

### 4.2 使用者人工驗收（已確認通過）
- **視覺與動效還原**：頂部標準字、打字狀態六點跳動（`home-dot-hop`）、懸浮登入按鈕過渡動畫（520ms / Hover 陰影）與原型 100% 一致。
- **向下箭頭**：點擊後維持 `#/preview/home` 路由，不改寫為 `#trust`。
- **桌面雙屏切換**：在 1005×763 尺寸下 `desktopSnap=true`、根元素 `scroll-snap-type: y mandatory`，滾輪上下雙屏切換正常。
- **長內容與窄視窗降級**：視窗高度縮短或手機寬度下，自動降級為原生滾動，可完整閱畢第二屏內容至頁尾 Footer。
- **動態偏好即時同步**：動態切換 `prefers-reduced-motion` 即時生效，Reduced Motion 下點擊箭頭採即時無動畫捲動。
- **樣式隔離**：離開首頁後完全不影響 Splash 與骨架頁面樣式。
- **上傳面板**：選檔、格式檢查、累加與上限提示正常。
- **Favicon 404**：瀏覽器強制重新整理後，已無 `/favicon.ico` 404 請求。

### 4.3 邊界與未驗證事項
- **未實測項目（保留未驗證）**：多品牌行動真機觸控與高解析度螢幕長時間 Canvas 渲染效能（`[RUNTIME_UNVERIFIED]`）。
- **階段邊界提醒**：
  - 會員登入（`#memberLogin`）與問卷入口（`#questionnaireLink`）維持原型 Toast 提示；
  - 「開始讀取」（`#startReading`）維持頁內模擬轉場面板；
  - 正式跨頁流程與後端 API 串接留待後續 Phase。

---

## 5. Phase 4 第三批驗收紀錄（Loading-1 & Exclude Modal Migration）

### 5.1 使用者確認保留之設計差異
- **排除視窗叉叉圖示**：保留 Vue 最初完整向量外觀（`viewBox="0 0 40 40"` 淡珊瑚圓形與叉叉 SVG），外層透明容器（68×68px、`margin: 0 auto 20px`、無方框背景與額外圓角），SVG 100% 滿版呈現。
- **排除視窗按鈕圓角**：保留排除視窗專屬膠囊圓角（`.modal-action .button` `border-radius: 999px`），不還原為原型 16px（僅限排除視窗按鈕，不擴大適用至其他按鈕）。

### 5.2 來源還原與必要工程修正
- **Logo、文字與動畫時序**：還原 Logo `viewBox="0 0 300 378.011"`，橘點跳動（`loading-logo-dot-hop` 1.45s，26% -24px，`transform-box: fill-box`、`transform-origin: center`）、狀態三點（`loading-dot-hop` 1.2s，獨立持續跳動不隨文字淡出）、文字淡入淡出（220ms 更新延遲、230ms CSS 過渡）。
- **流程時序與 Reduced Motion 行為**：
  - 一般模式：4 階段 1800/2400/2200/1100ms（正常流程 7.5s、排除流程 4.2s）。
  - Reduced Motion：流程開始前開啟時，依來源 `later()` 累積排程上限 500ms 截短；流程進行中動態切換時，CSS 動畫與 Canvas 即時響應偏好，但已排定之流程計時器不重新排程（不宣稱即時切換一定縮短當次流程）。
- **無障礙、焦點與背景鎖定**：
  - 排除視窗開啟時透過 `isBodyScrollLocked` 備份並鎖定 `body` 的 `overflow: hidden`，僅在持有鎖定時於關閉或卸載時精準還原原本值與 priority；
  - 延遲 80ms 聚焦 `#excludeModal`，關閉視窗時同步取消尚未執行的焦點定時器；
  - 補齊初始焦點在 dialog 時的 `Tab` / `Shift+Tab` 邊界處理，並將焦點循環鎖定於「返回首頁」（`#modalHome`）與「直接填寫問卷」（`#modalQuestionnaire`）雙按鈕之間；
  - 排除視窗關閉後，焦點即時轉移至已顯示的示範問卷或首頁標題，避免焦點殘留於隱藏視窗；
  - 落實 DEC-04：不支援 `Escape` 鍵與遮罩點擊關閉。
- **文案與提示還原**：
  - 排除視窗說明還原為：「這份檔案可能不是體檢或健康相關資料，或內容暫時無法辨識。你可以返回首頁重新上傳其他檔案，或直接填寫健康問卷。」
  - 「重新上傳檔案」提示小字移除 `aria-hidden`。
- **畫面轉場與排版（徹底阻斷非活動畫面溢出）**：
  - 非活動畫面外層 `.screen` 採 `position: absolute; inset: 0; min-height: 0; height: 100%; max-height: 100svh; overflow: hidden; transform: none;`，將位移轉場（`translateY(8px)`）下移至內層卡片容器（`.loading-card`、`.question-shell`、`.home-shell`、`.loading-note`）；
  - 外層 `.screen` 由不位移之邊界（`top: 0; bottom: 0; height: 100%`）承接 `overflow: hidden` 裁切，徹底消除因非活動 DOM 向下位移 8px 導致容器 `scrollHeight` 擴大 8px（763px → 771px）產生多餘捲軸之根本原因；
  - 活動畫面 `.screen.is-active`（`position: relative; height: auto; min-height: 100svh; overflow: visible;`）與 `.loading-card` / `.question-shell` / `.home-shell`（`transform: none`）保持 `.55s var(--ease)` 平滑淡入與上升動態，並在問卷示範長內容或短視窗下自然垂直捲動；
  - 排除視窗背景 `.modal-backdrop` 補齊 `overflow-y: auto`，短視窗下彈窗內容與按鈕自然可達。
- **占位畫面範圍（Demo Only）**：
  - 示範問卷與首頁外殼僅供分流驗證，不作為正式題庫或正式規格；
  - 正常讀取完成進入 `supplement`（資料補充示範），排除後點擊直接填寫問卷進入 `full`（健康問卷示範；被排除檔案不可視為有效健檢資料）；
  - 正式問卷將於後續批次獨立遷移並於 Phase 6 正式串接。

### 5.3 待 Phase 6 替換之占位畫面與 Demo 清單
- `activeScreen === 'questionnaire'`：示範問卷畫面（Phase 6 替換為正式 `/questionnaire` 路由跳轉）。
- `activeScreen === 'home'`：示範首頁外殼（Phase 6 替換為正式 `/home` 路由跳轉）。
- `.demo-controller`：Demo 情境控制面板（正式上線前移除）。
- 路由獨立事項：主控台 `/preview` 無對應路由警告已記錄為獨立事項（待後續整體路由規劃統一處理，本輪不擴大修改路由）。

### 5.4 驗收狀態
- `npm --prefix frontend run type-check`：✅ PASS (`vue-tsc -b` 0 錯誤、0 警告)。
- `npm --prefix frontend run build`：✅ PASS (`vite build` 順利產出)。
- 33 份來源檔案 Manifest 雜湊：✅ 33/33 PASS。
- **使用者人工驗收確認通過事項**：
  - ✅ Tab／Shift+Tab 焦點循環、Escape 鍵忽略、遮罩點擊不關閉行為；
  - ✅ 返回首頁／直接填寫問卷雙分支切換；
  - ✅ Console 無警告與報錯；
  - ✅ Reduced Motion 靜態與即時切換響應；
  - ✅ Loading 與排除視窗沒有多餘右側捲軸，Logo／氣泡位置正常；
  - ✅ 排除視窗叉叉圖示向量外觀正確；
  - ✅ 流程轉場自然；
  - ✅ 短視窗下內容與按鈕可完整看到或捲動到達。
- **待人工實測項目（保留未驗證）**：
  - 離頁後捲動還原（`[RUNTIME_UNVERIFIED]`，保留未驗證，不寫成通過）。
  - 多品牌行動真機觸控與高解析度螢幕長時間 Canvas 渲染效能（`[RUNTIME_UNVERIFIED]`）。

---

## 6. 階段限制與邊界規範（嚴格遵守）

1. **無業務邏輯**：尚未實作問卷計分、OCR、推薦演算法、登入 API 或購物流程。
2. **無業務 Store**：Pinia 僅完成 `app.use(pinia)` 實例註冊，不建立 Auth/Cart/Report 等業務 Store，不加入持久化外掛（留待 Phase 8）。
3. **無正式路由**：整站業務路由（`/home`, `/questionnaire`, `/report` 等）與路由守衛留待 Phase 6。
4. **無 UI 庫**：不引入 Element Plus、Ant Design Vue 等第三方大型 UI 庫，亦不在此階段建立正式 Design Tokens。

