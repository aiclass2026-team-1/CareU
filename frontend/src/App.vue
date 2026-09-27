<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <span class="brand-title">Care U</span>
          <span class="brand-tag">Phase 3 Scaffold</span>
        </div>
        <nav class="nav-links">
          <RouterLink to="/" class="nav-item" active-class="active">占位首頁</RouterLink>
          <RouterLink to="/scaffold-verify" class="nav-item" active-class="active">路由驗證</RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <p>Care U Frontend Engineering Baseline &bull; Phase 3 Scaffold</p>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #07295c;
}

.brand-tag {
  font-size: 11px;
  background-color: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.nav-links {
  display: flex;
  gap: 16px;
}

.nav-item {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-item:hover {
  color: #0f172a;
  background-color: #f8fafc;
  text-decoration: none;
}

.nav-item.active {
  color: #197afc;
  background-color: #eff6ff;
  font-weight: 600;
}

.app-main {
  flex: 1;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 24px;
}

.app-footer {
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 16px 24px;
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}
</style>
