# Care U｜共用元件清冊與介面規格（Component Inventory & Interface Spec）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 工程規格草案（待 Technical PM 審閱）
- **主要依據**：
  - 5 份 HTML 原型 DOM 結構與 JavaScript 事件邏輯 `[CODE_OBSERVED]`
  - `docs/audit/frontend-migration-audit.md` §4 元件候選清單 `[SPEC_STATED]`
  - `docs/assets/asset-inventory.md` 圖示與動態視覺清冊 `[SPEC_STATED]`
  - `[CONFIRMED]` DEC-01, DEC-04 與共用登入視窗決策

---

## 1. 元件架構與分類概述

本專案元件工程化遵循 Vue 3 Composition API（`<script setup>`）設計規範。元件分為 5 大類別：
1. **全域基礎 UI 元件 (Base/Common)**：純視覺樣式、按鈕、通用 Modal 外殼、Toast 提示、SVG 精靈圖示。
2. **視覺與背景元件 (Visual/Canvas)**：品牌動畫、動態資料粒子背景、劑型示意圖。
3. **流程與表單元件 (Flow/Form)**：健檢檔案上傳抽屜、問卷步驟進度條、單選/多選/數值輸入群組。
4. **領域業務元件 (Domain/Report)**：關注指標長條圖清單、方向卡片、頁內候選更換清單、購物車視窗。
5. **全域模態視窗 (Modals)**：共用會員登入視窗、健檢排除視窗。

---

## 2. 全域基礎 UI 元件清冊

### 2.1 `AppButton.vue`（膠囊按鈕）`[PROPOSED]`
- **來源定位**：各頁原型之 `.button`, `.primary-cta`, `.replay-button`
- **職責**：封裝品牌藍實心、暖橘實心、外框（outline）、次要（secondary）等膠囊圓角按鈕樣式與動效光澤。
- **候選 Props `[PROPOSED]`**：
  - `variant`: `'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'`（預設 `'primary'`）
  - `size`: `'sm' | 'md' | 'lg'`（預設 `'md'`）
  - `disabled`: `boolean`（預設 `false`）
  - `loading`: `boolean`（預設 `false`）
  - `block`: `boolean`（滿寬，預設 `false`）

### 2.2 `AppModal.vue`（通用模態視窗外殼）`[PROPOSED]`
- **來源定位**：各頁 `.upload-sheet`, `.exclude-backdrop`, `#authLayer`, `#auxLayer`
- **職責**：提供半透明遮罩、居中容器、Focus Trap 焦點捕捉、背景捲動鎖定。
- **關鍵行為參數**：
  - `closeOnEsc`: `boolean` —— **重要：預設 `true`，但排除視窗 `ExcludeModal` 必須傳入 `false`（`[CONFIRMED]` DEC-04）**。
  - `closeOnClickOverlay`: `boolean`（預設 `true`，排除視窗傳入 `false`）。
- **候選 Emits `[PROPOSED]`**：`update:modelValue`, `close`, `after-leave`。

### 2.3 `AppToast.vue`（即時提示訊息）`[PROPOSED]`
- **來源定位**：首頁 L874 `#toast`（2800ms，L909 `[CODE_OBSERVED]`）, 報告頁 L197 `#toast`（3600ms，`function toast` 位於 L244 `[CODE_OBSERVED]`）
- **職責**：右下角浮動 Toast 提示，支援自動消失與 ARIA Live 朗讀（原型中首頁為 2800ms、報告頁為 3600ms `[CODE_OBSERVED]`）。
- **候選 Props `[PROPOSED]`**：
  - `type`: `'info' | 'error' | 'success'`（預設 `'info'`）
  - `duration`: `number`（預設 `2800` ms，可傳入 `3600` ms）

### 2.4 `IconBase.vue`（共用圖示元件）`[PROPOSED]` 與來源 SVG 精靈圖標群（11 款圖示）`[CODE_OBSERVED]`
- **來源定位**：報告頁 L77-140 `#symbolSprite` `[CODE_OBSERVED]`
- **實際 Symbol ID 清冊 `[CODE_OBSERVED]`**：
  1. `i-lock`（鎖頭）
  2. `i-arrow`（右箭頭）
  3. `i-down`（向下箭頭）
  4. `i-info`（資訊驚嘆號）
  5. `i-close`（叉叉關閉）
  6. `i-cart`（購物車）
  7. `i-check`（綠色勾號）
  8. `i-spark`（星芒裝飾）
  9. `i-eye`（顯示密碼）
  10. `i-eye-off`（隱藏密碼）
  11. `i-user`（使用者）
- **警示圖示說明**：報告頁中的黃色三角驚嘆號（接近提醒門檻）與紅色圓形驚嘆號（就醫警告）在原碼中為 HTML/CSS 標記（`.alert-badge` / 內嵌向量），不屬於 symbol 精靈圖 `[CODE_OBSERVED]`。


---

## 3. 視覺與背景動態元件

