<template>
    <v-container>
        <v-card flat class="fixed-header" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">추천 정모</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <div v-if="loadingMeetings" class="text-center my-4 loading-container">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <span class="ml-2">정모 정보를 불러오는 중...</span>
            </div>
            
            <div v-else-if="meetingsByDate.length === 0" class="text-center pa-4 empty-container">
                <v-icon size="large" color="grey">mdi-calendar-blank</v-icon>
                <p class="mt-2 mb-4">예정된 정모가 없습니다.</p>
                <v-btn color="primary" variant="tonal" @click="$router.push('/silverpotion/gathering/main')">모임 찾기</v-btn>
            </div>
            
            <div v-else>
                <!-- 날짜 선택 버튼 -->
                <div class="date-selector mb-4">
                    <v-slide-group
                        v-model="selectedDateIndex"
                        show-arrows
                        center-active
                        class="date-slide-group"
                    >
                        <v-slide-group-item
                            v-for="(dateInfo, index) in dateButtons"
                            :key="index"
                        >
                            <div class="date-btn-wrapper" @click="selectDate(index)">
                                <div class="date-btn" :class="{ 'date-btn-selected': selectedDateIndex === index }">
                                    <div class="date-month">{{ dateInfo.month }}월</div>
                                    <div class="date-day">{{ dateInfo.day }}</div>
                                    <div class="date-weekday">{{ dateInfo.dayOfWeek }}</div>
                                </div>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </div>
                
                <!-- 선택된 날짜의 정모 목록 -->
                <div v-if="selectedDateMeetings.length === 0" class="text-center pa-4 empty-container">
                    <p>선택한 날짜에 예정된 정모가 없습니다.</p>
                </div>
                
                <div v-else>
                    <v-list>
                        <v-list-item 
                            v-for="meeting in selectedDateMeetings" 
                            :key="meeting.meetingId"
                            class="mb-3 meeting-card"
                            @click="goToGatheringDetail(meeting.gatheringId)"
                            :ripple="true"
                            hover
                        >
                            <template v-slot:prepend>
                                <v-avatar size="60" rounded>
                                    <v-img :src="meeting.imageUrl || require('@/assets/default-gathering.png')" 
                                           contain
                                           bg-color="#f5f5f5"
                                           alt="정모 이미지"></v-img>
                                </v-avatar>
                            </template>
                            
                            <div>
                                <div class="d-flex align-center">
                                    <v-icon size="x-small" class="mr-1">mdi-calendar</v-icon>
                                    <span class="text-caption">{{ formatDate(meeting.meetingDate) }} {{ formatTime(meeting.meetingTime) }}</span>
                                </div>
                                <div class="d-flex align-center mt-1">
                                    <span class="font-weight-medium">{{ meeting.name }}</span>
                                    <v-chip
                                        size="x-small"
                                        class="ml-2"
                                        color="primary"
                                        variant="outlined"
                                    >
                                        {{ meeting.category || '카테고리 정보 없음' }}
                                    </v-chip>
                                </div>
                                <div class="d-flex align-center mt-1">
                                    <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                                    <span class="text-caption">{{ meeting.place }}</span>
                                    <v-icon size="x-small" class="ml-2 mr-1">mdi-account-multiple</v-icon>
                                    <span class="text-caption">{{ meeting.attendees ? meeting.attendees.length : 0 }}/{{ meeting.maxPeople }}명</span>
                                    <v-icon size="x-small" class="ml-2 mr-1">mdi-currency-krw</v-icon>
                                    <span class="text-caption">{{ meeting.cost }}원</span>
                                </div>
                                <div class="text-caption text-grey mt-1">
                                    <span>{{ meeting.gatheringName || '모임 정보 없음' }}</span>
                                </div>
                            </div>
                        </v-list-item>
                    </v-list>
                </div>
            </div>
        </div>
    </v-container>
</template>

<script>
import axios from 'axios';

