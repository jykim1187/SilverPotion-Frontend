<template>
  <div class="health-dashboard-v5">
    <div class="dashboard-header">
      <div class="title-section">
        <div class="user-profile" @click="showUserProfile">
          <img :src="profileImage" class="profile-image" alt="User Profile">
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
      <!-- 데이터 없음 메시지 -->
      <div v-if="noDataMessage" class="no-data-message">
        <v-alert type="info" text>
          {{ noDataMessage }}
        </v-alert>
      </div>

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
        <div class="stats-card calories">
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
                    :stroke-dasharray="`${getCaloryPercentage()}, 100`"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div class="percentage">{{ getCaloryPercentageText() }}</div>
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
                    <span class="metric-percent">{{ getSleepPercentageText(myData.deepSleepMinutes) }}</span>
                  </div>
                  <v-progress-linear
                    :value="getSleepPercentage(myData.deepSleepMinutes)"
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
                    <span class="metric-percent">{{ getSleepPercentageText(myData.remSleepMinutes) }}</span>
                  </div>
                  <v-progress-linear
                    :value="getSleepPercentage(myData.remSleepMinutes)"
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
                    <span class="metric-percent">{{ getSleepPercentageText(myData.lightSleepMinutes) }}</span>
                  </div>
                  <v-progress-linear
                    :value="getSleepPercentage(myData.lightSleepMinutes)"
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
      
  
      <!-- 헬스 점수 섹션 - 버전 4 -->
      <div class="health-score-container version-4" v-if="selectedScoreDesign === 4">
        <div class="score-header-v4">
          <h2>건강 지수</h2>
        </div>
        
        <div class="score-content-v4">
          <!-- 상단 점수 카드 섹션 -->
          <div v-if="didIwriteHealthDetail" class="score-card-hero">
            <!-- 왼쪽: 설명 텍스트 -->
            <div class="hero-content">
              <div class="hero-title">종합 건강 점수</div>
              <div class="hero-subtitle">{{ getHealthScoreStatus() }}</div>
              <p class="score-description">
                {{ getHealthScoreDescription() }}
              </p>
            </div>
            
            <!-- 오른쪽: 원형 그래프 -->
            <div class="hero-graphic">
              <div class="score-ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" class="ring-bg" />
                  <circle cx="50" cy="50" r="45" class="ring-value" :stroke-dasharray="`${healthScore * 2.83} 283`" />
                </svg>
                <div class="ring-content">
                  <div class="ring-score">{{ healthScore }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 건강 프로필 작성 안내 메시지 -->
          <div v-else class="health-profile-guide">
            <div class="guide-content">
              <v-icon large color="blue" class="guide-icon">mdi-file-document-edit-outline</v-icon>
              <h3 class="guide-title">건강 프로필을 작성해 건강지수를 확인해보세요!</h3>
              <p class="guide-description">건강 프로필 작성을 완료하면 맞춤형 건강 점수와 분석 결과를 확인할 수 있습니다.</p>
              <v-btn 
                color="warning" 
                class="guide-btn" 
                elevation="2" 
                @click="goToHealthProfile"
              >
                <v-icon left>mdi-file-document-edit</v-icon>
                건강프로필 작성하기
              </v-btn>
            </div>
          </div>
          
          <div class="score-detail-cards">
            <div class="detail-card activity-card">
              <div class="card-inner">
                <div class="card-header">
                  <div class="card-icon">
                    <v-icon color="green">mdi-run</v-icon>
                  </div>
                  <div class="card-title">활동 점수</div>
                </div>
                <div class="card-score">{{ activityScore }}</div>
                <div class="card-bar">
                  <div class="card-bar-fill activity-fill" :style="{ width: activityScore + '%' }"></div>
                </div>
              </div>
            </div>
            
            <div class="detail-card physical-card">
              <div class="card-inner">
                <div class="card-header">
                  <div class="card-icon">
                    <v-icon color="blue">mdi-heart-pulse</v-icon>
                  </div>
                  <div class="card-title">신체상태 점수</div>
                </div>
                <div class="card-score">{{ physicalScore }}</div>
                <div class="card-bar">
                  <div class="card-bar-fill physical-fill" :style="{ width: physicalScore + '%' }"></div>
                </div>
              </div>
            </div>
            
            <div class="detail-card lifestyle-card">
              <div class="card-inner">
                <div class="card-header">
                  <div class="card-icon">
                    <v-icon color="amber">mdi-food-apple</v-icon>
                  </div>
                  <div class="card-title">생활습관 점수</div>
                </div>
                <div class="card-score">{{ lifestyleScore }}</div>
                <div class="card-bar">
                  <div class="card-bar-fill lifestyle-fill" :style="{ width: lifestyleScore + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      
      <!-- 여기서부터 헬스 점수 그래프 섹션 -->
      <!-- <div class="health-score-history-container"> -->
        <!-- <div class="score-history-header">
          <h2>최근 5일간 건강 점수 추세</h2>
          <div class="graph-type-selector">
            <v-btn-toggle v-model="selectedGraphType" mandatory>
              <v-btn small value="line">선 그래프</v-btn>
              <v-btn small value="bar">막대 그래프</v-btn>
              <v-btn small value="area">영역 그래프</v-btn>
            </v-btn-toggle>
          </div>
        </div>
        
        선 그래프 버전
        <div v-if="selectedGraphType === 'line'" class="graph-container line-graph">
          <div class="graph-legend">
            <div class="legend-item">
              <span class="legend-color" style="background-color: #2196F3;"></span>
              <span class="legend-text">종합 건강 점수</span>
            </div>
          </div>
          <div class="graph-content">
            <svg viewBox="0 0 500 200" class="score-graph">
              Y축 그리드 라인
              <line x1="40" y1="20" x2="40" y2="180" stroke="#e0e0e0" stroke-width="1" />
              <line x1="40" y1="20" x2="480" y2="20" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#e0e0e0" stroke-width="1" />
              
              Y축 눈금
              <text x="30" y="25" text-anchor="end" font-size="12" fill="#666">100</text>
              <text x="30" y="65" text-anchor="end" font-size="12" fill="#666">80</text>
              <text x="30" y="105" text-anchor="end" font-size="12" fill="#666">60</text>
              <text x="30" y="145" text-anchor="end" font-size="12" fill="#666">40</text>
              <text x="30" y="185" text-anchor="end" font-size="12" fill="#666">20</text>
              
              X축 눈금 및 날짜
              <template v-for="(score, index) in lastFiveDaysScores" :key="'date-'+index">
                <text :x="40 + index * 110" y="200" text-anchor="middle" font-size="12" fill="#666">{{ score.date }}</text>
              </template>
              
              점수 선 그래프
              <polyline 
                :points="getLineGraphPoints()"
                fill="none" 
                stroke="#2196F3" 
                stroke-width="3"
                stroke-linejoin="round"
                class="score-line"
              />
              
              데이터 포인트
              <template v-for="(score, index) in lastFiveDaysScores" :key="'point-'+index">
                <circle 
                  :cx="40 + index * 110" 
                  :cy="180 - (score.score * 1.6)" 
                  r="6" 
                  fill="#2196F3"
                  class="data-point"
                />
                <text 
                  :x="40 + index * 110" 
                  :y="170 - (score.score * 1.6)" 
                  text-anchor="middle" 
                  font-size="12" 
                  fill="#333"
                  font-weight="bold"
                  class="point-label"
                >{{ score.score }}</text>
              </template>
            </svg>
          </div>
        </div>
        
        막대 그래프 버전
        <div v-if="selectedGraphType === 'bar'" class="graph-container bar-graph">
          <div class="graph-legend">
            <div class="legend-item">
              <span class="legend-color" style="background-color: #00BCD4;"></span>
              <span class="legend-text">종합 건강 점수</span>
            </div>
          </div>
          <div class="graph-content">
            <svg viewBox="0 0 500 240" class="score-graph">
              Y축 그리드 라인
              <line x1="50" y1="20" x2="50" y2="180" stroke="#e0e0e0" stroke-width="1" />
              <line x1="50" y1="20" x2="480" y2="20" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="50" y1="60" x2="480" y2="60" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="50" y1="100" x2="480" y2="100" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="50" y1="140" x2="480" y2="140" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="50" y1="180" x2="480" y2="180" stroke="#e0e0e0" stroke-width="1" />
              
              Y축 눈금
              <text x="40" y="25" text-anchor="end" font-size="12" fill="#666">100</text>
              <text x="40" y="65" text-anchor="end" font-size="12" fill="#666">80</text>
              <text x="40" y="105" text-anchor="end" font-size="12" fill="#666">60</text>
              <text x="40" y="145" text-anchor="end" font-size="12" fill="#666">40</text>
              <text x="40" y="185" text-anchor="end" font-size="12" fill="#666">20</text>
              
              X축 선
              <line x1="50" y1="180" x2="480" y2="180" stroke="#e0e0e0" stroke-width="1" />
              
              막대 그래프
              <template v-for="(score, index) in lastFiveDaysScores" :key="'bar-'+index">
                <rect 
                  :x="60 + index * 85" 
                  :y="180 - (score.score * 1.6)" 
                  width="60" 
                  :height="score.score * 1.6" 
                  :fill="getBarColor(score.score)"
                  rx="4"
                  ry="4"
                  class="score-bar"
                />
                <text 
                  :x="90 + index * 85" 
                  :y="190 - (score.score * 1.6) + (score.score < 50 ? -25 : 15)" 
                  text-anchor="middle" 
                  font-size="14" 
                  :fill="score.score < 50 ? '#333' : '#fff'"
                  font-weight="bold"
                >{{ score.score }}</text>
                <text 
                  :x="90 + index * 85" 
                  y="210" 
                  text-anchor="middle" 
                  font-size="12" 
                  fill="#666"
                >{{ score.date }}</text>
              </template>
            </svg>
          </div>
        </div> -->
        
        <!-- 영역 그래프 버전
        <div v-if="selectedGraphType === 'area'" class="graph-container area-graph">
          <div class="graph-legend">
            <div class="legend-item">
              <span class="legend-color gradient-legend"></span>
              <span class="legend-text">종합 건강 점수</span>
            </div>
          </div>
          <div class="graph-content">
            <svg viewBox="0 0 500 200" class="score-graph">
              배경 그리드
              <line x1="40" y1="20" x2="40" y2="180" stroke="#e0e0e0" stroke-width="1" />
              <line x1="40" y1="20" x2="480" y2="20" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#e0e0e0" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#e0e0e0" stroke-width="1" />
              
              Y축 눈금
              <text x="30" y="25" text-anchor="end" font-size="12" fill="#666">100</text>
              <text x="30" y="65" text-anchor="end" font-size="12" fill="#666">80</text>
              <text x="30" y="105" text-anchor="end" font-size="12" fill="#666">60</text>
              <text x="30" y="145" text-anchor="end" font-size="12" fill="#666">40</text>
              <text x="30" y="185" text-anchor="end" font-size="12" fill="#666">20</text>
              
              X축 날짜
              <template v-for="(score, index) in lastFiveDaysScores" :key="'date-'+index">
                <text :x="40 + index * 110" y="200" text-anchor="middle" font-size="12" fill="#666">{{ score.date }}</text>
              </template>
              
              영역 그래프
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color: #8E24AA; stop-opacity: 0.8" />
                  <stop offset="100%" style="stop-color: #8E24AA; stop-opacity: 0.1" />
                </linearGradient>
              </defs>
              
              <path 
                :d="getAreaGraphPath()"
                fill="url(#areaGradient)" 
                stroke="#8E24AA" 
                stroke-width="2"
                class="score-area"
              />
              
              데이터 포인트
              <template v-for="(score, index) in lastFiveDaysScores" :key="'area-point-'+index">
                <circle 
                  :cx="40 + index * 110" 
                  :cy="180 - (score.score * 1.6)" 
                  r="6" 
                  fill="#8E24AA"
                />
                <text 
                  :x="40 + index * 110" 
                  :y="170 - (score.score * 1.6)" 
                  text-anchor="middle" 
                  font-size="12" 
                  fill="#333"
                  font-weight="bold"
                >{{ score.score }}</text>
              </template>
            </svg>
          </div>
        </div> -->
      <!-- </div> -->
<!-- 여기까지 헬스 점수 그래프 섹션 -->


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
      profileImage : '',
      showErrorModal : false,
      noDataMessage: '',
      targetCalory: 0,
      targetStep: 0,
      showCaloryTargetModal: false,
      showUserProfileModal: false,
      // 유저프로필 컴포넌트에 부모 컴포넌트의 타입을 전달하기 위한 용도
      parentType: 'healthData',
      isRequestPending: false, // 요청 중복 방지 플래그 추가
      didIwriteHealthDetail: false, // 건강세부조사 작성한 유저인지 아닌지
      //헬스 점수 섹션
      selectedScoreDesign: 4,
      healthScore: 0,
      activityScore: 0,
      physicalScore: 0,
      lifestyleScore: 0,
      
      // 최근 5일간의 헬스 점수 더미 데이터
      // selectedGraphType: 'line',
      // lastFiveDaysScores: [
      //   { date: '07-15', score: 87 },
      //   { date: '07-16', score: 82 },
      //   { date: '07-17', score: 91 },
      //   { date: '07-18', score: 78 },
      //   { date: '07-19', score: 85 }
      // ]
    }
  },

  async mounted(){
    // 사용자 프로필 이미지 가져오기

    // 타입에 따라 초기 날짜 설정
    this.setInitialDate();
   
    // 데이터 불러오기
    this.fetchDataOnce();
    
    // 탭 변경 이벤트 리스너 등록
    window.addEventListener('tab-changed', this.handleTabChange);
    
    // 건강세부조사 작성 여부 불러오기
    this.loadyesOrNoForHealthDetail();
    //// 헬스점수 불러오기
    this.loadHealthScore();
  },
  
  beforeUnmount() {
    // 컴포넌트 제거 시 이벤트 리스너 제거
    window.removeEventListener('tab-changed', this.handleTabChange);
  },
  
  watch: {
    loginId() {
      this.fetchDataOnce();
      this.loadyesOrNoForHealthDetail();
      this.loadHealthScore();
    },
    type(newVal, oldVal) {
      // 빈 값이거나 초기화 중인 경우 처리하지 않음
      if (!newVal || (oldVal === undefined || oldVal === '')) {
        return;
      }
      
      // 타입이 변경되면 그에 맞는 초기 날짜 설정
      this.setInitialDate();
      this.fetchDataOnce();
      this.loadHealthScore();
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
          this.isRequestPending = false;
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
        this.profileImage = response.data.result.imgUrl;
        this.targetCalory = response.data.result.targetCalories;
        this.targetStep = response.data.result.targetSteps;
        this.noDataMessage = '';
        console.log(response);
      } catch(error) {
        console.error("건강 데이터 가져오기 실패:", error);
        
        // 데이터 초기화
        this.resetData();
        
        // 에러 모달 대신 메시지 표시
        this.noDataMessage = `${this.myData.period} 데이터가 없습니다.`;
      }
    },

     //날짜를 주차로 변환하는 메소드
     convertDateToWeek(date1){
      console.log('날짜',date1)
      const date = new Date(date1);
  date.setDate(date.getDate() - 7); //  전주 월요일로 이동

  // 첫 목요일 구하기
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0: 일 ~ 6: 토
  const firstThursday = new Date(date.getFullYear(), date.getMonth(),
    firstDayWeekday <= 4 ? 1 + (4 - firstDayWeekday) : 1 + (7 - firstDayWeekday) + 4
  );

  // 첫 목요일 기준으로 year, month 고정!
  const fixedYear = firstThursday.getFullYear();
  const fixedMonth = firstThursday.getMonth() + 1;

  // 주차 계산
  const diffDays = (date - firstThursday) / (1000 * 60 * 60 * 24);
  const weekNumber = diffDays < 0 ? 1 : Math.floor(diffDays / 7) + 2;

  return `${fixedYear}년 ${fixedMonth}월 ${weekNumber}주차`;
      },

      // 날짜를 년월로 변환하는 메소드
        convertDateToYearMonth(date1) {
          const date = new Date(date1);
          let year = date.getFullYear();
          let month = date.getMonth(); 

          // 만약 월이 0이면 (1월에서 -1 한 경우), 전년도 12월로 설정
          if (month === 0) {
            year -= 1;
            month = 12;
          }
          return `${year}년 ${month}월`;
        },

    // 데이터 초기화 메소드 추가
    resetData() {
      this.myData.step = 0;
      this.myData.heartbeat = 0;
      this.myData.calory = 0;
      this.myData.activeCalory = 0;
      this.myData.distance = 0;
      this.myData.totalSleepMinutes = 0;
      this.myData.deepSleepMinutes = 0;
      this.myData.lightSleepMinutes = 0;
      this.myData.remSleepMinutes = 0;
      this.targetCalory = '0';
      this.targetStep = '0';
      if(this.type === 'DAY'){
        this.myData.period = this.currentDate;
      }
      else if(this.type === 'WEEKAVG'){
        this.myData.period = this.convertDateToWeek(this.currentDate);
      }
      else if(this.type === 'MONTHAVG'){
        this.myData.period = this.convertDateToYearMonth(this.currentDate);
      }
      
    },
    resetHealthScore(){
      this.healthScore = 0;
      this.activityScore = 0;
      this.physicalScore = 0;
      this.lifestyleScore = 0;
    },
    handleDateChange(dateRange) {
      console.log('선택된 날짜:', dateRange);
      
      // 날짜 형식 검증
      if (dateRange && dateRange !== 'NaN-NaN-NaN' && dateRange.match(/^\d{4}-\d{2}-\d{2}$/)) {
        this.currentDate = dateRange;
        this.showDatePicker = false;
        this.fetchDataOnce();
        this.loadHealthScore();
      } else {
        console.error('유효하지 않은 날짜 형식:', dateRange);
        this.noDataMessage = '유효하지 않은 날짜 형식입니다.';
        this.resetData();
        this.resetHealthScore();
      }
    },

    toggleDatePicker() {
      this.showDatePicker = !this.showDatePicker;
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
    // 건강세부조사 작성 여부 불러오기
    async loadyesOrNoForHealthDetail(){
      const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/havedetailhealthinfo`, {
        "loginId": this.loginId,
      });
      this.didIwriteHealthDetail = response.data.result;
      console.log('건강세부조사 작성 여부', this.didIwriteHealthDetail);
    },
  
    //// 헬스 점수 불러오기 
    async loadHealthScore() {
      try{
      const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/healthscore/create`, {
        "userId": this.loginId,
        "type": this.type,
        "date": this.currentDate
      });

      console.log('헬스 점수 데이터 가져오기', response);

      this.healthScore = response.data.result.totalScore;
      this.activityScore = response.data.result.activityScore;
      this.physicalScore = response.data.result.bodyScore;
      this.lifestyleScore = response.data.result.habitScore;
    }
    catch(error){
      console.error('헬스 점수 데이터 가져오기 실패:', error);
      this.resetHealthScore();
    }
    

    },
    
    // 헬스 점수 상태 반환
    getHealthScoreStatus() {
      if (this.healthScore >= 90) {
        return '최상';
      } else if (this.healthScore >= 80) {
        return '좋음';
      } else if (this.healthScore >= 70) {
        return '양호';
      } else if (this.healthScore >= 60) {
        return '주의';
      } else {
        return '관리필요';
      }
    },
    
    // 헬스 점수 설명 반환
    getHealthScoreDescription() {
      if (this.healthScore >= 90) {
        return '매우 건강한 상태입니다. 현재 습관을 계속 유지하세요!';
      } else if (this.healthScore >= 80) {
        return '건강한 상태입니다. 조금만 더 신경써보세요!';
      } else if (this.healthScore >= 70) {
        return '양호한 상태입니다. 생활 습관 개선이 필요해요.';
      } else if (this.healthScore >= 60) {
        return '주의가 필요합니다. 운동량을 늘려보세요.';
      } else {
        return '건강 관리가 필요합니다. 전문가와 상담하세요.';
      }
    },
    
    //// 그래프 데이터 관련 메소드
    getLineGraphPoints() {
      return this.lastFiveDaysScores.map((score, index) => 
        `${40 + index * 110},${180 - (score.score * 1.6)}`
      ).join(' ');
    },
    
    getAreaGraphPath() {
      const points = this.lastFiveDaysScores.map((score, index) => 
        `${40 + index * 110},${180 - (score.score * 1.6)}`
      );
      
      // 시작점
      let path = `M ${points[0]}`;
      
      // 각 점을 연결하는 선
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i]}`;
      }
      
      // 마지막 점에서 X축까지 내려오는 선
      path += ` L ${40 + (this.lastFiveDaysScores.length - 1) * 110},180`;
      
      // 시작점의 X축부터 시작점까지 올라가는 선
      path += ` L 40,180 Z`;
      
      return path;
    },
    
    getBarColor(score) {
      if (score >= 90) return '#4CAF50'; // 초록색 (최상)
      if (score >= 80) return '#00BCD4'; // 파란색 (좋음)
      if (score >= 70) return '#FFC107'; // 노란색 (양호)
      if (score >= 60) return '#FF9800'; // 주황색 (주의)
      return '#F44336'; // 빨간색 (관리 필요)
    },
    ////
    
    // 건강 프로필 페이지로 이동하는 메소드 추가
    goToHealthProfile() {
      this.$router.push('/silverpotion/userhealthinfodetail');
    },
    
    // 칼로리 퍼센티지 계산 메소드 추가
    getCaloryPercentage() {
      if (!this.myData.calory || !this.targetCalory || this.targetCalory <= 0) {
        return 0;
      }
      return Math.min((this.myData.calory / this.targetCalory) * 100, 100);
    },
    
    // 칼로리 퍼센트 텍스트 반환 메소드 추가
    getCaloryPercentageText() {
      const percentage = this.getCaloryPercentage();
      return `${Math.round(percentage)}%`;
    },
    
    // 수면 퍼센티지 계산 메소드 추가
    getSleepPercentage(sleepMinutes) {
      if (!sleepMinutes || !this.myData.totalSleepMinutes || this.myData.totalSleepMinutes <= 0) {
        return 0;
      }
      return Math.min((sleepMinutes / this.myData.totalSleepMinutes) * 100, 100);
    },
    
    // 수면 퍼센트 텍스트 반환 메소드 추가
    getSleepPercentageText(sleepMinutes) {
      const percentage = this.getSleepPercentage(sleepMinutes);
      return `${Math.round(percentage)}%`;
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

/* 모바일 환경에서 달력이 화면 밖으로 넘어가지 않도록 조정 */
@media (max-width: 768px) {
  .date-picker-container {
    right: auto;
    left: 0;
    max-width: 100vw;
    width: calc(100vw - 40px);
    transform: translateX(-7%);
    left: 50%;
  }
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


@media (max-width: 768px) {
  .version-1 .score-content-v1 {
    flex-direction: column;
  }
  
  .version-2 .sub-score-card {
    flex-direction: column;
    text-align: center;
  }
  
  .version-2 .card-icon {
    margin: 0 auto 15px auto;
  }
  
  .version-3 .sub-gauges {
    flex-direction: column;
  }
  
  .version-4 .score-card-hero {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .version-4 .hero-content {
    order: 2;
    margin-top: 15px;
  }
  
  .version-4 .hero-graphic {
    order: 1;
    margin: 0 auto;
  }
  
  .version-4 .score-description {
    text-align: center;
    margin: 0 auto;
  }
  
  .version-4 .score-detail-cards {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .version-4 .card-inner {
    padding: 15px;
  }
  
  .version-4 .card-score {
    font-size: 1.8rem;
  }
  
  .version-4 .card-title {
    font-size: 0.85rem;
  }
  
  .version-5 .score-card-hero {
    flex-direction: column;
    text-align: center;
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

/* * * 프로필 모달 스타일 * */ 

.profile-dialog-close {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}

.profile-card {
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.profile-dialog {
  border-radius: 8px !important;
  overflow: visible !important;
}

.no-data-message {
  margin-bottom: 20px;
  width: 100%;
}
/* //// */
/* 헬스 점수 공통 스타일 */
.health-score-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.health-score-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}



/* 버전 4 스타일  */
.version-4 {
  background: #f9f9f9;
  color: rgb(0, 0, 0);
}

.version-4 .score-header-v4 {
  margin-bottom: 30px;
}

.version-4 .score-header-v4 h1 {
  font-size: 1.5rem;
  font-weight: 900;
  color: rgb(0, 0, 0);
}

.version-4 .score-content-v4 {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.version-4 .score-center-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.version-4 .score-ring {
  position: relative;
  width: 180px;
  height: 180px;
  margin-bottom: 20px;
}

.version-4 .score-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.version-4 .ring-bg {
  fill: none;
  stroke: rgba(0, 0, 0, 0.1);
  stroke-width: 8;
}
.version-4 .ring-value {
  fill: none;
  stroke: #00d4ff;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease;
}

.version-4 .ring-content {
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

.version-4 .ring-score {
  font-size: 3rem;
  font-weight: 700;
  color: rgb(0, 0, 0);
}

.version-4 .ring-label {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);
}

.version-4 .ring-status {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-top: 5px;
}

.version-4 .score-description {
  text-align: center;
  font-size: 1.1rem;
  color: rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  max-width: 500px;
}

.version-4 .score-detail-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 항상 3개의 열을 표시 */
  gap: 20px;
  width: 100%;
}

.version-4 .detail-card {
  border-radius: 15px;
  overflow: hidden;
  min-width: 0; /* 최소 너비 제한 제거 */
}

.version-4 .card-inner {
  background: white;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.01);
}

.version-4 .card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.version-4 .card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.version-4 .activity-card .card-icon {
  background: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
}

.version-4 .physical-card .card-icon {
  background: rgba(33, 150, 243, 0.15);
  color: #2196F3;
}

.version-4 .lifestyle-card .card-icon {
  background: rgba(255, 193, 7, 0.15);
  color: #FFC107;
}

.version-4 .card-title {
  font-size: 0.9rem;
  color: #666;
}

.version-4 .card-score {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 10px 0 20px 0;
}

.version-4 .card-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: auto;
}

.version-4 .card-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  border-radius: 3px;
  transition: width 1s ease;
}

.version-4 .activity-card .card-bar-fill {
  background: linear-gradient(90deg, #43a047, #66bb6a);
}

.version-4 .physical-card .card-bar-fill {
  background: linear-gradient(90deg, #1976d2, #42a5f5);
}

.version-4 .lifestyle-card .card-bar-fill {
  background: linear-gradient(90deg, #ffa000, #ffca28);
}



/* 반응형 스타일 */
@media (max-width: 768px) {
  .version-1 .score-content-v1 {
    flex-direction: column;
  }
  
  .version-2 .sub-score-card {
    flex-direction: column;
    text-align: center;
  }
  
  .version-2 .card-icon {
    margin: 0 auto 15px auto;
  }
  
  .version-3 .sub-gauges {
    flex-direction: column;
  }
  
  .version-4 .score-card-hero {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .version-4 .hero-content {
    order: 2;
    margin-top: 15px;
  }
  
  .version-4 .hero-graphic {
    order: 1;
    margin: 0 auto;
  }
  
  .version-4 .score-description {
    text-align: center;
    margin: 0 auto;
  }
  
  .version-4 .score-detail-cards {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .version-4 .card-inner {
    padding: 15px;
  }
  
  .version-4 .card-score {
    font-size: 1.8rem;
  }
  
  .version-4 .card-title {
    font-size: 0.85rem;
  }
  
  .version-5 .score-card-hero {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .version-4 .score-detail-cards {
    grid-template-columns: 1fr !important;
    gap: 15px;
  }
  
  .version-4 .hero-graphic {
    width: 150px;
    height: 150px;
  }
  
  .version-4 .ring-score {
    font-size: 2.5rem;
  }
}

.version-4 .score-card-hero {
  background: white;
  border-radius: 15px;
  padding: 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.version-4 .hero-content {
  flex: 1;
  min-width: 250px;
}

.version-4 .hero-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.version-4 .hero-subtitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00c2ff;
  margin-bottom: 15px;
}

.version-4 .score-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  max-width: 500px;
}

.version-4 .hero-graphic {
  width: 180px;
  height: 180px;
  position: relative;
}

.version-4 .detail-card {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  background: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.version-4 .detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* 최근 5일간 건강 점수 그래프 스타일 */
.health-score-history-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.health-score-history-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.score-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.score-history-header h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.graph-type-selector {
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.graph-container {
  margin-top: 20px;
}

.graph-legend {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
}

.gradient-legend {
  background: linear-gradient(to bottom, #8E24AA 0%, rgba(142, 36, 170, 0.1) 100%);
}

.legend-text {
  font-size: 0.9rem;
  color: #666;
}

.graph-content {
  height: 250px;
  position: relative;
}

.score-graph {
  width: 100%;
  height: 100%;
}

/* 선 그래프 애니메이션 */
.line-graph .score-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 1.5s ease-in-out forwards;
}

.line-graph .data-point {
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards 1.2s;
}

.line-graph .point-label {
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards 1.4s;
}

/* 막대 그래프 애니메이션 */
.bar-graph .score-bar {
  transform-origin: bottom;
  transform: scaleY(0);
  animation: growBar 1s ease-out forwards;
}

/* 영역 그래프 애니메이션 */
.area-graph .score-area {
  opacity: 0;
  animation: fadeIn 1.5s ease-in-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes growBar {
  to {
    transform: scaleY(1);
  }
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .score-history-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .graph-content {
    height: 220px;
  }
}

@media (max-width: 480px) {
  .graph-content {
    height: 200px;
  }
}

/* 건강 프로필 작성 안내 스타일 */
.health-profile-guide {
  background: white;
  border-radius: 15px;
  padding: 40px 30px;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px dashed rgba(255, 152, 0, 0.3);
}

.guide-content {
  max-width: 500px;
  margin: 0 auto;
}

.guide-icon {
  font-size: 64px;
  margin-bottom: 15px;
  color: #008cff;
}

.guide-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #008cff;
  margin-bottom: 15px;
}

.guide-description {
  font-size: 1rem;
  color: #00070c;
  margin-bottom: 25px;
  line-height: 1.5;
}

.guide-btn {
  background: linear-gradient(135deg, #57abf0, #48a6f3) !important;
  color: white;
  padding: 0 20px;
  height: 40px;
  border-radius: 20px;
  text-transform: none;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 3px 5px rgba(4, 183, 238, 0.3) !important;
  transition: all 0.3s ease;
}

.guide-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(4, 183, 238, 0.4) !important;
}
</style>




