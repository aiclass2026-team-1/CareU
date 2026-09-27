# Care U｜首頁工程規格（Home Page Specification）

- **文件版本**：v1.0 (Draft)
- **撰寫日期**：2026-09-27
- **基準 Commit**：`b96132d3d35a05364b2b7275e9ab7b21f31b3a50`
- **文件狀態**：`[PROPOSED]` 工程頁面規格（待 Technical PM 審閱）
- **主要依據**：
  - `source/page-specs/CareU_首頁_頁面規格.md` `[SPEC_STATED]`
  - `source/prototypes/CareU_首頁原型.html`（共 1074 行）`[CODE_OBSERVED]`
  - `[CONFIRMED]` DEC-03 字體策略與共用登入規範

---

## 1. 來源與適用範圍

- **對應原型檔案**：`source/prototypes/CareU_首頁原型.html`
- **適用範圍**：Care U 首頁 Hero 視覺、上傳面板抽屜、分流問卷入口、第二屏信任說明、全域懸浮登入入口。
- **邊界說明**：原型中點擊登入入口與問卷入口僅觸發 Toast 提示；正式工程化應分別呼叫 `LoginModal` 與 Vue Router 導航。

---

## 2. 畫面架構與視覺保留要求

### 2.1 雙屏垂直 Scroll Snap 架構
- **第一屏 Hero 區**：包含頂部品牌標準字展開動畫、主標題「如果身體會說話，最近想跟你說什麼？」、主 CTA「從體檢資料開始瞭解」、輔助問卷入口、三層節點圖層與動態 Canvas 粒子網絡。
- **第二屏說明區 (`#trust`)**：包含「讓資料的來源、用途與界線，都清楚可見。」標題、三張信任說明卡片（資料使用、判讀依據、使用界線）與頁尾 Footer。
- **垂直整屏導航**：桌面端支援滾輪位移（`deltaY > 8`）整屏平滑切換，切換期間鎖定 `780ms` 防連滾；行動端支援原生流式捲動。

### 2.2 視覺規格保留 `[CODE_OBSERVED]`
- **主標題樣式**：Selector 為 `.hero h1`，字級 `clamp(2rem, 5.2vw, 4.15rem)`，行高 `1.32`；`@media (max-width: 520px)` 下為 `clamp(2rem, 10.5vw, 3rem)` `[CODE_OBSERVED]`。
- **字體宣告與大小**：`"LINE Seed TW"`（`100 600` 解碼 99,124 bytes / `700 900` 解碼 101,512 bytes）`[CODE_OBSERVED]`。
- **配色**：主色藍 `#197AFC`、深藍 `#07295C`、橘色 `#FB8F54`、珊瑚粉 `#EB938E`。
- **節點視差與 Canvas**：底層 Canvas 網格（間距 34px/30px），三層節點圖層（背景網絡、左下前景、右上前景）依游標移動產生不同幅度與方向之景深視差。

---

## 3. 上傳面板（UploadSheet）操作與驗證規則

### 3.1 視窗開啟與檔案選擇機制 `[CODE_OBSERVED]`
1. **開啟方式**：使用者點擊 Hero 主 CTA「從體檢資料開始瞭解」（`#chooseFileButton`），**先開啟 `uploadSheet` 模態視窗，不直接觸發原生檔案選擇器**。
2. **選取檔案**：點擊視窗內「新增或重新選擇」（`#addFiles`）按鈕，才呼叫原生檔案選擇器（`fileInput.click()`）。
3. **累加選檔與防呆限制**：
   - 支援格式：PDF、JPG、PNG（其餘格式於面板內顯示 `uploadError.textContent = '僅支援 PDF、JPG、JPEG、PNG 格式。'` 並觸發錯誤 Toast「檔案格式不符合：僅支援 PDF、JPG、PNG。」）。
   - 單檔大小上限：`25MB`（超過於面板內顯示 `uploadError.textContent = '單一檔案請勿超過 25MB。'` 並觸發錯誤 Toast「檔案容量超過限制：單一檔案請勿超過 25MB。」）。
   - 檔案數量上限：清單**累加最多保留 10 檔**（新加入檔案超過可容納剩餘數時，**僅於面板內提示 `uploadError.textContent = '一次最多保留 10 個檔案。'`，不發出 Toast** `[CODE_OBSERVED]`）。
   - **注意**：上述限制為原型前端防呆規則，非正式後端契約 `[CODE_OBSERVED]`。
