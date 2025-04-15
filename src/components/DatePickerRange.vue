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
      :format="dateRangeFormat"
      :enable-time-picker="false"
      @update:model-value="handleDate" 
      auto-apply
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
// 부모 컴포넌트(HealthDate)로 handleDateChange 이벤트 전달하기 위한 설정
const emit = defineEmits(["handleDateChange"]);
const props = defineProps({
  type: String,
});
const date = ref();
// 사용자가 날짜를 선택하면 handleDate 날짜선택함수 호출
const handleDate = (modelData) => {
  // 단순히 date.value 업데이트만 수행
  // 실제 날짜 형식 변환 및 emit은 dateRangeFormat 함수에서 처리
  date.value = modelData;
};

onMounted(() => {
  const today = new Date();
  date.value = today;
  
  // 마운트 시 초기 날짜 선택 시에도 dateRangeFormat을 한 번 실행하여 
  // 부모 컴포넌트에 적절한 형식의 날짜 전달
  if (date.value) {
    dateRangeFormat(date.value);
  }
});

const dateRangeFormat = (value) => {
  // 모든 타입에서 단일 값 처리
  const date = value;
  if (!date) return "";
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  
  const formattedDate = `${year}-${month}-${day}`;
  
  // WEEKAVG일 때 주 표시, MONTHAVG일 때 월 표시
  if (props.type === 'WEEKAVG') {
    // 주의 시작일(월요일)과 끝일(일요일) 계산
    const dayOfWeek = date.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 일요일이면 -6, 아니면 1에서 현재 요일 빼기
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const mondayYear = monday.getFullYear();
    const mondayMonth = (monday.getMonth() + 1).toString().padStart(2, "0");
    const mondayDay = monday.getDate().toString().padStart(2, "0");
    
    const sundayMonth = (sunday.getMonth() + 1).toString().padStart(2, "0");
    const sundayDay = sunday.getDate().toString().padStart(2, "0");
    
    // 월요일 날짜를 백엔드로 전달 (YYYY-MM-DD 형식)
    const mondayDate = `${mondayYear}-${mondayMonth}-${mondayDay}`;
    emit("handleDateChange", mondayDate);
    
    return `${mondayYear}년 ${mondayMonth}월 ${mondayDay}일 - ${sundayMonth}월 ${sundayDay}일`;
  } else if (props.type === 'MONTHAVG') {
    // 선택한 월의 1일로 설정 (YYYY-MM-DD 형식)
    const firstDayDate = `${year}-${month}-01`;
    emit("handleDateChange", firstDayDate);
    return `${year}년 ${month}월`;
  } else {
    emit("handleDateChange", formattedDate);
    return formattedDate;
  }
};
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