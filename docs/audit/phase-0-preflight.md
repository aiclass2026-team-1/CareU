# Care U｜Phase 0 Preflight & Source Baseline Report

- **執行日期**：2026-09-27
- **專案路徑**：`C:\Users\User\Desktop\CareU`
- **階段定位**：Phase 0：Git Source Baseline Preparation（來源基準準備與環境保護）
- **報告狀態**：正式基準文件

---

## 1. 預檢結論（Verdict）

**結論：PASS**

### 1.1 判定範圍與授權邊界
- **核准範圍**：確認專案內 33 份來源檔案齊全、5 份 HTML 原型雜湊無誤、3 份 CSV 可解析且結構相符，具備建立 Git Source Baseline 之條件。
- **限制說明**：本報告**僅作為來源資產保護與基準鎖定依據**，不代表產品規格或後端 API 契約全部定案，亦**不包含 Vue 開發授權、檔案清洗、素材抽出或任何來源檔案修改**。

---

## 2. 來源資產盤點（Source Inventory）

### 2.1 來源檔案統計
專案 `source/` 目錄內共有 **33 份** 原始檔案。

#### 全專案副檔名分布（33 份）
- **SVG（7 份）**：全數位於 `source/assets/brand/`
- **PNG（8 份）**：7 份位於 `source/assets/brand/`，1 份位於 `source/flows/`
- **HTML（5 份）**：全數位於 `source/prototypes/`
- **MD（6 份）**：5 份位於 `source/page-specs/`，1 份位於 `source/flows/`
- **TXT（3 份）**：2 份位於 `source/project-brief/`，1 份位於 `source/data/questionnaire/`
- **CSV（3 份）**：分別位於 `data/health-categories/`、`data/products/raw/`、`data/products/derived/`
- **AI（1 份）**：位於 `source/assets/brand/vis/`

#### 依功能分類統計
| 分類目錄 | 檔案數 | 格式構成 | 說明 |
| :--- | :---: | :--- | :--- |
| **project-brief** | 2 | 2 TXT | Technical PM Prompt 指引與新對話準備清單 |
| **prototypes** | 5 | 5 HTML | 入口頁、首頁、Loading-1/排除視窗、問卷/Loading-2、報告/登入視窗 |
| **page-specs** | 5 | 5 MD | 對應 5 份原型的頁面規格說明文件 |
| **flows** | 2 | 1 PNG, 1 MD | 網站流程圖（JPEG 二進位標頭）與流程說明文件 |
| **assets/brand** | 15 | 7 SVG, 7 PNG, 1 AI | 官方 VIS 品牌標誌、標準字、色票與向量原檔 |
| ├ combinations | 3 | 1 SVG, 2 PNG | 標誌橫式/直式組合圖檔 |
| ├ logo | 6 | 5 SVG, 1 PNG | Logo 尺寸變形與部件向量檔 |
| ├ vis | 3 | 2 PNG, 1 AI | VIS 概覽、色票表與 Illustrator 原檔 |
| └ wordmark | 3 | 1 SVG, 2 PNG | 標準字向量與圖檔 |
| **data/questionnaire** | 1 | 1 TXT | 12 項完整問卷題庫與安全禁忌題目 |
| **data/health-categories** | 1 | 1 CSV | 12 項保健項目清單 |
| **data/products/raw** | 1 | 1 CSV | 原始健康食品資料集（含來源網址） |
| **data/products/derived** | 1 | 1 CSV | 衍生資料集（DB 欄位版，含機制與評分標籤） |
| **合計** | **33** | **7 SVG, 8 PNG, 5 HTML, 6 MD, 3 TXT, 3 CSV, 1 AI** | **來源完整** |

### 2.2 預留目錄與 .gitkeep 防護
Git 預設不追蹤空目錄，以下目錄已透過加入空白 `.gitkeep` 確保目錄結構納入版控：
- `source/archive/.gitkeep`（歷史封存預留）
- `source/assets/mock/.gitkeep`（展示假素材預留）
- `source/assets/prototype-generated/.gitkeep`（原型生成素材預留）
- `docs/assets/.gitkeep`（管理文件資產預留）

*註：`docs/audit/` 因已存放 `phase-0-preflight.md` 與 `source-manifest.csv`，無需 `.gitkeep`。*

---

## 3. 來源基準驗證（Readability & Hashes）

### 3.1 文字編碼與二進位格式
- **文字檔案（24 份）**：包含所有 `.txt`、`.md`、`.html`、`.csv`、`.svg`，檢驗均為標準 **UTF-8（無 BOM）**。
- **AI 檔案驗證狀態**：`source/assets/brand/vis/CareU_VIS.ai` (2,161,740 bytes) 屬於 Adobe Illustrator 專用格式，標記為「**未驗證（需專用軟體開啟，不判定為損毀）**」。
- **流程圖格式**：`source/flows/CareU_網站流程圖.png` 實質為 JFIF/JPEG 編碼格式，副檔名為 `.png`，瀏覽器與常見檢視器均可正常解析，維持來源原件不更名。

