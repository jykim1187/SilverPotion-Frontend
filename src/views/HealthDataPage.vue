<template>
  <div class="health-data-page">
    <div class="dependents-toggle-section">
      <div class="data-toggle">
        <v-btn small class="me-btn" :class="{ active: selectedUser === me }" @click="selectMyData">내 데이터</v-btn>
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
          <!-- 피보호자 연결 요청 버튼 -->
        </div>
        <v-btn small class="add-dependent-btn" icon @click="showLinkRequestModal = true">
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
      <HealthData :loginId="currentUserId" :type="selectedType" :targetDate="calculatedDate" :userName="selectedUserName" />
    </div>
    
    <!-- 피보호자 연결 요청 모달 -->
    <LinkRequest v-model="showLinkRequestModal" @input="handleModalChange" />
  </div>
</template>

<script>
import HealthData from '@/components/HealthData.vue';
import LinkRequest from '@/components/LinkRequest.vue';
import axios from 'axios';

export default {
  name: 'HealthDataPage',
  components: {
    HealthData,
    LinkRequest
  },
  data() {
    return { 
      me: localStorage.getItem('loginId') || '',
      selectedUser: localStorage.getItem('loginId') || '',
      selectedType: 'DAY',
      dependents: [],
      currentdependent: null,
      showLinkRequestModal: false,
      selectedUserName: localStorage.getItem('userName') || ''
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
    },
    calculatedDate() {
      const today = new Date();
      
      if (this.selectedType === 'DAY') {
        // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
        return today.toISOString().split('T')[0];
      } 
      else if (this.selectedType === 'WEEKAVG') {
        // 이번주 월요일 계산
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일 구하기
        const monday = new Date(today);
        monday.setDate(diff);
        return monday.toISOString().split('T')[0];
      } 
      else if (this.selectedType === 'MONTHAVG') {
        // 이번달 1일 계산
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return firstDay.toISOString().split('T')[0];
      }
      
      return today.toISOString().split('T')[0];
    }
  },
  methods: {
    selectMyData() {
      this.selectedUser = this.me;
      this.selectedUserName = localStorage.getItem('userName') || '';
    },
    selectdependent(dependent) {
      this.selectedUser = dependent.userId;
      this.selectedUserName = dependent.name;
    },
    handleModalChange(val) {
      this.showLinkRequestModal = val;
    }
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


