<template>
  <div class="health-dashboard-v5">
    <div class="dashboard-header">
      <div class="title-section">
        <div class="logo">
          <v-icon large color="white">mdi-atom</v-icon>
        </div>
        <h1>{{ loginId }} 님의 건강 모니터링</h1>
      </div>
      <!-- 날짜 선택 -->
      <div class="date-picker-section">
        <v-icon @click="toggleDatePicker" class="calendar-icon">mdi-calendar</v-icon>
        <div class="date-picker-container" v-show="showDatePicker">
          <DatePickerRange :type="type" @handleDateChange="handleDateChange" />
        </div>
      </div>
      <div class="date-section">
        <v-chip outlined color="black" class="date-chip">
          {{ currentDate }}
        </v-chip>
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
              <span class="stat-subtitle">정상 범위</span>
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
                <div class="status-badge">
                  좋은 수면
                </div>
                <div class="status-text">
                  어제보다 30분 더 많이 주무셨습니다
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
</template>

<script>
import axios from 'axios';
import DatePickerRange from "@/components/DatePickerRange.vue";
import '@vuepic/vue-datepicker/dist/main.css';
export default {
  name: 'HealthData',
  props: {
    loginId: String,
    type: String,
    targetDate: String
  },
  components: {
    DatePickerRange
  },
  data() {
    return {
      currentDate: new Date().toISOString().split('T')[0],
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
        remSleepMinutes : 0
      },
      showErrorModal : false,
      targetCalory: 2000,
      showCaloryTargetModal: false,
      newTargetCalory: 2000,
    }
  },

  async mounted(){
    // 목표 칼로리 불러오기
    this.loadTargetCalory();
    
    // 부모 컴포넌트에서 전달받은 targetDate 사용
    this.currentDate = this.targetDate;
    
    // 데이터 불러오기
    this.fetchData();
  },
  watch: {
    loginId() {
      this.fetchData();
      this.loadTargetCalory();
    },
    type() {
      this.fetchData();
    },
    targetDate(newDate) {
      this.currentDate = newDate;
      this.fetchData();
    }
  },

  methods: {
    // 컴포넌트 외부에서 사용자가 피보호자 아이디를 클릭했다거나 데이터 타입을 변경했다거나 했을 때 watch를 통해 다시 호출되기 위해서
    async fetchData(){
      const dto ={
        "loginId" : this.loginId,
        "type" : this.type,
        "date" : this.currentDate
      };
    try{
    
      const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/health/allinone`,dto);
      this.myData.step = response.data.result.step;
      this.myData.heartbeat = response.data.result.heartbeat;
      this.myData.calory = response.data.result.calory;
      this.myData.activeCalory = response.data.result.activeCalory;
      this.myData.distance = response.data.result.distance;
      this.myData.totalSleepMinutes = response.data.result.totalSleepMinutes;
      this.myData.deepSleepMinutes = response.data.result.deepSleepMinutes;
      this.myData.lightSleepMinutes = response.data.result.lightSleepMinutes;
      this.myData.remSleepMinutes = response.data.result.remSleepMinutes;
    }catch(error){
      this.showErrorModal = true;
    }
    },

    handleDateChange(dateRange) {
      console.log('선택된 날짜:', dateRange);
      
      // 날짜 형식 검증
      if (dateRange && dateRange !== 'NaN-NaN-NaN' && dateRange.match(/^\d{4}-\d{2}-\d{2}$/)) {
        this.currentDate = dateRange;
        this.showDatePicker = false;
        this.fetchData();
      } else {
        console.error('유효하지 않은 날짜 형식:', dateRange);
        this.showErrorModal = true;
      }
    },

    toggleDatePicker() {
      console.log('toggleDatePicker 호출됨');
      this.showDatePicker = !this.showDatePicker;
      console.log('showDatePicker:', this.showDatePicker);
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
    }
}
}
</script>

<style scoped>
.date-picker-section {
  position: relative;
  margin-right: 20px;
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
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  background-color: #f5f5f5;
}

.title-section {
  display: flex;
  align-items: center;
}

.logo {
  width: 48px;
  height: 48px;
  background: rgba(59, 73, 171, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.title-section h1 {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #333;
}

.date-chip {
  font-size: 0.9rem;
  padding: 0 16px;
  color: #333;
  border-color: #333;
}

.dashboard-content {
  padding: 30px 40px;
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
  padding: 24px;
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
  width: 48px;
  height: 48px;
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
  font-size: 2.5rem;
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
  padding: 24px;
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
  }
  
  .sleep-details {
    width: 100%;
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
</style>


