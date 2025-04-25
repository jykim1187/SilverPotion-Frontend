<template>
  <div class="date-picker-wrapper">
    <!-- update는 사용자가 날짜를 선택하면handleDate호출 -->
    <VueDatePicker
      :range="false"
      :month-picker="props.type === 'MONTHAVG'"
      :week-picker="props.type === 'WEEKAVG'"
      locale="ko"
      v-model="date"  
      :inline="true"
      :hide-input="true"
      :enable-time-picker="false"
      :max-date="computedMaxDate"
      @update:model-value="handleDate" 
      auto-apply
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps, computed } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
// 부모 컴포넌트(HealthDate)로 handleDateChange 이벤트 전달하기 위한 설정
const emit = defineEmits(["handleDateChange"]);
const props = defineProps({
  type: String,
  maxDate: Date,
  isHealthData: {
    type: Boolean,
    default: false
  }
});
const date = ref();

// 데이터 타입별로 최대 날짜 계산
const computedMaxDate = computed(() => {
  // props.maxDate가 있는 경우 우선 적용 (건강 리포트용)
  if (props.maxDate) {
    return props.maxDate;
  }
  
  // 건강 데이터일 경우에만 커스텀 최대 날짜 적용
  if (props.isHealthData) {
    const today = new Date();
    
    if (props.type === 'DAY') {
      // 실시간 데이터는 오늘까지 선택 가능
      return today;
    } else if (props.type === 'WEEKAVG') {
      // 주간 평균은 저번 주까지만 선택 가능
      const lastWeek = new Date(today);
      const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
      const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
      lastWeek.setDate(today.getDate() - daysToLastSunday);
      return lastWeek;
    } else if (props.type === 'MONTHAVG') {
      // 월간 평균은 저번 달까지만 선택 가능
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return lastMonth;
    }
  }
  
  // 기본값은 현재 날짜
  return new Date();
});

// 날짜가 Date 객체인지 확인하고, 다양한 형태의 날짜 데이터를 Date 객체로 변환하는 함수
function ensureDateObject(date) {
  if (!date) return null;
  
  // 이미 Date 객체인 경우
  if (date instanceof Date) return date;
  
  // 배열인 경우 (Week picker에서 받는 값 형태)
  if (Array.isArray(date)) {
    return new Date(date[0]);
  }
  
  // 객체인 경우 (Month picker에서 받는 값 형태: {month, year})
  if (typeof date === 'object' && date !== null) {
    if ('month' in date && 'year' in date) {
      return new Date(date.year, date.month, 1);
    }
    if ('getTime' in date && typeof date.getTime === 'function') {
      return date;
    }
  }
  
  // 문자열인 경우
  if (typeof date === 'string') {
    return new Date(date);
  }
  
  console.error('날짜 변환 실패:', date);
  return new Date(); // 실패 시 현재 날짜 반환
}

// 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 날짜 범위 형식 처리
function dateRangeFormat(date, type) {
  const dateValue = ensureDateObject(date);
  
  if (!dateValue) return null;
  
  if (type === 'WEEKAVG') {
    // 선택된 날짜의 요일 계산
    const day = dateValue.getDay();
    // 해당 주의 월요일로 계산
    const diff = dateValue.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(dateValue);
    monday.setDate(diff);
    
    if (props.isHealthData) {
      // 건강 데이터인 경우, 선택한 주의 다음주 월요일 계산
      const nextMonday = new Date(monday);
      nextMonday.setDate(monday.getDate() + 7); 
      console.log('선택한 주 월요일:', formatDateToYYYYMMDD(monday));
      console.log('다음주 월요일:', formatDateToYYYYMMDD(nextMonday));
      
      return formatDateToYYYYMMDD(nextMonday);
    } else {
      // 리포트인 경우, 건강 리포트는 선택한 주의 월요일 반환 (해당 주의 리포트를 가져오기 위해)
      const nextMonday = new Date(monday);
      nextMonday.setDate(monday.getDate() + 7); 
      console.log('선택한 주 월요일:', formatDateToYYYYMMDD(monday));
      console.log('다음주 월요일:', formatDateToYYYYMMDD(nextMonday));
      return formatDateToYYYYMMDD(nextMonday);
    }
  } else if (type === 'MONTHAVG') {
    console.log('dateValue 년:', dateValue.getFullYear());
    console.log('dateValue 월:', dateValue.getMonth());

  const firstDay = new Date(dateValue.getFullYear(), dateValue.getMonth(), 1);
  console.log('바로 선택한 달 1일:', formatDateToYYYYMMDD(firstDay));  // 선택한 달 1일

  if (props.isHealthData) {
    const nextMonthFirstDay = new Date(dateValue.getFullYear(), dateValue.getMonth() + 1, 1);  // 다음달 1일
    console.log('선택한 달 1일:', formatDateToYYYYMMDD(nextMonthFirstDay));
    return formatDateToYYYYMMDD(nextMonthFirstDay);
  } else {
    const nextMonthFirstDay = new Date(dateValue.getFullYear(), dateValue.getMonth() + 1, 1);  // 다음달 1일
    console.log('선택한 달 1일:', formatDateToYYYYMMDD(nextMonthFirstDay));
    return formatDateToYYYYMMDD(nextMonthFirstDay);
  }
  } else {
    // DAY 타입
  if(props.isHealthData){
    const today = new Date(dateValue);
    console.log('선택한 날짜:', formatDateToYYYYMMDD(today));
    return formatDateToYYYYMMDD(today);
  } else {  
    const nextDay = new Date(dateValue);
    nextDay.setDate(dateValue.getDate()+1);
    console.log('선택한 날짜:', formatDateToYYYYMMDD(nextDay));
    return formatDateToYYYYMMDD(nextDay);
  }
  }
}

