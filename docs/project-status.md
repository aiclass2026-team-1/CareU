# Care U｜工程狀態基準（Project Status Baseline）

- **最後更新日期**：2026-09-28
- **當前階段**：Phase 5｜Shared Component Modularization（已完成）
- **最近已提交功能 Checkpoint**：`5dd2998`（完整 SHA：`5dd2998 feat: migrate report and login modal to Vue`，本批待提交 Checkpoint：`refactor: modularize shared frontend components`）
- **功能基線說明**：Phase 5 Shared Components 已完成模組化抽取、集中資產管理、雙端 Parity 還原、Code Hygiene 清理與全套自動化驗證。
- **Git 運行狀態驗證原則**：Repo HEAD、Working Tree 與 Remote 同步狀態應於執行當下透過 Git 指令即時驗證，本文件不作自我記錄之靜態宣稱。
- **文件性質**：Care U 專案工程當前狀態的單一快速入口（Single Source of Current State）

---

## 1. 文件定位與維護原則（Document Purpose & Maintenance Protocol）

### 1.1 文件角色
- 本文件為 Care U 專案工程當前進度、最新已提交 Checkpoint、邊界限制與待辦事項之**單一快速入口**。
- 本文件**不記載冗長歷史變更細節**（完整歷史與各 Phase 歷程請查閱 `docs/phase-log.md`）。
- 本文件**不取代正式架構與需求規格**（規格細節請查閱 `docs/specs/**` 與 `source/**` 來源文件）。

### 1.2 維護更新協議（Future Update Protocol）
後續每一批次（Batch）或階段（Phase）推進時，均應遵循以下流程更新本文件：
```text
Implementation 完成
  └── Automated Validation（type-check / build / hash）通過
        └── User / PM 人工驗收完成（Acceptance PASS）
              └── 更新 docs/project-status.md
              └── 更新 docs/phase-log.md
              └── 同批次進行 Git Commit（建立新 Checkpoint）
              └── 經授權後 Push 至 Remote
```
- **禁止事項**：
  - 未經實際驗收前，不得將工作標記為 Completed。
  - 未完成 Commit 前，不得將工作標記為已建立 Git Checkpoint。
  - 未實際執行 Push 前，不得將 Remote 狀態標記為已同步。
  - 嚴禁將 Mock / Demo / Placeholder 描述為 Production 或 Backend-ready。

---

## 2. 目前專案工程狀態（Current Project State）

| 項目 | 當前狀態事實 | 依據來源 |
| :--- | :--- | :--- |
| **專案名稱** | Care U 保健食品推薦系統 | 專案規格與 `frontend/package.json` |
| **當前階段 (Current Phase)** | **Phase 5｜Shared Component Modularization（已完成）** | `frontend/README.md`, Git log |
| **最近完成之功能批次** | **Phase 5：共用元件與全站資產模組化（Shared Components Modularization）** | `frontend/README.md` §4, §5, 使用者人工驗收 PASS |
| **最近已提交功能 Checkpoint** | `5dd2998` (`feat: migrate report and login modal to Vue`，本批待提交 Checkpoint：`refactor: modularize shared frontend components`) | Git HEAD / 當前批次基準 |
| **執行中功能工作** | **無 (None)** | 當前無進行中的功能開發 |
| **下一批遷移 Scope** | **Phase 6｜Router / Site Flow Implementation（待授權）** | Repo 權威文件盤點結果 |

---

## 3. 工程遷移批次清冊（Completed Migration Batches）