### 3.2 HTML 原型 SHA-256 比對
5 份 HTML 原型雜湊值與上傳原件基準 100% 一致：

| 頁面原型 | 相對路徑 | 實際 SHA-256 | 預期基準 SHA-256 | 比對結果 |
| :--- | :--- | :--- | :--- | :---: |
| **入口頁** | `source/prototypes/CareU_入口頁原型.html` | `7678a4a258ca31674a601f9500eb44a69cb44b0330dff588eda3daaa1c4ded9b` | `7678a4a258ca31674a601f9500eb44a69cb44b0330dff588eda3daaa1c4ded9b` | 一致 |
| **首頁** | `source/prototypes/CareU_首頁原型.html` | `2c3ddc1ae522db44e7d0b93a7a1d5dc294ef48a5f1701c435184b0bdbcd78dd9` | `2c3ddc1ae522db44e7d0b93a7a1d5dc294ef48a5f1701c435184b0bdbcd78dd9` | 一致 |
| **Loading-1／排除視窗** | `source/prototypes/CareU_Loading頁-1_排除視窗_原型.html` | `dae11242781e4a1732b631f0bc0f004a16a87dfb8aaaf6eb473e95a94f2a0a03` | `dae11242781e4a1732b631f0bc0f004a16a87dfb8aaaf6eb473e95a94f2a0a03` | 一致 |
| **問卷頁／Loading-2** | `source/prototypes/CareU_問卷頁_Loading頁-2_原型.html` | `07e65d2f635ea8fe8d19d351ddc6e553efe249fea80bd8270193bac01f93bb4c` | `07e65d2f635ea8fe8d19d351ddc6e553efe249fea80bd8270193bac01f93bb4c` | 一致 |
| **報告頁／登入視窗** | `source/prototypes/CareU_報告頁_會員登入視窗_原型.html` | `b66af4d19057b380e14f7d57cf0e4eca99098ba9fc88fae550b9c86357605897` | `b66af4d19057b380e14f7d57cf0e4eca99098ba9fc88fae550b9c86357605897` | 一致 |

---

## 4. 資料集檢驗與欄位對照（Data Audit）

### 4.1 資料筆數與唯一識別碼（以標準 CSV Parser 剖析）
| 資料集名稱 | 相對路徑 | 欄位數 | 資料列數 (Rows) | 唯一許可證數 | 狀態 |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Raw 商品資料** | `source/data/products/raw/健康食品資料集(膠囊).csv` | 12 | **169** | **169** | 正常 |
| **Derived 商品資料** | `source/data/products/derived/健康食品資料集_DB欄位版.csv` | 17 | **186** | **169** | 正常 |
| **保健分類資料** | `source/data/health-categories/12項保健項目 ( 牙齒與膝關節刪除).csv` | 2 | **12** | - | 正常 |

### 4.2 欄位特性與待確認事項
1. **來源隔離**：Raw 與 Derived 分置不同目錄，保留原始未加工對照組。
2. **網址欄位差異**：Raw CSV 保留 `網址` 欄位；Derived CSV 目前**未包含來源網址**。
3. **衍生規則標籤**：Derived CSV 新增之 `mechanism_tag`、`evidence_score`、`contraindicated_*` 等欄位，其計算規則與依據尚待後續提供文件複核，目前僅標記為待確認，不作為官方後端結論。
4. **CSV 跳脫字元**：部分文字跳脫字元問題已列入待查；具體類型及範圍待複核，等待組員新版，目前不清洗。

---

## 5. 初步素材依賴與靜態掃描（Asset Dependency Scan）

### 5.1 靜態掃描結果
經靜態掃描 5 份 HTML 原型：
- **外部依賴**：無任何外部 HTTP(S) 資源、無外部 CDN 樣式表或 JS 腳本。
- **相對路徑**：無外部本機相對路徑依賴（0 處）。
- **Data URI 引用次數**（引用次數統計，不代表獨立素材數量）：
  - **入口頁**：0 次
  - **首頁**：5 次（2 份 WOFF 字體 + 3 張 PNG 圖片）
  - **Loading-1／排除視窗**：4 次（1 個 SVG Favicon + 2 份 WOFF 字體 + 1 張 PNG 背景）
  - **問卷頁／Loading-2**：4 次（1 個 SVG Favicon + 2 份 WOFF 字體 + 1 張 PNG 背景）
  - **報告頁／會員登入視窗**：5 次（2 份 WOFF 字體 + 2 張 PNG 圖片 + 1 個 SVG 圖示）

