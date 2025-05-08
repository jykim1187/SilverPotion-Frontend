<template>
  <div class="health-data-page">
    <!-- 내 건강프로필 작성하기 버튼 -->
    <div class="health-profile-button-container">
      <v-btn
        class="health-profile-btn"
        @click="goToHealthProfile"
        elevation="2"
        color="warning"
      >
        <v-icon left>mdi-file-document-edit</v-icon>
        <span class="profile-btn-text">건강프로필</span>
      </v-btn>
    </div>
    
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
      </div>
      
      <div class="lists-container">
        <!-- 피보호자 목록 섹션 - 항상 표시 -->
        <div class="list-section dependents-section">
          <div class="list-header">
            <v-icon small color="primary" class="mr-1">mdi-account-child</v-icon>
            <span>피보호자</span>
          </div>
          <div class="list-content">
            <div v-if="dependents.length === 0" class="empty-list-message">
              피보호자가 없습니다
            </div>
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
        
        <!-- 보호자 목록 섹션 - 항상 표시 -->
        <div class="list-section guardians-section">
          <div class="list-header">
            <v-icon small color="primary" class="mr-1">mdi-account-tie</v-icon>
            <span>보호자</span>
          </div>
          <div class="list-content">
            <div v-if="protectors.length === 0" class="empty-list-message">
              보호자가 없습니다
            </div>
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
    
    <!-- 소모임 추천 섹션 -->
    <div class="group-recommendation-container" v-if="showHealthData && selectedUser === me">
      <div class="recommendation-header">
        <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
        <h3>소모임 추천</h3>
      </div>
      <div class="recommendation-content">
        <v-btn 
          class="recommendation-btn" 
          color="primary" 
          elevation="2"
          @click="showGroupModal = true"
        >
          <v-icon left>mdi-star</v-icon>
          소모임 추천받기
        </v-btn>
        <p class="recommendation-desc">건강 데이터를 기반으로 나에게 맞는 모임을 추천받아보세요!</p>
      </div>
    </div>
    
    <!-- 피보호자 연결 요청 모달 -->
    <LinkRequest v-model="showLinkRequestModal" @input="handleModalChange" />
    <!-- 보호자 연결 요청 모달 -->
    <LinkRequestToProcteor v-model="showLinkRequestModal2" @input="handleModalChange2" />
    
    <!-- 소모임 추천 모달 -->
    <v-dialog v-model="showGroupModal" max-width="700">
      <v-card class="group-modal">
        <v-card-title class="modal-title position-relative">
          <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
          소모임 추천
          <v-btn icon class="close-btn" @click="showGroupModal = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text>
          <!-- 나와 잘 맞는 모임 추천 섹션 -->
          <div class="recommendation-section similar-section">
            <div class="section-header">
              <v-icon color="success" class="mr-2">mdi-account-multiple-check</v-icon>
              <h3>나와 잘 맞는 모임 추천</h3>
            </div>
            
            <v-carousel
              hide-delimiter-background
              show-arrows="hover"
              height="500"
              cycle
              :continuous="false"
              class="carousel-custom"
              v-if="similarGroups.length > 0"
            >
              <v-carousel-item
                v-for="(group, index) in similarGroups"
                :key="'similar-'+index"
              >
                <v-card outlined class="group-card mx-auto" :class="{'top-ranked': index === 0}" max-width="500">
                  <div class="rank-badge" v-if="index < 5">{{ index + 1 }}위</div>
                  <v-img 
                    :src="group.imageUrl || require('@/assets/default-gathering-main.png')" 
                    height="200" 
                    contain
                  ></v-img>
                  <v-card-title>{{ group.gatheringName }}</v-card-title>
                  <v-card-subtitle>
                    <v-chip color="primary" small class="mr-2 mb-2">{{ group.category }}</v-chip>
                    <div class="detail-category mt-1">
                      <span v-for="(detail, i) in group.detailCategory" :key="i">
                        <v-chip x-small outlined color="primary" class="mr-1 mb-1">{{ detail }}</v-chip>
                      </span>
                    </div>
                  </v-card-subtitle>
                  <v-card-text>
                    <p class="group-description">{{ group.introduce }}</p>
                    <div class="group-meta">
                      <v-chip small color="primary" class="mr-2">{{ group.region }}</v-chip>
                      <v-chip small color="info">{{ group.peopleCount }}/{{ group.maxPeople }}명</v-chip>
                    </div>
                  </v-card-text>
                  <v-card-actions class="action-container">
                    <v-spacer></v-spacer>
                    <v-btn 
                      text 
                      color="primary"
                      @click.stop="goToGatheringDetail(group.id)"
                      class="detail-btn clickable-btn"
                    >
                      자세히 보기
                      <v-icon small right>mdi-arrow-right</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-carousel-item>
            </v-carousel>
            
            <div v-if="similarGroups.length === 0" class="no-data-message">
              <v-icon large color="grey lighten-1">mdi-emoticon-sad-outline</v-icon>
              <p>추천할 모임이 없습니다</p>
            </div>
          </div>
          
          <!-- 색다른 모임 추천 섹션 -->
          <div class="recommendation-section different-section mt-6">
            <div class="section-header">
              <v-icon color="info" class="mr-2">mdi-lightbulb-on</v-icon>
              <h3>이런 모임은 어때요?</h3>
            </div>
            
            <v-row>
              <v-col cols="12" sm="4" v-for="(group, index) in differentGroups" :key="'different-'+index">
                <v-card outlined class="group-card-small" hover>
                  <v-img :src="require('@/assets/default-gathering-main.png')" height="120" contain></v-img>
                  <v-card-title class="subtitle-1">{{ group.gatheringName }}</v-card-title>
                  <v-card-subtitle class="caption">{{ group.category }}</v-card-subtitle>
                  <v-card-text class="card-text-small">
                    <p class="group-description-small">{{ group.introduce }}</p>
                  </v-card-text>
                  <v-card-actions class="action-container">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" x-small @click="goToGatheringDetail(group.id)" class="detail-btn">
                      자세히 보기
                      <v-icon x-small right>mdi-arrow-right</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
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
      isFirstLoad: true,
      selectedProfileBtn: 4, // 기본 선택된 프로필 버튼 (4번 버전 고정)
      
      // 소모임 추천 관련 데이터
      showGroupModal: false,
      similarGroups: [],
      differentGroups: []
    }
  },
 async mounted() {
  try {
        //모바일데이터 요청
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/health/dataFromApp`);
        console.log(response);
      } catch (error) {
        console.error("모바일 데이터 가져오기 실패:", error);
      }  
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
    showGroupModal(newVal){
      if(newVal === true){
        this.bringGroupData();
      }
    }
  },
  methods: {
    goToHealthProfile() {
      this.$router.push('/silverpotion/userhealthinfodetail');
    },
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
    },
    async bringGroupData(){
      const groupData = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/recommend/fivegatherings`);
      this.similarGroups = groupData.data.result.similar;
      this.differentGroups = groupData.data.result.different;
    
    },
    goToGatheringDetail(gatheringId) {
      this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
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
  position: relative;
}

