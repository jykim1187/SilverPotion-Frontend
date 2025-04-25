<template>
  <div class="health-data-page">
    <!-- 뷰 전환 버튼을 최상단으로 이동 -->
    <div class="view-toggle-wrapper">
      <div class="toggle-buttons">
        <button 
          class="modern-tab-button" 
          :class="{ active: showHealthData }"
          @click="showHealthData = true">
          <v-icon left>mdi-chart-line</v-icon>
          건강 데이터
        </button>
        <button 
          class="modern-tab-button" 
          :class="{ active: !showHealthData }"
          @click="showHealthData = false">
          <v-icon left>mdi-file-document-outline</v-icon>
          건강 리포트
        </button>
      </div>
    </div>

    <div class="dependents-toggle-section">
      <div class="me-section">
        <v-btn small class="me-btn" :class="{ active: selectedUser === me }" @click="selectMyData">내 데이터</v-btn>
        <v-btn small class="add-btn2" icon @click="showLinkRequestModal = true" v-if="dependents.length === 0 && protectors.length === 0">
              <v-icon small>mdi-plus</v-icon>
            </v-btn>
      </div>
      
      <div class="lists-container">
        <!-- 피보호자 목록 섹션 -->
        <div class="list-section dependents-section" v-if="dependents.length > 0">
          <div class="list-header">
            <v-icon small color="primary" class="mr-1">mdi-account-child</v-icon>
            <span>피보호자</span>
          </div>
          <div class="list-content">
            <v-btn 
              v-for="dependent in dependents" 
              :key="dependent.userId" 
              small 
              class="dependent-btn" 
              :class="{ active: selectedUser === dependent.userId }"
              @click="selectdependent(dependent)">
              {{ dependent.name }}
            </v-btn>
            <v-btn small class="add-btn" icon @click="showLinkRequestModal = true">
              <v-icon small>mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
        
        <!-- 보호자 목록 섹션 -->
        <div class="list-section guardians-section" v-if="protectors.length > 0">
          <div class="list-header">
            <v-icon small color="primary" class="mr-1">mdi-account-tie</v-icon>
            <span>보호자</span>
          </div>
          <div class="list-content">
            <v-btn 
              v-for="protector in protectors" 
              :key="protector.userId" 
              small 
              class="guardian-btn" 
              :class="{ active: selectedUser === protector.userId }"
              @click="selectProtector(protector)">
              {{ protector.name }}
            </v-btn>
            <v-btn small class="add-btn" icon @click="showLinkRequestModal2 = true">
              <v-icon small>mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
    
    <div class="period-selection">
      <v-tabs v-model="selectedType" background-color="white" color="primary" grow>
        <v-tab value="DAY">실시간</v-tab>
        <v-tab value="WEEKAVG">주간 평균</v-tab>
        <v-tab value="MONTHAVG">월간 평균</v-tab>
      </v-tabs>
    </div>
    
    <!-- 헬스데이터 컴포넌트 호출  -->
    <div class="health-data-container" v-if="showHealthData">
      <HealthData :loginId="currentUserId" :type="selectedType"  :userName="selectedUserName" :userLongId="selectedLongId" />
    </div>
    
    <!-- 헬스리포트 컴포넌트 호출 -->
    <div class="health-report-container" v-else>
      <HealthReportComponent :loginId="currentUserId" :type="selectedType" :targetDate="calculatedDate" :userName="selectedUserName" :userLongId="selectedLongId" v-model:isFirstLoad="isFirstLoad" />
    </div>
    
    <!-- 피보호자 연결 요청 모달 -->
    <LinkRequest v-model="showLinkRequestModal" @input="handleModalChange" />
    <!-- 보호자 연결 요청 모달 -->
    <LinkRequestToProcteor v-model="showLinkRequestModal2" @input="handleModalChange2" />
  </div>
</template>

<script>
import HealthData from '@/components/HealthData.vue';
import HealthReportComponent from '@/components/HealthReportComponent.vue';
import LinkRequest from '@/components/LinkRequest.vue';
import LinkRequestToProcteor from '@/components/LinkRequestToProcteor.vue';
import axios from 'axios';

