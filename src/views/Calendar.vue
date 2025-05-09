<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-calendar3 me-2"></i>
                일정 관리
              </h5>
              <button class="btn btn-primary" @click="openCreateModal">
                <i class="bi bi-plus-lg me-2"></i>
                일정 추가
              </button>
            </div>
          </div>
          <div class="card-body">
            <FullCalendar
              ref="calendar"
              :options="calendarOptions"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 일정 생성/수정 모달 -->
    <div class="modal fade" id="eventModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingEvent ? '일정 수정' : '새 일정' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEvent">
              <div class="mb-3">
                <label class="form-label">제목</label>
                <input type="text" class="form-control" v-model="newEvent.title" required>
              </div>
              <div class="mb-3">
                <label class="form-label">설명</label>
                <textarea class="form-control" v-model="newEvent.description" rows="3"></textarea>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">시작 시간</label>
                  <input type="datetime-local" class="form-control" v-model="newEvent.start" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">종료 시간</label>
                  <input type="datetime-local" class="form-control" v-model="newEvent.end">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">장소</label>
                <input type="text" class="form-control" v-model="newEvent.place">
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="newEvent.allDay" id="allDayCheck">
                  <label class="form-check-label" for="allDayCheck">
                    종일
                  </label>
                </div>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">취소</button>
                <button type="submit" class="btn btn-primary">저장</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 일정 상세 보기 모달 -->
    <div class="modal fade" id="eventDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ eventDetail?.title }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="eventDetail">
              <div class="mb-3">
                <i class="bi bi-text-paragraph me-2"></i>
                <span>{{ eventDetail.description }}</span>
              </div>
              <div class="mb-3">
                <i class="bi bi-clock me-2"></i>
                <span>{{ eventDetail.start }}</span>
              </div>
              <div class="mb-3">
                <i class="bi bi-clock-history me-2"></i>
                <span>{{ eventDetail.end }}</span>
              </div>
              <div class="mb-3" v-if="eventDetail.place">
                <i class="bi bi-geo-alt me-2"></i>
                <span>{{ eventDetail.place }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
            <button type="button" class="btn btn-primary me-2" @click="editEvent" v-if="selectedEvent?.extendedProps.source !== '정모'">수정</button>
            <button type="button" class="btn btn-danger" @click="deleteEvent">삭제</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import * as bootstrap from 'bootstrap';
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default {
  name: 'CalendarView',
  components: {
    FullCalendar
  },
  setup() {
    const calendar = ref(null);
    const selectedEvent = ref(null);
    const editingEvent = ref(null);
    const eventModal = ref(null);
    const eventDetailModal = ref(null);
    const eventDetail = ref(null);
    const newEvent = ref({
      title: '',
      description: '',
      start: '',
      end: '',
      place: '',
      allDay: false
    });

    const getModalInstance = (elementId) => {
      const element = document.getElementById(elementId);
      return element ? new bootstrap.Modal(element, { backdrop: false }) : null;
    };

    async function handleEventClick(info) {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/calendar/detail/${info.event.id}`
        );
        
        eventDetail.value = response.data.result;
        selectedEvent.value = info.event;
        eventDetailModal.value.show();
      } catch (error) {
        console.error('일정 상세 조회 실패:', error);
        if (error.response && error.response.data) {
          alert(error.response.data.status_message || '일정 상세 조회에 실패했습니다.');
        } else {
          alert('일정 상세 조회에 실패했습니다.');
        }
      }
    }

    function formatDateForInput(date) {
      if (!date) return '';
      return format(new Date(date), 'yyyy-MM-dd\'T\'HH:mm:ss');
    }

    function handleDateClick(info) {
      const clickedDate = new Date(info.date);
      clickedDate.setHours(9, 0, 0, 0);
      
      const endDate = new Date(clickedDate);
      endDate.setHours(clickedDate.getHours() + 1);
      
      newEvent.value = {
        title: '',
        description: '',
        start: formatDateForInput(clickedDate),
        end: formatDateForInput(endDate),
        place: '',
        allDay: false
      };
      eventModal.value.show();
    }

    function handleEventDrop(info) {
      updateEvent(info.event);
    }

    function handleEventResize(info) {
      updateEvent(info.event);
    }

    async function updateEvent(event) {
      try {
        const loginId = localStorage.getItem('loginId');
        const eventData = {
          ...event.extendedProps,
          start: event.start,
          end: event.end,
          allDay: event.allDay
        };
        await axios.put(
          `${process.env.VUE_APP_API_BASE_URL}/silverpotion/calendar/${event.id}`,
          eventData,
          { headers: { 'X-User-LoginId': loginId } }
        );
      } catch (error) {
        console.error('일정 수정 실패:', error);
      }
    }

    const calendarOptions = reactive({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      locale: 'ko',
      slotMinTime: '00:00:00',
      slotMaxTime: '24:00:00',
      allDaySlot: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEventRows: false,
      dayMaxEvents: false,
      height: 'parent',
      expandRows: true,
      weekends: true,
      events: [],
      eventClick: handleEventClick,
      dateClick: handleDateClick,
      eventDrop: handleEventDrop,
      eventResize: handleEventResize
    });

    function formatDateArrayToISO(dateArray) {
      if (!dateArray || !Array.isArray(dateArray)) return null;
      const [year, month, day, hour = 0, minute = 0] = dateArray;
      const date = new Date(year, month - 1, day, hour, minute);
      return date.toISOString();
    }

    async function fetchEvents() {
      try {
        const loginId = localStorage.getItem('loginId');
        
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/calendar/my`,
          { headers: { 'X-User-LoginId': loginId } }
        );
        
        let events = [];
        if (Array.isArray(response.data)) {
          events = response.data;
        } else if (response.data.result) {
          events = response.data.result;
        } else if (response.data.data) {
          events = response.data.data;
        } else if (response.data.calendars) {
          events = response.data.calendars;
        }

        const formattedEvents = events.map(event => {
          const formattedEvent = {
            id: event.id,
            title: event.title,
            start: formatDateArrayToISO(event.start),
            end: formatDateArrayToISO(event.end),
            allDay: event.allDay,
            backgroundColor: event.source === '정모' ? '#1976d2' : '#388e3c',
            borderColor: event.source === '정모' ? '#1976d2' : '#388e3c',
            extendedProps: {
              description: event.description,
              place: event.place,
              source: event.source
            }
          };
          return formattedEvent;
        });

        calendarOptions.events = formattedEvents;

        if (calendar.value) {
          calendar.value.getApi().removeAllEvents();
          calendar.value.getApi().addEventSource(formattedEvents);
        }
      } catch (error) {
        console.error('일정 조회 실패:', error);
      }
    }

    function formatDateTime(date) {
      return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko });
    }

    function openCreateModal() {
      newEvent.value = {
        title: '',
        description: '',
        start: '',
        end: '',
        place: '',
        allDay: false
      };
      eventModal.value.show();
    }

    function closeModal() {
      eventModal.value.hide();
      editingEvent.value = null;
    }

    async function saveEvent() {
      try {
        const loginId = localStorage.getItem('loginId');
        const eventData = {
          title: newEvent.value.title,
          description: newEvent.value.description,
          start: format(new Date(newEvent.value.start), 'yyyy-MM-dd\'T\'HH:mm:ss'),
          end: newEvent.value.end ? format(new Date(newEvent.value.end), 'yyyy-MM-dd\'T\'HH:mm:ss') : null,
          place: newEvent.value.place,
          allDay: newEvent.value.allDay
        };

        if (editingEvent.value) {
          eventData.id = editingEvent.value.id;
          await axios.put(
            `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/calendar/update`,
            eventData,
            { headers: { 'X-User-LoginId': loginId } }
          );
        } else {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/calendar/create`,
            eventData,
            { headers: { 'X-User-LoginId': loginId } }
          );
        }

        closeModal();
        fetchEvents();
      } catch (error) {
        console.error('일정 저장 실패:', error);
        if (error.response && error.response.data) {
          alert(error.response.data.status_message || '일정 저장에 실패했습니다.');
        } else {
          alert('일정 저장에 실패했습니다.');
        }
      }
    }

    function editEvent() {
      editingEvent.value = selectedEvent.value;
      newEvent.value = {
        id: selectedEvent.value.id,
        title: eventDetail.value.title,
        description: eventDetail.value.description,
        start: formatDateForInput(selectedEvent.value.start),
        end: formatDateForInput(selectedEvent.value.end),
        place: eventDetail.value.place,
        allDay: selectedEvent.value.allDay
      };
      eventDetailModal.value.hide();
      eventModal.value.show();
    }

    async function deleteEvent() {
      if (!confirm('정말로 이 일정을 삭제하시겠습니까?')) {
        return;
      }

      try {
        const loginId = localStorage.getItem('loginId');
        await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/calendar/delete/${selectedEvent.value.id}`,
          { headers: { 'X-User-LoginId': loginId } }
        );
        
        eventDetailModal.value.hide();
        fetchEvents();
      } catch (error) {
        console.error('일정 삭제 실패:', error);
        if (error.response && error.response.data) {
          alert(error.response.data.status_message || '일정 삭제에 실패했습니다.');
        } else {
          alert('일정 삭제에 실패했습니다.');
        }
      }
    }

    onMounted(() => {
      eventModal.value = getModalInstance('eventModal');
      eventDetailModal.value = getModalInstance('eventDetailModal');
      fetchEvents();
    });

    return {
      calendar,
      calendarOptions,
      selectedEvent,
      editingEvent,
      eventDetail,
      newEvent,
      formatDateTime,
      openCreateModal,
      saveEvent,
      editEvent,
      deleteEvent,
      closeModal
    };
  }
};
</script>