4. **單筆移除與送出**：使用者可點擊個別檔案右側叉號移除；清單為空時「開始讀取」（`#startReading`）維持停用；點擊「開始讀取」後攜帶檔案資訊導向 `/loading-analysis`。
5. **關閉方式與焦點現況**：
   - 原型支援點右上關閉「×」、點遮罩空白處、按 `Escape` 鍵關閉（L986 `[CODE_OBSERVED]`）。
   - **焦點現況**：原型未實作開啟後自動聚焦首個欄位與關閉後焦點返回（標記為原型未實作，正式工程化目標列 `[PROPOSED]`）。

---

## 4. 全域會員登入入口與共用登入規範

- **懸浮按鈕定位**：
  - 第一屏 Hero：固定於畫面右下角。
  - 捲動至第二屏說明頁後：自動平滑移動至右側垂直中央（`.is-on-explanation`）。
- **登入行為（`[CONFIRMED]`）**：
  - 點擊按鈕呼叫全域共用 `LoginModal`（攜帶 `returnTo: 'home'`）。
  - 登入成功後關閉視窗並留在首頁，不跳轉任何專屬頁面。
  - 關閉視窗後焦點還原至該按鈕。

---

## 5. 原型行為 vs 工程化目標區分

| 項目 | 原型現況 `[CODE_OBSERVED]` | 正式工程化目標 `[PROPOSED]` |
| :--- | :--- | :--- |
| **問卷入口** | 點擊問卷連結跳出原型 Toast 提示 | 使用 Vue Router 跳轉至 `/questionnaire`（`full` 模式） |
| **開始讀取** | 點擊後開啟頁內 `#routeScreen` 模擬轉場面板（標題「正在前往資料辨識頁」，內含 `#returnHome`） | 寫入 `useUploadStore` 並導向 `/loading-analysis` 頁面 |
| **會員登入** | 點擊跳出原型 Toast 提示 | 開啟全域 `LoginModal` 元件 |
| **說明連結** | 點擊跳出提示 Toast | 導向正式隱私權、條款與聲明頁面／彈窗 |

---

## 6. 元件與資料相依

- **元件相依**：`UploadSheet.vue`, `DataCanvas.vue`, `AppToast.vue`, `LoginModal.vue`。
- **狀態相依**：`useUploadStore`（管理待解析檔案清單）、`useAuthStore`（會員登入狀態）。

---

## 7. 逐項驗收條件清單

- [ ] 首頁載入時品牌圖示與標準字展開動畫流暢，無溢出裁切。
- [ ] 點擊「從體檢資料開始瞭解」能開啟上傳面板，且未直接喚起系統選檔器。
- [ ] 上傳面板支援多選累加，上限 10 檔、單檔 25MB 與格式檢查正確。
- [ ] 點擊「開始讀取」後正確寫入狀態並導向 `/loading-analysis`。
- [ ] 右下角會員登入按鈕在第二屏平滑上移至右側中央。
- [ ] 桌面滾輪可觸發整屏切換，Modal 開啟時不攔截滾輪。
- [ ] `prefers-reduced-motion: reduce` 下停止視差與 Canvas 脈動，文字直接顯示。
- [ ] **`[RUNTIME_UNVERIFIED]`**：高解析度螢幕（Retina / 4K）下 Canvas 粒子網絡繪製效能與記憶體開銷。
- [ ] **`[RUNTIME_UNVERIFIED]`**：多品牌行動瀏覽器在整屏 Scroll Snap 與動態網址列縮放時的吸附穩定度。