export default {
  name: 'HealthDataPage',
  components: {
    HealthData,
    HealthReportComponent,
    LinkRequest,
    LinkRequestToProcteor
  },
  data() {
    return { 
      me: localStorage.getItem('loginId') || '',
      selectedUser: localStorage.getItem('loginId') || '',
      selectedType: 'DAY',
      dependents: [],
      protectors: [],
      currentdependent: null,
      showLinkRequestModal: false,
      showLinkRequestModal2: false,
      selectedUserName: localStorage.getItem('userName'),
      selectedLongId: null,
      showHealthData: true, // 기본적으로 건강 데이터 화면 표시
      isFirstLoad: true
    }
  },
 async mounted() {
    // 내 피보호자 목록 받아오기 백엔드로부터
    const dependentData = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/myDependentList`);
    this.dependents = dependentData.data.result;
    console.log("피보호자", this.dependents);
    
    // 내 보호자 목록 받아오기 (API가 실제로 구현되어 있는지 확인 필요)
    try {
      const protectorData = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/myProtectList`);
      this.protectors = protectorData.data.result;
      console.log("보호자", this.protectors);
    } catch (error) {
      console.error("보호자 목록 가져오기 실패:", error);
      this.protectors = []; // 에러 시 빈 배열 할당
    }
  },
  computed: {
    currentUserId() {
      return this.selectedUser
    },
    calculatedDate() {
      const today = new Date();
      
      // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
      function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      if (this.selectedType === 'DAY') {
        // 실시간 선택 시, 건강 리포트 컴포넌트에는 어제 날짜, 건강 데이터 컴포넌트에는 오늘 날짜를 반환
        if (!this.showHealthData) {
          // 건강 리포트용 날짜 (어제)
          console.log("여기호출");
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate());
          return formatDateToYYYYMMDD(yesterday);
        } else {
          // 건강 데이터용 날짜 (오늘)
          return formatDateToYYYYMMDD(today);
        }
      } 
      else if (this.selectedType === 'WEEKAVG') {
        // 이번주 월요일 계산
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일 구하기
        const monday = new Date(today);
        monday.setDate(diff);
        
        if (this.showHealthData) {
          // 건강 데이터용 날짜 (이번주 월요일)
          const nextMonday = new Date(monday);
          nextMonday.setDate(nextMonday.getDate() + 7);
          return formatDateToYYYYMMDD(nextMonday);
        } else {
          // 건강 리포트용 날짜 (지난주 월요일)
          const lastMonday = new Date(monday);
          lastMonday.setDate(lastMonday.getDate() - 7);
          return formatDateToYYYYMMDD(lastMonday);
        }
      } 
      else if (this.selectedType === 'MONTHAVG') {
        // 이번달 1일
        // const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (this.showHealthData) {
          // 건강 데이터용 날짜 (이번달 1일)
          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          return formatDateToYYYYMMDD(nextMonth);
        } else {
          // 건강 리포트용 날짜 (지난달 1일)
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          return formatDateToYYYYMMDD(lastMonth);
        }
      }
      
      return formatDateToYYYYMMDD(today);
    }
  },
  watch: {
    // showHealthData가 변경될 때 (건강 데이터/건강 리포트 전환 시)
    showHealthData() {
      // selectedType이 비어있거나 변경 중이면 변경 생략
      if (!this.selectedType) return;
      
      // 여기서는 실제로 타입을 바꾸진 않고, 단지 탭 전환 여부 플래그만 설정
      // 컴포넌트에 플래그를 전달하여 컴포넌트 내부에서 처리하도록 함
      this.isFirstLoad = this.selectedType === 'DAY';
      
      // 기존 로직 대신 이벤트 전달 방식으로 변경
      this.$nextTick(() => {
        const event = new CustomEvent('tab-changed', {
          detail: { 
            showHealthData: this.showHealthData,
            selectedType: this.selectedType
          }
        });
        window.dispatchEvent(event);
      });
    },
    selectedType(newVal) {
      if(newVal === 'DAY'){
        this.isFirstLoad = true;
      }
      else{
        this.isFirstLoad = false;
      }
    },
  },
  methods: {
    selectMyData() {
      this.selectedUser = this.me;
      this.selectedUserName = localStorage.getItem('userName') || '';
      this.selectedLongId = null;
    },
    selectdependent(dependent) {
      this.selectedUser = dependent.loginId;
      this.selectedLongId = dependent.userId;
      this.selectedUserName = dependent.name;
    },
    selectProtector(protector) {
      this.selectedUser = protector.loginId;
      this.selectedLongId = protector.userId;
      this.selectedUserName = protector.name;
    },
    handleModalChange(val) {
      this.showLinkRequestModal = val;
    },
    handleModalChange2(val) {
      this.showLinkRequestModal2 = val;
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

.view-toggle-wrapper {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.toggle-buttons {
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.modern-tab-button {
  min-width: 150px;
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.modern-tab-button.active {
  background: linear-gradient(135deg, #3f51b5, #5c6bc0);
  color: white;
  box-shadow: 0 5px 15px rgba(63, 81, 181, 0.3);
}

.modern-tab-button:hover:not(.active) {
  background: #f5f5f5;
  color: #333;
}

.view-toggle-container {
  display: none; /* 기존 컨테이너 숨김 */
}

.dependents-toggle-section {
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.me-section {
  margin-bottom: 15px;
}

.lists-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.list-section {
  border-radius: 10px;
  background-color: #f9f9f9;
  padding: 10px 15px;
}

.dependents-section {
  border-left: 4px solid #4caf50; /* 피보호자 섹션은 초록색 */
}

.guardians-section {
  border-left: 4px solid #2196f3; /* 보호자 섹션은 파란색 */
}

.list-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.list-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.me-btn, .dependent-btn, .guardian-btn, .add-btn {
  border-radius: 20px;
}

.me-btn.active, .dependent-btn.active, .guardian-btn.active {
  background-color: #3f51b5;
  color: white;
}

.me-btn {
  font-weight: bold;
  background-color: #e0e0e0;
}

.dependent-btn {
  background-color: #e8f5e9; /* 연한 초록색 배경 */
}

.guardian-btn {
  background-color: #e3f2fd; /* 연한 파란색 배경 */
}

.add-btn {
  min-width: 30px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e0e0e0;
}

.add-btn2 {
  min-width: 30px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-left: 20px;
}

.period-selection {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.health-data-container, .health-report-container {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* 모바일 대응 */
@media (min-width: 768px) {
  .lists-container {
    flex-direction: row;
    gap: 20px;
  }
  
  .list-section {
    flex: 1;
  }
}
</style>


