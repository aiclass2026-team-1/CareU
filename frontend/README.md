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

## 3. 目前階段與預覽路由（Phase 4 第一批）

### 3.1 頁面實作進度
- **入口頁 (Splash Page)**：`src/views/SplashView.vue`（已完成遷移）
  - 預覽路由：`#/preview/splash`
  - 核心規格：
    - 定案圖形 Logo（藍色 U 型 `#197AFC`、中央十字、暖橘色圓點 `#FB8F54`）。
    - SVG clipPath 水平線升起遮罩動畫 (1.14s)、藍色清晰化動畫 (1.28s)、品牌文字淡入動畫 (0.66s)。
    - 一般模式載入後 **2850ms** 自動進入首頁（預覽暫導向 `#/`）；
    - 點擊畫面、觸控或鍵盤 `Enter` / `Space` 可立即略過動畫進入；
    - `prefers-reduced-motion: reduce` 下停止動畫與 2850ms 計時，顯示完整靜態版；
    - 依 Phase 2 規格移除重播按鈕與示意首頁。
- **骨架驗證頁面**：
  - `#/`：占位首頁 (`src/views/ScaffoldHomeView.vue`)
  - `#/scaffold-verify`：路由切換驗證頁 (`src/views/ScaffoldAboutView.vue`)

---

## 4. 階段限制與邊界規範（嚴格遵守）

1. **無業務邏輯**：尚未實作問卷計分、OCR、推薦演算法、登入 API 或購物流程。
2. **無業務 Store**：Pinia 僅完成 `app.use(pinia)` 實例註冊，不建立 Auth/Cart/Report 等業務 Store，不加入持久化外掛（留待 Phase 8）。
3. **無正式路由**：整站業務路由（`/home`, `/questionnaire`, `/report` 等）與路由守衛留待 Phase 6。
4. **無 UI 庫**：不引入 Element Plus、Ant Design Vue 等第三方大型 UI 庫，亦不在此階段建立正式 Design Tokens。