<style>
/* 날짜 숫자의 기본 a 태그 스타일 제거 (전역 적용) */
.fc-daygrid-day-number a {
  all: unset;
  color: #222 !important;
  font-weight: 500;
  pointer-events: none;
}

/* 오늘 날짜 강조 */
.fc-day-today .fc-daygrid-day-number a {
  color: #1976d2 !important;
  font-weight: 700;
}

/* 일요일 빨간색 */
.fc-day-sun .fc-daygrid-day-number a {
  color: #e74c3c !important;
}

/* 토요일도 일반색 */
.fc-day-sat .fc-daygrid-day-number a {
  color: #222 !important;
}

.container-fluid {
  min-height: 100vh;
  padding: 2rem;
  margin-bottom: 4rem;
}

.card {
  border-radius: 1rem;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.card-header {
  background-color: #e8f4ff !important;
  border-bottom: 2px solid #d1e7ff;
}

.btn-primary {
  background-color: #7eb6ff;
  border-color: #7eb6ff;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #5ca0ff;
  border-color: #5ca0ff;
  transform: translateY(-1px);
}

.card-body {
  height: 700px;
  overflow-y: auto;
  position: relative;
  padding: 1.5rem;
}

.fc {
  min-height: 700px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  margin-bottom: 2rem;
}

/* FullCalendar 헤더 고정 */
.fc-scrollgrid {
  border: none !important;
}

.fc .fc-scrollgrid-section-header {
  position: sticky !important;
  top: 0;
  z-index: 999 !important;
  background: #f8fbff !important;
}

.fc-scrollgrid-section-header table {
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  background: white !important;
}

.fc-scrollgrid-section-header th {
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  background: white !important;
  border-bottom: 2px solid #e8f4ff !important;
}

.fc-scrollgrid-section-header .fc-scrollgrid-sync-inner {
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  background: white !important;
}

/* 내부 스크롤러 설정 */
.fc-scroller {
  overflow: visible !important;
}

.fc-scroller-liquid-absolute {
  position: relative !important;
}

.fc .fc-scrollgrid-section-body {
  overflow-y: auto !important;
  max-height: 500px;
}

.fc-scrollgrid-section-body table {
  min-height: 100% !important;
}

.fc-daygrid-day-frame {
  min-height: 100px;
}

.fc-event {
  cursor: pointer;
  margin: 2px 0 !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
  border-radius: 8px !important;
  min-height: 24px !important;
  transition: all 0.2s ease;
}

.fc-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.fc-toolbar-title {
  font-size: 1.5rem;
  color: #4a90e2;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.fc-button-primary {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: -0.3px;
}

.fc-button-primary:hover {
  background-color: #5ca0ff !important;
  border-color: #5ca0ff !important;
  transform: translateY(-1px);
}

.fc-button-primary:not(:disabled).fc-button-active {
  background-color: #4a90e2 !important;
  border-color: #4a90e2 !important;
}

.fc-timegrid-event {
  margin: 2px 0 !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
  border-radius: 8px !important;
  min-height: 24px !important;
}

.fc-daygrid-event {
  margin: 2px 0 !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
  border-radius: 8px !important;
  min-height: 24px !important;
}

.fc-event-title {
  font-weight: 500;
  font-size: 0.9rem;
  letter-spacing: -0.2px;
  padding: 2px 6px;
}

.fc-event-time {
  font-size: 0.85rem;
  font-weight: 400;
  opacity: 0.9;
  padding: 2px 6px;
}

.fc-day-today {
  background-color: #f0f7ff !important;
}

.fc-day-today .fc-daygrid-day-number {
  font-weight: 700;
  color: #1976d2;
}

.fc-day-today .fc-daygrid-day-number:hover {
  text-decoration: none !important;
  color: #4a90e2 !important;
}

.fc-day-other {
  background-color: #fafafa;
}

.fc-day-other .fc-daygrid-day-number {
  color: #9e9e9e;
  text-decoration: none !important;
}

.fc-day-other .fc-daygrid-day-number:hover {
  text-decoration: none !important;
  color: #4a90e2 !important;
}

.fc-theme-standard td, .fc-theme-standard th {
  border-color: #e8f4ff;
}

/* 날짜 숫자를 기본 검정색으로 설정 (링크 스타일 제거) */
.fc-daygrid-day-number {
  color: #222 !important;
  text-decoration: none !important;
  cursor: default !important;
  pointer-events: none;
  font-weight: 500;
}

/* 오늘 날짜 강조 */
.fc-day-today .fc-daygrid-day-number {
  font-weight: 700;
  color: #1976d2;
}

/* 일요일 빨간색 */
.fc-day-sun .fc-daygrid-day-number {
  color: #e74c3c !important;
}

/* 토요일도 일반색 */
.fc-day-sat .fc-daygrid-day-number {
  color: #222 !important;
}

/* hover 효과 제거 */
.fc-daygrid-day-number:hover {
  color: inherit !important;
  text-decoration: none !important;
  cursor: default !important;
}

.modal-content {
  border-radius: 1rem;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background-color: #e8f4ff;
  border-bottom: 2px solid #d1e7ff;
  border-radius: 1rem 1rem 0 0;
}

.form-control:focus {
  border-color: #7eb6ff;
  box-shadow: 0 0 0 0.2rem rgba(126, 182, 255, 0.25);
}

.form-control {
  border-radius: 8px;
  border: 1px solid #d1e7ff;
}

.form-control:hover {
  border-color: #7eb6ff;
}

.btn-danger {
  background-color: #ff9eb6;
  border-color: #ff9eb6;
}

.btn-danger:hover {
  background-color: #ff7a9a;
  border-color: #ff7a9a;
}

.btn-secondary {
  background-color: #b4c6ff;
  border-color: #b4c6ff;
}

.btn-secondary:hover {
  background-color: #9ab0ff;
  border-color: #9ab0ff;
}

/* 모달 스타일 수정 */
.modal-dialog {
  margin: 1.75rem auto;
  max-width: 500px;
}

/* 페이지 전체 여백 조정 */
body {
  padding-bottom: 4rem;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

html {
  overflow-y: auto;
  height: 100%;
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #7eb6ff;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #5ca0ff;
}

.fc-day-sun .fc-daygrid-day-number {
  color: #e74c3c !important;
}
.fc-day-mon .fc-daygrid-day-number,
.fc-day-tue .fc-daygrid-day-number,
.fc-day-wed .fc-daygrid-day-number,
.fc-day-thu .fc-daygrid-day-number,
.fc-day-fri .fc-daygrid-day-number,
.fc-day-sat .fc-daygrid-day-number {
  color: #222 !important;
}

/* 날짜 숫자의 기본 a 태그 스타일 제거 */
.fc-daygrid-day-number a {
  all: unset;
  color: #222 !important;
  font-weight: 500;
  pointer-events: none;
}

::v-deep(.fc-daygrid-day-number a) {
  all: unset;
  color: #222 !important;
  font-weight: 500;
  pointer-events: none;
}

.fc-col-header-cell {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #222;
  letter-spacing: -0.5px;
  background: #f8fbff;
  border-bottom: 2px solid #e8f4ff;
  padding: 12px 0;
}

.fc-col-header-cell-cushion {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #222;
  letter-spacing: -0.5px;
  background: transparent;
  padding: 0 2px;
  user-select: none;
}

/* 요일 헤더 - 일요일 빨간색 */
.fc-day-sun .fc-col-header-cell-cushion {
  color: #e74c3c !important;
}

/* 요일 헤더 - 토요일 파란색 */
.fc-day-sat .fc-col-header-cell-cushion {
  color: #1976d2 !important;
}

/* 월간/주간/일간: 요일 헤더 고정 */
.fc .fc-scrollgrid-section-header,
.fc .fc-col-header {
  position: sticky !important;
  top: 0 !important;
  z-index: 999 !important;
  background: #f8fbff !important;
}

/* 주간/일간: 시간 헤더(09:00 등) 고정 */
.fc .fc-timegrid-axis,
.fc .fc-timegrid-slot-label {
  position: sticky !important;
  left: 0 !important;
  z-index: 998 !important;
  background: #f8fbff !important;
}

@media (max-width: 600px) {
  .fc-header-toolbar,
  .fc-toolbar,
  .fc-toolbar-ltr {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.5rem !important;
  }
  .fc-toolbar-title {
    font-size: 1.1rem !important;
    text-align: center !important;
    margin-bottom: 0.5rem !important;
  }
  .fc .fc-button-group,
  .fc .fc-button {
    width: 100% !important;
    margin: 0.1rem 0 !important;
    font-size: 0.95rem !important;
    padding: 0.5rem 0 !important;
  }
  .fc .fc-button {
    min-width: 0 !important;
  }
}
</style>
