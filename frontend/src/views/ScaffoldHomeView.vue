<script setup lang="ts">
/**
 * Care U - Phase 3 Scaffold 占位首頁
 * 僅作為前端骨架與 Router 掛載技術驗證，不含原型視覺與業務邏輯。
 */
</script>

<template>
  <div class="scaffold-card">
    <span class="badge">Phase 3 Scaffold Verified</span>
    <h2>技術驗證占位首頁 (Scaffold Home)</h2>
    <p class="description">
      本頁面為 Care U 前端工程化 Phase 3 之最小技術驗證占位頁。
    </p>

    <div class="status-grid">
      <div class="status-item">
        <strong>Vue 3</strong>
        <span>SFC & Composition API 掛載正常</span>
      </div>
      <div class="status-item">
        <strong>Vite</strong>
        <span>開發伺服器與 Bundler 運行正常</span>
      </div>
      <div class="status-item">
        <strong>TypeScript</strong>
        <span>型別約束與編譯配置就緒</span>
      </div>
      <div class="status-item">
        <strong>Pinia</strong>
        <span>全域實例已註冊（尚未建立業務 Store）</span>
      </div>
      <div class="status-item">
        <strong>Vue Router</strong>
        <span>路由實例已掛載（Hash History 骨架驗證）</span>
      </div>
    </div>

    <div class="actions">
      <RouterLink to="/preview/splash" class="btn btn--secondary">
        &larr; 預覽入口頁動畫 (/preview/splash)
      </RouterLink>
      <RouterLink to="/scaffold-verify" class="btn">
        前往骨架驗證分頁 &rarr;
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.scaffold-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  max-width: 640px;
  margin: 0 auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.badge {
  display: inline-block;
  background-color: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  margin-bottom: 12px;
}

h2 {
  font-size: 20px;
  color: #0f172a;
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  font-size: 13px;
}

.status-item strong {
  color: #1e293b;
}

.status-item span {
  color: #10b981;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  background-color: #197afc;
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #1462ca;
  text-decoration: none;
}

.btn--secondary {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn--secondary:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}
</style>
