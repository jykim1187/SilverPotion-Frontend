<template>
  <div class="health-report">
    <div class="report-header">
      <div class="title-section">
        <div class="user-profile" @click="showUserProfile">
          <img :src="profileImage" class="profile-image" alt="User Profile">
        </div>
        <h1 @click="showUserProfile" class="user-name-title">{{ userName }} 님의 건강 리포트</h1>
      </div>
      
      <!-- 날짜 선택 -->
      <div class="date-controls">
        <div class="date-picker-section">
          <v-icon @click="toggleDatePicker" class="calendar-icon">mdi-calendar</v-icon>
          <div class="date-picker-container" v-show="showDatePicker">
            <DatePickerRange :type="type" @handleDateChange="handleDateChange" :max-date="maxDate" :isHealthData="false" />
          </div>
        </div>
        <div class="date-section">
          <v-chip outlined color="black" class="date-chip">
            {{ this.period }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- 데이터 없음 메시지 -->
    <div v-if="noDataMessage" class="no-data-message">
      <v-alert type="info" text>
        {{ noDataMessage }}
      </v-alert>
    </div>

    <!-- 미니멀 디자인 -->
    <div class="report-container minimal">
      <div class="minimal-header">
        <div class="minimal-title" v-if="type === 'DAY'">일일 건강 리포트</div>
        <div class="minimal-title" v-if="type === 'WEEKAVG'">주간 건강 리포트</div>
        <div class="minimal-title" v-if="type === 'MONTHAVG'">월간 건강 리포트</div>
        <div class="minimal-subtitle">{{ userName }} | {{ this.period }}</div>
      </div>

      <div class="minimal-divider"></div>

      <div class="minimal-section">
        <div class="minimal-section-title">요약</div>
        <p class="minimal-paragraph">{{ parsedData["전반적인 요약"] }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">걸음</div>
        <p class="minimal-paragraph">{{ parsedData["걸음"] }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">심장 박동</div>
        <p class="minimal-paragraph">{{ parsedData["심박수"] }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">소모 칼로리</div>
        <p class="minimal-paragraph">{{ parsedData["소모칼로리"] }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">수면</div>
        <p class="minimal-paragraph">{{ parsedData["수면"] }}</p>
      </div>
    </div>
  </div>

  <!-- 사용자 프로필 모달 -->
  <v-dialog v-model="showUserProfileModal" max-width="400" content-class="profile-dialog">
    <v-card flat class="profile-card">
      <v-card-actions class="profile-dialog-close">
        <v-spacer></v-spacer>
        <v-btn icon @click="showUserProfileModal = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
      <v-card-text class="pa-0">
        <UserProfileComponent 
          :loginId="loginId" 
          :userName="userName"
          :userLongId="userLongId"
          :parentType="parentType"
          @start-text-chat="handleStartTextChat"
          @start-video-chat="handleStartVideoChat"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import DatePickerRange from "@/components/DatePickerRange.vue";
import UserProfileComponent from "@/components/UserProfileComponet.vue";
import axios from 'axios';

export default {
  name: 'HealthReportComponent',
  components: {
    DatePickerRange,
    UserProfileComponent
  },
  props: {
    loginId: String,
    type: String,
    userName: String,
    userLongId: Number,
    targetDate: String,
    isFirstLoad: Boolean,
  },
  data() {
    return {
      profileImage : '',
      currentDate: '',
      showDatePicker: false,
      reportData: "",
      parsedData: "",
      showUserProfileModal: false,
      // 유저프로필 컴포넌트에 부모 컴포넌트의 타입을 전달하기 위한 용도
      parentType: 'healthData',
      // 선택된 날짜를 저장할 내부 상태 추가
      selectedDate: "",
      period : "",
      isRequestPending: false, // 요청 중복 방지 플래그 추가
      noDataMessage: '', // 데이터 없음 메시지
    }
  },
  computed: {
    
   
    formattedCurrentDate() {
      if (!this.selectedDate) return '';
    
      if (this.type === 'DAY' && this.isFirstLoad) {
      const yesterday = new Date(this.selectedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      return `${yesterday.getFullYear()}년 ${yesterday.getMonth() + 1}월 ${yesterday.getDate()}일`;
    }
      if(this.type === 'DAY'){
        const date = new Date(this.selectedDate);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      }
      else if(this.type === 'WEEKAVG'){
        const date = new Date(this.selectedDate);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      }
      else if(this.type === 'MONTHAVG'){
        const date = new Date(this.selectedDate);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
      }
      else{
        return '';
      }
    },
    reportTypeText() {
      switch(this.type) {
        case 'DAY': return '일일';
        case 'WEEKAVG': return '주간';
        case 'MONTHAVG': return '월간';
        default: return '일일';
      }
    },
    maxDate() {
      const today = new Date();
      
      // 일일 리포트: 오늘까지 조회 가능 (건강데이터와 동일)
      if (this.type === 'DAY') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      }
      // 주간 평균: 저번 주까지만 조회 가능 (건강데이터와 동일)
      else if (this.type === 'WEEKAVG') {
        const lastWeek = new Date(today);
        const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
        const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
        lastWeek.setDate(today.getDate() - daysToLastSunday);
        return lastWeek;
      }
      // 월간 평균: 이번 달까지만 조회 가능 (건강데이터와 동일)
      else if (this.type === 'MONTHAVG') {
        // 월간 평균은 저번 달까지만 선택 가능
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return lastMonth;
      // const thisMonthFirstDay = new Date();
      // thisMonthFirstDay.setDate(1);
      // return thisMonthFirstDay;
      }
      
      return today;
    }
  },

  methods: {
    // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
    formatDateToYYYYMMDD(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    // 탭 변경 이벤트 처리
    handleTabChange(event) {
      // 헬스 리포트 탭으로 변경되었을 때만 처리
      if (!event.detail.showHealthData) {
        console.log("헬스 리포트 탭으로 변경됨, 데이터 요청 준비");
        // 기존 요청 플래그 초기화 (새로운 탭으로 전환되었으므로)
        this.isRequestPending = false;
        
        // 데이터를 다시 요청하지 않고, 컴포넌트가 targetDate 등을 통해
        // 필요한 데이터를 받고 내부적으로 처리하도록 함
      }
    },
    
    toggleDatePicker() {
      this.showDatePicker = !this.showDatePicker;
    },
    
    handleDateChange(dateRange) {
      if (dateRange && dateRange !== 'NaN-NaN-NaN' && dateRange.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log('선택된 날짜:', dateRange);
        
        // DatePickerRange에서 이미 적절한 날짜 변환이 이루어졌으므로 
        // 그대로 currentDate에 저장하고 UI용 selectedDate도 설정
        this.currentDate = dateRange;
        
        // MONTHAVG 타입인 경우 UI 표시를 위해 선택한 월의 1일로 설정
        if (this.type === 'MONTHAVG') {
          const date = new Date(dateRange);
          // 선택된 날짜가 다음달 1일이므로 한 달 이전으로 설정 (UI 표시용)
          date.setMonth(date.getMonth() - 1);
          this.selectedDate = this.formatDateToYYYYMMDD(date);
        } else if (this.type === 'WEEKAVG') {
          // 선택된 날짜가 다음주 월요일이므로 1주일 이전으로 설정 (UI 표시용)
          const date = new Date(dateRange);
          date.setDate(date.getDate() - 7);
          this.selectedDate = this.formatDateToYYYYMMDD(date);
        } else if (this.type === 'DAY') {
          // 선택된 날짜가 다음날이므로 1일 이전으로 설정 (UI 표시용)
          const date = new Date(dateRange);
          date.setDate(date.getDate() - 1);
          this.selectedDate = this.formatDateToYYYYMMDD(date);
        } else {
          this.selectedDate = dateRange;
        }
        
        this.$emit('update:isFirstLoad', false);

        this.showDatePicker = false;
        this.fetchReportDataOnce();
      } else {
        console.error('유효하지 않은 날짜 형식:', dateRange);
      }
    },
    
    // API 호출을 한 번만 수행하는 메소드
    fetchReportDataOnce() {
      // API 호출 중복 방지 플래그가 없으면 요청 수행
      if (!this.isRequestPending) {
        this.isRequestPending = true;
        
        // 데이터 요청
        this.fetchReportData().finally(() => {
          // 요청 완료 후 플래그 초기화 (일정 시간 후에)
          // setTimeout(() => {
          //   this.isRequestPending = false;
          // }, 500);
          this.isRequestPending = false;
        });
      } else {
        console.log("요청이 이미 진행 중입니다");
      }
    },
    
    async fetchReportData() {
      // 필수 데이터가 없으면 요청하지 않음
      if (!this.loginId || !this.type || !this.currentDate) {
        console.log("필요한 데이터가 없어 리포트 요청을 보내지 않습니다:", {
          loginId: this.loginId,
          type: this.type,
          date: this.currentDate
        });
        return;
      }
      
      const dto = {
        "loginId": this.loginId,
        "type": this.type,
        "date": this.currentDate
      };
      
      console.log("리포트 요청 데이터:", dto);
      
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/gptchat/allInOneReport`, dto);
        console.log("리포트 응답:", response.data.result);
        this.reportData = response.data.result.text;
        this.parsedData = JSON.parse(this.reportData);
        this.period = response.data.result.period;
        this.profileImage = response.data.result.imgUrl;
        this.noDataMessage = ''; // 성공 시 메시지 초기화
      } catch(error) {
        console.error("리포트 데이터 가져오기 실패:", error);
        
        // 기본 데이터 설정 (빈 데이터)
        this.initEmptyData();
        
        // 에러 메시지 표시
        if(this.type === 'DAY'){
          this.noDataMessage = `${this.period} 데이터가 없습니다.`;
        }
        else if(this.type === 'WEEKAVG'){
          console.log('피리오드',this.period);
          const weekFormatted = this.convertDateToYearMonthWeek(this.currentDate);
          this.noDataMessage = `${weekFormatted} 데이터가 없습니다.`;
          this.period = weekFormatted;
        }
        else if(this.type === 'MONTHAVG'){
          this.noDataMessage = `${this.period} 데이터가 없습니다.`;
        }
      }
    },
 //몇월 몇주차로 리턴
    convertDateToYearMonthWeek(date1) {
      const date = new Date(date1);
  date.setDate(date.getDate() - 7); // 🔥 전주 월요일로 이동

  // 첫 목요일 구하기
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0: 일 ~ 6: 토
  const firstThursday = new Date(date.getFullYear(), date.getMonth(),
    firstDayWeekday <= 4 ? 1 + (4 - firstDayWeekday) : 1 + (7 - firstDayWeekday) + 4
  );

  // 🔥 첫 목요일 기준으로 year, month 고정!
  const fixedYear = firstThursday.getFullYear();
  const fixedMonth = firstThursday.getMonth() + 1;

  // 주차 계산
  const diffDays = (date - firstThursday) / (1000 * 60 * 60 * 24);
  const weekNumber = diffDays < 0 ? 1 : Math.floor(diffDays / 7) + 2;

  return `${fixedYear}년 ${fixedMonth}월 ${weekNumber}주차`;
            },

    // 데이터가 없을 때 기본 데이터 설정
    initEmptyData() {
      const emptyReportData = {
        "전반적인 요약": "데이터가 없습니다.",
        "걸음": "걸음 데이터가 없습니다.",
        "심박수": "심박수 데이터가 없습니다.",
        "소모칼로리": "소모 칼로리 데이터가 없습니다.",
        "수면": "수면 데이터가 없습니다."
      };
      
      this.parsedData = emptyReportData;
      this.period = this.formattedCurrentDate;
    },

    // 사용자 프로필 표시
    showUserProfile() {
      if(this.loginId === localStorage.getItem("loginId")){
        this.showUserProfileModal = false;
      }
      else{
        this.showUserProfileModal = true;
        console.log(this.userLongId)
      }
    },
    
    // 채팅 관련 이벤트 핸들러
    handleStartTextChat(userId) {
      console.log(`${userId}와의 1:1 채팅 시작`);
      // 채팅 페이지로 이동하거나 채팅 기능 실행
      this.showUserProfileModal = false;
    },
    
    handleStartVideoChat(userId) {
      console.log(`${userId}와의 화상 채팅 시작`);
      // 화상 채팅 기능 실행
      this.showUserProfileModal = false;
    },
   
    // 사용자 프로필 이미지 가져오기
    async getUserProfileImage() {
      const dto = {
        "loginId": this.loginId
      };
      const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/whatisyourpicture`, dto);
      console.log('프로필',response);
      this.profileImage = response.data.result;
    },
  },
  mounted() {
    if (this.targetDate && this.type) {
      // 처음 마운트 시 targetDate와 type이 있으면 초기화
      this.currentDate = this.targetDate;
      this.selectedDate = this.targetDate;
      
      // 첫 로드 시 데이터 요청
      this.fetchReportDataOnce();
    }
    // 사용자 프로필 이미지 가져오기
    this.getUserProfileImage();
    
    // 탭 변경 이벤트 리스너 등록
    window.addEventListener('tab-changed', this.handleTabChange);
  },
  beforeUnmount() {
    // 컴포넌트 제거 시 이벤트 리스너 제거
    window.removeEventListener('tab-changed', this.handleTabChange);
  },
  watch: {
    loginId() {
      if (this.currentDate && this.type) {
        this.fetchReportDataOnce();
      }
    },
    // targetDate 감시
    targetDate(newVal) {
      if (newVal && this.type) {
        // targetDate가 변경되면 currentDate 업데이트
        console.log("targetDate 변경됨:", newVal);
        this.currentDate = newVal;
        this.selectedDate = newVal;
        // 데이터 요청은 type 변경시에만 하므로 여기서는 하지 않음
      }
    },
    // type 감시
    type(newVal, oldVal) {
      // 이미 실행 중이거나, oldVal이 없을 때(초기화 중일 때)는 실행하지 않음
      if (!newVal || (oldVal === undefined || oldVal === '')) {
        return;
      }
      
      const today = new Date();
      
      if (newVal === 'DAY') {
        // 실시간 - 오늘 날짜로 초기화
        this.currentDate = this.formatDateToYYYYMMDD(today);
        this.selectedDate = this.formatDateToYYYYMMDD(today);
      } 
      else if (newVal === 'WEEKAVG') {
        // 주간 평균 - 이번주 월요일로 초기화
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(today);
        monday.setDate(diff);
        // 지난주 월요일 계산 (리포트용)
        const lastMonday = new Date(monday);
        lastMonday.setDate(monday.getDate());
        
        this.currentDate = this.formatDateToYYYYMMDD(lastMonday);
        this.selectedDate = this.formatDateToYYYYMMDD(lastMonday);
      }
      else if (newVal === 'MONTHAVG') {
        // 월간 평균 - 지난달 1일로 초기화 (리포트용)
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);
        
        this.currentDate = this.formatDateToYYYYMMDD(nextMonth);
        this.selectedDate = this.formatDateToYYYYMMDD(nextMonth);
      }
      
      // 데이터 로드
      this.fetchReportDataOnce();
    }
  }
}
</script>

<style scoped>
/* 공통 스타일 */
.health-report {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 12px;
  width: 100%;
  overflow-x: hidden;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 12px 12px 0 0;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.title-section {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-profile {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  border: 2px solid white;
  transition: transform 0.3s ease;
}

.user-profile:hover {
  transform: scale(1.05);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.date-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 사용자 이름 제목 스타일 */
.user-name-title {
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  font-size: 1.5rem;
}

.user-name-title:hover {
  color: #3f51b5;
}

.user-name-title::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #3f51b5;
  transition: width 0.3s ease;
}

.user-name-title:hover::after {
  width: 100%;
}

.date-picker-section {
  position: relative;
  margin-left: 20px;
  z-index: 9999;
}

.calendar-icon {
  cursor: pointer;
  font-size: 24px;
  color: #333;
}

.date-picker-container {
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 9999;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 8px;
}

.date-section {
  display: flex;
  align-items: center;
}

.date-chip {
  font-size: 0.9rem;
  padding: 0 16px;
  color: #333;
  border-color: #333;
}

.design-selector {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.report-container {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* 미니멀 디자인 스타일 */
.minimal {
  padding: 25px;
  background-color: white;
  color: #333;
  max-width: 100%;
  margin: 0 auto;
}

.minimal-header {
  text-align: center;
  margin-bottom: 25px;
}

.minimal-title {
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.minimal-subtitle {
  font-size: 0.9rem;
  color: #757575;
  font-weight: 400;
}

.minimal-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 25px 0;
}

.minimal-section {
  margin-bottom: 30px;
}

.minimal-section-title {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 16px;
  position: relative;
  display: inline-block;
}

.minimal-section-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #333;
}

.minimal-paragraph {
  line-height: 1.7;
  font-size: 1rem;
  color: #505050;
}

.minimal-recommendations {
  margin-top: 16px;
}

.minimal-recommendation {
  margin-bottom: 16px;
  display: flex;
  align-items: baseline;
}

.minimal-recommendation-number {
  font-size: 0.8rem;
  font-weight: 600;
  color: #757575;
  margin-right: 12px;
  opacity: 0.7;
}

.minimal-recommendation-text {
  line-height: 1.6;
  color: #505050;
}

/* 프로필 모달 스타일 */
.profile-dialog-close {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}

.profile-card {
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.profile-dialog {
  border-radius: 8px !important;
  overflow: visible !important;
}

.no-data-message {
  margin-bottom: 20px;
  width: 100%;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .report-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }
  
  .title-section {
    margin-bottom: 15px;
    width: 100%;
  }
  
  .date-picker-section {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .date-section {
    margin-top: 10px;
  }
  
  .user-name-title {
    font-size: 1.3rem;
  }
  
  .minimal {
    padding: 20px 15px;
  }
  
  .minimal-title {
    font-size: 1.5rem;
  }
  
  .minimal-section-title {
    font-size: 1.1rem;
  }
  
  .minimal-paragraph {
    font-size: 0.95rem;
    line-height: 1.6;
  }
}

@media (max-width: 480px) {
  .minimal-title {
    font-size: 1.3rem;
  }
  
  .date-chip {
    font-size: 0.8rem;
    padding: 0 12px;
  }
  
  .logo {
    width: 36px;
    height: 36px;
  }
  
  .calendar-icon {
    font-size: 20px;
  }
}
</style>


