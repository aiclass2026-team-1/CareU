# Care U｜Asset Inventory 清冊

- **執行日期**：2026-09-27
- **專案根目錄**：`C:\Users\User\Desktop\CareU`
- **來源基準 Commit**：`ba4a60eff2eca656b3c9b7d49828b725d417d22e`（`chore: establish Care U source baseline`）
- **報告性質**：Phase 1 靜態資產盤點清冊（Static Asset Inventory）
- **分類標籤規範**：
  - `BRAND_SOURCE_OF_TRUTH`：官方 VIS 品牌定義之正式標誌、標準字、色票與向量原檔。
  - `PROTOTYPE_APPROVED`：原型中已定案採用且視覺確認之核心介面素材。
  - `PROTOTYPE_GENERATED`：原型中由代碼、Canvas 或視覺工具生成之光暈、紋理與背景素材。
  - `MOCK_ONLY`：僅供原型展示、測試或假資料呈現之暫存圖示與資料。
  - `PLACEHOLDER`：用於代表尚未定案之頁面或區塊之預留佔位素材。
  - `INLINE`：直接內嵌於 HTML 中之 Inline SVG 或 SVG Symbol Sprite。
  - `EXTERNAL`：外部網路引用的遠端資源（本專案經盤點為 0）。
  - `MISSING`：代碼中有引用但實體檔案缺失之素材（本專案經盤點為 0）。
  - `UNUSED`：存在於資料夾中但目前原型未直接以相對路徑引入之獨立檔案。
  - `ARCHIVE`：歷史封存素材（預留於 `source/archive/`）。
- **驗證狀態規範**：
  - `VERIFIED_STATIC`：經靜態代碼與記憶體 Base64 解碼雜湊計算驗證。
  - `UNVERIFIED_BINARY`：二進位專用檔案（如 Illustrator AI），需專用軟體驗證，不判定為損毀。
  - `UNKNOWN` / `NEEDS_REVIEW`：來源生成工具或商用授權尚無明確文件證據，標記待審查（不等於未授權）。

---

## 1. 素材盤點總結與統計方法

### 1.1 統計方法與定義說明
- **引用出現次數（Citation Count）**：各 HTML 原型與 CSS 樣式中出現 `src`、`url()`、`data:`、`@font-face` 或 `<svg>` 標籤之總次數（包含同素材在不同頁面的重複引用）。
- **實質不重複素材數（Distinct Asset Count）**：將所有內嵌 Data URI 與獨立檔案於**記憶體中進行二進位解碼並計算 SHA-256 雜湊**，位元組與雜湊完全相同者歸併為同一獨立素材。

### 1.2 總體資產統計矩陣
| 資產儲存形式 | 獨立資產數 (Distinct) | 跨頁引用次數 (Citations) | 主要分佈位置 | 備註 |
| :--- | :---: | :---: | :--- | :--- |
| **官方品牌獨立檔案** | **15** | - | `source/assets/brand/` (7 SVG, 7 PNG, 1 AI) | 官方 VIS 基準，其中 1 份 SVG 與報告頁 Data URI 完全一致。 |
| **內嵌字體 (@font-face Base64)** | **6** | 8 | 首頁 (2), Loading-1 (2), 問卷頁 (2), 報告頁 (2) | Loading-1 與問卷頁字體 SHA-256 完全相同。 |
| **內嵌圖片 (Data URI PNG)** | **3** | 7 | 首頁 (3), Loading-1 (1), 問卷頁 (1), 報告頁 (2) | 通用背景 PNG (917KB) 於 4 份原型中重複引用 5 次。 |
| **內嵌 Favicon (Data URI SVG)** | **1** | 2 | Loading-1 (1), 問卷頁 (1) | 百分比編碼 SVG，解碼為 192 bytes，兩頁完全相同。 |
| **內嵌品牌 Logo (Data URI SVG)** | **1** | 1 | 報告頁 Hero 頂部 (1) | 二進位與 `CareU_VIS-logogroup-01.svg` 100% 一致。 |
| **SVG Symbol 精靈圖標** | **11** | 9+ (動態) | 報告頁 `#symbolSprite` (L1-140) | 包含箭頭、鎖頭、購物車、使用者、眼睛等圖示。 |
| **Canvas 動態生成視覺** | **3** | 3 | 首頁 (L991), Loading-1 (L640), 問卷頁 (L805) | 首頁侷限於 Hero 容器，Loading 與問卷頁為全螢幕。 |
| **外部遠端依賴 (External)** | **0** | 0 | - | 靜態掃描未發現外部網路依賴。 |

