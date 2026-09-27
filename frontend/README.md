# Care U 前端工程骨架（Phase 3 Scaffold）

本目錄為 Care U 保健食品推薦系統的正式前端工程根目錄。

---

## 1. 技術棧與工程配置

- **核心框架**：Vue 3 (`v3.5.x`, SFC Composition API `<script setup>`)
- **建置工具**：Vite (`v8.x`)
- **語言規範**：TypeScript (`v5.8.x`)
- **路由管理**：Vue Router (`v5.x`，骨架階段暫採 Hash History)
- **狀態管理**：Pinia (`v4.x`，全域實例註冊，無業務 Store)
- **套件相依**：包含 `@vue/devtools-api` (`v8.x`) 滿足 Pinia 4 peer dependency

---

## 2. 開發與指令說明

請在 `frontend/` 目錄下執行以下指令：

```bash
# 1. 安裝相依套件（產生或依據 package-lock.json）
npm install

# 2. 啟動開發伺服器 (http://127.0.0.1:5173/)
npm run dev

# 3. 型別檢查（零發射）
npm run type-check

# 4. 生產環境建置
npm run build

# 5. 生產建置預覽
npm run preview
```

---

## 3. 階段限制與邊界規範（嚴格遵守）

1. **無業務邏輯**：本階段僅完成 Vue 3 + Vite + TypeScript + Vue Router + Pinia 的最小技術驗證骨架。
2. **無原型遷移**：不在此階段搬移 HTML 原型、不抽取 Base64 素材、不導入正式字體檔。
3. **無業務 Store**：Pinia 僅完成 `app.use(pinia)` 實例註冊，不建立 Auth/Cart/Report 等業務 Store，不加入持久化外掛（留待 Phase 8）。
4. **無正式路由**：僅配置最小技術驗證占位路由（`scaffold-home`, `scaffold-verify`），整站業務路由與守衛留待 Phase 6。
5. **無 UI 庫**：不引入 Element Plus、Ant Design Vue 等第三方大型 UI 庫，亦不在此階段建立正式 Design Tokens。