### 5.2 靜態掃描與視覺驗收界線
- **已完成**：程式碼靜態語法解析、素材標籤與內聯引用統計。
- **未包含（待後續階段）**：瀏覽器即時渲染驗收、全視窗斷點響應式視覺檢查、Canvas 粒子動畫效能測試。靜態無外部依賴不等於全平台視覺驗收完成。

---

## 6. 已知差異與待確認清單（Discrepancies & Pending Items）

| 編號 | 項目 | 狀況描述 | 處理原則 | 規劃處理階段 |
| :---: | :--- | :--- | :--- | :---: |
| **D-01** | **排除視窗操作分支** | 原型 HTML 與頁面規格包含「直接填寫問卷」次要按鈕；流程圖與流程說明僅列「返回首頁」。 | 本次不自行裁決，保留現狀。 | Phase 1 / Phase 2 |
| **D-02** | **問卷題庫範圍** | 獨立問卷 TXT 包含 12 類 29 題評估 + 3 題安全禁忌；HTML 原型僅為 6~7 步聚合示範。 | 原型作為 UX/互動參考，完整題目留待規格制定。 | Phase 1 / Phase 2 |
| **D-03** | **計分與量表改編規則** | 問卷 TXT 提及標準化分數與改編概念，但無精確計算公式。 | 標記為 TBD，不自行發明演算法。 | Phase 2 / Phase 7 |
| **D-04** | **Derived 缺網址欄** | Derived CSV 未包含 Raw 既有之 `網址` 欄位。 | 保留現有檔案，待新版清洗資料對齊。 | Phase 1 / Phase 7 |
| **D-05** | **CSV 欄位跳脫字元** | 部分文字跳脫字元問題已列入待查；具體類型及範圍待複核。 | 等待組員新版，目前不清洗。 | Phase 1 / Phase 7 |
| **D-06** | **字體命名與字重宣告** | 首頁宣告 `"LINE Seed TW"`；其餘頁面宣告 `"CareU LINE Seed TW"`；入口頁使用系統預設字體。 | 留待 Phase 1 盤點差異及提出建議，不於此階段修改原型或建立正式 Design System（正式規格基準屬 Phase 2）。 | Phase 1 |
| **D-07** | **流程圖副檔名** | `CareU_網站流程圖.png` 實質為 JPEG 格式。 | 保持來源原樣，不逕行轉檔。 | Phase 1 |

---

## 7. 版本控制與環境防護（Git Protection）

### 7.1 Git 儲存庫狀態
- **根目錄**：`C:\Users\User\Desktop\CareU`
- **初始化分支**：`main`
- **目前狀態**：本地 Git 儲存庫已初始化，尚未進行 `git add` 或 `git commit`（Untracked 狀態，準備就緒）。

### 7.2 來源防護設定（.gitattributes & .gitignore）
- **換行保護**：`.gitattributes` 已設定 `/source/** -text`，關閉 Git 對 `source/` 檔案之換行正規化，確保來源檔案位元組與 SHA-256 雜湊永不被 Git 轉換竄改。
- **排除規則**：`.gitignore` 精確排除 `node_modules/`、`dist/`、`coverage/`、`*.log`、`.env*`（允許 `.env.example`）及 OS 暫存檔，確保不排除任何 `source/` 或 `docs/` 檔案。

---

## 8. 正確工程化階段安排

```text
Phase 0：Git Source Baseline Preparation（當前完成階段）
  └── 鎖定 33 份來源檔案、建立 Manifest、配置 Git 防護、初始化 Repo（未 Commit）
Phase 1：Migration Audit & Asset Inventory
  └── 原型視覺與互動審計、素材依賴盤點、字體差異盤點與建議（不修改原型，不建立正式 Design System，不寫 Vue 代碼）
Phase 2：Architecture & Specification Baseline
  └── 制定元件規格、狀態模型、路由規則與資料流基準
Phase 3：Frontend Scaffold & Design System
  └── 正式建立 Vue 3 + Vite + Pinia + Vue Router 專案骨架與 Token 系統
Phase 4：Page Implementation
  └── 逐頁遷移重構 5 大頁面為 Vue 模組化元件
Phase 5：State & Flow Integration
  └── 整合體檢流程、問卷狀態、報告解鎖與 Pinia Store
Phase 6：Backend API Contract & Mocking
  └── 定義 OpenAPI / MSW 模擬環境
Phase 7：Data Model & Recommendation Alignment
  └── 對齊商品資料模型與推薦演算法
```

---
*報告完成，準備交由 Technical PM 進行驗收。*
