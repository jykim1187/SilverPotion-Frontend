<template>
  <v-app>
    <div class="app-wrapper">
      <div class="app-container">
        <HeaderComponent/>
        <v-main>
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

.v-main {
  padding-left: 16px !important;
  padding-right: 16px !important;
}

@media (max-width: 768px) {
  .v-main {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

@media (min-width: 769px) {
  .app-container {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  }
}
</style>