### 3.1 `LogoIntro.vue`（品牌開場動畫）`[PROPOSED]`
- **來源定位**：`CareU_入口頁原型.html` L292 `#splash`
- **職責**：執行 U 型與十字模糊轉清晰、圓點自水平線升起、文字漸入、點擊/鍵盤略過。
- **候選 Emits `[PROPOSED]`**：`complete`（動畫完成或略過後觸發導航進入首頁）。

### 3.2 `DataCanvas.vue`（粒子網絡動態背景）`[PROPOSED]`
- **來源定位**：首頁 L991 `#dataField`, Loading-1 L640, 問卷頁 L805
- **職責**：繪製網格資料點陣，追蹤指標互動，支援 Hero 容器模式與全螢幕覆蓋模式。
- **候選 Props `[PROPOSED]`**：
  - `fullscreen`: `boolean`（預設 `false`；在 Loading 與問卷頁設為 `true`）
  - `interactive`: `boolean`（是否響應游標移動，預設 `true`）

### 3.3 `ProductDoseArt.vue`（劑型圖示元件）`[PROPOSED]` 與來源 `productArt()` 函式 `[CODE_OBSERVED]`
- **來源定位**：報告頁 L247 `productArt()` `[CODE_OBSERVED]`
- **職責**：依品名動態渲染膠囊（`.capsule-art`）或錠劑（`.tablet-art`）之 HTML DOM＋CSS 樣式與 `.art-caption` 提示文字（非商品照片，非 SVG 圖片 `[CODE_OBSERVED]`）。
- **候選 Props `[PROPOSED]`**：
  - `productName`: `string`
  - `dosageForm`: `'capsule' | 'tablet'`

---

## 4. 流程與表單元件

### 4.1 `UploadSheet.vue`（健檢檔案上傳面板）`[PROPOSED]`
- **來源定位**：首頁 L838 `#uploadSheet` `[CODE_OBSERVED]`
- **職責**：展示上傳說明、已選檔案清單（累加最多 10 檔）、單筆刪除、格式與 25MB 大小防呆、開始讀取。
- **候選 Emits `[PROPOSED]`**：`start-reading`（攜帶已選檔案清單導向 Loading-1）。

### 4.2 `StepProgress.vue`（問卷進度條）`[PROPOSED]`
- **來源定位**：問卷頁 L434 `#progressFill` `[CODE_OBSERVED]`
- **職責**：依固定槽位平滑過渡進度條長度（`supplement` 7 槽；`full` 8 槽），不顯示數字步驟。
- **候選 Props `[PROPOSED]`**：
  - `currentSlot`: `number`
  - `totalSlots`: `number`

### 4.3 題型元件群（Schema-driven Questionnaire Components）`[PROPOSED]`
- **`QuestionRadioGroup.vue`**：單選題型（如睡眠品質、活動量、蔬果攝取），支援兩欄/單欄響應式。
- **`AllergySelector.vue`**：多選過敏原題型，實作「無已知過敏」互斥反選、「其他」展開文字框。
- **`MeasurementInputs.vue`**：數值輸入題型（腰圍、血壓），實作數值與「目前不知道」互斥切換。

---

## 5. 領域業務與全域模態元件

### 5.1 `HealthCategoryBarList.vue`（關注指標長條圖）`[PROPOSED]`
- **來源定位**：報告頁 L143 `#chartList`, `renderChart()` `[CODE_OBSERVED]`
- **職責**：依 `results` 降冪取前 8 筆渲染橫向長條與數值；未登入時前 2 名套用鎖定遮罩。
- **候選 Props `[PROPOSED]`**：
  - `results`: `Array<HealthCategoryResult>`
  - `isMember`: `boolean`
  - `activeCategoryId`: `string | null`

### 5.2 `DirectionCard.vue`（重點保健方向展開卡片）`[PROPOSED]`
- **來源定位**：報告頁 L144-146（結構摘要：`<section id="insightSection"><div id="insights"></div></section>`，原碼 ID 為 `#insightSection` 與 `#insights` `[CODE_OBSERVED]`）
- **職責**：呈現前 5 項重點方向，支援展開/收合、分析依據展示、黃色/紅色就醫警示標記（`.alert-badge`）、未登入鎖定遮罩。

### 5.3 `ProductCandidateList.vue`（頁內候選品項展開清單）`[PROPOSED]`
- **來源定位**：報告頁 L157-158（結構摘要：`<div id="bundleAnchor"><div id="bundleSection"></div></div>`）、L309 `toggle-candidates` `[CODE_OBSERVED]`
- **職責**：於方向卡片下方**頁內展開**（非 Modal/Drawer）候選品項清單，點選即時替換自選組合；選取時執行 `selectProduct` 跨方向重複選用阻擋（Toast「這個品項已在組合中，不會重複加入。」`[CODE_OBSERVED]`）。

### 5.4 `LoginModal.vue`（全域共用登入視窗，落實共用登入規範）`[PROPOSED]`
- **來源定位**：報告頁 L171 `#authDialog`, `CareUAuth`, `authMember` `[CODE_OBSERVED]`
- **職責**：支援登入（`login`）、註冊（`register`）、忘記密碼（`forgot`）三模式切換；支援密碼眼睛明文切換。
- **驗證規則 `[CODE_OBSERVED]`**：
  - 登入：Email 格式、密碼長度 `>= 8`。
  - 註冊：Email 格式、密碼長度 `>= 8`、兩次密碼一致。
  - 忘記密碼：Email 格式（不要求密碼）。
