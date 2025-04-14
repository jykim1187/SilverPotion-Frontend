<template>
  <div class="date-picker-wrapper">
    <VueDatePicker
      range
      locale="ko"
      v-model="date"
      :format="dateRangeFormat"
      :enable-time-picker="false"
      @update:model-value="handleDate"
      auto-apply
    />
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const emit = defineEmits(["handleDateChange"]);

const date = ref();

const handleDate = (modelData) => {
  let days = "";

  for (let rangeDate of modelData) {
    const date = new Date(rangeDate);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    days = days += `-${formattedDate}`;
  }

  date.value = modelData;
};

onMounted(() => {
  const startDate = new Date();
  const endDate = new Date(new Date().setDate(startDate.getDate() + 7));
  date.value = [startDate, endDate];
});

const dateRangeFormat = (value) => {
  const startDate = value[0];
  const endDate = value[1];

  if (startDate && endDate) {
    const startYear = startDate.getFullYear();
    const startMonth = (startDate.getMonth() + 1).toString().padStart(2, "0");
    const startDay = startDate.getDate().toString().padStart(2, "0");

    const endYear = endDate.getFullYear();
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, "0");
    const endDay = endDate.getDate().toString().padStart(2, "0");

    emit(
      "handleDateChange",
      `${startYear}-${startMonth}-${startDay}-${endYear}-${endMonth}-${endDay}`
    );

    return `${startYear}-${startMonth}-${startDay} ~ ${endYear}-${endMonth}-${endDay}`;
  }
  return "";
};
</script>

<style scoped>
.date-picker-wrapper {
  position: relative;
  z-index: 99999;
  width: 100%;
}

:deep(.dp__main) {
  width: 100%;
}

:deep(.dp__input_wrap) {
  width: 100%;
}

:deep(.dp__input) {
  width: 100%;
  font-size: 14px;
  padding: 8px;
}

:deep(.dp__menu) {
  z-index: 99999 !important;
}
</style>