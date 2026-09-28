# Care U｜工程歷程日誌（Phase & Milestone Engineering Log）

- **最後更新日期**：2026-09-28
- **當前階段**：Phase 4｜Prototype → Vue Page Migration
- **最近已提交功能 Checkpoint**：`41fb549`（完整 SHA：`41fb5494fc717573967f22e82ac0d01f32131291`，`fix: finalize loading-one layout and exclusion modal`）
- **功能基線說明**：`41fb549` 為建立本工程歷程日誌前，最近已完成、已驗收並已提交之功能 Checkpoint。
- **Git 運行狀態驗證原則**：Repo HEAD、Working Tree 與 Remote 同步狀態應於執行當下透過 Git 指令即時驗證，本文件不作自我記錄之靜態宣稱。
- **文件性質**：Care U 專案各階段（Phase）與批次（Batch）之長期里程碑與驗收紀錄

---

## 1. 記錄原則與標籤規範（Recording Rules & Evidence Tags）

本文件採用嚴格的事實與證據等級標籤，禁止無依據的主觀推測：

- **`CONFIRMED`**：已有實體工程文件、明確 Git Checkpoint 或詳細人工驗收紀錄作為客觀事實佐證。
- **`NEEDS_CONFIRMATION`**：已知存在該 Checkpoint 或代碼，但專案內缺少獨立詳細的逐項驗收清單，刻意保留不作主觀假設。
- **`RUNTIME_UNVERIFIED`**：程式碼結構已完成並通過靜態檢查，但尚未經瀏覽器真機、行動裝置或長時間運行驗證。
- **`TBD`**：尚待後續階段定義、評估或 Technical PM 授權之事項。

### 核心記錄原則
1. **不得反向推論**：後續 Phase / Batch 的完成，不能作為前面 Phase 驗收細節自動 PASS 的證據。
2. **不複製整份程式碼或逐檔 Diff**：本文件記錄關鍵成果、重大決策、驗收結果與未驗證邊界，不作流水帳式的 Diff 複製。
3. **維護協議（Update Protocol）**：每一批次工作完成並通過使用者/PM 驗收後，與 `docs/project-status.md` 同步更新並納入 Git Checkpoint。

---

## 2. Phase 0｜來源基準鎖定與防護（Git Source Baseline Preparation）

- **完成日期**：2026-09-27
- **Git Checkpoint**：`ba4a60e`（完整 SHA：`ba4a60eff2eca656b3c9b7d49828b725d417d22e`）
- **Commit 訊息**：`chore: establish Care U source baseline`
- **證據來源**：`docs/audit/phase-0-preflight.md`、`docs/audit/source-manifest.csv`
- **狀態標籤**：`CONFIRMED`

### 2.1 階段目標與成果
- 鎖定 `source/` 目錄內 **33 份來源檔案**，並建立 SHA-256 manifest baseline。
- 依據 `docs/audit/phase-0-preflight.md` 與 `docs/audit/source-manifest.csv` 記載，33 份來源檔案涵蓋：
  - `prototypes`：5 份 HTML 原型
  - `page-specs`：5 份頁面規格 MD
  - `flows`：2 份流程檔案（1 PNG 流程圖, 1 MD 流程說明）
  - `assets/brand`：15 份官方 VIS 品牌資產（7 SVG, 7 PNG, 1 AI 原檔）
  - `data`：4 份題庫與商品資料集（1 問卷 TXT, 1 保健分類 CSV, 1 Raw 商品 CSV, 1 Derived 商品 CSV）
  - `project-brief`：2 份專案指引文件（2 TXT）
  - **總計 33 份**（5 + 5 + 2 + 15 + 4 + 2 = 33）。
- 建立 `docs/audit/source-manifest.csv`，計算並記錄 33 份來源檔案之 SHA-256 雜湊基準。
- 配置 `.gitattributes`（`/source/** -text`），關閉換行轉換以確保來源二進位與雜湊永不被 Git 竄改。
- 配置 `.gitignore` 排除規則，並對空目錄設置 `.gitkeep` 防護。