---

## 2. 官方品牌資產清冊（Brand Source of Truth）

位於 `source/assets/brand/` 之下，共 15 份獨立來源檔案（7 SVG, 7 PNG, 1 AI）：

| asset_id | 來源相對路徑 | 格式與大小 | 檔案 SHA-256 雜湊 | 分類標籤 | 驗證狀態 | 處置與遷移建議 | 備註 |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- | :--- |
| `AST-BRD-01` | `source/assets/brand/combinations/CareU_VIS-logogroup-01.svg` | SVG (3,030 B) | `423afe482c919e0902bbe21fb46b90536de34c6e242f2b9d7be99c7645420d8a` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | 與報告頁內嵌 Logo Data URI 完全一致。 |
| `AST-BRD-02` | `source/assets/brand/combinations/CareU_VIS-標誌組合_01.png` | PNG (63,680 B) | `ad15af3ad4d3d9e0b3a517407c8b7c3aa5a0c20756cf253b22de1f1f1e94c823` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | 橫式標誌組合圖檔。 |
| `AST-BRD-03` | `source/assets/brand/combinations/CareU_VIS-標誌組合_02.png` | PNG (87,149 B) | `7dbbb191f27b87c9536af8ee3093dcb9b935e949015a48635fc9363068b2393f` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | 直式標誌組合圖檔。 |
| `AST-BRD-04` | `source/assets/brand/logo/CareU_VIS-Logo.png` | PNG (32,727 B) | `4923ac387f38c70fa7b69f60b12ef26728042e01ca7c902ea0de88c214e1c7cc` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | 官方獨立 Logo 圖檔。 |
| `AST-BRD-05` | `source/assets/brand/logo/CareU_VIS-logo-300.svg` | SVG (781 B) | `e7d01c7a7019ff6e6e2e7746d52bb926ad1ce3f8457410e6add9715907bb3cba` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | 300px 寬度向量 Logo。 |
| `AST-BRD-06` | `source/assets/brand/logo/CareU_VIS-logo-500.svg` | SVG (880 B) | `4b6ea15e1fc0e9abf860f82b52c7fdd793089d745ba44a2783db7f68248da8c8` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | 500px 寬度向量 Logo。 |
| `AST-BRD-07` | `source/assets/brand/logo/CareU_VIS-logo-cross.svg` | SVG (328 B) | `29be292830d1f0d0180ef2e003fa8377e838c2fd9fefd1286b53c937ecc8e605` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | Logo 十字輔助部件向量檔。 |
| `AST-BRD-08` | `source/assets/brand/logo/CareU_VIS-logo-dot.svg` | SVG (170 B) | `c93009edf615d1dcd5ba51cead952c1691acb2f1955da685353e0fb43708c236` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | Logo 圓點輔助部件向量檔。 |
| `AST-BRD-09` | `source/assets/brand/logo/CareU_VIS-logo-u.svg` | SVG (580 B) | `fe5633cdd94abc61509ca50daa313830109040c1d013360cfcd778d7a1bd6d98` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | Logo U 型部件向量檔。 |
| `AST-BRD-10` | `source/assets/brand/vis/CareU_VIS-概覽.png` | PNG (127,626 B) | `b1e04a25365e927641a0cedee18d7391aedc84b389848a61d6c1b35347529389` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | 保留於 `source/` 作為設計規範參考 | 品牌視覺識別概覽圖。 |
| `AST-BRD-11` | `source/assets/brand/vis/CareU_VIS-色票表.png` | PNG (84,158 B) | `41add3aaa3ca201980c1b4cb24b106fe81550a82325a02e136766d1d49794209` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | 保留於 `source/` 作為色彩規範參考 | 官方標準色彩規範表。 |
| `AST-BRD-12` | `source/assets/brand/vis/CareU_VIS.ai` | AI (2,161,740 B) | `99147b7610d077c8d244bac9be1f5316c13f1c5ce3c914cbcb4b13808ea79e51` | `BRAND_SOURCE_OF_TRUTH` | `UNVERIFIED_BINARY` | 保留於 `source/` 作為向量原始參考 | Illustrator 向量原檔（未驗證）。 |
| `AST-BRD-13` | `source/assets/brand/wordmark/CareU_VIS-wordmark.svg` | SVG (2,310 B) | `aba17e340d91ee35326673310e49e55d57df34fb77ce5ce6696feffb3638a015` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | Care U 標準字向量檔。 |
| `AST-BRD-14` | `source/assets/brand/wordmark/CareU_VIS-標準字_01.png` | PNG (74,146 B) | `90bbfe7e8bce77d2ebff32b760c1f398d357217f6f8eee4fa5bc13d66874b6aa` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | 標準字圖檔版本 1。 |
| `AST-BRD-15` | `source/assets/brand/wordmark/CareU_VIS-標準字_02.png` | PNG (81,188 B) | `3eaa1c69912b5adba9651850b6bb21351c9223aaae0fa08d58a68e32cf42164d` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | Phase 4 隨頁面遷移至 `src/assets/brand/` | 標準字圖檔版本 2。 |