export default{
    data(){
        return {
            upcomingMeetings: [],
            loadingMeetings: false,
            meetingError: null,
            selectedDateIndex: 0
        }
    },
    computed: {
        meetingsByDate() {
            const groupedMeetings = {};
            
            this.upcomingMeetings.forEach(meeting => {
                if (!groupedMeetings[meeting.meetingDate]) {
                    groupedMeetings[meeting.meetingDate] = [];
                }
                groupedMeetings[meeting.meetingDate].push(meeting);
            });
            
            // 각 날짜별로 정모를 시간순으로 정렬
            Object.keys(groupedMeetings).forEach(date => {
                groupedMeetings[date].sort((a, b) => {
                    return a.meetingTime.localeCompare(b.meetingTime);
                });
            });
            
            return Object.entries(groupedMeetings).map(([date, meetings]) => ({
                date,
                meetings
            })).sort((a, b) => new Date(a.date) - new Date(b.date));
        },
        selectedDateMeetings() {
            if (this.meetingsByDate.length === 0 || this.selectedDateIndex === null || this.selectedDateIndex < 0 || this.selectedDateIndex >= this.meetingsByDate.length) {
                return [];
            }
            
            return this.meetingsByDate[this.selectedDateIndex].meetings;
        },
        dateButtons() {
            // 정모가 있는 날짜만 버튼으로 표시
            if (this.meetingsByDate.length === 0) {
                // 정모가 없는 경우 오늘부터 7일간 표시
                const today = new Date();
                const buttons = [];
                
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    
                    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                    
                    buttons.push({
                        date: this.formatDateForApi(date),
                        day: date.getDate(),
                        dayOfWeek: dayNames[date.getDay()],
                        month: date.getMonth() + 1
                    });
                }
                
                return buttons;
            } else {
                // 정모가 있는 날짜만 버튼으로 표시
                return this.meetingsByDate.map(dateGroup => {
                    const date = new Date(dateGroup.date);
                    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                    
                    return {
                        date: dateGroup.date,
                        day: date.getDate(),
                        dayOfWeek: dayNames[date.getDay()],
                        month: date.getMonth() + 1
                    };
                });
            }
        }
    },
    mounted() {
        this.fetchUpcomingMeetings();
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        async fetchUpcomingMeetings() {
            this.loadingMeetings = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/upcoming`);
                const meetings = response.data.result || [];
                
                // 모임 정보 가져오기
                const meetingsWithGatheringInfo = await Promise.all(
                    meetings.map(async (meeting) => {
                        try {
                            const gatheringResponse = await axios.get(
                                `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${meeting.gatheringId}`
                            );
                            const gatheringInfo = gatheringResponse.data.result;
                            
                            return {
                                ...meeting,
                                gatheringName: gatheringInfo.gatheringName,
                                category: gatheringInfo.category,
                                region: gatheringInfo.region
                            };
                        } catch (err) {
                            console.error(`모임 정보를 불러오는데 실패했습니다 (ID: ${meeting.gatheringId}):`, err);
                            return {
                                ...meeting,
                                gatheringName: '모임 정보 없음',
                                category: '카테고리 정보 없음',
                                region: '지역 정보 없음'
                            };
                        }
                    })
                );
                
                this.upcomingMeetings = meetingsWithGatheringInfo;
            } catch (err) {
                console.error('정모 정보를 불러오는데 실패했습니다:', err);
                this.meetingError = '정모 정보를 불러오는데 실패했습니다.';
            } finally {
                this.loadingMeetings = false;
            }
        },
        formatDateForApi(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}/${day}`;
        },
        formatTime(timeString) {
            if (!timeString) return '';
            // HH:MM:SS 형식에서 HH:MM 형식으로 변환
            return timeString.substring(0, 5);
        },
        goToGatheringDetail(gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
        },
        selectDate(index) {
            if (index >= 0 && index < this.dateButtons.length) {
                this.selectedDateIndex = index;
            }
        }
    }
}
</script>

<style scoped>
.fixed-header {
    position: fixed;
    top: 56px; /* 기존 헤더 컴포넌트 높이에 맞게 조정 */
    left: 0;
    right: 0;
    z-index: 999;
    max-width: 768px; /* 앱 컨테이너 크기에 맞게 조정 */
    margin: 0 auto;
    width: 100%;
}

.content-wrapper {
    margin-top: 110px; /* 헤더 높이 + 기존 헤더 컴포넌트 높이에 맞게 조정 */
    padding: 0 16px;
    padding-bottom: 80px;
}

.date-selector {
    margin-bottom: 20px;
    overflow: visible;
}

.date-slide-group {
    padding: 4px;
}

.date-btn-wrapper {
    padding: 8px 4px;
    cursor: pointer;
}

.date-btn {
    width: 60px;
    height: 70px;
    border-radius: 8px;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.date-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background-color: transparent;
    transition: background-color 0.2s ease;
}

.date-btn-selected {
    background-color: #e8f0fe;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.date-btn-selected::before {
    background-color: var(--v-primary-base, #1976d2);
}

.date-month {
    font-size: 10px;
    color: #757575;
    margin-bottom: 2px;
}

.date-day {
    font-size: 22px;
    font-weight: 700;
    color: #212121;
    line-height: 1;
    margin-bottom: 4px;
}

.date-weekday {
    font-size: 12px;
    color: #616161;
    font-weight: 500;
}

.date-btn-selected .date-day {
    color: var(--v-primary-base, #1976d2);
}

.date-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0,0,0,0.15);
}

.attendees-avatars {
    display: flex;
    flex-wrap: wrap;
    max-width: 120px;
}

.empty-container {
    min-height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>