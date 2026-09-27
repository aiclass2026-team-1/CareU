# Care U｜視覺設計系統與 Design Tokens 規格（Design System Specification）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 工程規格草案（待 Technical PM 審閱）
- **主要依據**：
  - `source/assets/brand/` 官方 VIS 資產清單 `[CONFIRMED]`
  - `docs/assets/asset-inventory.md` 盤點結果 `[CODE_OBSERVED]`
  - 5 份 HTML 原型 CSS 樣式事實 `[CODE_OBSERVED]`
  - `[CONFIRMED]` DEC-03 字體策略決策

---

## 1. 設計系統定位與原則

Care U 視覺設計系統旨在傳達「專業、溫和、省心、個人化」的品牌感受。
- **保留定案視覺**：嚴格保留各頁面已定案之版型、微交互動效、漸層光暈與圓角陰影。
- **來源值與 Token 候選分立**：本文件清楚區分「原型現有來源值」與「建議之共用 Token 命名（`[PROPOSED]`）」，不以單一通用數值抹平各頁原碼差異。
- **字體策略（`[CONFIRMED]` DEC-03）**：保留各頁現行字體宣告與字重設定，不進行字體檔合併或轉換為統一 WOFF2 檔案，入口頁維持系統無襯線字體策略。

---

## 2. 色彩系統（Color Tokens）

### 2.1 品牌核心與語意色彩對照表

| 語意角色 | 建議 Token 名稱 `[PROPOSED]` | 來源 HEX 值 `[CODE_OBSERVED]` | 來源原名／引用位置 | 介面使用情境 |
| :--- | :--- | :--- | :--- | :--- |
| **品牌主色** | `--cu-color-primary` | `#197AFC` | `--brand-blue` / `--blue` | 主要 CTA、主要按鈕、焦點框、進度條底色 |
| **品牌強調橘** | `--cu-color-accent-orange`| `#FB8F54` | `--brand-orange` / `--orange` | Logo 圓點、問卷進度填色、報告前三名高亮 |
| **品牌深藍** | `--cu-color-navy` | `#07295C` | `--brand-navy` / `--navy` | 主標題、主要正文、月組合摘要底色 |
| **柔和天藍** | `--cu-color-sky-blue` | `#A3D3F7` | `--light-blue` / Sky Blue | 背景柔光、Canvas 資料點、資訊編號底色 |
| **警示珊瑚粉** | `--cu-color-coral` | `#EB938E` | `--coral` / Coral | 排除視窗叉號、錯誤 Toast 邊框、警示狀態 |
| **頁面底色** | `--cu-color-surface` | `#F7F8FA` | `--surface` / `--paper` | 頁面整體淺灰白底色、次要按鈕底色 |
| **純白表面** | `--cu-color-white` | `#FFFFFF` | `--white` | 卡片底色、模態視窗、反白文字 |
| **次要說明文字** | `--cu-color-text-muted` | `#687A93` (首頁/問卷) / `#60718A` (報告頁) | `--muted` | 輔助說明文字、次要標籤、副標題 |
| **警示深紅** | `--cu-color-alert-red` | `#E11D48` / `#991B1B` | 警示文字 / Error Toast | 就醫警告圖示、表單格式錯誤文字 |
| **提醒暖黃** | `--cu-color-warn-yellow` | `#D97706` / `#F59E0B` | 提醒標記 | 接近提醒門檻警告圖示 |
| **選取淡橘底** | `--cu-color-selected-bg` | `#FFF2E8` | 報告頁選項選取底色 | 候選品項被選取時的背景強調色 |
| **選取淡橘框** | `--cu-color-selected-border`| `#F3CBB0` | 報告頁選項選取邊框 | 候選品項被選取時的邊框強調色 |

### 2.2 漸層與背景效果遷移原則
各頁漸層、柔光與毛玻璃效果嚴格以對應 HTML 原型的 CSS 宣告為準，於 Phase 4 逐頁遷移時保留 selector、宣告順序、specificity 與 media query；本節不另列樣式數值，不代表可自行統一或重新設計。

---

## 3. 字體與排版系統（Typography Tokens，落實 DEC-03）

### 3.1 各頁面來源字體宣告與解碼大小現況清冊 `[CODE_OBSERVED]`
| 頁面 | 宣告 `font-family` | 內嵌 `@font-face` 原碼宣告字重 | 解碼 WOFF 位元組大小 | 備註與字集狀態 |
| :--- | :--- | :--- | ---: | :--- |
| **入口頁** | `"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif` | 無內嵌（使用系統字體） | 0 bytes | 系統預設字體策略 |
| **首頁** | `"LINE Seed TW", "Noto Sans TC", "PingFang TC", ...` | `100 600` | 99,124 bytes | LINE Seed TW WOFF |
| **首頁** | `"LINE Seed TW", "Noto Sans TC", "PingFang TC", ...` | `700 900` | 101,512 bytes | LINE Seed TW WOFF |
| **Loading-1／問卷** | `"CareU LINE Seed TW", "LINE Seed TW", ...` | `400` | 86,584 bytes | LINE Seed TW WOFF |
| **Loading-1／問卷** | `"CareU LINE Seed TW", "LINE Seed TW", ...` | `700` | 85,704 bytes | LINE Seed TW WOFF |
| **報告頁** | `"CareU LINE Seed TW", "LINE Seed TW", ...` | `400` | 4,370,584 bytes | **字集範圍未確認** |
| **報告頁** | `"CareU LINE Seed TW", "LINE Seed TW", ...` | `700` | 4,531,228 bytes | **字集範圍未確認** |

