<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">멤버 관리</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <div v-if="isLoading" class="text-center my-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">멤버 정보를 불러오는 중...</p>
            </div>
            
            <div v-else-if="error" class="text-center my-8">
                <v-alert type="error">{{ error }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchGatheringMembers">다시 시도</v-btn>
            </div>
            
            <div v-else>
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
                        
                        <v-list-item-title>
                            {{ member.nickname }}
                            <v-chip
                                v-if="member.userId === gatheringLeaderId"
                                size="x-small"
                                color="primary"
                                class="ml-2"
                            >
                                모임장
                            </v-chip>
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-caption">가입일: {{ formatDate(member.createdTime) }}</v-list-item-subtitle>
                        
                        <template v-slot:append>
                            <div class="d-flex">
                                <!-- 가입 대기 중인 멤버 -->
                                <v-btn
                                    v-if="member.status === 'WAIT'"
                                    color="success"
                                    variant="tonal"
                                    size="small"
                                    class="mr-2"
                                    @click="showApproveDialog(member)"
                                >
                                    가입 승인
                                </v-btn>
                                
                                <!-- 활성화된 멤버 (모임장 위임, 강퇴 버튼) -->
                                <template v-else-if="member.status === 'ACTIVATE'">
                                    <v-btn
                                        v-if="member.userId !== gatheringLeaderId && member.userId !== currentUserId"
                                        color="primary"
                                        variant="tonal"
                                        size="small"
                                        class="mr-2"
                                        @click="showTransferDialog(member)"
                                    >
                                        모임장 위임
                                    </v-btn>
                                    <v-btn
                                        v-if="member.userId !== gatheringLeaderId && member.userId !== currentUserId"
                                        color="error"
                                        variant="tonal"
                                        size="small"
                                        @click="showKickDialog(member)"
                                    >
                                        강퇴
                                    </v-btn>
                                </template>
                                
                                <!-- 강퇴된 멤버 -->
                                <v-chip
                                    v-else-if="member.status === 'BAN'"
                                    color="error"
                                    size="small"
                                >
                                    강퇴된 유저입니다
                                </v-chip>
                            </div>
                        </template>
                    </v-list-item>
                </v-list>
                
                <div v-else class="text-center pa-4 grey lighten-4 rounded">
                    <p>검색 결과가 없습니다.</p>
                </div>
            </div>
        </div>

        <!-- 모임장 위임 확인 다이얼로그 -->
        <v-dialog v-model="showTransferLeaderDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">모임장 위임</v-card-title>
                <v-card-text>
                    <p>정말로 <strong>{{ selectedMember?.nickname }}</strong>님에게 모임장을 위임하시겠습니까?</p>
                    <p class="text-caption mt-2">위임 후에는 모임장 권한이 이전되며, 되돌릴 수 없습니다.</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showTransferLeaderDialog = false">취소</v-btn>
                    <v-btn color="primary" variant="text" @click="transferLeadership">위임</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 멤버 강퇴 확인 다이얼로그 -->
        <v-dialog v-model="showKickMemberDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">멤버 강퇴</v-card-title>
                <v-card-text>
                    <p>정말로 <strong>{{ selectedMember?.nickname }}</strong>님을 강퇴하시겠습니까?</p>
                    <p class="text-caption mt-2">강퇴된 멤버는 모임에서 즉시 제외되며, 모임 활동에 참여할 수 없게 됩니다.</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showKickMemberDialog = false">취소</v-btn>
                    <v-btn color="error" variant="text" @click="kickMember">강퇴</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 가입 승인 확인 다이얼로그 -->
        <v-dialog v-model="showApproveMemberDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">가입 승인</v-card-title>
                <v-card-text>
                    <p>정말로 <strong>{{ selectedMember?.nickname }}</strong>님의 가입을 승인하시겠습니까?</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showApproveMemberDialog = false">취소</v-btn>
                    <v-btn color="success" variant="text" @click="approveMember">승인</v-btn>
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
    </v-container>
</template>

<script>
import axios from 'axios';

export default{
    data(){
        return {
            gatheringId: null,
            gatheringLeaderId: null,
            userList: [],
            filteredMembers: [],
            memberSearchQuery: '',
            isLoading: true,
            error: null,
            showTransferLeaderDialog: false,
            showKickMemberDialog: false,
            selectedMember: null,
            showAlert: false,
            alertMessage: '',
            showApproveMemberDialog: false,
            roomId: null
        }
    },
    computed: {
        currentUserId() {
            return parseInt(localStorage.getItem('userId'), 10);
        },
        isGatheringLeader() {
            return this.gatheringLeaderId === this.currentUserId;
        }
    },
    mounted() {
        this.gatheringId = this.$route.params.gatheringId;
        this.fetchGatheringInfo();
        this.fetchGatheringMembers();
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        async fetchGatheringInfo() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${this.gatheringId}`);
                const gatheringData = response.data.result;
                this.roomId = gatheringData.chatRoomId;
                this.gatheringLeaderId = gatheringData.leaderId;
                
                // 모임장이 아닌 경우 접근 제한
                if (this.gatheringLeaderId !== this.currentUserId) {
                    this.error = '모임장만 멤버 관리 페이지에 접근할 수 있습니다.';
                    this.isLoading = false;
                }
            } catch (error) {
                console.error('모임 정보를 가져오는데 실패했습니다:', error);
                this.error = '모임 정보를 불러오는데 실패했습니다. 다시 시도해주세요.';
                this.isLoading = false;
            }
        },
        async fetchGatheringMembers() {
            this.isLoading = true;
            this.error = null;
            
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${this.gatheringId}/userList`);
                this.userList = response.data.result || [];
                this.filteredMembers = [...this.userList]; // 초기 필터링된 멤버 목록 설정
            } catch (error) {
                console.error('모임 회원 목록을 가져오는데 실패했습니다:', error);
                this.error = '모임 회원 목록을 불러오는데 실패했습니다. 다시 시도해주세요.';
            } finally {
                this.isLoading = false;
            }
        },
        formatDate(dateString) {
            if (!dateString) return '';
            
            // 배열 형식인 경우 처리
            if (Array.isArray(dateString)) {
                const [year, month, day] = dateString;
                return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
            }
            
            // 문자열 형식인 경우 기존 처리 방식 유지
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}.${month}.${day}`;
        },
        searchMembers() {
            if (!this.memberSearchQuery.trim()) {
                this.filteredMembers = [...this.userList];
                return;
            }
            
            const query = this.memberSearchQuery.toLowerCase();
            this.filteredMembers = this.userList.filter(member => 
                member.nickname.toLowerCase().includes(query)
            );
        },
        showTransferDialog(member) {
            this.selectedMember = member;
            this.showTransferLeaderDialog = true;
        },
        showKickDialog(member) {
            this.selectedMember = member;
            this.showKickMemberDialog = true;
        },
        showApproveDialog(member) {
            this.selectedMember = member;
            this.showApproveMemberDialog = true;
        },
        async approveMember() {
            if (!this.selectedMember) return;
            
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/peopleupdate/${this.selectedMember.gatheringPeopleId}`, {
                    status: "ACTIVATE"
                });
                
                await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/participant`,
                    {
                        chatRoomId: this.roomId,
                        userId: this.selectedMember.userId
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "X-User-LoginId": localStorage.getItem("loginId")
                        }
                    }
                );

                this.showApproveMemberDialog = false;
                this.alertMessage = `${this.selectedMember.nickname}님의 가입이 승인되었습니다.`;
                this.showAlert = true;
                
                // 멤버 목록 다시 가져오기
                await this.fetchGatheringMembers();
            } catch (error) {
                console.error('가입 승인에 실패했습니다:', error);
                this.alertMessage = '가입 승인에 실패했습니다. 다시 시도해주세요.';
                this.showAlert = true;
            }
        },
        async transferLeadership() {
            if (!this.selectedMember) return;
            
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/leaderchange/${this.gatheringId}`, {
                    userId: this.selectedMember.userId
                });
                
                this.showTransferLeaderDialog = false;
                this.alertMessage = `${this.selectedMember.nickname}님에게 모임장이 위임되었습니다.`;
                this.showAlert = true;
                
                // 모임 정보 및 멤버 목록 다시 가져오기
                await this.fetchGatheringInfo();
                await this.fetchGatheringMembers();
                
                // 모임장 위임 후 홈으로 이동
                setTimeout(() => {
                    this.$router.push(`/silverpotion/gathering/home/${this.gatheringId}`);
                }, 2000);
            } catch (error) {
                console.error('모임장 위임에 실패했습니다:', error);
                this.alertMessage = '모임장 위임에 실패했습니다. 다시 시도해주세요.';
                this.showAlert = true;
            }
        },
        async kickMember() {
            if (!this.selectedMember) return;
            
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/peopleupdate/${this.selectedMember.gatheringPeopleId}`, {
                    status: "BAN"
                });
                
                this.showKickMemberDialog = false;
                this.alertMessage = `${this.selectedMember.nickname}님이 강퇴되었습니다.`;
                this.showAlert = true;
                
                // 멤버 목록 다시 가져오기
                await this.fetchGatheringMembers();
            } catch (error) {
                console.error('멤버 강퇴에 실패했습니다:', error);
                this.alertMessage = '멤버 강퇴에 실패했습니다. 다시 시도해주세요.';
                this.showAlert = true;
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
</style>