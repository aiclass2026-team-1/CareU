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

## 3. 目前階段與預覽路由（Phase 4 第二批）

### 3.1 頁面實作進度
- **入口頁 (Splash Page)**：`src/views/SplashView.vue`（已完成遷移）
  - 預覽路由：`#/preview/splash`
- **首頁 (Home & Upload Page)**：`src/views/HomeView.vue`（已完成遷移）
  - 預覽路由：`#/preview/home`
  - 核心規格：
    - 雙屏垂直 Scroll Snap 架構（第一屏 Hero + 第二屏 資料說明頁 `#trust`）。
    - 品牌進場動畫、打字狀態跳動提示（`dot-hop`）、三層節點圖層視差、Canvas 粒子網絡。
    - 上傳面板（`UploadSheet`）：點擊主 CTA 先開面板，面板內點「新增或重新選擇」開啟原生選檔；累加選檔、最多 10 檔、單檔 25MB、格式檢查與 2800ms Toast。
    - 隨捲動改變位置的會員登入入口（第一屏右下角，第二屏移至右側中央）。
    - 素材抽離至 `src/assets/home/`（2 組 LINE Seed TW WOFF 字體與 3 張節點圖 PNG，解碼雜湊 100% 吻合）。
    - 樣式完整隔離：首頁 CSS 選擇器全數限定於 `.home-page-container`，Keyframes 前綴統一為 `home-*`，避免影響 Splash 或骨架頁。
    - 整屏捲動與長內容降級：由實際 DOM 尺寸、桌面寬度（> 820px）、細緻指標與非 Reduced Motion 共同判定 `isDesktopSnap`；內容溢出或窄視窗時自動停用 snap 並放行原生滾動，確保可讀至完整 Footer。
    - 即時同步 Reduced Motion：動態監聽系統動態偏好變更，即時同步根元素捲動行為與 Canvas 粒子排程；Reduced Motion 下點擊箭頭採即時無動畫捲動。
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

## 5. 階段限制與邊界規範（嚴格遵守）

1. **無業務邏輯**：尚未實作問卷計分、OCR、推薦演算法、登入 API 或購物流程。
2. **無業務 Store**：Pinia 僅完成 `app.use(pinia)` 實例註冊，不建立 Auth/Cart/Report 等業務 Store，不加入持久化外掛（留待 Phase 8）。
3. **無正式路由**：整站業務路由（`/home`, `/questionnaire`, `/report` 等）與路由守衛留待 Phase 6。
4. **無 UI 庫**：不引入 Element Plus、Ant Design Vue 等第三方大型 UI 庫，亦不在此階段建立正式 Design Tokens。

