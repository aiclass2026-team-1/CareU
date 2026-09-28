# Care U｜工程狀態基準（Project Status Baseline）

- **最後更新日期**：2026-09-28
- **當前階段**：Phase 4｜Prototype → Vue Page Migration
- **最近已提交功能 Checkpoint**：`41fb549`（完整 SHA：`41fb5494fc717573967f22e82ac0d01f32131291`，`fix: finalize loading-one layout and exclusion modal`）
- **功能基線說明**：`41fb549` 為建立本工程文件基準前，最近已完成、已驗收並已提交之功能 Checkpoint。
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
| **當前階段 (Current Phase)** | **Phase 4｜Prototype → Vue Page Migration** | `frontend/README.md`, Git log |
| **最近完成之功能批次** | **Phase 4 第四批：問卷頁與 Loading頁-2（Questionnaire & Loading-2）** | `frontend/README.md` §6, 使用者人工驗收 PASS |
| **最近已提交功能 Checkpoint** | `41fb549` (`fix: finalize loading-one layout and exclusion modal`，本批待提交 Checkpoint：`feat: migrate questionnaire and loading-two to Vue`) | Git HEAD / 當前批次基準 |
| **執行中功能工作** | **無 (None)** | 當前無進行中的功能開發 |
| **下一批遷移 Scope** | **`TBD / NOT YET AUTHORIZED`**（`NO_AUTHORITATIVE_NEXT_BATCH_SCOPE_FOUND`，未授權，嚴禁自行推測頁面） | Repo 權威文件盤點結果 |

---

## 3. Phase 4 頁面遷移批次清冊（Completed Phase 4 Migration Batches）

| 批次 | 遷移範圍 (Scope) | 預覽路由 | Git Checkpoint | 證據來源 | 驗收狀態與可信度 |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **Batch 1** | **入口頁 (Splash Page)**<br>`src/views/SplashView.vue` | `#/preview/splash` | `a40f65c` | `frontend/src/views/SplashView.vue`<br>`frontend/src/router/index.ts` | **Checkpoint Confirmed**<br>詳細驗收清單：`NEEDS_CONFIRMATION` |
| **Batch 2** | **首頁 (Home & Upload Page)**<br>`src/views/HomeView.vue`<br>`src/views/useHome.ts`<br>`src/assets/home/` | `#/preview/home` | `1df51af` | `frontend/README.md` §4<br>Git log `1df51af` | **CONFIRMED**<br>Type-check PASS, Build PASS<br>33/33 Manifest Hash PASS<br>使用者人工驗收 PASS |
| **Batch 3** | **Loading頁-1 與排除視窗**<br>`src/views/LoadingOneView.vue`<br>`src/views/useLoadingOne.ts`<br>`src/assets/loading-one/` | `#/preview/loading-1` | `41fb549` | `frontend/README.md` §3, §5<br>Git log `41fb549` | **CONFIRMED**<br>Type-check PASS, Build PASS<br>33/33 Manifest Hash PASS<br>使用者人工驗收 PASS |
| **Batch 4** | **問卷頁與 Loading頁-2**<br>`src/views/QuestionnaireView.vue`<br>`src/views/useQuestionnaire.ts`<br>`src/assets/questionnaire/`<br>`src/assets/loading-one/loading-one.css` (背景同步) | `#/preview/questionnaire` | 待本批 Commit | `frontend/README.md` §6 | **CONFIRMED**<br>Type-check PASS, Build PASS<br>33/33 Manifest Hash PASS<br>使用者人工驗收 PASS |
| **Next Phase 4 migration batch** | **下一批次** | - | - | 尚未定案 | **`TBD / NOT YET AUTHORIZED`** |


---

## 4. 待處理與未驗證事項（Open Issues & Runtime Unverified）

以下事項依既有工程文件與審計報告如實列出，未經授權不得自行變更嚴重度或標記為通過：

1. **離頁後捲動還原**：`[RUNTIME_UNVERIFIED]`
   - 描述：離開 Loading-1／排除視窗路由後的瀏覽器捲動位置還原行為尚未進行實機驗證。
   - 來源：`frontend/README.md` §5.4。
2. **多裝置與長時間 Canvas 渲染效能**：`[RUNTIME_UNVERIFIED]`
   - 描述：多品牌行動真機觸控與高解析度螢幕長時間 Canvas 粒子渲染效能尚未進行實機壓力測試。
   - 來源：`frontend/README.md` §4.3, §5.4、`docs/specs/frontend-requirements.md` §7.2。