// 사용자가 날짜를 선택하면 실행되는 함수
function handleDate(dateValue) {
  // 콘솔에 현재 선택된 날짜 형태 확인
  console.log('선택된 날짜 형태:', dateValue, 'type:', typeof dateValue);

  let tempDate = dateValue;
  
  if (props.type === 'MONTHAVG' && typeof dateValue === 'object' && 'month' in dateValue && 'year' in dateValue) {  
  // 강제로 Date 객체로 변환 (month는 0부터 시작하니까 그대로)
  tempDate = new Date(dateValue.year, dateValue.month, 1);
  console.log('강제 변환된 tempDate:', tempDate);
}
  // Date 객체로 변환
  const dateObj = ensureDateObject(tempDate);
  

  if (!dateObj) {
    console.error('날짜 변환 실패:', dateValue);
    return;
  }
  
  // 백엔드에 전송할 날짜 형식으로 변환
  const formattedDate = dateRangeFormat(dateObj, props.type);
  
  if (formattedDate) {
    console.log('백엔드로 전송될 날짜:', formattedDate);
    emit('handleDateChange', formattedDate);
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  const today = new Date();
  
  // 초기 날짜 설정
  if (props.isHealthData) {
    if (props.type === 'DAY') {
      // 건강 데이터 일일 조회: 오늘 날짜
      date.value = today;
      
      // 오늘 날짜 그대로 전송 (내일 날짜로 변환하지 않음)
      setTimeout(() => {
        console.log('초기 설정 - 오늘 날짜:', formatDateToYYYYMMDD(today));
        emit('handleDateChange', formatDateToYYYYMMDD(today));
      }, 100);
      
      // 다른 타입에 대한 초기화 방지
      return;
    } else if (props.type === 'WEEKAVG') {
      // 건강 데이터 주간 평균: 이번주 월요일
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today);
      monday.setDate(diff);
      date.value = monday;
      
      // 초기값일 경우에도 다음주 월요일 계산 (UI에는 이번주 월요일 표시)
      const nextMonday = new Date(monday);
      nextMonday.setDate(monday.getDate() + 7);
      
      // 0.1초 후 이벤트 발생
      setTimeout(() => {
        console.log('초기 설정 - 다음주 월요일:', formatDateToYYYYMMDD(nextMonday));
        emit('handleDateChange', formatDateToYYYYMMDD(nextMonday));
      }, 100);
      
      // 다른 타입에 대한 초기화 방지
      return;
    } else if (props.type === 'MONTHAVG') {
      // 건강 데이터 월간 평균: 이번달 1일
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      console.log('월간탭 초기화 시간', formatDateToYYYYMMDD(firstDay));
      date.value = firstDay;
      
      // 이번달 1일을 그대로 사용 (UI에는 이번달 1일 표시)
      // 0.1초 후 이벤트 발생
      setTimeout(() => {
        console.log('초기 설정 - 이번달 1일:', formatDateToYYYYMMDD(firstDay));
        emit('handleDateChange', formatDateToYYYYMMDD(firstDay));
      }, 100);
      
      // 다른 타입에 대한 초기화 방지
      return;
    }
  } else {
    if (props.type === 'MONTHAVG' && props.maxDate) {
      // maxDate는 3월 31일로 제한 → 선택은 여기까지만
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      console.log('월간탭 초기화 시간', formatDateToYYYYMMDD(firstDay));
      date.value = firstDay;
      
      // 이번달 1일을 그대로 사용 (UI에는 이번달 1일 표시)
      // 0.1초 후 이벤트 발생
      setTimeout(() => {
        console.log('초기 설정 - 이번달 1일:', formatDateToYYYYMMDD(firstDay));
        emit('handleDateChange', formatDateToYYYYMMDD(firstDay));
      }, 100);
    
      // 다른 타입에 대한 초기화 방지
      return;
    } else if (props.type === 'DAY') {
      // 건강 리포트 실시간 탭: 오늘 날짜로 초기화
      date.value = today;
      
      // 건강 리포트는 초기화 시 이벤트를 발생시키지 않음 (HealthReportComponent에서 직접 처리)
      return;
    } else if (props.maxDate && props.maxDate < today) {
      date.value = props.maxDate;
    } else {
      date.value = today;
    }
  }
  
  // DAY 타입 또는 건강 리포트의 경우에만 실행 (단, 건강 리포트의 DAY 타입은 제외)
  setTimeout(() => {
    // 건강 리포트(isHealthData=false)의 DAY 타입인 경우 호출하지 않음
    if (!props.isHealthData && props.type === 'DAY') {
      console.log('건강 리포트 DAY 타입은 초기 설정을 건너뜁니다.');
      return;
    }
    
    const formattedDate = dateRangeFormat(date.value, props.type);
    if (formattedDate) {
      console.log('초기 설정 날짜:', formattedDate);
      emit('handleDateChange', formattedDate);
    }
  }, 100);
});
</script>

<style scoped>
.date-picker-wrapper {
  position: static;
  z-index: 99999;
  width: 100%;
}

:deep(.dp__main),
:deep(.dp__input_wrap),
:deep(.dp__input) {
  width: 100%;
  font-size: 14px;
  box-sizing: border-box;
}

:deep(.dp__menu) {
  z-index: 99999 !important;
}
</style>