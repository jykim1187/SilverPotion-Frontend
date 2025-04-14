<template>
  <div class="health-data-page">
    <div class="dependents-toggle-section">
      <div class="data-toggle">
        <v-btn small class="me-btn" :class="{ active: selectedUser === 'me' }" @click="selectedUser = 'me'">내 데이터</v-btn>
        <!-- 상단 피보호자 목록 -->
        <div class="dependents-list" v-if="dependents.length > 0">
          <v-btn 
            v-for="dependent in dependents" 
            :key="dependent.userId" 
            small 
            class="dependent-btn" 
            :class="{ active: selectedUser === dependent.userId }"
            @click="selectdependent(dependent)">
            {{ dependent.name }}
          </v-btn>
        </div>
        <v-btn small class="add-dependent-btn" icon>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </div>
    
    <div class="period-selection">
      <v-tabs v-model="selectedType" background-color="white" color="primary" grow>
        <v-tab value="DAY">실시간</v-tab>
        <v-tab value="WEEKAVG">주간 평균</v-tab>
        <v-tab value="MONTHAVG">월간 평균</v-tab>
      </v-tabs>
    </div>
    <!-- 헬스데이터 컴포넌트 호출 -->
    <div class="health-data-container">
      <HealthData :loginId="currentUserId" :type="selectedType" />
    </div>
  </div>
</template>

<script>
import HealthData from '@/components/HealthData.vue';
import axios from 'axios';

export default {
  name: 'HealthDataPage',
  components: {
    HealthData
  },
  data() {
    return { 
      selectedUser: localStorage.getItem('loginId') || '',
      selectedType: 'DAY',
      dependents: [],
      currentdependent: null
    }
  },
 async mounted() {
    // 내 피보호자 목록 받아오기 백엔드로부터
    const dependentData = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/myDependentList`);
    this.dependents = dependentData.data.result;
    console.log(this.dependents);
  },
  computed: {
    currentUserId() {
      return this.selectedUser
    }
  },
  methods: {
    selectdependent(dependent) {
      this.selectedUser = dependent.userId;
    },
  },
}
</script>

<style scoped>
.health-data-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dependents-toggle-section {
  background-color: white;
  border-radius: 12px;
  padding: 10px 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-toggle {
  display: flex;
  align-items: center;
  overflow-x: auto;
  white-space: nowrap;
  padding: 2px;
}

.me-btn, .dependent-btn, .add-dependent-btn {
  margin-right: 8px;
  border-radius: 20px;
}

.me-btn.active, .dependent-btn.active {
  background-color: #3f51b5;
  color: white;
}

.me-btn {
  font-weight: bold;
}

.add-dependent-btn {
  min-width: 36px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e0e0e0;
}

.dependents-list {
  display: flex;
  margin-left: 8px;
}

/* .profile-section {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-container {
  display: flex;
  align-items: center;
}

.profile-avatar {
  margin-right: 20px;
  border: 3px solid #3f51b5;
}

.profile-info {
  display: flex;
  flex-direction: column;
} */

.user-id {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #333;
}

.user-status {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.period-selection {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.health-data-container {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>