---

## 3. 原型內嵌字體資產（@font-face Base64 WOFF）

經記憶體解碼，5 份 HTML 原型內嵌之 `@font-face` 字體共有 6 個獨立 WOFF 資產（共 8 次引用）：

| asset_id | 引用頁面與行號 | 字體家族名稱與宣告字重 | 解碼位元組大小 | 完整 WOFF SHA-256 雜湊 | 分類標籤 | 驗證狀態 | 重複與關聯關係 | 未來遷移建議 |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: | :--- | :--- |
| `AST-FNT-01` | 首頁 L12 | `"LINE Seed TW"` (100 600) | 99,124 B | `e2d2d99e6d83a9ead4f073485fb79eba14ee478f79be843b4e23b9c0be0f3615` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | 首頁專用子集 1。 | Phase 4 隨頁面確認遷移 |
| `AST-FNT-02` | 首頁 L19 | `"LINE Seed TW"` (700 900) | 101,512 B | `b2f8a7b48d2f183a6d7072bdb00a50b30b44e6c6e54e9f1408e006fca62f403d` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | 首頁專用子集 2。 | Phase 4 隨頁面確認遷移 |
| `AST-FNT-03` | Loading-1 L15<br>問卷頁 L15 | `"CareU LINE Seed TW"` (400) | 86,584 B | `12fcfef3b9e44f5609e5f72a8208e6fc3a5f1e211a94fedd11f2f4b9f72b01e3` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | **完全相同**：Loading-1 與問卷頁共用。 | Phase 4 隨頁面確認遷移 |
| `AST-FNT-04` | Loading-1 L22<br>問卷頁 L22 | `"CareU LINE Seed TW"` (700) | 85,704 B | `3b464c94d4fbb8164cee606994f737ec0f2883f75a3e6528786ba5fb444de7ed` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | **完全相同**：Loading-1 與問卷頁共用。 | Phase 4 隨頁面確認遷移 |
| `AST-FNT-05` | 報告頁 L8 | `"CareU LINE Seed TW"` (400) | 4,370,584 B | `0a9be85551f64b5527206238fe902e2a2f2b2ea1461491bae66ef414cd5a0ad0` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | 報告頁較大字集版本（字集範圍未確認）。 | Phase 4 隨頁面確認遷移 |
| `AST-FNT-06` | 報告頁 L9 | `"CareU LINE Seed TW"` (700) | 4,531,228 B | `696ef4fbd5598f012d81275774da73ff2ead942ec9acf34a4ff156d725acf2f4` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | 報告頁較大字集版本（字集範圍未確認）。 | Phase 4 隨頁面確認遷移 |

---

## 4. 原型內嵌影像與圖標（Data URI Base64 & SVG）

經記憶體解碼，5 份 HTML 原型內嵌之圖片共有 5 個獨立資產（共 10 次引用）：

