# Care U 保健食品推薦系統

## 1. 專案簡介與目前階段

- **專案名稱**：Care U 保健食品推薦系統
- **核心定位**：專業、省心、個人化的保健食品導航與推薦評估系統。
- **目前階段**：**Phase 0：Git Source Baseline Preparation**（來源基準準備與環境保護）。
- **當前目標**：鎖定 33 份原始設計與規格資產作為 Source of Truth，建立版本控管防護機制，為後續工程化提供不可竄改的基準。

---

## 2. 目錄架構與用途說明

專案根目錄下主要包含 `source/`、`docs/` 兩大管理目錄：

```text
CareU/
├── source/                      # 來源資產庫（Source of Truth，受版本保護）
│   ├── project-brief/           # 專案管理指引、Technical PM 規範與準備清單
│   ├── prototypes/              # 5 份獨立 HTML 完成版互動原型
│   ├── page-specs/              # 5 份各頁完成版頁面規格文件 (.md)
│   ├── flows/                   # 網站流程圖 (.png) 與網站流程說明 (.md)
│   ├── assets/
│   │   ├── brand/               # 官方 VIS 品牌資產（標誌組合、Logo、色票、標準字、AI 原檔）
│   │   ├── prototype-generated/ # 原型專用視覺／背景生成素材（預留）
│   │   └── mock/                # 假資料與展示專用素材（預留）
│   ├── data/
│   │   ├── questionnaire/       # 12 項完整問卷與安全禁忌題庫 (.txt)
│   │   ├── health-categories/   # 12 項保健功效項目清單 (.csv)
│   │   └── products/
│   │       ├── raw/             # 衛福部原始健康食品資料集 (.csv，含來源網址)
│   │       └── derived/         # 團隊衍生資料集 (.csv，含機制標籤與證據評分)
│   └── archive/                 # 歷史封存資料（預留）
├── docs/                        # 專案審計與工程化文件
│   ├── audit/                   # 階段預檢報告、資產清冊與遷移審計文件
│   └── assets/                  # 專案管理與工程文件輔助資源（預留）
├── .gitattributes               # 來源檔案二進位保護與換行防護
├── .gitignore                   # 版本控制排除規則
└── README.md                    # 本專案說明文件
```

---

## 3. 資產分類與保護原則

### 3.1 原型定位（Prototypes as Source of Truth）
- `source/prototypes/` 中的 5 份 HTML 原型為「視覺風格、排版版型、已定案 UX 互動」的重要 Source of Truth。
- 原型內部的 `setTimeout`、模擬登入、假商品資料、Demo Controller 與固定數值均為**前端展示與原型測試用途，不等於正式後端規格或正式 API 契約**。

### 3.2 素材層級區分
1. **正式品牌素材（Brand Source of Truth）**：位於 `source/assets/brand/`，包含官方 Logo、標準字與 VIS 規範。
2. **原型生成素材（Prototype Generated）**：原型專用的背景光暈、幾何圖騰與視覺元素。
3. **展示專用素材（Mock Only）**：僅供 Prototype 展示用的假資料或暫存圖示。
4. **原始資料（Raw Data）**：`source/data/products/raw/` 保留未修改的衛福部商品資料（含來源網址）。
5. **衍生資料（Derived Data）**：`source/data/products/derived/` 為加工欄位版，其演算法與標籤規則尚待複核。
6. **封存資產（Archive）**：歷史版本或淘汰檔案統一歸檔於 `source/archive/`。

### 3.3 來源原件不可覆寫原則
- `source/` 下的所有原始檔案預設**嚴禁由 AI Agent 覆寫、重命名、刪除或自動格式化**。
- 未來若組員提供新版清洗商品資料，必須先確認其來源、用途與取代關係，經 Technical PM 審核後另行納入，不得直接覆蓋現有 Raw 或 Derived 檔案。

---

## 4. 前端技術規劃與工程化階段安排

### 4.1 預定前端技術棧
- **核心框架**：Vue 3 (Composition API / `<script setup>`)
- **建置工具**：Vite
- **路由管理**：Vue Router
- **狀態管理**：Pinia
- **語法規範**：TypeScript 尚未定案（待 Phase 2/3 評估決定）。
- **現況**：目前**尚未建立前端工程專案**（No scaffold yet）。

### 4.2 專案分階段推進計畫
1. **Phase 0：Git Source Baseline Preparation**（當前階段：來源保護、基準雜湊、管理文件建立與 Git 初始化）。
2. **Phase 1：Migration Audit & Asset Inventory**（原型視覺審計、Token 抽取、素材依賴盤點；不寫前端代碼）。
3. **Phase 2：Architecture & Specification Baseline**（制定元件規格、狀態模型與路由規範）。
4. **Phase 3：Frontend Scaffold & Design System**（正式建立 Vue 3 + Vite 專案骨架與基礎 UI Token）。
5. **Phase 4：Page Implementation**（逐步將 5 大頁面由 Prototype 遷移重構為 Vue 模組化元件）。
6. **Phase 5：State & Flow Integration**（串接問卷、報告流程與 Pinia 狀態管理）。
7. **Phase 6：Backend API Contract & Mocking**（定義 OpenAPI 規格與 MSW 模擬環境）。
8. **Phase 7：Data Model & Recommendation Alignment**（對齊商品資料模型與推薦演算法）。
