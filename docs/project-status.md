# Care U｜工程狀態基準（Project Status Baseline）

- **最後更新日期**：2026-09-30
- **當前階段**：Phase 7｜Questionnaire Live Integration Closeout（完成 COMPLETE）
- **最近已提交 Checkpoint**：`334748d`（完整 SHA：`334748dc426b67babb9db36642dc53b59314fa79`，`fix: separate questionnaire auth and data contexts`）
- **功能基線說明**：Questionnaire Live Integration Runtime QA 已全面完成（T01-T08 全數通過 PASS）。已修正 T01 缺失指標解析問題（根本原因：`build-questionnaire-plan` 混合 caller JWT auth context 與 database reads，現已拆分 `authClient` 與 `dbClient` Service Role 讀取）。生產環境部署 `build-questionnaire-plan` v8 (ACTIVE, verify_jwt: true)。Full Path A 煙測（No Upload → Full Questionnaire → submit-questionnaire 201 → finalize-health-report 200 → formal /report）全數通過。問卷功能正式完工，會員與認證保持暫緩，報告實作為下一階段核心開發重點。
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
| **當前階段 (Current Phase)** | **Phase 7｜Questionnaire Live Integration Closeout (COMPLETE)** | `docs/specs/backend-integration-contracts.md`, Git status |
| **最近完成之功能批次** | **Questionnaire Live Integration Runtime QA & T01-T08 Regression PASS。生產環境部署 `build-questionnaire-plan` v8。T01 根本原因修復（分離 authClient 與 dbClient）。Full Path A 煙測全數通過。** | 人工與資料庫驗證 PASS, Type-check PASS, Build PASS |
| **最近已提交 Checkpoint** | `fix: separate questionnaire auth and data contexts` (`334748d`) | Git HEAD / 當前批次基準 |
| **執行中功能工作** | **Questionnaire Live Integration 圓滿結算，準備進入 Report 實作階段（RANK-01, RPT-01, RPT-02, RPT-04, UI-02）** | 專案進度規範 |
| **下一階段 Scope** | **Report Implementation & Recommendation Scope（RANK-01, RPT-01, RPT-02, RPT-04, UI-02）** | Repo 權威文件盤點結果 |

---

## 3. 工程遷移批次清冊（Completed Migration Batches）

| 階段 / 批次 | 遷移範圍 (Scope) | 預覽路由 | Git Checkpoint | 證據來源 | 驗收狀態與可信度 |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **Phase 4 Batch 1** | **入口頁 (Splash Page)**<br>`src/views/SplashView.vue` | `#/preview/splash` | `a40f65c` | `frontend/src/views/SplashView.vue` | **Checkpoint Confirmed** |
| **Phase 4 Batch 2** | **首頁 (Home & Upload Page)**<br>`src/views/HomeView.vue` | `#/preview/home` | `1df51af` | `frontend/README.md` §7 | **CONFIRMED** (User Accepted) |
| **Phase 4 Batch 3** | **Loading頁-1 與排除視窗**<br>`src/views/LoadingOneView.vue` | `#/preview/loading-1` | `41fb549` | `frontend/README.md` §7 | **CONFIRMED** (User Accepted) |
| **Phase 4 Batch 4** | **問卷頁與 Loading頁-2**<br>`src/views/QuestionnaireView.vue` | `#/preview/questionnaire` | `3d9c22a` | `frontend/README.md` §7 | **CONFIRMED** (User Accepted) |
| **Phase 4 Batch 5** | **報告頁與會員登入視窗**<br>`src/views/ReportView.vue` | `#/preview/report` | `5dd2998` | `frontend/README.md` §7 | **CONFIRMED** (User Accepted) |
| **Phase 5** | **共用元件與全站資產模組化** | 全站共用 | `ac99318` | `frontend/README.md` §4, §5 | **CONFIRMED** (User Accepted) |
| **Phase 6** | **正式整站路由、導航守衛、Flow Context、問卷 Draft Lifecycle、CSS Leakage 修正與 Transition Polish** | 保留 `#/preview/*` | `6239cf5` | `frontend/src/router/index.ts` | **CONFIRMED**<br>Type-check PASS, Build PASS<br>User Acceptance PASS |
| **Phase 7 Batch 1-8** | **Questionnaire Live Integration & T01-T08 Regression QA** | 支援正式流程 | `334748d` | Supabase Functions / Frontend / Test Suite | **CONFIRMED**<br>T01-T08 PASS, Path A PASS, v8 deployed |

---

## 4. 待處理與未驗證事項（Open Issues & Runtime Unverified）

1. **離頁後捲動還原**：`[RUNTIME_UNVERIFIED]`
2. **多裝置與長時間 Canvas 渲染效能**：`[RUNTIME_UNVERIFIED]`
3. **弱網環境重試穩定性**：`[RUNTIME_UNVERIFIED]`
4. **Questionnaire 窄視窗體重欄位／Demo overlay 顯示**：`[DEFER]` (留待後續 UI 調整)
5. **Illustrator 二進位原檔**：`[UNVERIFIED_BINARY]` (`CareU_VIS.ai`)

---

## 5. 文件歷史差異與風險記錄（Documentation Risks & Historical Differences）

### 5.1 根目錄 README 內容過期（`KNOWN_STALE_DOCUMENTATION`）
- **處置原則**：標記為已知過期文件，待後續專案級文件整理指令時再行更新，本輪不修改。

### 5.2 Phase 推進計畫版本演進（`HISTORICAL_ROADMAP_VERSION_DIFFERENCE`）
- **處置原則**：保留早期文件原貌，後續以 Technical PM 與最新 specs 定義為準。

---

## 6. 當前工程邊界與限制（Current Engineering Boundaries）

1. **會員認證系統暫緩**：Membership/Auth 保持暫緩，訪客體驗與 Rank #1/#2 鎖定機制完整保留。
2. **問卷運行期功能完整**：Questionnaire Live Integration 已全面完成，支援完整版與補充版動態問卷、性別過濾、缺失指標解析與資料庫持久化。
3. **報告實作範圍界定**：
   - RPT-03「bundle 中無適用產品」不視為 Bug：維持有效健康方向可見、無合適核准商品時顯示說明訊息、不造假商品、不強塞進可購買 bundle。
   - 剩餘報告實作範圍包含：`RANK-01`, `RPT-01`, `RPT-02`, `RPT-04`, `UI-02` 及 `RPT-03 regression protection only`。
4. **正式整站路由與守衛已確立**：正式 URL（`/ stromal`, `/home`, `/loading-1`, `/questionnaire`, `/report`）運行正常。

---

## 7. 待決策與確認事項（Current TBD / Needs Confirmation）

- **`[RUNTIME_UNVERIFIED]`**：真機 Canvas 渲染效能及跨裝置捲動還原。

---

## 8. 明確下一步行動（Exact Next Action）

**進入 Report 實作階段（RANK-01, RPT-01, RPT-02, RPT-04, UI-02, RPT-03 regression protection）；維持 Questionnaire 功能穩定。**