### 3.2 建議 Typography Token 命名候選 `[PROPOSED]`
依據 `[CONFIRMED]` DEC-03，本階段保留各頁宣告，共用 Token 建議統一候選如下：
```css
/* 共用字體家族候選 [PROPOSED] */
--cu-font-family-base: "CareU LINE Seed TW", "LINE Seed TW", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
--cu-font-family-splash: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;

/* 字重 Token [PROPOSED] */
--cu-font-weight-regular: 400;
--cu-font-weight-bold: 700;

/* 字型合成防護 [SPEC_STATED] */
font-synthesis: none;
```

### 3.3 字級與排版遷移原則 `[CODE_OBSERVED]`
各頁標題、內文、標籤與對話框字級行高均以各原型 CSS 原始宣告及 media query 覆寫為準。已核對關鍵原碼事實包括：
- **首頁主標題**（首頁 `.hero h1`）：`font-size: clamp(2rem, 5.2vw, 4.15rem); line-height: 1.32;`；`@media (max-width: 520px)` 覆寫為 `font-size: clamp(2rem, 10.5vw, 3rem);`。
- **報告頁對話框標題**（報告頁 `.dialog-title`）：基礎 `font-size: 27px`；後續依原碼 selector、media query 與宣告順序覆寫。

---

## 4. 版面容器、圓角與陰影規範

### 4.1 間距比例（Spacing Scale）`[PROPOSED]`
| Token `[PROPOSED]` | 數值 | 典型使用場景 |
| :--- | :--- | :--- |
| `--cu-space-xs` | `4px` | 圖示與文字緊湊間距、標籤微調 |
| `--cu-space-sm` | `8px` | 輸入框垂直內距、小標籤內距 |
| `--cu-space-md` | `14px` ~ `16px` | 一般按鈕內距、卡片元件間隙 |
| `--cu-space-lg` | `24px` | Modal 內距、卡片間距 |
| `--cu-space-xl` | `32px` ~ `48px` | 區段間距、大卡片內距 |
| `--cu-space-2xl`| `clamp(48px, 8vw, 80px)` | 頁面上下留白、Hero 區域外距 |

### 4.2 容器、圓角與陰影遷移原則 `[CODE_OBSERVED]`
所有容器寬度（如報告頁 `.wrap`）、主卡片結構（如問卷主卡片 `.question-shell`）、圓角與陰影，均按對應原型 HTML 的 CSS 宣告與 media query 覆寫為準，待 Phase 4 頁面遷移時逐項核對原碼順序與優先級。已核對關鍵原碼事實包括：
- **首頁主 CTA**（首頁 `.primary-cta`）：圓角為 `border-radius: 999px;`；過渡為 `transition: box-shadow 220ms ease, background-color 220ms ease;`。
- **Loading-1 排除視窗**（Loading-1 `.exclude-modal`）：`width: min(600px, 100%); border-radius: 32px; box-shadow: 0 35px 90px rgba(7, 41, 92, .24);`；`@media (max-width: 650px)` 覆寫為 `border-radius: 26px;`。
- **問卷主卡片**（問卷頁 `.question-shell`）：`width: min(900px, 100%);`；`@media (max-width: 650px)` 覆寫為 `padding: 25px 18px; border-radius: 25px;`。

---

## 5. 動效與過渡規格（Motion Tokens）

### 5.1 緩動曲線事實 `[CODE_OBSERVED]`
- **首頁**：`--ease: cubic-bezier(.22, .76, .22, 1);` (首頁 `[CODE_OBSERVED]`)
- **Loading-1、問卷頁、報告頁**：`--ease: cubic-bezier(.22, .8, .32, 1);` (Loading-1、問卷頁、報告頁 `[CODE_OBSERVED]`)

