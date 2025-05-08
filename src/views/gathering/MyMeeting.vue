<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">참가 예정 정모</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <!-- 로딩 상태 -->
            <div v-if="loading" class="text-center my-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">정모 정보를 불러오는 중...</p>
            </div>
            
            <!-- 에러 상태 -->
            <div v-else-if="error" class="text-center pa-4">
                <v-icon color="error" size="large">mdi-alert-circle</v-icon>
                <p class="mt-2">{{ error }}</p>
                <v-btn color="primary" class="mt-3" @click="fetchMyMeetings">다시 시도</v-btn>
            </div>
            
            <!-- 정모가 없는 경우 -->
            <div v-else-if="myMeetings.length === 0" class="text-center pa-4">
                <v-icon color="grey-lighten-1" size="large">mdi-calendar-blank</v-icon>
                <p class="mt-2">참가 예정인 정모가 없습니다.</p>
                <v-btn color="primary" class="mt-3" @click="$router.push('/silverpotion/gathering/main')">
                    모임 둘러보기
                </v-btn>
            </div>
            
            <!-- 정모 목록 -->
            <div v-else>
                <v-list>
                    <v-list-item 
                        v-for="meeting in myMeetings" 
                        :key="meeting.meetingId"
                        class="mb-3 meeting-card"
                        @click="goToGatheringDetail(meeting.gatheringId)"
                        :ripple="true"
                        hover
                    >
                        <template v-slot:prepend>
                            <v-avatar size="70" rounded>
                                <v-img :src="meeting.imageUrl || require('@/assets/default-gathering.png')" 
                                       cover
                                       alt="정모 이미지"></v-img>
                            </v-avatar>
                        </template>
                        
                        <div class="meeting-info">
                            <div class="d-flex align-center">
                                <v-icon size="x-small" class="mr-1">mdi-calendar</v-icon>
                                <span class="text-caption">{{ formatDate(meeting.meetingDate) }} {{ formatTime(meeting.meetingTime) }}</span>
                            </div>
                            <div class="d-flex align-center mt-1">
                                <span class="font-weight-medium">{{ meeting.name }}</span>
                            </div>
                            <div class="d-flex align-center mt-1">
                                <span class="font-weight-medium">{{ meeting.gatheringName || '모임 정보 없음' }}</span>
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
                            </div>
                            <div class="d-flex align-center mt-1">
                                <!-- 인원 정보 -->
                                <div class="d-flex align-center">
                                    <v-icon size="x-small" class="mr-1">mdi-account-multiple</v-icon>
                                    <span class="text-caption">{{ meeting.attendees ? meeting.attendees.length : 0 }}/{{ meeting.maxPeople }}명</span>
                                </div>
                                
                                <!-- 구분선 -->
                                <v-divider vertical class="mx-2" style="height: 12px;"></v-divider>
                                
                                <!-- 비용 정보 -->
                                <div class="d-flex align-center">
                                    <v-icon size="x-small" class="mr-1">mdi-currency-krw</v-icon>
                                    <span class="text-caption">{{ formatCost(meeting.cost) }}</span>
                                </div>
                            </div>
                            
                            <!-- 참가 취소 버튼 -->
                            <div class="mt-2 text-right">
                                <v-btn 
                                    color="error" 
                                    variant="outlined" 
                                    size="small" 
                                    @click.stop="showCancelDialog(meeting)"
                                    class="cancel-btn"
                                >
                                    {{ isUserLeaderOfMeeting(meeting) ? '삭제' : '취소' }}
                                </v-btn>
                            </div>
                        </div>
                    </v-list-item>
                </v-list>
            </div>
        </div>
        
        <!-- 참가 취소 확인 다이얼로그 -->
        <v-dialog v-model="cancelDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h5">{{ isLeader ? '정모 삭제' : '정모 참가 취소' }}</v-card-title>
                <v-card-text>
                    <p v-if="isLeader">정말로 <strong>{{ selectedMeeting?.name }}</strong> 정모를 삭제하시겠습니까?</p>
                    <p v-else>정말로 <strong>{{ selectedMeeting?.name }}</strong> 정모 참가를 취소하시겠습니까?</p>
                    <p class="text-caption mt-2" v-if="!isLeader">참가 취소 후에도 다시 참가 신청이 가능합니다.</p>
                    <p class="text-caption mt-2 text-error" v-if="isLeader">정모를 삭제하면 모든 참가자의 참가 정보가 삭제되며 복구할 수 없습니다.</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="text" @click="cancelDialog = false">취소</v-btn>
                    <v-btn 
                        :color="isLeader ? 'error' : 'error'" 
                        variant="elevated" 
                        @click="isLeader ? deleteMeeting() : cancelMeetingAttendance()"
                        :loading="cancelLoading"
                    >
                        {{ isLeader ? '정모 삭제' : '참가 취소' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import axios from 'axios';

export default{
    data(){
        return {
            myMeetings: [],
            loading: false,
            error: null,
            cancelDialog: false,
            selectedMeeting: null,
            cancelLoading: false,
            isLeader: false,
            userId: null
        }
    },
    mounted() {
        this.userId = localStorage.getItem('userId');
        this.fetchMyMeetings();
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        
        async fetchMyMeetings() {
            this.loading = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/mymeetings`);
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
                                region: gatheringInfo.region,
                                leaderId: gatheringInfo.leaderId // 모임장 ID 추가
                            };
                        } catch (err) {
                            console.error(`모임 정보를 불러오는데 실패했습니다 (ID: ${meeting.gatheringId}):`, err);
                            return {
                                ...meeting,
                                gatheringName: '모임 정보 없음',
                                category: '카테고리 정보 없음',
                                region: '지역 정보 없음',
                                leaderId: null
                            };
                        }
                    })
                );
                
                // 날짜순으로 정렬
                this.myMeetings = meetingsWithGatheringInfo.sort((a, b) => 
                    new Date(a.meetingDate) - new Date(b.meetingDate)
                );
            } catch (err) {
                console.error('내 정모 정보를 불러오는데 실패했습니다:', err);
                this.error = '내 정모 정보를 불러오는데 실패했습니다.';
            } finally {
                this.loading = false;
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        },
        
        formatTime(timeString) {
            if (!timeString || typeof timeString !== 'string') return '';
            return timeString.substring(0, 5); // HH:MM 형식으로 변환
        },
        
        formatCost(cost) {
            if (cost === 0) return '무료';
            return `${cost.toLocaleString()}원`;
        },
        
        goToGatheringDetail(gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
        },
        
        isUserLeaderOfMeeting(meeting) {
            return this.userId && meeting.leaderId && this.userId === meeting.leaderId.toString();
        },
        
        showCancelDialog(meeting) {
            this.selectedMeeting = meeting;
            // 현재 사용자가 모임장인지 확인
            this.isLeader = this.isUserLeaderOfMeeting(meeting);
            this.cancelDialog = true;
        },
        
        async cancelMeetingAttendance() {
            if (!this.selectedMeeting) return;
            
            this.cancelLoading = true;
            try {
                await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/deleteattend`, {
                    data: {
                        meetingId: this.selectedMeeting.meetingId
                    }
                });
                
                // 성공적으로 취소된 경우 목록에서 제거
                this.myMeetings = this.myMeetings.filter(meeting => meeting.meetingId !== this.selectedMeeting.meetingId);
                
                // 다이얼로그 닫기
                this.cancelDialog = false;
                this.selectedMeeting = null;
                
                // 성공 메시지 표시
                alert('정모 참가가 취소되었습니다.');
            } catch (err) {
                console.error('정모 참가 취소에 실패했습니다:', err);
                alert('정모 참가 취소에 실패했습니다. 다시 시도해주세요.');
            } finally {
                this.cancelLoading = false;
            }
        },
        
        async deleteMeeting() {
            if (!this.selectedMeeting) return;
            
            this.cancelLoading = true;
            try {
                await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/delete/${this.selectedMeeting.meetingId}`
                );
                
                // 성공적으로 삭제된 경우 목록에서 제거
                this.myMeetings = this.myMeetings.filter(meeting => meeting.meetingId !== this.selectedMeeting.meetingId);
                
                // 다이얼로그 닫기
                this.cancelDialog = false;
                this.selectedMeeting = null;
                
                // 성공 메시지 표시
                alert('정모가 삭제되었습니다.');
            } catch (err) {
                console.error('정모 삭제에 실패했습니다:', err);
                alert('정모 삭제에 실패했습니다. 다시 시도해주세요.');
            } finally {
                this.cancelLoading = false;
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
}

.meeting-card {
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.meeting-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.meeting-info {
    width: 100%;
}

.cancel-btn {
    transition: all 0.2s ease;
}

.cancel-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

/* 빈 상태 컨테이너 */
.text-center.pa-4 {
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 32px !important;
    min-height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

/* 로딩 상태 스타일링 */
.text-center.my-4 {
    padding: 24px;
    border-radius: 12px;
    background-color: #f9f9f9;
}
</style>