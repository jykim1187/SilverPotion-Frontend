<template>
  <v-container>
    <div class="admin-dashboard">
      <h1 class="text-h4 mb-6">관리자 대시보드</h1>
      <div class="button-container">
        <v-btn
          color="primary"
          class="mb-4"
          block
          size="large"
          @click="$router.push('/silverpotion/admins/users')"
        >
          회원 관리
        </v-btn>
        <v-btn
          color="primary"
          class="mb-4"
          block
          size="large"
          @click="$router.push('/silverpotion/admins/report/list')"
        >
          신고 관리
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'AdminDashboard'
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nav-button {
  padding: 15px 30px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 16px;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #45a049;
}
</style>