3. **主控台 `/preview` 無匹配 Route 警告**：`[OPEN_ISSUE]`
   - 描述：存取 `/preview` 根路徑時之無匹配路由警告，已記錄為獨立待處理事項，待後續整站正式路由規劃（Phase 6）統一處理，目前不作片面修改。
   - 來源：`frontend/README.md` §5.3。
4. **弱網環境重試穩定性**：`[RUNTIME_UNVERIFIED]`
   - 描述：弱網環境（3G / 高延遲）下 Loading-2 重試機制的穩定性與使用者體驗尚未實測。
   - 來源：`docs/specs/frontend-requirements.md` §7.2。
5. **Illustrator 二進位原檔**：`[UNVERIFIED_BINARY]`
   - 描述：`source/assets/brand/vis/CareU_VIS.ai` (2.16MB) 屬專用二進位格式，需專用軟體驗證，不判定為損毀。
   - 來源：`docs/audit/phase-0-preflight.md` §3.1、`docs/assets/asset-inventory.md` §2。

---

## 5. 文件歷史差異與風險記錄（Documentation Risks & Historical Differences）

本區塊記錄專案中已知的文件演進差異，**本輪只記錄、不修改歷史檔案**：

### 5.1 根目錄 README 內容過期（`KNOWN_STALE_DOCUMENTATION`）
- **現象**：根目錄 `README.md` 仍停留在「Phase 0：Git Source Baseline Preparation」與「尚未建立前端工程專案（No scaffold yet）」之早期敘述。
- **實際現況**：前端專案已於 Phase 3 建立，且已完成 Phase 4 第三批。
- **處置原則**：標記為已知過期文件，待後續專案級文件整理指令時再行更新，本輪不修改。

### 5.2 Phase 推進計畫版本演進（`HISTORICAL_ROADMAP_VERSION_DIFFERENCE`）
- **現象**：早期文件（根目錄 `README.md` §4.2、`docs/audit/phase-0-preflight.md` §8）記載 8 階段推進計畫（Phase 0 ~ Phase 7）；較新的架構規格（`docs/specs/frontend-requirements.md` §1.2）擴展為 16 階段計畫（Phase 3 ~ Phase 16）。
- **處置原則**：此為專案推進過程中的規格細化，不構成代碼衝突，保留早期文件原貌，後續以 Technical PM 與最新 specs 定義為準。

---

## 6. 當前工程邊界與限制（Current Engineering Boundaries）

為防止過度宣稱與架構混淆，目前專案嚴格遵守以下邊界：

1. **無正式後端與 OCR 整合**：目前 Loading-1 健檢資料讀取僅為前端 4 階段動畫與 Demo 轉場，無正式 OCR 或後端解析服務。
2. **無正式推薦演算法與計分引擎**：問卷計分、12 項關注方向排序與商品推薦邏輯目前均為前端 Mock/Demo 展示資料，不等於正式後端推薦引擎。
3. **無正式會員認證與 API 契約**：登入/註冊/忘記密碼視窗僅為前端記憶體狀態與表單驗證展示，無正式 JWT/Session 鑑權與後端 API 串接。
4. **無正式整站正式路由與守衛**：目前僅提供 `#/preview/*` Hash 預覽路由與骨架驗證頁面，正式整站業務路由與路由守衛留待後續階段（Phase 6）。
5. **無業務 Pinia Store**：Pinia 僅完成全域實例註冊，尚未建立業務 Store（留待 Phase 8）。
6. **Frontend Demo / Mock / Placeholder 嚴禁描述為 Production 或 Backend-ready**。

---

## 7. 待決策與確認事項（Current TBD / Needs Confirmation）

- **`TBD`**：Next Phase 4 migration batch 之正式頁面 Scope 與驗收標準（等待 Technical PM 定案與授權）。
- **`NEEDS_CONFIRMATION`**：Phase 3（Scaffold）與 Phase 4 Batch 1（Splash）之詳細逐項人工驗收紀錄因 Repo 內未留存獨立清單，保留待確認標記。
- **`[RUNTIME_UNVERIFIED]`**：真機 Canvas 渲染效能、離頁捲動還原及弱網重試機制。

---

## 8. 明確下一步行動（Exact Next Action）

**由 Technical PM／使用者確認並授權下一個最高價值的 Phase 4 / MVP migration batch 正式 scope（例如報告頁與會員登入視窗）；在 scope 定案以前不得開始功能 Preflight 或 Implementation。**



