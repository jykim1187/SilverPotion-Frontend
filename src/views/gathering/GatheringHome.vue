<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">{{ gatheringName }}</h1>
                <!-- 모임 메뉴 버튼 -->
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn icon v-bind="props">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-if="isGatheringLeader" @click="goToUpdateGathering">
                            <v-list-item-title>모임 수정</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="isGatheringMember && !isGatheringLeader" @click="showLeaveDialog = true">
                            <v-list-item-title>모임 탈퇴</v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="isGatheringLeader" @click="showDisbandDialog = true">
                            <v-list-item-title class="text-error">모임 해체</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="showReportDialog = true">
                            <v-list-item-title>모임 신고</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-card-text>
        </v-card>

        <!-- 탭 메뉴 추가 -->
        <div class="content-wrapper">
            <v-tabs v-model="activeTab" centered grow class="mt-0 pt-0">
                <v-tab value="home" class="flex-1">홈</v-tab>
                <v-tab value="board" class="flex-1">게시판</v-tab>
                <v-tab value="chat" class="flex-1">채팅</v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="mt-5">
                <v-window-item value="home">
                    <div>
                        <!-- 모임 사진 -->
                        <div class="mb-6">
                            <v-img
                                :src="gatheringImage || require('@/assets/default-gathering.png')"
                                max-height="200"
                                cover
                                class="rounded-lg"
                                style="max-width: 100%;"
                            ></v-img>
                        </div>
                        
                        <!-- 모임 정보 -->
                        <div class="mb-4 position-relative">
                            <!-- 모임 수정 버튼 (모임장에게만 표시) -->
                            <v-btn
                                v-if="isGatheringLeader"
                                icon="mdi-pencil"
                                size="small"
                                color="primary"
                                class="position-absolute"
                                style="top: 0; right: 0;"
                                @click="goToUpdateGathering"
                            ></v-btn>
                            
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <v-chip size="small" color="primary" variant="outlined" class="mr-2">
                                    <v-icon size="x-small" start>mdi-map-marker</v-icon>
                                    {{ gatheringRegion || '지역 정보 없음' }}
                                </v-chip>
                                <v-chip size="small" color="primary" variant="outlined" class="mr-2">
                                    <v-icon size="x-small" start>mdi-tag</v-icon>
                                    {{ gatheringCategory || '카테고리 없음' }}
                                </v-chip>
                                <v-chip size="small" color="primary" variant="outlined">
                                    <v-icon size="x-small" start>mdi-account-multiple</v-icon>
                                    {{ gatheringPeopleCount || 0 }}/{{ gatheringMaxPeople || 0 }}명
                                </v-chip>
                            </div>
                            <h2 class="text-h6 font-weight-bold">{{ gatheringName }}</h2>
                            <p class="text-body-2 mt-1">{{ gatheringIntroduce || '모임 소개가 없습니다.' }}</p>
                        </div>
                        
                        <!-- 정기모임 섹션 -->
                        <div class="mb-6">
                            <h3 class="text-subtitle-1 font-weight-bold mb-3">정기모임</h3>
                            
                            <div v-if="meetings.length === 0" class="text-center pa-4 grey lighten-4 rounded">
                                <p>예정된 정기모임이 없습니다.</p>
                            </div>
                            
                            <v-card v-for="meeting in sortedMeetings" :key="meeting.meetingId" class="mb-4" variant="outlined">
                                <div class="d-flex flex-column pa-4">
                                    <div class="text-caption text-primary mb-1">{{ formatDate(meeting.meetingDate) }}</div>
                                    
                                    <!-- 모임명과 참석/취소 버튼을 같은 행에 배치 -->
                                    <div class="d-flex justify-space-between align-center mb-3">
                                        <div class="text-subtitle-1 font-weight-bold">{{ meeting.name }}</div>
                                        
                                        <!-- 정모 수정 버튼 (정모 생성자에게만 표시) -->
                                        <div class="d-flex align-center">
                                            <v-btn
                                                v-if="isCreator(meeting)"
                                                icon="mdi-pencil"
                                                size="small"
                                                color="primary"
                                                class="mr-2"
                                                @click="goToUpdateMeeting(meeting.meetingId)"
                                            ></v-btn>
                                            
                                            <!-- 참석/취소 버튼 -->
                                            <v-btn
                                                v-if="!isAttending(meeting) && isGatheringMember"
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                                @click="attendMeeting(meeting.meetingId)"
                                                :disabled="meeting.attendees.length >= meeting.maxPeople"
                                            >
                                                참석
                                            </v-btn>
                                            <v-btn
                                                v-if="isAttending(meeting) && !isCreator(meeting)"
                                                color="error"
                                                variant="outlined"
                                                size="small"
                                                @click="cancelAttendance(meeting.meetingId)"
                                            >
                                                취소
                                            </v-btn>
                                            <v-btn
                                                v-if="isAttending(meeting) && isCreator(meeting)"
                                                color="error"
                                                variant="outlined"
                                                size="small"
                                                @click="showCreatorCancelAlert"
                                            >
                                                취소
                                            </v-btn>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex flex-wrap">
                                        <div class="meeting-image mr-4 mb-3">
                                            <v-img
                                                :src="meeting.imageUrl || require('@/assets/default-gathering.png')"
                                                width="120"
                                                height="120"
                                                cover
                                                class="rounded-lg"
                                            ></v-img>
                                        </div>
                                        
                                        <div class="meeting-info flex-grow-1">
                                            <div class="d-flex align-center mb-2">
                                                <v-icon size="small" class="mr-2">mdi-calendar-clock</v-icon>
                                                <span class="text-body-2">일시: {{ formatDate(meeting.meetingDate) }} {{ meeting.meetingTime }}</span>
                                            </div>
                                            <div class="d-flex align-center mb-2">
                                                <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
                                                <span class="text-body-2">위치: {{ meeting.place }}</span>
                                            </div>
                                            <div class="d-flex align-center mb-2">
                                                <v-icon size="small" class="mr-2">mdi-currency-krw</v-icon>
                                                <span class="text-body-2">비용: {{ formatCost(meeting.cost) }}</span>
                                            </div>
                                            <div class="d-flex align-center mb-2">
                                                <v-icon size="small" class="mr-2">mdi-account-group</v-icon>
                                                <span class="text-body-2">참석: {{ meeting.attendees.length }}/{{ meeting.maxPeople }}명</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- 참석자 프로필 이미지 -->
                                    <div class="mt-3">
                                        <div class="text-caption mb-2">참석자</div>
                                        <div class="d-flex flex-wrap">
                                            <div v-for="(attendee, index) in meeting.attendees" :key="index" class="mr-2 mb-2">
                                                <v-avatar size="36">
                                                    <v-img
                                                        :src="attendee.profileImage || require('@/assets/default-gathering.png')"
                                                        alt="프로필 이미지"
                                                    ></v-img>
                                                </v-avatar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </v-card>
                            
                            <!-- 정모 만들기 버튼 (모임장에게만 표시) -->
                            <div v-if="isGatheringLeader" class="text-center mt-4">
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-plus"
                                    @click="goToCreateMeeting"
                                >
                                    정모 만들기
                                </v-btn>
                            </div>
                        </div>
                        
                        <!-- 모임 멤버 섹션 -->
                        <div class="mb-6">
                            <div class="d-flex justify-space-between align-center mb-3">
                                <h3 class="text-subtitle-1 font-weight-bold">모임 멤버 ({{ gatheringPeopleCount || 0 }})</h3>
                                
                                <!-- 멤버 관리 버튼 (모임장에게만 표시) -->
                                <v-btn
                                    v-if="isGatheringLeader"
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    @click="goToMemberManagement"
                                >
                                    멤버 관리
                                </v-btn>
                            </div>
                            
                            <!-- 멤버 검색창 -->
                            <v-text-field
                                v-model="memberSearchQuery"
                                label="멤버 검색"
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="mb-4"
                                @input="searchMembers"
                            ></v-text-field>
                            
                            <!-- 멤버 목록 -->
                            <v-list v-if="filteredMembers.length > 0">
                                <v-list-item
                                    v-for="member in filteredMembers"
                                    :key="member.userId"
                                    class="mb-2 rounded-lg"
                                >
                                    <template v-slot:prepend>
                                        <v-avatar size="40">
                                            <v-img
                                                :src="member.profileImage || require('@/assets/default-gathering.png')"
                                                alt="프로필 이미지"
                                            ></v-img>
                                        </v-avatar>
                                    </template>
                                    
                                    <v-list-item-title>{{ member.nickname }}</v-list-item-title>
                                    <v-list-item-subtitle>가입일: {{ formatDate(member.createdTime) }}</v-list-item-subtitle>
                                    
                                    <template v-slot:append>
                                        <v-btn
                                            v-if="isGatheringMember && member.userId !== currentUserId"
                                            color="primary"
                                            variant="text"
                                            size="small"
                                            @click="goToChat(member.userId)"
                                        >
                                            채팅하기
                                        </v-btn>
                                    </template>
                                </v-list-item>
                            </v-list>
                            
                            <div v-else class="text-center pa-4 grey lighten-4 rounded">
                                <p>검색 결과가 없습니다.</p>
                            </div>
                        </div>
                    </div>
                </v-window-item>

                <v-window-item value="board">
                    <GatheringBoard :gatheringId="gatheringId"/>
                </v-window-item>

                <v-window-item value="chat">
                    <div v-if="isGatheringMember">
                        채팅 내용
                    </div>
                    <div v-else class="text-center pa-5">
                        <v-icon size="large" color="grey">mdi-account-alert</v-icon>
                        <p class="mt-3">모임원만 이용 가능합니다.</p>
                    </div>
                </v-window-item>
            </v-window>
        </div>

        <!-- 모임 탈퇴 확인 다이얼로그 -->
        <v-dialog v-model="showLeaveDialog" max-width="300">
            <v-card>
                <v-card-title class="text-h6">모임 탈퇴</v-card-title>
                <v-card-text>
                    정말로 모임을 탈퇴하시겠습니까?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showLeaveDialog = false">취소</v-btn>
                    <v-btn color="error" variant="text" @click="leaveGathering">탈퇴</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 모임 해체 다이얼로그 -->
        <v-dialog v-model="showDisbandDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">모임 해체</v-card-title>
                <v-card-text>
                    <p class="mb-3">정말로 모임을 해체하시겠습니까?</p>
                    <p class="text-caption text-error">이 작업은 되돌릴 수 없으며, 모든 모임 데이터가 삭제됩니다.</p>
                    <v-text-field
                        v-model="disbandConfirmText"
                        label="확인을 위해 '해체'를 입력하세요"
                        variant="outlined"
                        class="mt-4"
                        :rules="[v => v === '해체' || '정확히 \'해체\'를 입력해주세요']"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showDisbandDialog = false">취소</v-btn>
                    <v-btn 
                        color="error" 
                        variant="text" 
                        @click="disbandGathering"
                        :disabled="disbandConfirmText !== '해체'"
                    >
                        해체
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 모임 신고 다이얼로그 -->
        <v-dialog v-model="showReportDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">모임 신고</v-card-title>
                <v-card-text>
                    <v-select
                        v-model="reportSmallCategory"
                        label="신고 사유 선택"
                        :items="reportCategories"
                        item-title="text"
                        item-value="value"
                        variant="outlined"
                        required
                        :rules="[v => !!v || '신고 사유를 선택해주세요']"
                        class="mb-4"
                    ></v-select>
                    
                    <v-textarea
                        v-model="reportContent"
                        label="상세 내용"
                        hint="신고 사유에 대한 상세 내용을 작성해주세요."
                        rows="4"
                        variant="outlined"
                        :rules="[v => !!v || '상세 내용을 입력해주세요']"
                    ></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showReportDialog = false">취소</v-btn>
                    <v-btn color="error" variant="text" @click="reportGathering">신고</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 알림 다이얼로그 -->
        <v-dialog v-model="showAlert" max-width="300">
            <v-card>
                <v-card-text class="text-center pa-4">
                    {{ alertMessage }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="showAlert = false">확인</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 가입인사 작성 다이얼로그 -->
        <v-dialog v-model="showJoinDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">가입인사 작성</v-card-title>
                <v-card-text>
                    <v-textarea
                        v-model="greetingMessage"
                        label="가입인사"
                        hint="모임에 가입하며 남길 인사를 작성해주세요."
                        rows="4"
                    ></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showJoinDialog = false">취소</v-btn>
                    <v-btn color="primary" variant="text" @click="joinGathering">확인</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 가입하기 버튼 (모임 멤버가 아닌 경우에만 표시) -->
        <v-btn
            v-if="!isGatheringMember"
            color="primary"
            class="mb-0 rounded-0 fixed-button"
            @click="showJoinDialog = true"
        >
            가입하기
        </v-btn>
    </v-container>
</template>

<script>
import axios from 'axios';
import GatheringBoard from '@/components/GatheringBoard.vue';

export default{
    components: {
        GatheringBoard
    },
    data(){
        return {
            gatheringName: '',
            gatheringId: null,
            gatheringImage: null,
            gatheringRegion: '',
            gatheringCategory: '',
            gatheringPeopleCount: 0,
            gatheringMaxPeople: 0,
            gatheringIntroduce: '',
            gatheringLeaderId: null,
            showLeaveDialog: false,
            showReportDialog: false,
            reportSmallCategory: '',
            reportContent: '',
            reportCategories: [
                { text: '성적 행위', value: 'SEXUAL_CONTENT' },
                { text: '혐오 발언', value: 'HATE_SPEECH' },
                { text: '사기', value: 'FRAUD' },
                { text: '폭력', value: 'VIOLENCE' },
                { text: '불법', value: 'ILLEGAL_ACT' },
                { text: '따돌림', value: 'BULLYING' }
            ],
            activeTab: 'home',
            isGatheringMember: false,
            userList: [],
            meetings: [],
            showAlert: false,
            alertMessage: '',
            memberSearchQuery: '',
            filteredMembers: [],
            showJoinDialog: false,
            greetingMessage: '',
            showDisbandDialog: false,
            disbandConfirmText: ''
        }
    },
    computed: {
        isGatheringLeader() {
            const currentUserId = parseInt(localStorage.getItem('userId'), 10);
            return this.gatheringLeaderId === currentUserId;
        },
        currentUserId() {
            return parseInt(localStorage.getItem('userId'), 10);
        },
        sortedMeetings() {
            return [...this.meetings].sort((a, b) => {
                const dateA = new Date(a.meetingDate + ' ' + a.meetingTime);
                const dateB = new Date(b.meetingDate + ' ' + b.meetingTime);
                return dateA - dateB;
            });
        }
    },
    mounted() {
        this.gatheringId = this.$route.params.gatheringId;
        this.fetchGatheringInfo();
        this.fetchGatheringMembers();
        this.fetchMeetings();
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        async fetchGatheringInfo() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${this.gatheringId}`);
                const gatheringData = response.data.result;
                
                this.gatheringName = gatheringData.gatheringName;
                this.gatheringImage = gatheringData.imageUrl;
                this.gatheringRegion = gatheringData.region;
                this.gatheringCategory = gatheringData.category;
                this.gatheringPeopleCount = gatheringData.peopleCount;
                this.gatheringMaxPeople = gatheringData.maxPeople;
                this.gatheringIntroduce = gatheringData.introduce;
                this.gatheringLeaderId = gatheringData.leaderId;
            } catch (error) {
                console.error('모임 정보를 가져오는데 실패했습니다:', error);
            }
        },
        async fetchGatheringMembers() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${this.gatheringId}/userList`);
                this.userList = response.data.result || [];
                
                // 상태가 ACTIVATE인 멤버만 필터링
                this.filteredMembers = this.userList.filter(member => member.status === 'ACTIVATE');
                
                const currentUserId = localStorage.getItem('userId');
                const currentUserIdNum = parseInt(currentUserId, 10);
                this.isGatheringMember = this.userList.some(user => user.userId === currentUserIdNum && user.status === 'ACTIVATE');
                
                console.log('현재 사용자 ID:', currentUserIdNum);
                console.log('모임 회원 목록:', this.userList);
                console.log('모임 회원 여부:', this.isGatheringMember);
            } catch (error) {
                console.error('모임 회원 목록을 가져오는데 실패했습니다:', error);
            }
        },
        async fetchMeetings() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/${this.gatheringId}/list`);
                this.meetings = response.data.result || [];
                console.log('정기모임 목록:', this.meetings);
            } catch (error) {
                console.error('정기모임 목록을 가져오는데 실패했습니다:', error);
            }
        },
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}.${month}.${day}`;
        },
        formatCost(cost) {
            if (cost === 0) return '무료';
            return cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
        },
        goToUpdateGathering() {
            this.$router.push(`/silverpotion/gathering/update/${this.gatheringId}`);
        },
        async leaveGathering() {
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/withdraw/${this.gatheringId}`);
                this.showLeaveDialog = false;
                alert('모임을 성공적으로 탈퇴했습니다.');
                this.$router.push('/silverpotion/gathering/main');
            } catch (error) {
                console.error('모임 탈퇴에 실패했습니다:', error);
            }
        },
        async reportGathering() {
            if (!this.reportSmallCategory || !this.reportContent.trim()) {
                alert('신고 사유와 상세 내용을 모두 입력해주세요.');
                return;
            }
            
            try {
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/report/create`, {
                    referenceId: this.gatheringId,
                    reportBigCategory: 'GATHERING',
                    reportSmallCategory: this.reportSmallCategory,
                    content: this.reportContent
                });
                
                this.showReportDialog = false;
                this.reportSmallCategory = '';
                this.reportContent = '';
                
                alert('신고가 접수되었습니다.');
            } catch (error) {
                console.error('모임 신고에 실패했습니다:', error);
                alert('모임 신고에 실패했습니다. 다시 시도해주세요.');
            }
        },
        // 사용자가 정기모임에 참석 중인지 확인
        isAttending(meeting) {
            return meeting.attendees.some(attendee => attendee.userId === this.currentUserId);
        },
        
        // 사용자가 정기모임 생성자인지 확인
        isCreator(meeting) {
            // 여기서는 정기모임 생성자 정보가 API 응답에 없으므로,
            // 첫 번째 참석자를 생성자로 가정합니다. 실제 구현에서는 API 응답에 맞게 수정해야 합니다.
            return meeting.attendees.length > 0 && meeting.attendees[0].userId === this.currentUserId;
        },
        
        // 정기모임 참석하기
        async attendMeeting(meetingId) {
            try {
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/attend`, {
                    meetingId: meetingId
                });
                
                // 참석 성공 후 정기모임 목록 다시 가져오기
                await this.fetchMeetings();
                
                this.alertMessage = '정기모임 참석이 완료되었습니다.';
                this.showAlert = true;
            } catch (error) {
                console.error('정기모임 참석에 실패했습니다:', error);
                this.alertMessage = '정기모임 참석에 실패했습니다.';
                this.showAlert = true;
            }
        },
        
        // 정기모임 참석 취소하기
        async cancelAttendance(meetingId) {
            try {
                await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/deleteattend`, {
                    data: {
                        meetingId: meetingId
                    }
                });
                
                // 취소 성공 후 정기모임 목록 다시 가져오기
                await this.fetchMeetings();
                
                this.alertMessage = '정기모임 참석이 취소되었습니다.';
                this.showAlert = true;
            } catch (error) {
                console.error('정기모임 참석 취소에 실패했습니다:', error);
                this.alertMessage = '정기모임 참석 취소에 실패했습니다.';
                this.showAlert = true;
            }
        },
        // 정기모임 생성자가 취소 버튼을 눌렀을 때 알림 표시
        showCreatorCancelAlert() {
            this.alertMessage = '자신이 만든 정모는 참석 취소할 수 없습니다.';
            this.showAlert = true;
        },
        // 정모 만들기 페이지로 이동
        goToCreateMeeting() {
            this.$router.push({
                path: '/silverpotion/meeting/create',
                query: { gatheringId: this.gatheringId }
            });
        },
        // 멤버 검색
        searchMembers() {
            if (!this.memberSearchQuery.trim()) {
                // 상태가 ACTIVATE인 멤버만 필터링
                this.filteredMembers = this.userList.filter(member => member.status === 'ACTIVATE');
                return;
            }
            
            const query = this.memberSearchQuery.toLowerCase();
            this.filteredMembers = this.userList.filter(member => 
                member.status === 'ACTIVATE' && member.nickname.toLowerCase().includes(query)
            );
        },
        
        // 멤버 관리 페이지로 이동
        goToMemberManagement() {
            this.$router.push(`/silverpotion/gathering/management/${this.gatheringId}`);
        },
        
        // 채팅 페이지로 이동
        goToChat(userId) {
            // 여기서는 단순히 userId를 roomId로 사용하지만, 실제로는 채팅방 ID를 생성하거나 가져오는 로직이 필요할 수 있습니다.
            this.$router.push(`/chat/${userId}`);
        },
        // 모임 가입하기
        async joinGathering() {
            if (!this.greetingMessage.trim()) {
                this.alertMessage = '가입인사를 입력해주세요.';
                this.showAlert = true;
                return;
            }
            
            try {
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/register`, {
                    gatheringId: this.gatheringId,
                    greetingMessage: this.greetingMessage
                });
                
                this.showJoinDialog = false;
                this.greetingMessage = '';
                
                // 가입 성공 후 모임 정보와 멤버 목록 다시 가져오기
                await this.fetchGatheringInfo();
                await this.fetchGatheringMembers();
                
                this.alertMessage = '가입이 요청되었습니다. 승인 후 모임에 참여할 수 있습니다.';
                this.showAlert = true;
            } catch (error) {
                console.error('모임 가입에 실패했습니다:', error);
                this.alertMessage = '모임 가입에 실패했습니다.';
                this.showAlert = true;
            }
        },
        // 정모 수정 페이지로 이동
        goToUpdateMeeting(meetingId) {
            this.$router.push(`/silverpotion/meeting/update/${meetingId}`);
        },
        async disbandGathering() {
            if (this.disbandConfirmText !== '해체') return;
            
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/disband/${this.gatheringId}`);
                
                this.showDisbandDialog = false;
                alert('모임이 성공적으로 해체되었습니다.');
                this.$router.push('/silverpotion/gathering/main');
            } catch (error) {
                console.error('모임 해체에 실패했습니다:', error);
                this.alertMessage = '모임 해체에 실패했습니다. 다시 시도해주세요.';
                this.showAlert = true;
            }
        },
    },
}
</script>

<style scoped>
.flex-1 {
    flex: 1;
}

.gap-2 {
    gap: 8px;
}

.position-relative {
    position: relative;
}

.position-absolute {
    position: absolute;
}

.meeting-image {
    min-width: 120px;
}

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
    margin-top: 50px; /* 헤더 높이 + 기존 헤더 컴포넌트 높이에 맞게 조정 */
    padding: 0;
}

.fixed-button {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    max-width: 768px; /* 앱 컨테이너 크기에 맞게 조정 */
    width: 100%;
    z-index: 999;
}
</style>