- **呼叫與返回行為規範 `[CONFIRMED]`**：
  - 首頁呼叫：登入後關閉視窗，留在首頁。
  - 報告頁呼叫：登入後關閉視窗，原地解鎖會員內容（前 2 名指標與品項），焦點精確還原至觸發點。
  - 支援 `Escape` 鍵關閉。

### 5.5 `ExcludeModal.vue`（健檢解析排除視窗，落實 DEC-01 / DEC-04）`[PROPOSED]`
- **來源定位**：Loading-1 L410 `#excludeModal` `[CODE_OBSERVED]`
- **職責**：呈現健檢資料無法使用警示，提供「返回首頁」（`#modalHome`）與「直接填寫問卷」（`#modalQuestionnaire`）雙按鈕。
- **按鍵與焦點規範 `[CONFIRMED]`**：**不支援 `Escape` 鍵關閉**，焦點鎖定於雙按鈕之間。

---

## 6. 關鍵模態視窗行為對比矩陣

本矩陣清晰區分「原型現況事實」、「已確認決策」與「工程候選方案（`[PROPOSED]`）」：

| 視窗元件 | 初始焦點 (Initial Focus) | 鍵盤焦點循環 (Focus Trap) | 鍵盤 Escape 關閉 | 點擊遮罩關閉 | 關閉後焦點返回 (Return Focus) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **`UploadSheet`**<br>(首頁上傳抽屜) | **原型現況**：未實作自動聚焦<br>**`[PROPOSED]`**：移入首個按鈕 | **原型現況**：無 Trap<br>**`[PROPOSED]`**：限制於面板內 | **支援 (`true`)**<br>(首頁 L986 `[CODE_OBSERVED]`) | 支援<br>(首頁 L963) | **原型現況**：未實作返回<br>**`[PROPOSED]`**：返回主 CTA |
| **`ExcludeModal`**<br>(Loading-1 排除) | **原型現況**：延遲 80ms 聚焦 `#excludeModal`<br>(L511 `[CODE_OBSERVED]`) | **實作雙按鈕 Trap**<br>(Loading-1 L613 `[CODE_OBSERVED]`) | **`[CONFIRMED]` DEC-04<br>不支援 (`false`)** | **不支援 (`false`)**<br>(L614 `[CODE_OBSERVED]`) | **`[CONFIRMED]`**：點擊雙按鈕導航跳轉，無原位關閉返回 |
| **`LoginModal`**<br>(全域共用登入) | **原型現況**：聚焦視窗容器<br>(報告頁 L275 `[CODE_OBSERVED]`) | **實作 Modal Trap**<br>(報告頁 L281 `[CODE_OBSERVED]`) | **支援 (`true`)**<br>(報告頁 L281) | 支援<br>(報告頁 L310) | **`[CONFIRMED]` 原位還原**：精確返回 `returnFocus` 呼叫按鈕 |
| **`CartModal`**<br>(報告頁購買視窗) | **原型現況**：聚焦視窗容器<br>(報告頁 L286 `[CODE_OBSERVED]`) | **實作 Modal Trap**<br>(報告頁 L281 `[CODE_OBSERVED]`) | **支援 (`true`)**<br>(報告頁 L281) | 支援<br>(報告頁 L310) | **原型現況**：返回觸發按鈕<br>(購物車圖示或加入按鈕) |

- **報告頁 Modal 捲動鎖定現況 `[CODE_OBSERVED]`**：`openModal()` 透過 `document.body.style.position = 'fixed'`, `document.body.style.top = -scrollY + 'px'`, `document.body.style.width = '100%'` 以及設定背景容器 `inert` 實作；`closeModal()` 還原捲動位置（共用元件實作方案待 Phase 5 定案）。

---

## 7. 驗收清單與未驗證事項

### 7.1 規格驗收清單
- [ ] 完整盤點 5 大類共用元件候選與 Props/Emits/Slots 介面建議。
- [ ] 11 款 SVG Symbol ID 與實際原碼 `i-*` 完全一致，警示標記正確區分。
- [ ] 依據 DEC-04 明確標記 `ExcludeModal` 不支援 `Escape` 鍵與遮罩點擊關閉。
- [ ] 模態視窗矩陣分開記錄「初始焦點」、「Tab 限制」與「關閉後焦點返回」，不偽稱首頁上傳面板已具備焦點能力。
- [ ] 完整記錄 `LoginModal` 來源焦點記錄、原位解鎖、密碼明文切換與表單驗證規則。
- [ ] 明確記錄 `ProductDoseArt` 為 HTML DOM+CSS 劑型生成，非圖片素材。

### 7.2 未驗證事項（`[RUNTIME_UNVERIFIED]`）
- 螢幕閱讀器（NVDA / VoiceOver）在 `AppModal` 開啟時的 `aria-modal="true"` 焦點囚禁嚴密程度。
- 虛擬鍵盤彈起時，行動裝置瀏覽器中 `LoginModal` 表單欄位的視窗適配性。
