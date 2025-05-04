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
import { ref, onMounted } from 'vue';
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

    const calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
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
      dayMaxEvents: true,
      weekends: true,
      events: [],
      eventClick: handleEventClick,
      dateClick: handleDateClick,
      eventDrop: handleEventDrop,
      eventResize: handleEventResize
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
      const d = new Date(date);
      return d.toISOString().slice(0, 16);
    }

    function handleDateClick(info) {
      const clickedDate = new Date(info.date);
      clickedDate.setHours(9, 0, 0, 0); // 기본 시작 시간을 오전 9시로 설정
      
      newEvent.value = {
        title: '',
        description: '',
        start: formatDateForInput(clickedDate),
        end: '',
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

    function formatDateArrayToISO(dateArray) {
      if (!dateArray || !Array.isArray(dateArray)) return null;
      const [year, month, day, hour = 0, minute = 0] = dateArray;
      const date = new Date(year, month - 1, day, hour, minute);
      return date.toISOString();
    }

    async function fetchEvents() {
      try {
        const loginId = localStorage.getItem('loginId');
        console.log('Fetching events with loginId:', loginId);
        
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/calendar/my`,
          { headers: { 'X-User-LoginId': loginId } }
        );
        
        console.log('API Response:', response.data);
        
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

        console.log('Processed events:', events);

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
          console.log('Formatted event:', formattedEvent);
          return formattedEvent;
        });

        calendarOptions.events = formattedEvents;
        console.log('Calendar options events:', calendarOptions.events);

        if (calendar.value) {
          console.log('Refreshing calendar events');
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
          id: editingEvent.value ? editingEvent.value.id : null,
          title: newEvent.value.title,
          description: newEvent.value.description,
          start: new Date(newEvent.value.start),
          end: newEvent.value.end ? new Date(newEvent.value.end) : null,
          place: newEvent.value.place,
          allDay: newEvent.value.allDay
        };

        if (editingEvent.value) {
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

<style scoped>
.card {
  border-radius: 0.5rem;
}

.modal-content {
  border-radius: 0.5rem;
}

.modal-dialog {
  margin-top: 100px !important;
}

.modal {
  z-index: 1050 !important;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #bb2d3b;
  border-color: #b02a37;
}

.fc {
  height: calc(100vh - 200px) !important;
}

.fc-event {
  cursor: pointer;
  margin: 1.5px 0 !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
  height: calc(100% - 3px) !important;
  border-radius: 2px !important;
  min-height: 20px !important;
}

.fc-event:hover {
  opacity: 0.9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
}

.fc-toolbar-title {
  font-size: 1.25rem;
}

.fc-button-primary {
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
}

.fc-button-primary:hover {
  background-color: #0b5ed7 !important;
  border-color: #0a58ca !important;
}

.fc-button-primary:not(:disabled).fc-button-active {
  background-color: #0a58ca !important;
  border-color: #0a58ca !important;
}

/* 이벤트 간격 추가 */
.fc-timegrid-event {
  margin: 1.5px 0 !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
  height: calc(100% - 3px) !important;
  border-radius: 2px !important;
  min-height: 20px !important;
}

.fc-daygrid-event {
  margin: 1.5px 0 !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
  height: calc(100% - 3px) !important;
  border-radius: 2px !important;
  min-height: 20px !important;
}

/* 이벤트 내용 스타일 */
.fc-event-title {
  font-weight: 500;
  padding: 0 4px;
  font-size: 0.9em;
}

.fc-event-time {
  font-size: 0.8em;
  opacity: 0.8;
  padding: 0 4px;
}
</style>