### 5.2 各頁面實際 Keyframes 動畫清冊 `[CODE_OBSERVED]`
| 頁面 | 實際 Keyframes 名稱 `[CODE_OBSERVED]` | 視覺動態效果描述 |
| :--- | :--- | :--- |
| **入口頁** | `@keyframes blue-clear`<br>`@keyframes sunrise`<br>`@keyframes copy-in` | 藍色 U 型模糊轉清晰 (1.28s)<br>暖橘圓點自水平線遮罩升起 (1.14s)<br>品牌文字淡入並上移 8px (0.66s) |
| **首頁** | `@keyframes brand-to-top`<br>`@keyframes brand-to-top-mobile`<br>`@keyframes mark-settle`<br>`@keyframes reveal-wordmark`<br>`@keyframes reveal-wordmark-mobile`<br>`@keyframes wordmark-slide`<br>`@keyframes quick-in`<br>`@keyframes dot-hop`<br>`@keyframes arrow-float`<br>`@keyframes spin` | 品牌圖示移至頂部<br>手機版頂部定位<br>Logo 圖示縮為 46px<br>標準字展開並淡入<br>手機版標準字展開<br>標準字滑入<br>文案快速淡入<br>打字三點跳動<br>向下箭頭浮動提示<br>Spinner 旋轉動畫 |
| **Loading-1** | `@keyframes logo-dot-hop`<br>`@keyframes dot-hop`<br>`@keyframes panel-in` | Logo 橘點上下跳動<br>打字三點依序起伏<br>面板進場動畫 |
| **問卷頁** | `@keyframes button-spin`<br>`@keyframes logo-dot-hop`<br>`@keyframes dot-hop`<br>`@keyframes panel-in` | 送出按鈕 Spinner 旋轉<br>Loading-2 橘點跳動<br>打字三點起伏<br>題目面板淡入 |
| **報告頁** | `@keyframes grow`<br>`@keyframes float`<br>`@keyframes enter`<br>`@keyframes modal-in`<br>`@keyframes dot-hop` | 長條圖橫條寬度增長<br>Logo 光點緩慢懸浮<br>卡片捲入視野漸入<br>模態視窗進場<br>Loading 橘點跳動 |

---

## 6. 各頁面響應式斷點清冊（Responsive Breakpoints）`[CODE_OBSERVED]`

本專案保留各頁面原設計斷點與覆寫規則，不進行機械式粗暴合併：

| 頁面 | 來源定義斷點清單 `[CODE_OBSERVED]` | 主要版面與排版覆寫行為 |
| :--- | :--- | :--- |
| **入口頁** | `@media(max-width: 480px)` | 品牌文字縮為 1rem，分隔點與留白緊湊化，進入提示縮為 0.7rem。 |
| **首頁** | `@media(max-width: 820px)`<br>`@media(min-width: 821px)`<br>`@media(max-width: 520px)` | `820px` 以下說明卡改為單欄，頁尾垂直排列；`520px` 以下全面縮放 Hero 標題、上傳面板內距與按鈕寬度。 |
| **Loading-1** | `@media(max-width: 650px)` | 排除視窗雙按鈕改為單欄垂直排列，外層留白收緊為上下 84px/左右 18px。 |
| **問卷頁** | `@media(max-width: 650px)` | 題目選項與基本資料欄位改為單欄，上一題/下一步按鈕平分寬度。 |
| **報告頁** | `@media(min-width: 1500px)`<br>`@media(max-width: 1250px)`<br>`@media(max-width: 1100px)`<br>`@media(max-width: 1000px)`<br>`@media(max-width: 850px)`<br>`@media(max-width: 720px)`<br>`@media(max-width: 600px)`<br>`@media(max-width: 420px)`<br>`@media(max-height: 690px)` | `1500px` 以上 Hero 留白加大；<br>`1250px` 左側導覽欄縮減；<br>`1000px` 指標與組合改單欄佈局，側欄說明卡調整；<br>`850px` 候選品項卡縮小寬度；<br>`720px` 組合卡改單欄垂直圖文對齊；<br>`600px`/`420px` 極窄版面文字與圖形縮放；<br>`690px` 低高度下登入彈窗優化垂直內距。 |

- **安全區域相容（Safe Area Insets）**：所有滿版頁面與底部提示統一納入 `env(safe-area-inset-bottom)` 與 `100svh`。

---

## 7. 減少動態偏好規範（`prefers-reduced-motion: reduce`）`[SPEC_STATED]`

當使用者系統偏好減少動態效果時，全站必須遵守：
1. **停止循環動畫**：Logo 暖橘圓點停止跳動、三點改為靜態低透明度、Canvas 停止呼吸脈動與視差追蹤。
2. **轉場時間縮短**：CSS 轉場時間縮短為 `<= 150ms` 或立即呈現。
3. **整屏捲動改為即時**：首頁與報告頁取消平滑捲動，改為即時跳轉定位。
4. **入口頁停止自動跳轉**：入口頁直接顯示完整 Logo 與文字，靜態等待使用者點擊。

---

## 8. 驗收清單與未驗證事項

### 8.1 規格驗收清單
- [ ] 完整記錄色彩來源值與語意 Token 候選對照表。
- [ ] 依據 DEC-03 如實記錄各頁字體宣告與字重現況，標記報告頁字體為「字集範圍未確認」。
- [ ] 完整保留各頁面實際 `@keyframes` 動畫名稱，無未取證之假名稱。
- [ ] 完整保留報告頁 8 組寬度斷點與 1 組高度斷點宣告。
- [ ] 明確記錄 Reduced Motion 降級規範與 Safe Area 規則。

### 8.2 未驗證事項（`[RUNTIME_UNVERIFIED]`）
- 跨瀏覽器（特別是 Firefox / Safari）下 `backdrop-filter: blur(12px)` 的渲染效能與文字清晰度。
- WOFF 字體在 Android 舊版 WebView 上的渲染抗鋸齒效果。
