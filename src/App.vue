<template>
  <v-app>
    <div class="app-wrapper">
      <div class="app-container">
        <div class="header-section">
          <HeaderComponent/>
        </div>
        <v-main class="main-section">
          <router-view/>
        </v-main>
      </div>
    </div>
  </v-app>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue'
export default {
  name: 'App',
  components: {
    HeaderComponent
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #ffffff;
}

.app-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
}

.app-container {
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  background-color: #ffffff;
}

.header-section {
  width: 100%;
  position: relative;
  z-index: 1;
}

.main-section {
  width: 100%;
  position: relative;
  z-index: 0;
  margin-top: 56px; /* HeaderComponent의 높이만큼 마진 추가 */
}

.main-content {
  margin-top: 60px; /* HeaderComponent의 높이에 맞게 조정 */
  padding-left: 16px !important;
  padding-right: 16px !important;
}

@media (max-width: 768px) {
  .main-content {
    margin-top: 50px; /* 모바일에서의 간격 조정 */
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

@media (min-width: 769px) {
  .app-container {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  }
}

.v-main {
  padding: 0 !important;
}
</style>
