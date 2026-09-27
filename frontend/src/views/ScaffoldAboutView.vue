<script setup lang="ts">
/**
 * Care U - Phase 3 Scaffold 路由切換驗證頁
 * 僅作為 RouterLink 與路由切換技術驗證用途。
 */
</script>

<template>
  <div class="scaffold-card">
    <span class="badge">RouterLink Switch PASS</span>
    <h2>路由切換驗證分頁 (Scaffold Verify)</h2>
    <p class="description">
      當你看到此頁面時，代表 Vue Router 路由切換與視圖載入已正常運作。
    </p>

    <div class="info-box">
      <p><strong>當前路由路徑：</strong> <code>#/scaffold-verify</code></p>
      <p><strong>路由模式：</strong> Hash History（骨架執行選擇，正式路由留待 Phase 6）</p>
    </div>

    <div class="actions">
      <RouterLink to="/" class="btn-outline">
        &larr; 返回技術驗證首頁
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
  background-color: #dcfce7;
  color: #15803d;
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

.info-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: #334155;
  margin-bottom: 24px;
  line-height: 1.8;
}

code {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.actions {
  display: flex;
  justify-content: flex-start;
}

.btn-outline {
  display: inline-block;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #475569;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-outline:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  text-decoration: none;
}
</style>
