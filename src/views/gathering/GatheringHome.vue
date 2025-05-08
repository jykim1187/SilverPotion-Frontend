<template>
    <v-container class="gathering-home-container pa-0">
        <!-- 헤더 -->
        <v-card flat class="header-card" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">{{ gatheringName }}</h1>
                <!-- 모임 메뉴 버튼 -->
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn icon v-bind="props" flat>
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>
                    <v-list rounded="lg" elevation="3">
                        <v-list-item v-if="isGatheringLeader" @click="goToUpdateGathering" class="menu-item">
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2">mdi-pencil</v-icon>
                                모임 수정
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="isGatheringMember && !isGatheringLeader" @click="showLeaveDialog = true" class="menu-item">
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2">mdi-exit-to-app</v-icon>
                                모임 탈퇴
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item v-if="isGatheringLeader" @click="showDisbandDialog = true" class="menu-item">
                            <v-list-item-title class="text-error">
                                <v-icon size="small" class="mr-2" color="error">mdi-delete</v-icon>
                                모임 해체
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="showReportDialog = true" class="menu-item">
                            <v-list-item-title>
                                <v-icon size="small" class="mr-2">mdi-flag</v-icon>
                                모임 신고
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-card-text>
        </v-card>

        <!-- 탭 메뉴 -->
        <div class="content-wrapper">
            <v-tabs 
                v-model="activeTab" 
                centered 
                grow 
                class="tab-container" 
                bg-color="#E8F1FD"
                color="primary"
            >
                <v-tab value="home" class="tab-item" color="primary">
                    <span class="primary--text">홈</span>
                </v-tab>
                <v-tab value="board" class="tab-item" color="primary">
                    <span class="primary--text">게시판</span>
                </v-tab>
                <v-tab value="chat" class="tab-item" color="primary">
                    <span class="primary--text">채팅</span>
                </v-tab>
            </v-tabs>

            <v-window v-model="activeTab" class="mt-12">
                <!-- 홈 탭 -->
                <v-window-item value="home">
                    <div class="home-content px-4">
                        <!-- 모임 사진 -->
                        <div class="mb-6 gathering-image-container">
                            <v-img
                                :src="gatheringImage || require('@/assets/default-gathering-main.png')"
                                height="200"
                                :width="380"
                                class="gathering-image"
                                contain
                                position="center"
                            ></v-img>
                        </div>
                        
                        <!-- 모임 정보 -->
                        <div class="gathering-info-section">
                                                        
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <v-chip size="small" color="primary" variant="outlined" class="info-chip">
                                    <v-icon size="x-small" start>mdi-map-marker</v-icon>
                                    {{ gatheringRegion || '지역 정보 없음' }}
                                </v-chip>
                                <v-chip size="small" color="primary" variant="outlined" class="info-chip">
                                    <v-icon size="x-small" start>mdi-tag</v-icon>
                                    {{ gatheringCategory || '카테고리 없음' }}
                                </v-chip>
                                <v-chip size="small" color="primary" variant="outlined" class="info-chip">
                                    <v-icon size="x-small" start>mdi-account-multiple</v-icon>
                                    {{ gatheringPeopleCount || 0 }}/{{ gatheringMaxPeople || 0 }}명
                                </v-chip>
                            </div>
                            <h2 class="gathering-title">{{ gatheringName }}</h2>
                            <p class="gathering-intro">{{ gatheringIntroduce || '모임 소개가 없습니다.' }}</p>
                        </div>
                        
                        <!-- 정기모임 섹션 -->
                        <section class="section-container">
                            <div class="d-flex justify-space-between align-center mb-3">
                                <h3 class="section-title">정기모임</h3>

                                <v-btn
                                    v-if="isGatheringLeader"
                                    variant="tonal"
                                    color="primary"
                                    prepend-icon="mdi-plus"
                                    @click="goToCreateMeeting"
                                    class="create-meeting-btn"
                                    rounded="lg"
                                >
                                    정모 만들기
                                </v-btn>
                            </div>
                            
                            <div v-if="meetings.length === 0" class="empty-container">
                                <v-icon size="x-large" color="grey-lighten-1">mdi-calendar-blank</v-icon>
                                <p class="mt-3 text-grey-darken-1">예정된 정기모임이 없습니다.</p>
                            </div>
                            
                            <div v-else>
                                <div class="meeting-list">
                                    <v-card 
                                        v-for="meeting in sortedMeetings" 
                                        :key="meeting.meetingId"
                                        class="meeting-card mb-3"
                                        elevation="1"
                                        rounded="lg"
                                    >
                                        <div class="pa-3">
                                            <!-- 날짜 및 시간 -->
                                            <div class="d-flex align-center mb-2">
                                                <v-icon size="small" color="primary" class="mr-1">mdi-calendar</v-icon>
                                                <span class="text-body-2 font-weight-medium">{{ formatDateTime(meeting.meetingDate, meeting.meetingTime) }}</span>
                                                
                                                <v-spacer></v-spacer>
                                                
                                                <!-- 수정 버튼 -->
                                                <v-btn
                                                    v-if="isCreator(meeting)"
                                                    icon="mdi-pencil"
                                                    size="small"
                                                    color="primary"
                                                    variant="text"
                                                    class="mr-1"
                                                    @click.stop="goToUpdateMeeting(meeting.meetingId)"
                                                ></v-btn>
                                            </div>
                                            
                                            <div class="d-flex">
                                                <!-- 정모 이미지 -->
                                                <div class="meeting-image-container mr-3">
                                                    <v-img
                                                        :src="meeting.imageUrl || require('@/assets/default-gathering.png')"
                                                        cover
                                                        class="meeting-image"
                                                    ></v-img>
                                                </div>
                                                
                                                <div class="meeting-content">
                                                    <!-- 정모 이름 -->
                                                    <div class="d-flex align-center">
                                                        <div class="text-h6 font-weight-bold meeting-name">{{ meeting.name }}</div>
                                                    </div>
                                                    
                                                    <!-- 정모 정보 -->
                                                    <div class="mt-2 text-body-2">
                                                        <!-- 장소 정보 -->
                                                        <div class="d-flex align-center mb-1">
                                                            <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                                                            <span>{{ meeting.place }}</span>
                                                        </div>
                                                        
                                                        <!-- 인원 및 비용 정보 (한 줄에 표시) -->
                                                        <div class="d-flex align-center">
                                                            <!-- 인원 정보 -->
                                                            <div class="d-flex align-center">
                                                                <v-icon size="small" class="mr-1">mdi-account-multiple</v-icon>
                                                                <span>{{ meeting.attendees.length }}/{{ meeting.maxPeople }}명</span>
                                                            </div>
                                                            
                                                            <!-- 구분선 -->
                                                            <v-divider vertical class="mx-2" style="height: 16px;"></v-divider>
                                                            
                                                            <!-- 비용 정보 -->
                                                            <div class="d-flex align-center">
                                                                <v-icon size="small" class="mr-1">mdi-currency-krw</v-icon>
                                                                <span>{{ formatCost(meeting.cost) }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <!-- 참석자 프로필과 참석/취소 버튼 -->
                                                    <div class="mt-2 d-flex align-center justify-space-between">
                                                        <div class="d-flex align-center">
                                                            <div class="attendees-avatars d-flex">
                                                                <v-avatar
                                                                    v-for="(attendee, index) in meeting.attendees.slice(0, 3)"
                                                                    :key="index"
                                                                    size="24"
                                                                    class="attendee-avatar mr-2"
                                                                >
                                                                    <v-img
                                                                        :src="attendee.profileImage || require('@/assets/default-gathering.png')"
                                                                        alt="프로필 이미지"
                                                                    ></v-img>
                                                                </v-avatar>
                                                            </div>
                                                        </div>
                                                        
                                                        <!-- 참석/취소 버튼 -->
                                                        <div>
                                                            <v-btn
                                                                v-if="!isAttending(meeting) && isGatheringMember"
                                                                color="primary"
                                                                variant="tonal"
                                                                size="small"
                                                                @click.stop="attendMeeting(meeting.meetingId)"
                                                                :disabled="meeting.attendees.length >= meeting.maxPeople"
                                                                class="action-btn"
                                                            >
                                                                참석
                                                            </v-btn>
                                                            <v-btn
                                                                v-if="isAttending(meeting) && !isCreator(meeting)"
                                                                color="error"
                                                                variant="tonal"
                                                                size="small"
                                                                @click.stop="cancelAttendance(meeting.meetingId)"
                                                                class="action-btn"
                                                            >
                                                                취소
                                                            </v-btn>
                                                            <v-btn
                                                                v-if="isAttending(meeting) && isCreator(meeting)"
                                                                color="error"
                                                                variant="tonal"
                                                                size="small"
                                                                @click.stop="showDeleteMeetingDialog(meeting.meetingId)"
                                                                class="action-btn"
                                                            >
                                                                취소
                                                            </v-btn>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </v-card>
                                </div>
                            </div>
                        </section>
                        
                        <!-- 모임 멤버 섹션 -->
                        <section class="section-container">
                            <div class="d-flex justify-space-between align-center mb-3">
                                <h3 class="section-title">모임 멤버 ({{ gatheringPeopleCount || 0 }})</h3>
                                
                                <!-- 멤버 관리 버튼 (모임장에게만 표시) -->
                                <v-btn
                                    v-if="isGatheringLeader"
                                    color="primary"
                                    variant="tonal"
                                    size="small"
                                    @click="goToMemberManagement"
                                    class="manage-members-btn"
                                    rounded="lg"
                                >
                                    <v-icon size="small" class="mr-1">mdi-account-cog</v-icon>
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
                                class="mb-4 search-field"
                                rounded="lg"
                                @input="searchMembers"
                            ></v-text-field>
                            
                            <!-- 멤버 목록 -->
                            <div v-if="filteredMembers.length > 0" class="member-list">
                                <v-card
                                    v-for="member in filteredMembers"
                                    :key="member.userId"
                                    class="member-card mb-2"
                                    elevation="1"
                                    rounded="lg"
                                    @click="showUserProfile(member)"
                                >
                                    <div class="d-flex align-center pa-3">
                                        <v-avatar size="40" class="mr-3">
                                            <v-img
                                                :src="member.profileImage || require('@/assets/default-gathering.png')"
                                                alt="프로필 이미지"
                                            ></v-img>
                                        </v-avatar>
                                        
                                        <div class="member-info">
                                            <div class="font-weight-medium">{{ member.nickname }}</div>
                                            <div class="text-caption text-grey">가입일: {{ formatDate(member.createdTime) }}</div>
                                        </div>
                                        
                                        <v-spacer></v-spacer>
                                        
                                        <v-btn
                                            v-if="isGatheringMember && member.userId !== currentUserId"
                                            color="primary"
                                            variant="tonal"
                                            size="small"
                                            @click="goToChat(member.userId)"
                                            rounded="lg"
                                            class="chat-btn"
                                        >
                                            <v-icon size="small" class="mr-1">mdi-chat</v-icon>
                                            채팅
                                        </v-btn>
                                    </div>
                                </v-card>
                            </div>
                            
                            <div v-else class="empty-container">
                                <v-icon size="x-large" color="grey-lighten-1">mdi-account-search</v-icon>
                                <p class="mt-3 text-grey-darken-1">검색 결과가 없습니다.</p>
                            </div>
                        </section>
                    </div>
                </v-window-item>

                <!-- 게시판 탭 -->
                <v-window-item value="board">
                    <router-view :gatheringId="gatheringId"></router-view>
                </v-window-item>

                <!-- 채팅 탭 -->
                <v-window-item value="chat">
                    <div v-if="isGatheringMember">
                        <v-card class="mt-4">
                            <v-card-title class="text-center text-h6">
                                모임 채팅
                            </v-card-title>
                            <v-card-text>
                                <div class="chat-box">
                                    <div 
                                        v-for="(msg, index) in messages"
                                        :key="index"
                                        :class="['chat-message', msg.senderId === userId ? 'sent' : 'received' ]"
                                    >
                                        <template v-if="msg.senderId === userId">
                                            <div class="message-content">
                                                {{ msg.content }}
                                                <span class="time" v-if="msg.createdAt">{{ formatTime(msg.createdAt) }}</span>
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="message-content">
                                                {{ msg.content }}
                                                <span class="time" v-if="msg.createdAt">{{ formatTime(msg.createdAt) }}</span>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                                <v-text-field
                                    v-model="newMessage"
                                    label="메시지 입력"
                                    @keyup.enter="sendMessage"
                                />
                                <v-btn color="primary" block @click="sendMessage">전송</v-btn>
                            </v-card-text>
                        </v-card>
                    </div>
                    <div v-else class="empty-container">
                        <v-icon size="x-large" color="grey-lighten-1">mdi-account-alert</v-icon>
                        <p class="mt-3 text-grey-darken-1">모임원만 이용 가능합니다.</p>
                    </div>
                </v-window-item>
            </v-window>
        </div>

        <!-- 모임 탈퇴 확인 다이얼로그 -->
        <v-dialog v-model="showLeaveDialog" max-width="300">
            <v-card class="dialog-card">
                <v-card-title class="dialog-title">모임 탈퇴</v-card-title>
                <v-card-text class="dialog-content">
                    정말로 모임을 탈퇴하시겠습니까?
                </v-card-text>
                <v-card-actions class="dialog-actions">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showLeaveDialog = false">취소</v-btn>
                    <v-btn color="error" variant="text" @click="leaveGathering">탈퇴</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 모임 해체 다이얼로그 -->
        <v-dialog v-model="showDisbandDialog" max-width="400">
            <v-card class="dialog-card">
                <v-card-title class="dialog-title">모임 해체</v-card-title>
                <v-card-text class="dialog-content">
                    <p class="mb-3">정말로 모임을 해체하시겠습니까?</p>
                    <p class="text-caption text-error">이 작업은 되돌릴 수 없으며, 모든 모임 데이터가 삭제됩니다.</p>
                    <v-text-field
                        v-model="disbandConfirmText"
                        label="확인을 위해 '해체'를 입력하세요"
                        variant="outlined"
                        class="mt-4 confirm-field"
                        rounded="lg"
                        :rules="[v => v === '해체' || '정확히 \'해체\'를 입력해주세요']"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions class="dialog-actions">
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
            <v-card class="dialog-card">
                <v-card-title class="dialog-title">모임 신고</v-card-title>
                <v-card-text class="dialog-content">
                    <v-select
                        v-model="reportSmallCategory"
                        label="신고 사유 선택"
                        :items="reportCategories"
                        item-title="text"
                        item-value="value"
                        variant="outlined"
                        required
                        :rules="[v => !!v || '신고 사유를 선택해주세요']"
                        class="mb-4 report-field"
                        rounded="lg"
                    ></v-select>
                    
                    <v-textarea
                        v-model="reportContent"
                        label="상세 내용"
                        hint="신고 사유에 대한 상세 내용을 작성해주세요."
                        rows="4"
                        variant="outlined"
                        :rules="[v => !!v || '상세 내용을 입력해주세요']"
                        class="report-field"
                        rounded="lg"
                    ></v-textarea>
                </v-card-text>
                <v-card-actions class="dialog-actions">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showReportDialog = false">취소</v-btn>
                    <v-btn color="error" variant="text" @click="reportGathering">신고</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 알림 다이얼로그 -->
        <v-dialog v-model="showAlert" max-width="300">
            <v-card class="dialog-card">
                <v-card-text class="dialog-content text-center pa-4">
                    {{ alertMessage }}
                </v-card-text>
                <v-card-actions class="dialog-actions">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="showAlert = false">확인</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 사용자 프로필 다이얼로그 -->
        <v-dialog v-model="showUserProfileDialog" max-width="500" class="profile-dialog" fullscreen-breakpoint="sm">
            <v-card class="dialog-card responsive-dialog">
                <v-card-title class="dialog-title">
                    <v-spacer></v-spacer>
                    <v-btn icon @click="showUserProfileDialog = false" density="compact">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="pa-0">
                    <user-profile-component
                        v-if="selectedUser"
                        :login-id="selectedUser.loginId || ''"
                        :user-name="selectedUser.nickname || ''"
                        :user-long-id="selectedUser.userId || 0"
                        :user-login-id="selectedUser.loginId || ''"
                        parent-type="post"
                    ></user-profile-component>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- 가입인사 작성 다이얼로그 -->
        <v-dialog v-model="showJoinDialog" max-width="400">
            <v-card class="dialog-card">
                <v-card-title class="dialog-title">가입인사 작성</v-card-title>
                <v-card-text class="dialog-content">
                    <v-textarea
                        v-model="greetingMessage"
                        label="가입인사"
                        hint="모임에 가입하며 남길 인사를 작성해주세요."
                        rows="4"
                        variant="outlined"
                        class="greeting-field"
                        rounded="lg"
                    ></v-textarea>
                </v-card-text>
                <v-card-actions class="dialog-actions">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showJoinDialog = false">취소</v-btn>
                    <v-btn color="primary" variant="text" @click="joinGathering">확인</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 정모 삭제 확인 다이얼로그 -->
        <v-dialog v-model="showDeleteDialog" max-width="300">
            <v-card class="dialog-card">
                <v-card-title class="dialog-title">정모 삭제</v-card-title>
                <v-card-text class="dialog-content">
                    정말 해당 정모를 삭제하시겠습니까?
                </v-card-text>
                <v-card-actions class="dialog-actions">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showDeleteDialog = false">취소</v-btn>
                    <v-btn color="error" variant="text" @click="deleteMeeting">확인</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 가입하기 버튼 (모임 멤버가 아닌 경우에만 표시) -->
        <v-btn
            v-if="!isGatheringMember"
            class="join-btn"
            @click="showJoinDialog = true"
            elevation="3"
            rounded="lg"
            style="background-color: #E8F1FD; color: #1976d2;"
        >
            가입하기
        </v-btn>
    </v-container>
</template>

<script>
import axios from 'axios';
import WebSocketManager from '@/WebSocketManager';


import UserProfileComponent from '@/components/UserProfileComponet.vue';

export default{
    components: {
       //GatheringBoard제거
        UserProfileComponent
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
            disbandConfirmText: '',
            messages: [],
            newMessage: "",
            userId: null,
            chatRoomId: null,
            isSubscribed: false,
            showDeleteDialog: false,
            meetingIdToDelete: null,
            roomId: null,
            showUserProfileDialog: false,
            selectedUser: null
        }
    },
    beforeUnmount() {
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
    watch: {
        activeTab(newValue) {
            if (newValue === 'board') {
                this.$router.push(`/silverpotion/gathering/board/${this.gatheringId}`);
            }
        }
    },
    mounted: async function() {
        this.gatheringId = this.$route.params.gatheringId;
        this.userId = Number(localStorage.getItem("userId"));

        await this.fetchGatheringInfo();
        await this.fetchGatheringMembers();
        await this.fetchMeetings();
        
        if (this.isGatheringMember) {
            if (this.chatRoomId) {
                this.roomId = this.chatRoomId;
            } else {
                console.error("❌ chatRoomId가 없습니다.");
            }
        }
    },
    methods: {
        handleBackButton() {
            // 이전 라우트 경로 확인
            const previousRoute = this.$router.options.history.state.back;
            
            // 이전 경로가 정모 수정 또는 모임 수정인 경우 모임 메인 페이지로 이동
            if (previousRoute && (
                previousRoute.includes('/silverpotion/gathering/update/') || 
                previousRoute.includes('/silverpotion/meeting/update/')
            )) {
                this.$router.push('/silverpotion/gathering/main');
            } else {
                // 그 외의 경우 일반적인 뒤로가기
                this.$router.go(-1);
            }
        },
        async fetchGatheringInfo() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${this.gatheringId}`);
                const gatheringData = response.data.result;
                console.log('모임 정보:', gatheringData);
                this.gatheringName = gatheringData.gatheringName;
                this.gatheringImage = gatheringData.imageUrl;
                this.gatheringRegion = gatheringData.region;
                this.gatheringCategory = gatheringData.category;
                this.gatheringPeopleCount = gatheringData.peopleCount;
                this.gatheringMaxPeople = gatheringData.maxPeople;
                this.gatheringIntroduce = gatheringData.introduce;
                this.gatheringLeaderId = gatheringData.leaderId;
                this.chatRoomId = gatheringData.chatRoomId;
            } catch (error) {
                console.error('모임 정보를 가져오는데 실패했습니다:', error);
            }
        },
        async fetchGatheringMembers() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${this.gatheringId}/userList`);
                this.userList = response.data.result || [];
                console.log('모임 회원 목록2:', response.data.result);

                
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
        formatDate(dateValue) {
            if (!dateValue) return '날짜 정보 없음';
            
            // 배열 형태의 날짜 처리 (Java LocalDate 형식)
            if (Array.isArray(dateValue)) {
                const [year, month, day] = dateValue;
                return `${year}년 ${month}월 ${day}일`;
            }
            
            // 문자열 형태의 날짜 처리 (기존 로직)
            try {
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) return '날짜 정보 없음';
                
                return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
            } catch (error) {
                console.error('날짜 변환 오류:', error);
                return '날짜 정보 없음';
            }
        },
        formatCost(cost) {
            if (cost === 0) return '회비없음';
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
        showDeleteMeetingDialog(meetingId) {
            this.meetingIdToDelete = meetingId;
            this.showDeleteDialog = true;
        },
        async deleteMeeting() {
            try {
                await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/delete/${this.meetingIdToDelete}`
                );
                
                // 성공 메시지 표시
                this.alertMessage = '정모가 삭제되었습니다.';
                this.showAlert = true;
                
                // 정모 목록 다시 불러오기
                this.fetchMeetings();
                
                // 다이얼로그 닫기
                this.showDeleteDialog = false;
            } catch (error) {
                console.error('정모 삭제 중 오류가 발생했습니다:', error);
                this.alertMessage = '정모 삭제 중 오류가 발생했습니다.';
                this.showAlert = true;
            }
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
        
        sendMessage() {
            if (!this.roomId) {
                console.warn("🚫 roomId가 없습니다. WebSocket 연결 확인 필요.");
                return;
            }
            if (this.newMessage.trim() === "") return;

            const message = {
                roomId: this.roomId,
                content: this.newMessage,
                type: "TEXT",
                senderId: this.userId,
                createdAt: new Date().toISOString()
            };

            console.log('📤 Sending message:', message);

            WebSocketManager.send(
                `/pub/room/${this.roomId}`,
                message
            );

            this.newMessage = "";
        },

        
        scrollToBottom() {
            this.$nextTick(() => {
                const chatBox = this.$el.querySelector(".chat-box");
                chatBox.scrollTop = chatBox.scrollHeight;
            });
        },
        
        formatTime(timeValue) {
            if (!timeValue) return '';
            
            // 배열 형태의 시간 처리 (Java LocalTime 형식)
            if (Array.isArray(timeValue)) {
                const [hour, minute] = timeValue;
                // 시간과 분을 두 자리 숫자로 포맷팅
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                return `${formattedHour}:${formattedMinute}`;
            }
            
            // 문자열 형태의 시간 처리 (기존 로직)
            if (typeof timeValue === 'string') {
                // HH:MM:SS 형식에서 HH:MM 형식으로 변환
                return timeValue.substring(0, 5);
            }
            
            return '';
        },
        formatDateTime(dateValue, timeValue) {
            if (!dateValue || !timeValue) return '날짜/시간 정보 없음';
            
            // 배열 형태의 날짜와 시간 처리
            if (Array.isArray(dateValue) && Array.isArray(timeValue)) {
                const [year, month, day] = dateValue;
                const [hour, minute] = timeValue;
                
                return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
            }
            
            // 기존 형식 처리 (문자열 등)
            try {
                const dateStr = this.formatDate(dateValue);
                const timeStr = this.formatTime(timeValue);
                
                return `${dateStr} ${timeStr}`;
            } catch (error) {
                console.error('날짜/시간 변환 오류:', error);
                return '날짜/시간 정보 없음';
            }
        },

        showUserProfile(member) {
            this.selectedUser = member;
            this.showUserProfileDialog = true;
        }
    },
}
</script>

<style scoped>
/* 전체 컨테이너 스타일 */
.gathering-home-container {
    padding-bottom: 80px;
    max-width: 960px;
}

/* 헤더 스타일 */
.header-card {
    position: fixed;
    top: 56px; /* 기존 헤더 컴포넌트 높이에 맞게 조정 */
    left: 0;
    right: 0;
    z-index: 999;
    max-width: 768px; /* 앱 컨테이너 크기에 맞게 조정 */
    margin: 0 auto;
    width: 100%;
}

/* 콘텐츠 래퍼 */
.content-wrapper {
    margin-top: 56px; /* 헤더 높이에 맞게 조정 */
    padding-bottom: 16px;
}

/* 탭 스타일링 */
.tab-container {
    background-color: white;
    position: sticky;
    top: 112px; /* 헤더 높이 + 기존 헤더 컴포넌트 높이 */
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.tab-item {
    font-weight: 600;
    letter-spacing: 0.5px;
}

.primary--text {
    color: #1976d2 !important;
}

.v-tab--selected {
    font-weight: 700;
}

.v-tab--selected .primary--text {
    color: #1976d2 !important;
}

/* 홈 콘텐츠 스타일링 */
.home-content {
    padding-top: 16px;
}

/* 모임 이미지 */
.gathering-image-container {
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
}

.gathering-image {
    max-width: 380px;
    height: 200px;
    object-fit: contain;
    margin: 0 auto;
}

/* 모임 정보 섹션 */
.gathering-info-section {
    position: relative;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.edit-btn {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-chip {
    margin-right: 8px;
    margin-bottom: 8px;
    font-weight: 500;
}

.gathering-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #333;
}

.gathering-intro {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.5;
}

/* 섹션 스타일링 */
.section-container {
    margin-bottom: 32px;
    padding-bottom: 16px;
    position: relative;
}

.section-container:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 50%, rgba(0,0,0,0) 100%);
}

.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
    position: relative;
    display: inline-block;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 24px;
    height: 2px;
    background-color: var(--v-primary-base, #1976d2);
}

/* 빈 컨테이너 스타일 */
.empty-container {
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 32px;
    min-height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

/* 정모 카드 스타일링 */
.meeting-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    background-color: white;
}

.meeting-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.meeting-image-container {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.meeting-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.meeting-content {
    flex: 1;
    min-width: 0;
}

.meeting-name {
    font-size: 1.1rem;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.attendees-avatars {
    display: flex;
}

.attendee-avatar {
    border: 1px solid white;
    margin-left: -8px;
}

.attendee-avatar:first-child {
    margin-left: 0;
}

.action-btn {
    min-width: 60px;
    font-weight: 500;
}

/* 멤버 카드 스타일링 */
.member-card {
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.member-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.member-info {
    flex: 1;
    min-width: 0;
}

.chat-btn {
    min-width: 64px;
}

/* 검색 필드 스타일링 */
.search-field {
    background-color: #f5f5f5;
    border-radius: 12px;
}

/* 다이얼로그 스타일링 */
.dialog-card {
    border-radius: 16px;
    overflow: hidden;
}

.dialog-title {
    font-weight: 600;
    padding-top: 20px;
    font-size: 1.2rem;
}

.dialog-content {
    padding-top: 16px;
    padding-bottom: 16px;
}

.dialog-actions {
    padding: 16px;
}

.confirm-field, .report-field, .greeting-field {
    margin-top: 8px;
}

/* 가입하기 버튼 */
.join-btn {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    min-width: 50%;
    height: 48px;
    border-radius: 24px;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.join-btn:hover {
    transform: translateX(-50%) translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

/* 정모 만들기 버튼 */
.create-meeting-btn {
    min-width: 120px;
    height: 30px;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.create-meeting-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 멤버 관리 버튼 */
.manage-members-btn {
    min-width: 100px;
    transition: all 0.3s ease;
}

.manage-members-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 메뉴 아이템 스타일링 */
.menu-item {
    transition: background-color 0.2s ease;
}

.menu-item:hover {
    background-color: #f5f5f5;
}

/* 반응형 스타일링 */
@media (max-width: 600px) {
    .gathering-image {
        height: 140px;
    }
    
    .text-h6 {
        font-size: 1.1rem !important;
    }
    
    .action-btn {
        min-width: 56px;
    }
}

/* 애니메이션 효과 */
.v-card, .v-btn {
    will-change: transform, box-shadow;
}

/* 유틸리티 클래스 */
.flex-1 {
    flex: 1;
}

.gap-2 {
    gap: 8px;
}

/* 프로필 다이얼로그 스타일 */
.profile-dialog {
    width: 90%;
    margin: 0 auto;
}

.responsive-dialog {
    overflow: auto !important;
    max-height: 90vh;
    margin: 0;
    padding: 0;
}

@media (max-width: 600px) {
    .profile-dialog {
        width: 100%;
        margin: 0;
    }
    .dialog-card {
        max-width: 100%;
        margin: 0;
        border-radius: 0;
    }
    .responsive-dialog {
        height: 100vh;
        max-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    .dialog-title {
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 1;
        padding: 8px !important;
    }
    .user-profile {
        padding: 16px !important;
        min-width: unset !important;
        min-height: unset !important;
        box-shadow: none !important;
    }
}

.chat-box {
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.chat-box {
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.chat-message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    word-wrap: break-word;
}

.sent {
    align-self: flex-end;
}

.received {
    align-self: flex-start;
}

.message-content {
    padding: 8px 12px;
    border-radius: 12px;
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 8px;
}

.sent .message-content {
    background-color: #e3f2fd;
    color: #1976d2;
    border-bottom-right-radius: 0;
}

.received .message-content {
    background-color: #f5f5f5;
    color: #333;
    border-bottom-left-radius: 0;
}

.time {
    font-size: 0.75rem;
    color: #888;
    display: inline-block;
    white-space: nowrap;
}
</style>