| asset_id | 引用頁面與實際定位 | 儲存形式與 MIME | 解碼位元組大小 | 完整 SHA-256 雜湊 | 分類標籤 | 驗證狀態 | 重複與關聯關係 | 未來遷移建議 |
| :--- | :--- | :--- | :---: | :--- | :--- | :---: | :--- | :--- |
| `AST-IMG-01` | 首頁 L753 `#networkBack`<br>Loading-1 L341 `#networkBack`<br>問卷頁 L421 `#networkBack`<br>報告頁 L143 `.hero-bg`<br>報告頁 L177 `#entryTransition img` | Data URI Base64 (`image/png`) | 917,195 B | `8252806f62f59f7119f1c59e1af1c722619b210d972611982ca4f2480b12ef4e` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | **通用背景底圖**：於 4 份原型中重複引用 5 次（首頁底圖、Loading-1 底圖、問卷頁底圖、報告頁 Hero/轉場底圖）。 | Phase 4 隨頁面遷移至 `src/assets/images/bg-glow.png` |
| `AST-IMG-02` | 首頁 L754 `#networkLeft` | Data URI Base64 (`image/png`) | 507,263 B | `2f321de61adadc4068f843f157e52bd942319cddd2d4910c0b2b760e75b0f314` | `PROTOTYPE_GENERATED` | `VERIFIED_STATIC` | 首頁左側前景網絡節點圖。 | Phase 4 隨頁面遷移至 `src/assets/images/network-left.png` |
| `AST-IMG-03` | 首頁 L755 `#networkRight` | Data URI Base64 (`image/png`) | 568,127 B | `b8068786184efe296d0ce6bd2b43a1df509d00e8dbed040d00bee2f670c201d7` | `PROTOTYPE_GENERATED` | `VERIFIED_STATIC` | 首頁右側前景網絡節點圖。 | Phase 4 隨頁面遷移至 `src/assets/images/network-right.png` |
| `AST-IMG-04` | Loading-1 L10 `<link rel="icon">`<br>問卷頁 L10 `<link rel="icon">` | Data URI Percent-encoded (`image/svg+xml`) | 192 B | `f914476d88daac7d5dc8c57b6f4e4e3edc75bbb5f1bd7e5a20ea42842aa4e9ef` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | **通用 Favicon SVG**：包含 Care U 藍色 U 標誌與橘色圓點圖示。 | Phase 4 隨頁面遷移至 `public/favicon.svg` |
| `AST-IMG-05` | 報告頁 L145 `.brand-logo` | Data URI Base64 (`image/svg+xml`) | 3,030 B | `423afe482c919e0902bbe21fb46b90536de34c6e242f2b9d7be99c7645420d8a` | `BRAND_SOURCE_OF_TRUTH` | `VERIFIED_STATIC` | **官方標誌組合 SVG**：與 `source/assets/brand/combinations/CareU_VIS-logogroup-01.svg` 100% 相同。 | Phase 4 隨頁面遷移至 `src/assets/brand/` |


---

## 5. Inline SVG 與 SVG Symbol 圖示清冊

### 5.1 原型 Inline SVG 分佈
- `[CODE_OBSERVED]` 入口頁 (L297)：1 個 Inline SVG（Care U 開場聚合動畫標誌圖騰）。
- `[CODE_OBSERVED]` 首頁 (L761, L812, L823, L834, L870)：5 個 Inline SVG（Hero 下拉標誌、三大專業說明圖示、會員登入按鈕圖示）。
- `[CODE_OBSERVED]` Loading-1 (L346, L392, L411)：3 個 Inline SVG（Loading 旋轉動畫 Logo、示意首頁 Logo、排除視窗警告符號）。
- `[CODE_OBSERVED]` 問卷頁 (L422, L447, L471)：3 個 Inline SVG（問卷打勾完成圖示、Loading-2 旋轉 Logo、報告完成打勾標記）。
- `[CODE_OBSERVED]` 報告頁 (L1-140, L143, L148 等)：14 個 Inline SVG 標籤，其中 L1-140 定義了 11 個共用 `<symbol>` 圖示。

### 5.2 報告頁 SVG `<symbol>` 圖示精靈清冊
在 `source/prototypes/CareU_報告頁_會員登入視窗_原型.html` L1-140 中定義之 11 個 `<symbol>` 圖示：

| symbol_id | 圖示名稱 | 用途與出處 | 儲存形式 | 分類標籤 | 驗證狀態 | 未來遷移建議 |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `#i-lock` | 鎖頭圖示 | 報告頁三大方向未登入鎖定遮罩提示（`.locked-card`） | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconLock.vue` |
| `#i-arrow` | 右箭頭圖示 | 按鈕與導航連結箭頭 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconArrow.vue` |
| `#i-down` | 下拉箭頭 | 下拉選單與收合面板提示 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconDown.vue` |
| `#i-info` | 資訊提示圖示 | 警語、注意事項與輔助說明彈窗 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconInfo.vue` |
| `#i-close` | 關閉叉號 | Modal 視窗關閉按鈕 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconClose.vue` |
| `#i-cart` | 購物車圖示 | 頂部導航購物車彈窗入口 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconCart.vue` |
| `#i-check` | 勾選完成圖示 | 勾選方塊與選定狀態 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconCheck.vue` |
| `#i-spark` | 亮點/推薦星芒 | 個人化最佳推薦品項標籤 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconSpark.vue` |
| `#i-eye` | 顯示密碼圖示 | 登入視窗密碼明文切換 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconEye.vue` |
| `#i-eye-off` | 隱藏密碼圖示 | 登入視窗密碼遮罩切換 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconEyeOff.vue` |
| `#i-user` | 使用者/會員圖示 | 頂部導航「會員登入」入口按鈕 | Inline SVG `<symbol>` | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `IconUser.vue` |