### 2.2 審計與已知差異
- 記錄早期差異項目 D-01 至 D-07（包含排除視窗分支差異、題庫範圍差異、Derived CSV 缺網址欄、字體宣告差異等）。
- `source/assets/brand/vis/CareU_VIS.ai` 標記為 `UNVERIFIED_BINARY`（二進位專用原檔）。

---

## 3. Phase 1｜原型遷移審計與資產清冊（Migration Audit & Asset Inventory）

- **完成日期**：2026-09-27
- **Git Checkpoint**：`b96132d`（完整 SHA：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`）
- **Commit 訊息**：`docs: add frontend migration audit and asset inventory`
- **證據來源**：`docs/audit/frontend-migration-audit.md`、`docs/assets/asset-inventory.md`
- **狀態標籤**：`CONFIRMED`

### 3.1 階段目標與成果
- **逐頁原始碼審計**：全面檢驗 5 份獨立 HTML 原型之 DOM 結構、CSS 樣式、Keyframes 動畫、JavaScript 事件、時序計時器與 Placeholder。
- **靜態資產盤點清冊（Asset Inventory）**：
  - 記憶體解碼並計算所有內嵌 Data URI 與獨立檔案之 SHA-256 雜湊。
  - 盤點 15 份品牌資產、6 份內嵌 WOFF 字體、3 份內嵌 PNG 圖片、1 份 SVG Favicon、11 款 SVG Symbol 精靈圖標、3 處 Canvas 動態視覺。
  - 確認專案無外部網路依賴（0 external HTTP/HTTPS resources）。
- 提出元件階層拆分提案與 Token 抽取建議。

---

## 4. Phase 2｜架構與工程規格基準（Architecture & Specification Baseline）

- **完成日期**：2026-09-27
- **Git Checkpoint**：`9603ed4`（完整 SHA：`9603ed47bd497151a4306353fee97c8e9f4d555a`）
- **Commit 訊息**：`docs: establish phase 2 specification baseline`
- **證據來源**：`docs/specs/**`（5 份架構規格 + 5 份工程頁面規格）
- **狀態標籤**：`CONFIRMED`（規格基準 Draft 建立）

### 4.1 階段目標與成果
建立完整的工程化規格體系，包含：
1. `docs/specs/frontend-requirements.md`（前端工程需求規範、無障礙規範、時序模型與 Phase 3~16 推進基準）
2. `docs/specs/site-flow.md`（整站流程與路由架構規格）
3. `docs/specs/component-inventory.md`（共用元件清冊與介面規格）
4. `docs/specs/design-system.md`（視覺設計系統與 Design Tokens 規格）
5. `docs/specs/state-data-notes.md`（狀態管理與資料模型筆記）
6. 5 份工程頁面規格：`01-splash-page.md` 至 `05-report-auth-modal.md`

### 4.2 確立之核心架構決策
- **`DEC-01`**：排除視窗明確落實「返回首頁」與「直接填寫問卷（銜接 full 模式，被排除檔案不計為有效資料）」雙分支。
- **`DEC-02`**：問卷頁先依原型遷移 6~7 步 Demo 結構；12 類 32 題完整題庫留待 Phase 7 資料對齊。
- **`DEC-03`**：保留各頁現行字體宣告差異（首頁 `"LINE Seed TW"`、其他頁面 `"CareU LINE Seed TW"`），現階段不合併字體。
- **`DEC-04`**：排除視窗**不支援 `Escape` 鍵關閉與遮罩點擊關閉**，焦點鎖定於雙按鈕間；其他通用 Modal 則支援 `Escape` 關閉與焦點還原。
- **共用登入視窗**：全域單一 Modal 元件，登入後原地解鎖，首頁不跳轉專屬頁，報告頁不重跑分析。

---

## 5. Phase 3｜前端工程骨架建置（Frontend Scaffold & Configuration）

- **完成日期**：2026-09-27
- **Git Checkpoint**：`edfcc90`（完整 SHA：`edfcc909186c89354a5ae015351954398604ead2`）
- **Commit 訊息**：`chore: scaffold Vue frontend with Vite and TypeScript`
- **證據來源**：`frontend/package.json`、`frontend/vite.config.ts`、`frontend/src/**`
- **狀態標籤**：Milestone Confirmed；詳細驗收清單：`NEEDS_CONFIRMATION`

### 5.1 階段目標與成果
- 於 `frontend/` 目錄建立 Vue 3 前端工程骨架：
  - **核心框架**：Vue 3 (`v3.5.x`, SFC Composition API `<script setup>`)
  - **建置工具**：Vite (`v8.x`)
  - **語言支援**：TypeScript (`v5.8.x`, 專案參考模式，`vue-tsc -b`)
  - **路由管理**：Vue Router (`v5.x`，暫採 Hash History `createWebHashHistory`)
  - **狀態管理**：Pinia (`v4.x`，完成全域實例註冊，無業務 Store)
  - **相依套件**：配置 `@vue/devtools-api`
- 提供基礎骨架驗證頁面：`#/`（占位首頁）與 `#/scaffold-verify`（路由驗證頁）。


---

## 6. Phase 4｜原型逐頁遷移至 Vue（Prototype → Vue Page Migration）

本階段目標為將 5 大 HTML 原型模組化遷移至 Vue 3 SFC，分批次推進與驗收。

### 6.1 Phase 4 第一批：入口頁遷移（Splash Page Migration）
- **完成日期**：2026-09-27
- **Git Checkpoint**：`a40f65c`（完整 SHA：`a40f65cf52692deccf8458b1725d5244306470db`）
- **Commit 訊息**：`feat: migrate splash page to Vue`
- **遷移範圍**：`frontend/src/views/SplashView.vue`
- **預覽路由**：`#/preview/splash`（`meta: { hideLayout: true }`）
- **證據來源**：`frontend/src/views/SplashView.vue`、`frontend/src/router/index.ts`、Git log
- **狀態標籤**：Checkpoint Confirmed；詳細驗收清單：`NEEDS_CONFIRMATION`
- **已知成果**：
  - 品牌開場動畫完整還原（U 型/十字模糊轉清晰、圓點升起、Slogan 漸入）。
  - 支援 2850ms 自動進入示意首頁、點擊/鍵盤（Enter/Space）立即略過、Reduced Motion 動態偏好適配。

---

### 6.2 Phase 4 第二批：首頁與上傳面板遷移（Home & Upload Page Migration）
- **完成日期**：2026-09-27
- **Git Checkpoint**：`1df51af`（完整 SHA：`1df51afe6a88f5a6ebd4fca0e9168e692936a166`）
- **Commit 訊息**：`feat: migrate home and upload page to Vue`
- **遷移範圍**：`frontend/src/views/HomeView.vue`、`frontend/src/views/useHome.ts`、`frontend/src/assets/home/`
- **預覽路由**：`#/preview/home`
- **證據來源**：`frontend/README.md` §4、Git log
- **狀態標籤**：`CONFIRMED`

#### 驗收成果清單
- **自動化驗證**：
  - `npm --prefix frontend run type-check`：`vue-tsc -b` 0 錯誤、0 警告。
  - `npm --prefix frontend run build`：`vite build` 順利產出獨立分塊。
  - `docs/audit/source-manifest.csv` 33 份來源資產 SHA-256 雜湊 100% 吻合（33 PASS）。
- **使用者人工驗收項目（全數通過）**：
  - 頂部標準字、打字六點跳動（`home-dot-hop`）、懸浮登入按鈕過渡動畫與原型 100% 一致。
  - 向下箭頭點擊後維持 `#/preview/home` 路由，不改寫為 `#trust`。
  - 桌面雙屏切換（`desktopSnap=true`、`scroll-snap-type: y mandatory`）正常。
  - 長內容與窄視窗自動降級為原生滾動，可閱畢第二屏至 Footer。
  - `prefers-reduced-motion` 動態即時同步，Reduced Motion 下點擊箭頭採即時無動畫捲動。
  - 樣式完全隔離，不污染 Splash 與骨架頁面。
  - 上傳面板選檔、格式檢查、最多 10 檔累加與上限提示正常。
  - 瀏覽器強整後無 `/favicon.ico` 404 請求。
- **保留之未驗證項目**：
  - 多品牌行動真機觸控與高解析度螢幕長時間 Canvas 渲染效能（`[RUNTIME_UNVERIFIED]`）。

---

### 6.3 Phase 4 第三批：Loading頁-1 與排除視窗遷移（Loading-1 & Exclude Modal Migration）
- **完成日期**：2026-09-28
- **Git Checkpoint**：`41fb549`（完整 SHA：`41fb5494fc717573967f22e82ac0d01f32131291`）
- **Commit 訊息**：`fix: finalize loading-one layout and exclusion modal`
- **遷移範圍**：`frontend/src/views/LoadingOneView.vue`、`frontend/src/views/useLoadingOne.ts`、`frontend/src/assets/loading-one/`
- **預覽路由**：`#/preview/loading-1`
- **證據來源**：`frontend/README.md` §3, §5、Git log
- **狀態標籤**：`CONFIRMED`

#### A. 已記錄之工程實作與自動化驗證（Documented Implementation & Automated Validation）
- **自動化驗證**：
  - `npm --prefix frontend run type-check`：✅ PASS (`vue-tsc -b` 0 錯誤、0 警告)。
  - `npm --prefix frontend run build`：✅ PASS (`vite build` 順利產出)。
  - 33 份來源檔案 Manifest 雜湊：✅ 33/33 PASS。
- **工程實作細節（依據 `frontend/README.md` §5.1, §5.2）**：
  - 4 階段狀態文字推進時序（1800ms / 2400ms / 2200ms / 1100ms，正常流程 7.5s、排除流程 4.2s）與 220ms 更新延遲、230ms CSS 過渡。
  - Logo `viewBox="0 0 300 378.011"`、橘點跳動（`loading-logo-dot-hop` 1.45s）、狀態三點（`loading-dot-hop` 1.2s）、Canvas 全螢幕粒子場。
  - 排除視窗（`ExcludeModal`）落實 DEC-01 雙分支與 DEC-04 不支援 Escape/遮罩點擊關閉。
  - 排除視窗透過 `isBodyScrollLocked` 鎖定與精準還原 `body` 捲動，延遲 80ms 聚焦並具備定時器清理。
  - 非活動畫面 `.screen` 採 `position: absolute; inset: 0; transform: none; overflow: hidden;`，將位移轉場下移至內層卡片容器，阻斷非活動 DOM 位移造成的容器溢出；活動畫面 `.screen.is-active` 正常垂直捲動；`.modal-backdrop` 補齊 `overflow-y: auto`。
  - 排除視窗叉叉圖示（`viewBox="0 0 40 40"`）與專屬膠囊按鈕圓角（`border-radius: 999px`）。
  - 內嵌示範問卷與首頁外殼僅供頁內轉場分流驗證（Demo Only）。

#### B. 使用者人工驗收成果（User Acceptance，依據 `frontend/README.md` §5.4）
- ✅ **焦點與鍵盤互動**：Tab / Shift+Tab 焦點循環、Escape 鍵忽略、遮罩點擊不關閉行為通過。
- ✅ **分流切換**：返回首頁／直接填寫問卷雙分支切換通過。
- ✅ **主控台狀態**：Console 無警告與報錯通過。
- ✅ **動態偏好**：Reduced Motion 靜態與即時切換響應通過。
- ✅ **視覺與排版**：Loading 與排除視窗沒有多餘右側捲軸，Logo／氣泡位置正常通過。
- ✅ **圖示外觀**：排除視窗叉叉圖示向量外觀正確通過。
- ✅ **流程轉場**：流程轉場自然通過。
- ✅ **響應適配**：短視窗下內容與按鈕可完整看到或捲動到達通過。

#### C. 保留之未驗證與獨立待處理事項（Runtime Unverified & Isolated Items）
- 離開 Loading-1／排除視窗路由後的捲動還原（`[RUNTIME_UNVERIFIED]`，保留未驗證）。
- 多品牌真機觸控與長時間 Canvas 渲染效能（`[RUNTIME_UNVERIFIED]`）。
- 主控台 `/preview` 無對應路由警告記錄為獨立待處理事項，本批次不處理。

---

### 6.4 Phase 4 第四批：問卷頁與 Loading頁-2 遷移（Questionnaire & Loading-2 Migration）
- **完成日期**：2026-09-28
- **Git Checkpoint**：`3d9c22a`（完整 SHA：`3d9c22a7f5a7e671d4bf59c36e811caef94a61b8`）
- **Commit 訊息**：`feat: migrate questionnaire and loading-two to Vue`
- **遷移範圍**：`frontend/src/views/QuestionnaireView.vue`、`frontend/src/views/useQuestionnaire.ts`、`frontend/src/assets/questionnaire/`、`frontend/src/assets/loading-one/loading-one.css`（背景同步）
- **預覽路由**：`#/preview/questionnaire`
- **證據來源**：`frontend/README.md` §6、使用者人工驗收紀錄
- **狀態標籤**：`CONFIRMED`

#### A. 已記錄之工程實作與自動化驗證（Documented Implementation & Automated Validation）
- **自動化驗證**：
  - `npm --prefix frontend run type-check`：✅ PASS (`vue-tsc -b` 0 錯誤、0 警告)。
  - `npm --prefix frontend run build`：✅ PASS (`vite build` 順利產出)。
  - 33 份來源檔案 Manifest 雜湊：✅ 33/33 PASS。
- **工程實作細節（依據 `frontend/README.md` §6.1）**：
  - 問卷雙模式架構：資料補充模式（6 步驟＋complete，7 畫面，固定 7 槽）與完整模式（6 步驟＋complete，7 畫面，固定 8 槽；女性動態插入安全題，8 畫面，固定 8 槽；男性／其他略過安全題直達第 8 槽 100%，槽位固定防倒退）。
  - 題型互動與互斥校驗：基本資料（年齡、性別、體重）、生活習慣單選、身體測量腰圍／血壓與「目前不知道」雙向互斥（勾選清空數值，聚焦或輸入數值取消勾選）、過敏原多選清單（11 項多選、「無已知過敏」互斥、「其他」展開輸入與非空白校驗）、安全資訊（懷孕／哺乳）。
  - 答案暫存機制：`sessionStorage`（Key: `careu-questionnaire`）作答即時寫入、F5 模式比對精準還原、送出問卷後暫存保留供分析失敗返回問卷恢復填答、Demo 重新開始清除。
  - Loading-2 推進與異常處理：4 階段時序推進（1600ms / 1800ms / 1800ms / 1200ms），文字淡入淡出切換，Logo 暖橘圓點跳動（1.45s）、狀態三點起伏（1.2s），完成後顯示「報告準備完成」（650ms）並轉入報告頁 Placeholder（`REPORT READY`）；分析失敗卡片（「這次分析沒有順利完成」）支援「返回問卷」（還原答案）與「再試一次」（重播 Loading-2）。
  - 視覺與背景定案：Questionnaire ＋ Loading-2 網絡背景圖層定案為 `blur(2px)`（`filter: saturate(.45) contrast(.9) blur(2px)`）；Loading-1 網絡背景圖層同步更新為相同效果；問卷白色主方框於桌面全題目固定維持 900px（`.question-shell { width: 900px; max-width: 100%; }`），消除寬度跳動；「目前不知道」選項維持 Prototype 原生純文字 Choice Chip 視覺。
  - 鍵盤與可及性架構（MVP 定義）：表單控制項與按鈕遵循瀏覽器原生標準行為，支援 Tab 走訪與 Enter/Space 選取，具備 `:focus-visible` 品牌藍外框；非 MVP 之自訂 Focus Loop 與換題自動強制移焦已自 MVP 範圍移除（標記為 Post-MVP / not required for MVP，不視為缺陷）。
  - 專屬素材抽離至 `src/assets/questionnaire/`（2 組 CareU LINE Seed TW WOFF 字體與 1 張後景圖 PNG，解碼雜湊 100% 吻合）。

#### B. 使用者人工驗收成果（User Acceptance，依據 `frontend/README.md` §6.2）
- ✅ **雙模式與進度槽**：補充模式（7 槽）與完整模式（8 槽，女性安全題動態插入，男性略過直達 100% 不倒退）通過。
- ✅ **表單互斥與防呆**：測量「目前不知道」雙向互斥、過敏原「無已知過敏」互斥、「其他」展開非空白校驗通過。
- ✅ **暫存與還原**：作答即時暫存、F5 還原與 Demo 重新開始清除通過。
- ✅ **Loading-2 排版與動效**：4 階段時序推進、Logo 橘點與三點跳動、Logo 居中與氣泡垂直對齊排版通過。
- ✅ **分析失敗重試**：失敗卡片、「返回問卷」答案保留與「再試一次」重播通過。
- ✅ **視覺與背景**：Questionnaire 與 Loading-1 背景同步 `blur(2px)` 通過。
- ✅ **卡片尺寸穩定性**：桌面切換各題目白色外框固定為 900px 無跳動通過。
- ✅ **「目前不知道」外觀**：純文字 Chip 視覺還原（無額外 checkbox 方格）通過。
- ✅ **鍵盤與滑鼠操作**：瀏覽器原生標準交互體驗通過。

#### C. 保留之未驗證事項（Runtime Unverified Items）
- 多品牌行動真機長時間 Canvas 粒子渲染效能（`[RUNTIME_UNVERIFIED]`）。
- 行動端虛擬鍵盤彈起時之滾動置中（`[RUNTIME_UNVERIFIED]`）。

---

### 6.5 Phase 4 第五批：報告頁與會員登入視窗遷移（Report Page & Login Modal Migration）
- **完成日期**：2026-09-28
- **Git Checkpoint**：待本批 Commit（`feat: migrate report and login modal to Vue`）
- **遷移範圍**：
  - `frontend/src/views/ReportView.vue`、`frontend/src/views/ReportHero.vue`、`frontend/src/views/ReportChartSection.vue`、`frontend/src/views/ReportInsightSection.vue`、`frontend/src/views/ReportRecommendationSection.vue`、`frontend/src/views/ReportBundleSection.vue`、`frontend/src/views/LoginModal.vue`、`frontend/src/views/CartModal.vue`
  - `frontend/src/views/useReport.ts`、`frontend/src/views/reportData.ts`、`frontend/src/views/catalogData.json`
  - `frontend/src/assets/report/`（包含完整 4.37MB / 4.53MB WOFF 全字集字體、官方 VIS Logo、網絡通用背景圖）
- **預覽路由**：`#/preview/report`
- **證據來源**：`frontend/README.md` §7、使用者人工驗收紀錄
- **狀態標籤**：`CONFIRMED`

#### A. 已記錄之工程實作與自動化驗證（Documented Implementation & Automated Validation）
- **自動化驗證**：
  - `npm --prefix frontend run type-check`：✅ PASS (`vue-tsc -b` 0 錯誤、0 警告)。
  - `npm --prefix frontend run build`：✅ PASS (`vite build` 順利產出)。
  - 33 份來源檔案 Manifest 雜湊：✅ 33/33 PASS。
- **工程實作細節（依據 `frontend/README.md` §7.1）**：
  - 頂部導覽列與 Hero 摘要區：官方 VIS 標誌 Lockup、購物車與示範會員入口、公開摘要與會員完整摘要即時切換、懸浮光暈與通用免責聲明。
  - 身體優先關注方向圖表：顯示前 8 項指標（依 `score` 降冪排序），純橫向長條進度條；未登入前 2 名覆蓋鎖定遮罩與登入 CTA；點擊公開項目展開詳細分析，再次點擊收合，且點擊時僅對當前被點擊橫條重播 `@keyframes grow` 動畫（0.65s）。
  - 重點保健方向卡片：展示前 5 項方向展開卡片（`<details>`），未登入前 2 名鎖定；展開呈現摘要、生活依據、原因說明及警示標記（黃色三角門檻提醒、紅色圓形就醫警告）。
  - 保健食品推薦與更換：登入後原地解鎖；候選品項 Choice Chip、DOM+CSS 劑型示意（膠囊與錠劑視覺）、主要成分、核准字號、功效宣稱與注意事項展開；點擊「更換品項」頁內展開候選清單；跨方向選取已存在商品時阻擋並觸發 Toast 提示。
  - 專屬保健組合與計價：已選品項卡片、推薦理由、可自組合移除或重新選擇；月組合摘要卡片以 `uniqueSelected()` 針對品項 ID 進行 Set 去重加總模擬金額。
  - 共用登入視窗：登入/註冊/忘記密碼模式切換、密碼明文切換眼睛圖示、示範帳號一鍵體驗；登入後原地解鎖報告與推薦，不重跳首頁、不重跑問卷或 Loading；點擊「示範會員」開啟確認視窗，確認後才執行登出。
  - 側邊 4 節點導航：點擊平滑捲動至各區段標題，hover 無文字底線。
  - Demo 控制面板：右下角懸浮展開，支援切換 4 組受試者 Profile（小安、小晴、阿哲、小柔）、訪客/登入切換、重設/清空組合。
  - 專屬全字集素材：提取完整 4.37MB / 4.53MB WOFF 字體，SHA-256 100% 吻合，徹底解決字符降級粗細不一問題；`.wrap` 容器包裹解決組合區塊滿版問題。

#### B. 使用者人工驗收成果（User Acceptance，依據 `frontend/README.md` §7.2）
- ✅ **圖表 8 條橫向長條**：正常渲染、依 score 排序與點擊單條動畫重播通過。
- ✅ **候選商品詳細資訊**：功效宣稱、證據類型、主要成分、警語、注意事項與核准資訊展開通過。
- ✅ **示範會員登出確認**：點擊會員按鈕彈出確認視窗（不直接登出），確認後安全登出通過。
- ✅ **左側選單樣式**：hover 無文字底線，點擊平滑定位通過。
- ✅ **文字字重一致性**：完整 WOFF 字集覆蓋，無中文字元降級微軟正黑體之粗細混雜通過。
- ✅ **組合區塊寬度**：`.wrap` 容器約束與置中正常，無滿版跑版通過。
- ✅ **原地解鎖與防呆**：登入後原地解鎖、不重跑流程、跨方向重複選取阻擋與 Set 去重計價通過。

#### C. 保留之未驗證事項（Runtime Unverified Items）
- 多品牌行動真機長時間 Canvas 粒子渲染效能（`[RUNTIME_UNVERIFIED]`）。
- 行動端虛擬鍵盤彈起時之滾動置中（`[RUNTIME_UNVERIFIED]`）。

---

### 6.6 Next MVP Scope
- **遷移範圍**：**`TBD / NOT YET AUTHORIZED`**（`NO_AUTHORITATIVE_NEXT_BATCH_SCOPE_FOUND`）
- **狀態**：尚未授權，嚴格等待 Technical PM 規劃、Review 與後續指令。

---

## 7. 長期工程歷程總覽表（Milestone Summary Matrix）

| 階段 / 批次 | 核心產出 / 範圍 | 最新 Git Checkpoint | 狀態與驗收等級 |
| :--- | :--- | :---: | :--- |
| **Phase 0** | 來源基準鎖定、33 份檔案雜湊 Manifest、Git 保護 | `ba4a60e` | `CONFIRMED` |
| **Phase 1** | 原型程式碼審計、Asset Inventory、Token 分析 | `b96132d` | `CONFIRMED` |
| **Phase 2** | 5 份架構規格 + 5 份工程頁面規格、DEC-01~04 確立 | `9603ed4` | `CONFIRMED` (Draft Baseline) |
| **Phase 3** | Vue 3 + Vite + TS + Pinia + Vue Router 專案骨架 | `edfcc90` | Checkpoint Confirmed / `NEEDS_CONFIRMATION` |
| **Phase 4 Batch 1** | 入口頁 (Splash Page) 遷移至 Vue | `a40f65c` | Checkpoint Confirmed / `NEEDS_CONFIRMATION` |
| **Phase 4 Batch 2** | 首頁與上傳面板 (Home & Upload) 遷移至 Vue | `1df51af` | `CONFIRMED` (User Accepted) |
| **Phase 4 Batch 3** | Loading-1 與排除視窗遷移至 Vue | `41fb549` | `CONFIRMED` (User Accepted) |
| **Phase 4 Batch 4** | 問卷頁與 Loading頁-2 遷移至 Vue（含 Loading-1 背景同步） | `3d9c22a` | `CONFIRMED` (User Accepted) |
| **Phase 4 Batch 5** | 報告頁與會員登入視窗遷移至 Vue（含全字集與 UI 修正） | 待本批 Commit | `CONFIRMED` (User Accepted) |
| **Next MVP Scope** | 整站流程與前後端整合準備 | - | **`TBD / NOT YET AUTHORIZED`** |


