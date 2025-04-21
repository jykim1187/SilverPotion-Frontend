<template>
  <div class="health-report">
    <div class="report-header">
      <div class="title-section">
        <div class="logo">
          <v-icon large color="white">mdi-file-document</v-icon>
        </div>
        <h1 class="user-name-title">{{ userName }} 님의 건강 리포트</h1>
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
          {{ formattedDate }}
        </v-chip>
      </div>
    </div>

    <!-- 미니멀 디자인 -->
    <div class="report-container minimal">
      <div class="minimal-header">
        <div class="minimal-title" v-if="type === 'DAY'">일일 건강 리포트</div>
        <div class="minimal-title" v-if="type === 'WEEKAVG'">주간 건강 리포트</div>
        <div class="minimal-title" v-if="type === 'MONTHAVG'">월간 건강 리포트</div>
        <div class="minimal-subtitle">{{ userName }} | {{ formattedDate }}</div>
      </div>

      <div class="minimal-divider"></div>

      <div class="minimal-section">
        <div class="minimal-section-title">요약</div>
        <p class="minimal-paragraph">{{ reportData.summary }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">걸음</div>
        <p class="minimal-paragraph">{{ reportData.summary }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">심장 박동</div>
        <p class="minimal-paragraph">{{ reportData.summary }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">소모 칼로리</div>
        <p class="minimal-paragraph">{{ reportData.summary }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">수면</div>
        <p class="minimal-paragraph">{{ reportData.summary }}</p>
      </div>

      <div class="minimal-section">
        <div class="minimal-section-title">추천 사항</div>
        <div class="minimal-recommendations">
          <div class="minimal-recommendation" v-for="(recommendation, index) in reportData.recommendations" :key="index">
            <span class="minimal-recommendation-number">{{ index + 1 }}</span>
            <span class="minimal-recommendation-text">{{ recommendation.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatePickerRange from "@/components/DatePickerRange.vue";

export default {
  name: 'HealthReportComponent',
  components: {
    DatePickerRange
  },
  props: {
    loginId: String,
    type: String,
    targetDate: String,
    userName: String,
    userLongId: Number
  },
  data() {
    return {
      currentDate: new Date().toISOString().split('T')[0],
      showDatePicker: false,
      selectedDesign: 'modern', // 기본 디자인: modern, minimal, colorful
      reportData: {
        summary: "최근 건강 데이터를 분석한 결과, 전반적인 건강 상태는 양호합니다. 심박수와 수면 패턴이 안정적이며, 활동량이 적절합니다. 다만 지난 주에 비해 걸음 수가 약간 감소했으니 일상 활동을 조금 더 늘리는 것이 좋겠습니다.",
        metrics: [
          { 
            title: "심박수", 
            value: "72 BPM", 
            status: "normal", 
            statusText: "정상",
            icon: "mdi-heart-pulse"
          },
          { 
            title: "평균 수면 시간", 
            value: "7시간 30분", 
            status: "good", 
            statusText: "양호",
            icon: "mdi-sleep"
          },
          { 
            title: "일일 평균 걸음 수", 
            value: "8,250 걸음", 
            status: "warning", 
            statusText: "주의",
            icon: "mdi-shoe-print"
          },
          { 
            title: "소모 칼로리", 
            value: "1,850 kcal", 
            status: "good", 
            statusText: "양호",
            icon: "mdi-fire"
          }
        ],
        recommendations: [
          { 
            text: "하루 10,000걸음을 목표로 조금 더 걸으시는 것이 좋겠습니다.", 
            icon: "mdi-walk" 
          },
          { 
            text: "심박수 관리를 위해 규칙적인 유산소 운동을 주 3회 이상 하시기 바랍니다.", 
            icon: "mdi-heart" 
          },
          { 
            text: "수면의 질을 높이기 위해 취침 전 전자기기 사용을 줄이는 것이 좋습니다.", 
            icon: "mdi-power-sleep" 
          },
          { 
            text: "수분 섭취량을 늘려 하루 2리터 이상 물을 마시는 것을 권장합니다.", 
            icon: "mdi-cup-water" 
          }
        ]
      }
    }
  },
  computed: {
    formattedDate() {
      if (!this.targetDate) return '2023-11-20'; // 기본값
      
      const date = new Date(this.targetDate);
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    },
    reportTypeText() {
      switch(this.type) {
        case 'DAY': return '일일';
        case 'WEEKAVG': return '주간';
        case 'MONTHAVG': return '월간';
        default: return '일일';
      }
    }
  },
  methods: {
    toggleDatePicker() {
      this.showDatePicker = !this.showDatePicker;
    },
    
    handleDateChange(dateRange) {
      if (dateRange && dateRange !== 'NaN-NaN-NaN' && dateRange.match(/^\d{4}-\d{2}-\d{2}$/)) {
        this.currentDate = dateRange;
        this.showDatePicker = false;
        this.fetchReportData();
      } else {
        console.error('유효하지 않은 날짜 형식:', dateRange);
      }
    },
    
    fetchReportData() {
      // 실제 구현 시에는 API로 데이터를 가져옴
      // 현재는 더미 데이터 사용
      console.log(`리포트 데이터 가져오기: ${this.loginId}, ${this.type}, ${this.targetDate}`);
      
      // 타입에 따라 다른 데이터 표시 (실제로는 API에서 가져온 데이터 사용)
      if (this.type === 'WEEKAVG') {
        this.reportData.summary = "주간 건강 데이터를 분석한 결과, 활동량이 증가하고 있습니다. 특히 심박수와 수면의 질이 개선되고 있어 긍정적입니다. 이대로 꾸준히 건강 관리를 계속하시면 좋겠습니다.";
      } else if (this.type === 'MONTHAVG') {
        this.reportData.summary = "한 달간의 건강 데이터를 종합했을 때, 전반적인 건강 패턴이 안정적입니다. 월초에 비해 월말로 갈수록 활동량이 증가하고 있으며, 평균 심박수도 정상 범위를 유지하고 있습니다.";
      }
    }
  },
  mounted() {
    // 부모 컴포넌트에서 전달받은 targetDate 사용
    this.currentDate = this.targetDate;
    this.fetchReportData();
  },
  watch: {
    loginId() {
      this.fetchReportData();
    },
    type() {
      this.fetchReportData();
    },
    targetDate(newDate) {
      this.currentDate = newDate;
      this.fetchReportData();
    }
  }
}
</script>

<style scoped>
/* 공통 스타일 */
.health-report {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 12px;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  background-color: #f5f5f5;
  border-radius: 12px 12px 0 0;
  margin-bottom: 20px;
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

.user-name-title {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #333;
}

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
}

/* 미니멀 디자인 스타일 */
.minimal {
  padding: 40px;
  background-color: white;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
}

.minimal-header {
  text-align: center;
  margin-bottom: 30px;
}

.minimal-title {
  font-size: 2rem;
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
  margin: 30px 0;
}

.minimal-section {
  margin-bottom: 40px;
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
  line-height: 1.8;
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


/* 모바일 반응형 */
@media (max-width: 768px) {
  .modern .metrics-grid,
  .modern .recommendations-list,
  .colorful-metrics-container,
  .colorful-recommendation-list {
    grid-template-columns: 1fr;
  }
  
  .minimal-metric {
    width: calc(50% - 10px);
  }
  
  .colorful-header {
    padding: 30px 20px;
  }
  
  .colorful-title {
    font-size: 1.8rem;
  }
  
  .modern .metric-value,
  .minimal-metric-value,
  .colorful-metric-value {
    font-size: 1.5rem;
  }
  
  .report-header {
    flex-direction: column;
    padding: 16px;
  }
  
  .title-section {
    margin-bottom: 15px;
  }
  
  .user-name-title {
    font-size: 1.5rem;
  }
}
</style>