---

## 6. Canvas 與 CSS 生成視覺清冊

| visual_id | 實現方式 | 出現地點 | 視覺描述與互動 | 分類標籤 | 驗證狀態 | 處置與遷移建議 |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `VIS-CANVAS-01` | HTML5 Canvas 2D Context | 首頁 (`CareU_首頁原型.html` L991) | 動態粒子網絡，**侷限於 Hero 容器尺寸**，隨指針產生互動光暈；`prefers-reduced-motion` 停止循環。 | `PROTOTYPE_GENERATED` | `VERIFIED_STATIC` | Phase 5 封裝為 `DataCanvas.vue`（支援容器模式 Props）。 |
| `VIS-CANVAS-02` | HTML5 Canvas 2D Context | Loading-1 (`CareU_Loading頁-1_排除視窗_原型.html` L640) | 動態粒子網絡，**全螢幕視窗覆蓋**；`prefers-reduced-motion` 停止循環。 | `PROTOTYPE_GENERATED` | `VERIFIED_STATIC` | Phase 5 封裝為 `DataCanvas.vue`（支援全螢幕模式 Props）。 |
| `VIS-CANVAS-03` | HTML5 Canvas 2D Context | 問卷頁 (`CareU_問卷頁_Loading頁-2_原型.html` L805) | 動態粒子網絡，**全螢幕視窗覆蓋**；`prefers-reduced-motion` 停止循環。 | `PROTOTYPE_GENERATED` | `VERIFIED_STATIC` | Phase 5 封裝為 `DataCanvas.vue`（支援全螢幕模式 Props）。 |
| `VIS-CHART-01` | 動態 DOM / CSS Bar 渲染 | 報告頁 (`#chartList` L143) | 橫向長條指標清單，renderChart() 依既有 profile.results 順序取前 8 筆渲染長條進度與數值（載入資料時依 score 降冪排序），未登入前 2 名為鎖定遮罩。 | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | Phase 5 封裝為 `HealthCategoryBarList.vue`。 |
| `VIS-DOSE-01` | HTML DOM＋CSS 劑型示意 | 報告頁 (`productArt()` L247) | 依品名自動生成膠囊（`.capsule-art`）或錠劑（`.tablet-art`）DOM 結構與 CSS 樣式示意（包含 `aria-label="膠囊與錠劑示意，非實際商品外觀"` 與 `.art-caption`），非實際商品外觀，非向量圖形。 | `PROTOTYPE_GENERATED` | `VERIFIED_STATIC` | Phase 5 封裝為 `ProductDoseArt.vue`。 |
| `VIS-CSS-01` | CSS Keyframes & Radial Gradients | 入口頁、首頁、Loading-1、問卷頁、報告頁 | 品牌藍/橘色柔和光暈、進度條脈動動畫、卡片毛玻璃背景（`backdrop-filter: blur`）。 | `PROTOTYPE_APPROVED` | `VERIFIED_STATIC` | 納入 Design System 樣式規範。 |

---

## 7. 展示專用與 Placeholder 素材清冊