/* 건강 프로필 버튼 컨테이너 */
.health-profile-button-container {
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.health-profile-btn {
  background: linear-gradient(135deg, #00c2ff, #12c0f5);
  color: white;
  transition: all 0.3s ease;
  border-radius: 20px;
  padding: 0 16px;
  height: 36px;
  text-transform: none;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 3px 5px rgba(4, 183, 238, 0.3);
}

/* 모든 버튼 공통 hover 효과 */
.health-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(4, 183, 238, 0.4);
}

/* 모바일 설정 - 작은 화면에서는 아이콘만 표시 */
@media (max-width: 768px) {
  .profile-btn-text {
    display: none;
  }
  
  .health-profile-btn {
    min-width: 36px !important;
    width: 36px;
    padding: 0;
    border-radius: 50%;
  }
}

.view-toggle-wrapper {
  margin-top: 40px; /* 프로필 버튼 공간 확보 */
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
  display: none; 
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

.empty-list-message {
  color: #9e9e9e;
  font-size: 0.85rem;
  font-style: italic;
  padding: 4px 0;
  flex-grow: 1;
}

.list-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 40px;
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
  margin-left: auto;
}

.add-btn2 {
  display: none; /* 이제 필요 없음 */
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

/* 소모임 추천 섹션 스타일 */
.group-recommendation-container {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.group-recommendation-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recommendation-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.recommendation-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.recommendation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.recommendation-btn {
  margin-bottom: 15px;
  min-width: 200px;
  height: 45px;
  border-radius: 30px;
  text-transform: none;
  font-weight: 600;
  font-size: 1rem;
  background: linear-gradient(135deg, #3f51b5, #5c6bc0);
  transition: all 0.3s ease;
}

.recommendation-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(63, 81, 181, 0.3);
}

.recommendation-desc {
  color: #666;
  text-align: center;
  font-size: 0.95rem;
  max-width: 400px;
  margin: 0 auto;
}

/* 모달 스타일 */
.group-modal .modal-title {
  background-color: #f5f7fa;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

.close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.group-card {
  position: relative;
  height: 100%;
  transition: all 0.3s ease;
  overflow: hidden;
  margin: 0 auto;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.group-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.rank-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #4caf50;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 2;
}

.rank-second {
  background-color: #2196f3;
}

.rank-badge:nth-child(1) {
  background-color: #f44336; /* 1위 - 빨강 */
}

.rank-badge:nth-child(2) {
  background-color: #ff9800; /* 2위 - 주황 */
}

.rank-badge:nth-child(3) {
  background-color: #ffc107; /* 3위 - 노랑 */
}

.rank-badge:nth-child(4) {
  background-color: #8bc34a; /* 4위 - 연두 */
}

.rank-badge:nth-child(5) {
  background-color: #03a9f4; /* 5위 - 파랑 */
}

.detail-category {
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
}

.group-description {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.group-card-small {
  height: 100%;
  transition: all 0.3s ease;
}

.card-text-small {
  padding-top: 0;
}

.group-description-small {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .recommendation-content {
    padding: 10px 0;
  }
  
  .recommendation-btn {
    min-width: 180px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .recommendation-desc {
    font-size: 0.85rem;
  }
}

.carousel-custom {
  position: relative;
}

.carousel-custom .v-window__prev, 
.carousel-custom .v-window__next {
  margin-top: -60px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  z-index: 1;
}

.action-container {
  padding-bottom: 20px;
  padding-right: 16px;
  margin-top: 10px;
}

.detail-btn {
  height: auto !important;
  padding: 8px 16px !important;
  border-radius: 20px;
  white-space: nowrap;
  min-width: 110px;
  margin-bottom: 8px !important;
}

.clickable-btn {
  position: relative;
  z-index: 10;
  pointer-events: auto !important;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #9e9e9e;
}

.no-data-message p {
  margin-top: 16px;
}
</style>


