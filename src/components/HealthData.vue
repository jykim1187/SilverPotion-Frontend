<template>
  <div class="health-dashboard-v5">
    <div class="dashboard-header">
      <div class="title-section">
        <div class="user-profile" @click="showUserProfile">
          <img :src="getUserProfileImage()" class="profile-image" alt="User Profile">
        </div>
        <h1 @click="showUserProfile" class="user-name-title">{{ userName }} 님의 건강 모니터링</h1>
      </div>
      <!-- 날짜 선택 -->
      <div class="date-controls">
        <div class="date-picker-section">
          <v-icon @click="toggleDatePicker" class="calendar-icon">mdi-calendar</v-icon>
          <div class="date-picker-container" v-show="showDatePicker">
            <DatePickerRange :type="type" @handleDateChange="handleDateChange" :isHealthData="true" />
          </div>
        </div>
        <div class="date-section">
          <v-chip outlined color="black" class="date-chip">
            {{ myData.period }}
          </v-chip>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <!-- 주요 건강 지표 카드 -->
      <div class="stats-grid">
        <!-- 걸음 수 -->
        <div class="stats-card steps">
          <div class="card-top">
            <div class="card-badge">
              <v-icon>mdi-shoe-print</v-icon>
            </div>
            <div class="stat-value">
              <div class="value-number">{{ myData.step }}</div>
              <div class="value-label">걸음</div>
            </div>
          </div>
          <div class="card-bottom">
            <div class="stat-info">
              <div class="distance-info">
                <div class="distance-value">{{ (myData.distance / 1000).toFixed(2) }} <span class="distance-unit">km</span></div>
                <div class="distance-label">걸은 거리</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 심장 박동 -->
        <div class="stats-card heart-rate">
          <div class="card-top">
            <div class="card-badge">
              <v-icon>mdi-heart-pulse</v-icon>
            </div>
            <div class="stat-value">
              <div class="value-number">{{ myData.heartbeat }}</div>
              <div class="value-label">BPM</div>
            </div>
          </div>
          <div class="card-bottom">
            <div class="stat-title">
              <h3>심장 박동</h3>
              <span class="stat-subtitle" :class="getHeartRateStatusClass(myData.heartbeat)">
                {{ getHeartRateStatus(myData.heartbeat) }}
              </span>
            </div>
            <div class="stat-chart heartbeat-animation">
              <svg viewBox="0 0 120 30" class="heartbeat">
                 <polyline 
                  points="0,20 5,20 10,10 15,30 20,10 25,20 30,20 35,10 40,20 45,20 50,10 55,20 60,20 65,10 70,20 75,20 80,10 85,20 90,20 95,10 100,20 105,20 110,10 115,20 120,20" 
                />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 소모 칼로리 -->
        <div class="stats-card calories" @click="showCaloryTargetModal = true">
          <div class="card-top">
            <div class="card-badge">
              <v-icon>mdi-fire</v-icon>
            </div>
            <div class="stat-value">
              <div class="value-number">{{ myData.calory }}</div>
              <div class="value-label">칼로리</div>
            </div>
          </div>
          <div class="card-bottom">
            <div class="stat-title">
              <h3>소모 칼로리</h3>
              <span class="stat-subtitle">목표 {{ targetCalory }} kcal</span>
            </div>
            <div class="stat-chart">
              <div class="circular-progress">
                <svg viewBox="0 0 36 36">
                  <path
                    class="circle-bg"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="circle calories-circle"
                    :stroke-dasharray="`${(myData.calory / targetCalory) * 100}, 100`"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div class="percentage">{{ Math.round((myData.calory / targetCalory) * 100) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 수면 데이터 -->
      <div class="sleep-container">
        <div class="sleep-header">
          <h2><v-icon left>mdi-moon-waning-crescent</v-icon> 수면 분석</h2>
        </div>
        
        <div class="sleep-content">
          <div class="sleep-overview">
            <div class="sleep-total">
              <div class="total-time-circle">
                <svg viewBox="0 0 160 160">
                  <circle class="sleep-bg" cx="80" cy="80" r="70" />
                  <circle 
                    class="sleep-deep" 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    :stroke-dasharray="`${(myData.deepSleepMinutes / myData.totalSleepMinutes) * 439.6}, 439.6`"
                    stroke-dashoffset="0"
                  />
                  <circle 
                    class="sleep-rem" 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    :stroke-dasharray="`${(myData.remSleepMinutes / myData.totalSleepMinutes) * 439.6}, 439.6`"
                    :stroke-dashoffset="-1 * (myData.deepSleepMinutes / myData.totalSleepMinutes) * 439.6"
                  />
                  <circle 
                    class="sleep-light" 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    :stroke-dasharray="`${(myData.lightSleepMinutes / myData.totalSleepMinutes) * 439.6}, 439.6`"
                    :stroke-dashoffset="-1 * ((myData.deepSleepMinutes + myData.remSleepMinutes) / myData.totalSleepMinutes) * 439.6"
                  />
                </svg>
                <div class="sleep-total-text">
                  <div class="total-hours">{{Math.floor(myData.totalSleepMinutes / 60)}}<span class="time-unit">시간</span> {{myData.totalSleepMinutes % 60}}<span class="time-unit">분</span></div>
                </div>
              </div>
              <div class="sleep-status">
                <div class="status-badge" :class="getSleepStatusClass(myData.totalSleepMinutes)">
                  {{ getSleepStatus(myData.totalSleepMinutes) }}
                </div>
                <div class="status-text">
                  {{ getSleepDescription(myData.totalSleepMinutes) }}
                </div>
              </div>
            </div>
            
            <div class="sleep-details">
              <div class="sleep-metrics">
                <div class="sleep-metric-item">
                  <div class="metric-header">
                    <v-icon color="deep-purple" class="mr-2">mdi-sleep</v-icon>
                    <span class="metric-title">깊은 수면</span>
                  </div>
                  <div class="metric-value-wrapper">
                    <span class="metric-value">{{Math.floor(myData.deepSleepMinutes / 60)}}시간 {{myData.deepSleepMinutes % 60}}분</span>
                    <span class="metric-percent">{{ Math.round((myData.deepSleepMinutes / myData.totalSleepMinutes) * 100) }}%</span>
                  </div>
                  <v-progress-linear
                    :value="(myData.deepSleepMinutes / myData.totalSleepMinutes) * 100"
                    height="8"
                    rounded
                    color="deep-purple"
                    background-color="rgba(0, 0, 0, 0.1)"
                  ></v-progress-linear>
                </div>
                <div class="sleep-metric-item">
                  <div class="metric-header">
                    <v-icon color="indigo" class="mr-2">mdi-eye</v-icon>
                    <span class="metric-title">REM 수면</span>
                  </div>
                  <div class="metric-value-wrapper">
                    <span class="metric-value">{{Math.floor(myData.remSleepMinutes / 60)}}시간 {{myData.remSleepMinutes % 60}}분</span>
                    <span class="metric-percent">{{ Math.round((myData.remSleepMinutes / myData.totalSleepMinutes) * 100) }}%</span>
                  </div>
                  <v-progress-linear
                    :value="(myData.remSleepMinutes / myData.totalSleepMinutes) * 100"
                    height="8"
                    rounded
                    color="indigo"
                    background-color="rgba(0, 0, 0, 0.1)"
                  ></v-progress-linear>
                </div>
                <div class="sleep-metric-item">
                  <div class="metric-header">
                    <v-icon color="blue lighten-1" class="mr-2">mdi-weather-night</v-icon>
                    <span class="metric-title">얕은 수면</span>
                  </div>
                  <div class="metric-value-wrapper">
                    <span class="metric-value">{{Math.floor(myData.lightSleepMinutes / 60)}}시간 {{myData.lightSleepMinutes % 60}}분</span>
                    <span class="metric-percent">{{ Math.round((myData.lightSleepMinutes / myData.totalSleepMinutes) * 100) }}%</span>
                  </div>
                  <v-progress-linear
                    :value="(myData.lightSleepMinutes / myData.totalSleepMinutes) * 100"
                    height="8"
                    rounded
                    color="blue lighten-1"
                    background-color="rgba(0, 0, 0, 0.1)"
                  ></v-progress-linear>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <v-dialog v-model="showErrorModal" max-width="400">
    <v-card>
      <v-card-title class="headline">오류 발생</v-card-title>
      <v-card-text>데이터가 존재하지 않습니다.</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="showErrorModal = false">닫기</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- 목표 칼로리 설정 다이얼로그 -->
  <v-dialog v-model="showCaloryTargetModal" max-width="400">
    <v-card>
      <v-card-title class="headline">소모 칼로리 목표 설정</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newTargetCalory"
          label="목표 칼로리 (kcal)"
          type="number"
          :rules="[v => !!v || '목표 칼로리를 입력해주세요', v => v > 0 || '0보다 큰 값을 입력해주세요']"
          outlined
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey darken-1" text @click="showCaloryTargetModal = false">취소</v-btn>
        <v-btn color="primary" text @click="saveTargetCalory">저장</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- 사용자 프로필 모달 -->
  <v-dialog v-model="showUserProfileModal" max-width="450">
    <v-card>
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
import axios from 'axios';
import DatePickerRange from "@/components/DatePickerRange.vue";
import UserProfileComponent from "@/components/UserProfileComponet.vue";
import '@vuepic/vue-datepicker/dist/main.css';
export default {
  name: 'HealthData',
  props: {
    loginId: String,
    type: String,
    userName: String,
    userLongId: Number,
    // targetDate: String,
  },
  components: {
    DatePickerRange,
    UserProfileComponent
  },
  data() {
    // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
    function formatDateToYYYYMMDD(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    const today = new Date();
    
    return {
      currentDate: formatDateToYYYYMMDD(today),
      showDatePicker: false,
      myData: {
        step: 0,
        heartbeat: 0,
        calory : 0,
        activeCalory : 0,
        distance : 0,
        totalSleepMinutes : 0,
        deepSleepMinutes : 0,
        lightSleepMinutes : 0,
        remSleepMinutes : 0,
        period : ''
      },
      showErrorModal : false,
      targetCalory: 2000,
      showCaloryTargetModal: false,
      newTargetCalory: 2000,
      showUserProfileModal: false,
      // 유저프로필 컴포넌트에 부모 컴포넌트의 타입을 전달하기 위한 용도
      parentType: 'healthData',
      isRequestPending: false // 요청 중복 방지 플래그 추가
    }
  },

  async mounted(){
    // 목표 칼로리 불러오기
    this.loadTargetCalory();
    
    // 타입에 따라 초기 날짜 설정
    this.setInitialDate();
   
    // 데이터 불러오기
    this.fetchDataOnce();
    
    // 탭 변경 이벤트 리스너 등록
    window.addEventListener('tab-changed', this.handleTabChange);
  },
  
  beforeUnmount() {
    // 컴포넌트 제거 시 이벤트 리스너 제거
    window.removeEventListener('tab-changed', this.handleTabChange);
  },
  
  watch: {
    loginId() {
      this.fetchDataOnce();
      this.loadTargetCalory();
    },
    type(newVal, oldVal) {
      // 빈 값이거나 초기화 중인 경우 처리하지 않음
      if (!newVal || (oldVal === undefined || oldVal === '')) {
        return;
      }
      
      // 타입이 변경되면 그에 맞는 초기 날짜 설정
      this.setInitialDate();
      this.fetchDataOnce();
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
    
    // 타입에 따라 초기 날짜 설정
    setInitialDate() {
      const today = new Date();
      
      if (this.type === 'DAY') {
        // 실시간 선택 시 오늘 날짜로 설정
        this.currentDate = this.formatDateToYYYYMMDD(today);
      } 
      else if (this.type === 'WEEKAVG') {
        // 이번주 월요일 계산
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 월요일 구하기
        const monday = new Date(today);
        monday.setDate(diff);
        
        // 이번주 월요일로 설정 (그러면 백엔드에서 저번주 데이터를 조회)
        this.currentDate = this.formatDateToYYYYMMDD(monday);
      } 
      else if (this.type === 'MONTHAVG') {
        // 이번달 1일 계산
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        // 이번달 1일로 설정 (그러면 백엔드에서 저번달 데이터를 조회)
        this.currentDate = this.formatDateToYYYYMMDD(firstDay);
      }
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
    
    // 탭 변경 이벤트 처리
    handleTabChange(event) {
      // 헬스 데이터 탭으로 변경되었을 때만 처리
      if (event.detail.showHealthData) {
        console.log("헬스 데이터 탭으로 변경됨, 데이터 요청 준비");
        // 기존 요청 플래그 초기화 (새로운 탭으로 전환되었으므로)
        this.isRequestPending = false;
      }
    },
    
    // API 호출을 한 번만 수행하는 메소드
    fetchDataOnce() {
      // API 호출 중복 방지
      if (!this.isRequestPending) {
        this.isRequestPending = true;
        
        // 데이터 요청
        this.fetchData().finally(() => {
          // 요청 완료 후 플래그 초기화 (일정 시간 후에)
          setTimeout(() => {
            this.isRequestPending = false;
          }, 500);
        });
      } else {
        console.log("요청이 이미 진행 중입니다");
      }
    },
    
    // 컴포넌트 외부에서 사용자가 피보호자 아이디를 클릭했다거나 데이터 타입을 변경했다거나 했을 때 watch를 통해 다시 호출되기 위해서
    async fetchData() {
      // 필요한 데이터가 모두 있는지 확인
      if (!this.loginId || !this.type || !this.currentDate) {
        console.log("필요한 데이터가 없어 요청을 보내지 않습니다:", { 
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

      console.log("건강 데이터 요청:", dto);
      
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/health/allinone`, dto);
        this.myData.step = response.data.result.step;
        this.myData.heartbeat = response.data.result.heartbeat;
        this.myData.calory = response.data.result.calory;
        this.myData.activeCalory = response.data.result.activeCalory;
        this.myData.distance = response.data.result.distance;
        this.myData.totalSleepMinutes = response.data.result.totalSleepMinutes;
        this.myData.deepSleepMinutes = response.data.result.deepSleepMinutes;
        this.myData.lightSleepMinutes = response.data.result.lightSleepMinutes;
        this.myData.remSleepMinutes = response.data.result.remSleepMinutes;
        this.myData.period = response.data.result.period;
      } catch(error) {
        console.error("건강 데이터 가져오기 실패:", error);
        this.showErrorModal = true;
      }
    },

    handleDateChange(dateRange) {
      console.log('선택된 날짜:', dateRange);
      
      // 날짜 형식 검증
      if (dateRange && dateRange !== 'NaN-NaN-NaN' && dateRange.match(/^\d{4}-\d{2}-\d{2}$/)) {
        this.currentDate = dateRange;
        this.showDatePicker = false;
        this.fetchDataOnce();
      } else {
        console.error('유효하지 않은 날짜 형식:', dateRange);
        this.showErrorModal = true;
      }
    },

    toggleDatePicker() {
      this.showDatePicker = !this.showDatePicker;
    },
    
    // 목표 칼로리 저장
    saveTargetCalory() {
      if (this.newTargetCalory > 0) {
        this.targetCalory = parseInt(this.newTargetCalory);
        // 로컬 스토리지에 사용자별 목표 칼로리 저장
        localStorage.setItem(`targetCalory_${this.loginId}`, this.targetCalory);
        this.showCaloryTargetModal = false;
      }
    },
    
    // 목표 칼로리 불러오기
    loadTargetCalory() {
      const savedTargetCalory = localStorage.getItem(`targetCalory_${this.loginId}`);
      if (savedTargetCalory) {
        this.targetCalory = parseInt(savedTargetCalory);
        this.newTargetCalory = this.targetCalory;
      }
    },
    
    // 사용자 프로필 이미지 가져오기
    getUserProfileImage() {
      // 기본 프로필 이미지
      let defaultImage = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.userName) + '&background=random&color=fff';
      
      // 실제 구현 시에는 사용자 ID를 기반으로 서버에서 이미지를 가져오는 로직 추가
      // 예: return this.userProfileImage || defaultImage;
      
      return defaultImage;
    },
    
    // 심장 박동수에 따른 상태 텍스트 반환
    getHeartRateStatus(heartRate) {
      if (!heartRate) return '정보 없음';
      
      if (heartRate < 60) {
        return '낮은 심박수';
      } else if (heartRate >= 60 && heartRate <= 100) {
        return '정상 범위';
      } else if (heartRate > 100 && heartRate <= 120) {
        return '약간 높음';
      } else {
        return '높은 심박수';
      }
    },
    
    // 심장 박동수에 따른 클래스 반환
    getHeartRateStatusClass(heartRate) {
      if (!heartRate) return '';
      
      if (heartRate < 60) {
        return 'status-low';
      } else if (heartRate >= 60 && heartRate <= 100) {
        return 'status-normal';
      } else if (heartRate > 100 && heartRate <= 120) {
        return 'status-elevated';
      } else {
        return 'status-high';
      }
    },
    
    // 수면 시간에 따른 상태 텍스트 반환
    getSleepStatus(minutes) {
      if (!minutes) return '정보 없음';
      
      const hours = minutes / 60;
      
      if (hours < 6) {
        return '부족한 수면';
      } else if (hours >= 6 && hours < 7) {
        return '조금 부족한 수면';
      } else if (hours >= 7 && hours <= 9) {
        return '좋은 수면';
      } else {
        return '과도한 수면';
      }
    },
    
    // 수면 시간에 따른 클래스 반환
    getSleepStatusClass(minutes) {
      if (!minutes) return '';
      
      const hours = minutes / 60;
      
      if (hours < 6) {
        return 'sleep-insufficient';
      } else if (hours >= 6 && hours < 7) {
        return 'sleep-slight-insufficient';
      } else if (hours >= 7 && hours <= 9) {
        return 'sleep-good';
      } else {
        return 'sleep-excessive';
      }
    },
    
    // 수면 시간에 따른 설명 텍스트 반환
    getSleepDescription(minutes) {
      if (!minutes) return '수면 데이터가 없습니다';
      
      const hours = minutes / 60;
      
      if (hours < 6) {
        return '수면이 부족합니다. 7-9시간 수면을 권장합니다.';
      } else if (hours >= 6 && hours < 7) {
        return '수면이 조금 부족합니다. 1시간 더 주무세요.';
      } else if (hours >= 7 && hours <= 9) {
        return '건강한 수면 시간입니다. 좋은 습관을 유지하세요.';
      } else {
        return '수면 시간이 길어요. 7-9시간이 적정 수면입니다.';
      }
    },
  },
  computed: {
    // 날짜를 '0000년 0월 0일' 형식으로 표시하는 계산된 속성
    formattedCurrentDate() {
      if (!this.currentDate) return '';
      
      const date = new Date(this.currentDate);
      
      if (this.type === 'DAY') {
        // 일별 데이터는 날짜 표시
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      } 
      else if (this.type === 'WEEKAVG') {
        // 주간 평균 데이터는 날짜 표시
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      }
      else if (this.type === 'MONTHAVG') {
        // 월간 데이터는 월까지만 표시
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
      }
      else {
        // 기본값
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
      }
    }
  }
}
</script>

<style scoped>
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

.health-dashboard-v5 {
  background: white;
  color: #333;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  width: 100%;
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px;
  background-color: #f5f5f5;
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

.date-chip {
  font-size: 0.9rem;
  padding: 0 16px;
  color: #333;
  border-color: #333;
}

.dashboard-content {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stats-card {
  background: #f9f9f9;
  border-radius: 16px;
  padding: 20px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: -1;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.card-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.steps .card-badge {
  background: rgba(76, 175, 80, 0.25);
  color: #4CAF50;
}

.heart-rate .card-badge {
  background: rgba(244, 67, 54, 0.25);
  color: #F44336;
}

.calories .card-badge {
  background: rgba(255, 152, 0, 0.25);
  color: #FF9800;
}

.stat-value {
  text-align: right;
}

.value-number {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
  color: #333;
}

.value-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 4px;
  color: #555;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distance-info {
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.distance-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2196F3;
  line-height: 1;
}

.distance-unit {
  font-size: 0.8rem;
  font-weight: 500;
}

.distance-label {
  font-size: 0.8rem;
  color: #555;
  margin-top: 2px;
}

.stat-title h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.stat-subtitle {
  font-size: 0.8rem;
  opacity: 0.7;
  color: #555;
}

.circular-progress {
  position: relative;
  width: 60px;
  height: 60px;
}

.circular-progress svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: rgba(0, 0, 0, 0.1);
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

.steps-circle {
  stroke: #4CAF50;
}

.calories-circle {
  stroke: #FF9800;
}

.percentage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.heartbeat-animation {
  width: 60px;
  height: 30px;
}

.heartbeat {
  fill: none;
  stroke: #F44336;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: pulse 1.5s ease-in-out infinite;
}

.sleep-container {
  background: #f9f9f9;
  border-radius: 16px;
  overflow: hidden;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sleep-header {
  margin-bottom: 24px;
}

.sleep-header h2 {
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: #333;
}

.sleep-content {
  display: flex;
  flex-direction: column;
}

.sleep-overview {
  display: flex;
  flex-wrap: wrap;
}

.sleep-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  margin-right: 48px;
}

.total-time-circle {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 16px;
}

.total-time-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.sleep-bg {
  fill: none;
  stroke: rgba(0, 0, 0, 0.1);
  stroke-width: 12;
}

.sleep-deep {
  fill: none;
  stroke: #3F51B5;
  stroke-width: 12;
  transform-origin: center;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out;
}

.sleep-rem {
  fill: none;
  stroke: #673AB7;
  stroke-width: 12;
  transform-origin: center;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out;
}

.sleep-light {
  fill: none;
  stroke: #64B5F6;
  stroke-width: 12;
  transform-origin: center;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out;
}

.sleep-total-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.total-hours {
  font-size: 2.0rem;
  font-weight: 700;
  line-height: 1;
  color: #333;
}

.time-unit {
  font-size: 1rem;
  font-weight: 400;
  color: #555;
}

.sleep-status {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.status-text {
  font-size: 0.85rem;
  opacity: 0.8;
  color: #555;
}

.sleep-details {
  flex-grow: 1;
  min-width: 300px;
}

.sleep-metrics {
  margin-bottom: 24px;
}

.sleep-metric-item {
  margin-bottom: 16px;
}

.metric-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.metric-title {
  font-weight: 500;
  color: #333;
}

.metric-value-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.metric-value {
  font-weight: 600;
  color: #333;
}

.metric-percent {
  font-size: 0.85rem;
  opacity: 0.8;
  color: #555;
}

.sleep-timeline {
  margin-top: 24px;
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.75rem;
  color: #555;
}

.timeline-track {
  height: 24px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.track-segment {
  position: absolute;
  height: 100%;
}

.track-segment.deep {
  background-color: #3F51B5;
}

.track-segment.light {
  background-color: #64B5F6;
}

.track-segment.rem {
  background-color: #673AB7;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

@keyframes pulse {
  0% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.15);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes appear {
  0% {
    stroke-dashoffset: 439.6;
  }
}

@media (max-width: 960px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }
  
  .date-picker-section {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .date-section {
    margin-top: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .sleep-overview {
    flex-direction: column;
    align-items: center;
  }
  
  .sleep-total {
    margin-right: 0;
    margin-bottom: 32px;
    width: 100%;
  }
  
  .sleep-details {
    width: 100%;
  }
  
  .value-number {
    font-size: 1.8rem;
  }
  
  .total-hours {
    font-size: 1.8rem;
  }
  
  .total-time-circle {
    width: 140px;
    height: 140px;
  }
  
  .card-badge {
    width: 36px;
    height: 36px;
  }
  
  .dashboard-content {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .title-section h1 {
    font-size: 1.3rem;
  }
  
  .total-time-circle {
    width: 120px;
    height: 120px;
  }
  
  .metric-value-wrapper {
    flex-direction: column;
  }
  
  .metric-percent {
    margin-top: 5px;
  }
  
  .date-chip {
    font-size: 0.8rem;
    padding: 0 12px;
  }
}

.calories {
  cursor: pointer;
  transition: all 0.3s ease;
}

.calories:hover {
  box-shadow: 0 8px 16px rgba(255, 152, 0, 0.2);
}

.heart-rate:hover {
  box-shadow: 0 8px 16px rgba(245, 2, 2, 0.2);
}

.steps:hover {
  box-shadow: 0 8px 16px rgba(55, 212, 7, 0.342);
}

/* 사용자 이름 제목 스타일 */
.user-name-title {
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
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

/* 프로필 모달 스타일 */
.profile-dialog-close {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}

/* 심장 박동 상태 스타일 */
.status-normal {
  color: #4CAF50;
  font-weight: 600;
}

.status-low {
  color: #2196F3;
  font-weight: 600;
}

.status-elevated {
  color: #FF9800;
  font-weight: 600;
}

.status-high {
  color: #F44336;
  font-weight: 600;
}

/* 수면 상태 배지 스타일 */
.sleep-good {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.sleep-insufficient, .sleep-excessive {
  background-color: rgba(244, 67, 54, 0.2);
  color: #F44336;
}

.sleep-slight-insufficient {
  background-color: rgba(255, 152, 0, 0.2);
  color: #FF9800;
}
</style>