| mock_id | 代碼定位 | 用途與描述 | 儲存形式 | 分類標籤 | 驗證狀態 | 處置建議 |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `MCK-DAT-01` | 報告頁 L215 `profiles` | 小安、小晴、阿哲、小柔多組受試者模擬指標分數與警示卡。 | JS Object (內嵌) | `MOCK_ONLY` | `VERIFIED_STATIC` | 保留於測試/展示環境，不進入正式生產資料庫。 |
| `MCK-DAT-02` | 報告頁 L201 `blueprint` | 12 項指標之模擬分析文案與檢驗項目說明。 | JS Object (內嵌) | `MOCK_ONLY` | `VERIFIED_STATIC` | 未來由後端 API 或知識庫動態產出。 |
| `MCK-DAT-03` | 報告頁 L240 `catalog.products` | 商品資料包含來源資料集欄位（品名、成分、宣稱等），展示價格與推薦配對為模擬示範資料。 | JS Object (內嵌) | `MOCK_ONLY` | `VERIFIED_STATIC` | 未來由正式推薦引擎與商品資料庫替換。 |
| `MCK-PLC-01` | 入口頁 L281 `#home` | 示意首頁文字與重播按鈕。 | HTML DOM (內嵌) | `PLACEHOLDER` | `VERIFIED_STATIC` | 正式路由串接後移除。 |
| `MCK-PLC-02` | Loading-1 L388 `#homeScreen` | 簡易首頁外殼。 | HTML DOM (內嵌) | `PLACEHOLDER` | `VERIFIED_STATIC` | 正式路由串接後由 Vue Router 導航替換。 |
| `MCK-PLC-03` | 問卷頁 L470 `#reportScreen` | 報告預告卡片（純靜態 Placeholder）。 | HTML DOM (內嵌) | `PLACEHOLDER` | `VERIFIED_STATIC` | 正式流程中直接路由跳轉至 `/report`。 |

---

## 8. 素材分類標籤與未來遷移建議表（Migration Target Mapping）

*註：素材搬移隨 Phase 4 頁面遷移確認；元件抽取主要在 Phase 5；正式共享狀態設計在 Phase 8。本次不進行任何檔案抽出或目錄建立。*

```text
src/
├── assets/
│   ├── brand/                 # 官方品牌正式向量與圖檔 (隨 Phase 4 納入)
│   │   ├── CareU_VIS-logogroup-01.svg
│   │   ├── CareU_VIS-Logo.png
│   │   ├── CareU_VIS-wordmark.svg
│   │   └── ... (其餘品牌檔案)
│   ├── fonts/                 # LINE Seed TW 字體檔案 (隨 Phase 4 納入)
│   │   ├── LINESeedTW-Regular.woff2 / .woff
│   │   └── LINESeedTW-Bold.woff2 / .woff
│   └── images/                # 介面背景圖 (隨 Phase 4 納入)
│       ├── bg-glow.png        (通用背景底圖，917KB)
│       ├── network-left.png   (首頁左側前景網絡圖，507KB)
│       └── network-right.png  (首頁右側前景網絡圖，568KB)
└── components/
    ├── icons/                 # 獨立 SVG 圖示元件 (Phase 5 抽取)
    │   ├── IconLock.vue
    │   ├── IconArrow.vue
    │   ├── IconCart.vue
    │   ├── IconUser.vue
    │   └── ... (共 11 個圖示元件)
    └── common/
        └── DataCanvas.vue     (粒子網絡背景元件，Phase 5 抽取)
```

---

## 9. 待確認與未定案素材清冊（Needs Review & License Notes）

| 項目編號 | 素材名稱／標籤 | 待確認事項與審查依據 | 處置原則 |
| :---: | :--- | :--- | :--- |
| **REV-01** | **`CareU_VIS.ai` (2.16MB)** | 檔案為 Illustrator 專用格式，靜態環境下無法解析內部圖層，需專用軟體驗證內部向量圖層是否包含未導出之其他視覺部件。 | 標記為 `UNVERIFIED_BINARY`，不判定為損毀，保持原件完好。 |
| **REV-02** | **LINE Seed TW 字體授權與字集** | 原型 HTML 註解載明「LINE Seed TW 由 LINE Corporation 依 SIL Open Font License 1.1 提供」，各原型內嵌大小差異極大（86KB vs 4.5MB），具體字集範圍未確認。 | 待 Phase 2/3 統一字體版本與字重規範，建議以標準 WOFF2 子集發布。 |
| **REV-03** | **背景圖生成來源與授權** | 通用背景 PNG 圖檔在 4 份原型中重複引用 5 次，目前來源生成工具與原始設計圖層檔未定。 | 標記為 `PROTOTYPE_APPROVED` / `UNKNOWN`，保留原件於介面中使用，不主觀猜測其生成來源。 |
| **REV-04** | **`CareU_網站流程圖.png`** | 實質為 JFIF/JPEG 二進位格式，副檔名為 `.png`。 | 保持來源原件不更名，遷移至開發文件時由組員視需要提供向量或正確副檔名檔案。 |

---
*Asset Inventory 盤點清冊完成，請 Technical PM 審閱。*