| 階段 / 批次 | 遷移範圍 (Scope) | 預覽路由 | Git Checkpoint | 證據來源 | 驗收狀態與可信度 |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **Phase 4 Batch 1** | **入口頁 (Splash Page)**<br>`src/views/SplashView.vue` | `#/preview/splash` | `a40f65c` | `frontend/src/views/SplashView.vue` | **Checkpoint Confirmed** |
| **Phase 4 Batch 2** | **首頁 (Home & Upload Page)**<br>`src/views/HomeView.vue` | `#/preview/home` | `1df51af` | `frontend/README.md` §7 | **CONFIRMED** (User Accepted) |
| **Phase 4 Batch 3** | **Loading頁-1 與排除視窗**<br>`src/views/LoadingOneView.vue` | `#/preview/loading-1` | `41fb549` | `frontend/README.md` §7 | **CONFIRMED** (User Accepted) |
| **Phase 4 Batch 4** | **問卷頁與 Loading頁-2**<br>`src/views/QuestionnaireView.vue` | `#/preview/questionnaire` | `3d9c22a` | `frontend/README.md` §7 | **CONFIRMED** (User Accepted) |
| **Phase 4 Batch 5** | **報告頁與會員登入視窗**<br>`src/views/ReportView.vue` | `#/preview/report` | `5dd2998` | `frontend/README.md` §7 | **CONFIRMED** (User Accepted) |
| **Phase 5** | **共用元件與全站資產模組化**<br>`BrandMark`, `AppModal`, `AppToast`, `DataCanvas`, `LoadingStageVisual`, `LoginModal`, `useBodyScrollLock`, `useToast`, `tokens.css`, `fonts.css`, `common.css` | 全站共用 | 待本批 Commit | `frontend/README.md` §4, §5 | **CONFIRMED**<br>Type-check PASS, Build PASS<br>33/33 Manifest Hash PASS<br>Parity Check PASS<br>Code Hygiene PASS |
| **Next MVP Scope** | **整站正式流程與路由串接 (Phase 6 Router & Site Flow)** | - | - | 尚未定案 | **`TBD / NOT YET AUTHORIZED`** |

---

## 4. 待處理與未驗證事項（Open Issues & Runtime Unverified）

1. **離頁後捲動還原**：`[RUNTIME_UNVERIFIED]`
2. **多裝置與長時間 Canvas 渲染效能**：`[RUNTIME_UNVERIFIED]`
3. **主控台 `/preview` 無匹配 Route 警告**：`[OPEN_ISSUE]`（留待 Phase 6 路由統一處理）
4. **弱網環境重試穩定性**：`[RUNTIME_UNVERIFIED]`
5. **Illustrator 二進位原檔**：`[UNVERIFIED_BINARY]` (`CareU_VIS.ai`)

---

## 5. 文件歷史差異與風險記錄（Documentation Risks & Historical Differences）

### 5.1 根目錄 README 內容過期（`KNOWN_STALE_DOCUMENTATION`）
- **處置原則**：標記為已知過期文件，待後續專案級文件整理指令時再行更新，本輪不修改。

### 5.2 Phase 推進計畫版本演進（`HISTORICAL_ROADMAP_VERSION_DIFFERENCE`）
- **處置原則**：保留早期文件原貌，後續以 Technical PM 與最新 specs 定義為準。

---

## 6. 當前工程邊界與限制（Current Engineering Boundaries）

1. **無正式後端與 OCR 整合**：目前 Loading-1 健檢資料讀取僅為前端 4 階段動畫與 Demo 轉場，無正式 OCR 或後端解析服務。
2. **無正式推薦演算法與計分引擎**：問卷計分、12 項關注方向排序與商品推薦邏輯目前均為前端 Mock/Demo 展示資料，不等於正式後端推薦引擎。
3. **無正式會員認證與 API 契約**：登入/註冊/忘記密碼視窗僅為前端記憶體狀態與表單驗證展示，無正式 JWT/Session 鑑權與後端 API 串接。
4. **無正式整站正式路由與守衛**：目前僅提供 `#/preview/*` Hash 預覽路由與骨架驗證頁面，正式整站業務路由與路由守衛留待後續階段（Phase 6）。
5. **無業務 Pinia Store**：Pinia 僅完成全域實例註冊，尚未建立業務 Store（留待 Phase 8）。
6. **Frontend Demo / Mock / Placeholder 嚴禁描述為 Production 或 Backend-ready**。

---

## 7. 待決策與確認事項（Current TBD / Needs Confirmation）

- **`TBD`**：Phase 6（整站正式流程與路由串接 / site-flow & route navigation）之正式工程範圍與驗收標準（等待 Technical PM 定案與授權）。
- **`[RUNTIME_UNVERIFIED]`**：真機 Canvas 渲染效能、離頁捲動還原及弱網重試機制。

---

## 8. 明確下一步行動（Exact Next Action）

**由 Technical PM／使用者確認並授權 Phase 6（整站正式流程與路由串接 / site-flow & route navigation）；在 Phase 6 scope 定案與授權以前不得提前開始功能開發。**
