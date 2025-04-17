<template>
    <v-container>
        <!-- 회원 주소 정보 버튼 -->
        <div class="d-flex justify-start">
            <v-card 
                class="mb-6 pa-3" 
                variant="outlined" 
                hover 
                @click="goToAddressUpdate"
                max-width="fit-content"
            >
                <div v-if="userInfo" class="d-flex align-center">
                    <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                    <span>{{ userInfo.region || '주소 정보가 없습니다. 클릭하여 주소를 설정하세요.' }}</span>
                </div>
                <div v-else class="d-flex align-center">
                    <v-progress-circular indeterminate color="primary" size="16" class="mr-2"></v-progress-circular>
                    <span>주소 정보를 불러오는 중...</span>
                </div>
            </v-card>
        </div>

        <!-- 카테고리 제목 -->
        <h2 class="text-h6 font-weight-medium mb-4">모임 카테고리</h2>

        <!-- 카테고리 버튼 -->
        <div class="category-container">
            <v-row>
                <!-- 첫 번째 줄 (6개) -->
                <v-col v-for="(category, index) in categories.slice(0, 6)" :key="index" cols="12" sm="6" md="4" lg="2">
                    <div class="category-item text-center" @click="goToSearchWithCategory(category)">
                        <v-avatar size="50" class="mb-1">
                            <v-img :src="require(`@/assets/category/${category.image}.png`)" alt="카테고리 이미지"></v-img>
                        </v-avatar>
                        <div class="category-name">{{ category.name }}</div>
                    </div>
                </v-col>
            </v-row>
            
            <v-row>
                <!-- 두 번째 줄 (6개) -->
                <v-col v-for="(category, index) in categories.slice(6)" :key="index + 6" cols="12" sm="6" md="4" lg="2">
                    <div class="category-item text-center" @click="goToSearchWithCategory(category)">
                        <v-avatar size="50" class="mb-1">
                            <v-img :src="require(`@/assets/category/${category.image}.png`)" alt="카테고리 이미지"></v-img>
                        </v-avatar>
                        <div class="category-name">{{ category.name }}</div>
                    </div>
                </v-col>
            </v-row>
        </div>
        
        <!-- 내 모임 섹션 -->
        <div class="d-flex align-center mt-6 mb-4">
            <h2 class="text-h6 font-weight-medium mr-2">내 모임</h2>
            <v-btn 
                v-if="myGatherings.length > 0"
                variant="text" 
                color="primary"
                size="small"
                to="/silverpotion/gathering/mygathering"
                class="ml-2 pa-0"
            >
                더보기
            </v-btn>
        </div>
        
        <div v-if="loadingGatherings">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <span class="ml-2">모임 정보를 불러오는 중...</span>
        </div>
        
        <div v-else-if="myGatherings.length === 0" class="text-center pa-4">
            <v-icon size="large" color="grey">mdi-account-group</v-icon>
            <p class="mt-2">참여 중인 모임이 없습니다.</p>
        </div>
        
        <div v-else>
            <v-list>
                <v-list-item 
                    v-for="(gathering, index) in myGatherings.slice(0, 3)" 
                    :key="index"
                    class="mb-2"
                    @click="goToGatheringDetail(gathering.id)"
                    :ripple="true"
                    hover
                >
                    <template v-slot:prepend>
                        <v-avatar size="50" rounded>
                            <v-img :src="gathering.imageUrl || require('@/assets/default-gathering.png')" 
                                   cover
                                   alt="모임 이미지"></v-img>
                        </v-avatar>
                    </template>
                    
                    <div>
                        <div class="d-flex align-center">
                            <span class="font-weight-medium">{{ gathering.gatheringName }}</span>
                            <v-chip
                                size="x-small"
                                class="ml-2"
                                color="primary"
                                variant="outlined"
                            >
                                {{ gathering.category }}
                            </v-chip>
                            <div class="d-flex align-center ml-3">
                                <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                                <span class="text-caption">{{ gathering.region }}</span>
                                <v-icon size="x-small" class="ml-2 mr-1">mdi-account-multiple</v-icon>
                                <span class="text-caption">{{ gathering.peopleCount }}/{{ gathering.maxPeople }}명</span>
                            </div>
                        </div>
                    </div>
                </v-list-item>
            </v-list>
        </div>
        
        <!-- 추천 모임 섹션 -->
        <div class="d-flex align-center mt-6 mb-4">
            <h2 class="text-h6 font-weight-medium mr-2">추천 모임</h2>
            <v-btn 
                variant="text" 
                color="primary"
                size="small"
                to="/silverpotion/gathering/recommendGathering"
                class="ml-2 pa-0"
            >
                더보기
            </v-btn>
        </div>
        
        <div v-if="loadingRecommended">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <span class="ml-2">추천 모임을 불러오는 중...</span>
        </div>
        
        <div v-else-if="filteredRecommendedGatherings.length === 0" class="text-center pa-4">
            <v-icon size="large" color="grey">mdi-map-search</v-icon>
            <p class="mt-2">주변 지역의 추천 모임이 없습니다.</p>
        </div>
        
        <div v-else>
            <v-list>
                <v-list-item 
                    v-for="(gathering, index) in filteredRecommendedGatherings.slice(0, 3)" 
                    :key="index"
                    class="mb-2"
                    @click="goToGatheringDetail(gathering.id)"
                    :ripple="true"
                    hover
                >
                    <template v-slot:prepend>
                        <v-avatar size="50" rounded>
                            <v-img :src="gathering.imageUrl || require('@/assets/default-gathering.png')" 
                                   cover
                                   alt="모임 이미지"></v-img>
                        </v-avatar>
                    </template>
                    
                    <div>
                        <div class="d-flex align-center">
                            <span class="font-weight-medium">{{ gathering.gatheringName }}</span>
                            <v-chip
                                size="x-small"
                                class="ml-2"
                                color="primary"
                                variant="outlined"
                            >
                                {{ gathering.category }}
                            </v-chip>
                            <div class="d-flex align-center ml-3">
                                <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                                <span class="text-caption">{{ gathering.region }}</span>
                                <v-icon size="x-small" class="ml-2 mr-1">mdi-account-multiple</v-icon>
                                <span class="text-caption">{{ gathering.peopleCount }}/{{ gathering.maxPeople }}명</span>
                                <span class="text-caption text-grey ml-2">{{ gathering.introduce || '모임 소개가 없습니다.' }}</span>
                            </div>
                        </div>
                    </div>
                </v-list-item>
            </v-list>
        </div>
        
        <!-- 추천 정모 섹션 -->
        <div class="d-flex align-center mt-6 mb-4">
            <h2 class="text-h6 font-weight-medium mr-2">추천 정모</h2>
            <v-btn 
                variant="text" 
                color="primary"
                size="small"
                to="/silverpotion/gathering/recommendMeeting"
                class="ml-2 pa-0"
            >
                더보기
            </v-btn>
        </div>
        
        <div v-if="loadingMeetings" class="text-center my-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <span class="ml-2">정모 정보를 불러오는 중...</span>
        </div>
        
        <div v-else-if="meetingsByDate.length === 0" class="text-center pa-4">
            <v-icon size="large" color="grey">mdi-calendar-blank</v-icon>
            <p class="mt-2">예정된 정모가 없습니다.</p>
        </div>
        
        <div v-else>
            <!-- 날짜 선택 버튼 -->
            <div class="date-selector mb-4">
                <v-slide-group
                    v-model="selectedDateIndex"
                    show-arrows
                    center-active
                >
                    <v-slide-group-item
                        v-for="(dateInfo, index) in dateButtons"
                        :key="index"
                        v-slot="{ isSelected, toggle }"
                    >
                        <v-btn
                            :color="isSelected ? 'primary' : ''"
                            :variant="isSelected ? 'flat' : 'outlined'"
                            class="ma-1"
                            rounded
                            @click="toggle"
                        >
                            <div class="text-center">
                                <div class="text-caption">{{ dateInfo.dayOfWeek }}</div>
                                <div class="text-body-2">{{ dateInfo.day }}</div>
                            </div>
                        </v-btn>
                    </v-slide-group-item>
                </v-slide-group>
            </div>
            
            <!-- 선택된 날짜의 정모 목록 -->
            <div v-if="selectedDateMeetings.length === 0" class="text-center pa-4 empty-meetings-container">
                <p>선택한 날짜에 예정된 정모가 없습니다.</p>
            </div>
            
            <div v-else>
                <v-card
                    v-for="meeting in selectedDateMeetings.slice(0, 3)"
                    :key="meeting.meetingId"
                    class="mb-4"
                    variant="outlined"
                    @click="goToGatheringDetail(meeting.gatheringId)"
                >
                    <v-row no-gutters>
                        <v-col cols="4">
                            <v-img
                                :src="meeting.imageUrl || require('@/assets/default-gathering.png')"
                                height="120"
                                cover
                            ></v-img>
                        </v-col>
                        <v-col cols="8">
                            <v-card-text class="pa-3">
                                <div class="d-flex flex-column">
                                    <div class="text-subtitle-1 font-weight-bold">{{ meeting.name }}</div>
                                    <div class="text-caption">
                                        <v-icon size="x-small" class="mr-1">mdi-calendar</v-icon>
                                        {{ formatDate(meeting.meetingDate) }} {{ formatTime(meeting.meetingTime) }}
                                    </div>
                                    <div class="text-caption">
                                        <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                                        {{ meeting.place }}
                                    </div>
                                    <div class="text-caption mt-1">
                                        <v-chip size="x-small" color="primary" variant="outlined" class="mr-1">
                                            {{ meeting.category || '카테고리 정보 없음' }}
                                        </v-chip>
                                        <span>{{ meeting.gatheringName || '모임 정보 없음' }}</span>
                                    </div>
                                    
                                    <div class="d-flex align-center mt-2">
                                        <div class="attendees-avatars">
                                            <v-avatar
                                                v-for="(attendee, idx) in meeting.attendees.slice(0, 8)"
                                                :key="idx"
                                                size="20"
                                                class="ma-1"
                                            >
                                                <v-img
                                                    :src="attendee.profileImage || require('@/assets/default-gathering.png')"
                                                    alt="참석자"
                                                ></v-img>
                                            </v-avatar>
                                        </div>
                                        <span class="text-caption ml-2">
                                            {{ meeting.attendees.length }}/{{ meeting.maxPeople }}명
                                        </span>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-col>
                    </v-row>
                </v-card>
            </div>
        </div>
        
        <!-- 모임 생성 버튼 -->
        <v-btn
            class="create-gathering-btn"
            color="primary"
            icon
            size="large"
            @click="showCreateDialog = true"
        >
            <v-icon>mdi-plus</v-icon>
        </v-btn>
        
        <!-- 모임 생성 확인 다이얼로그 -->
        <v-dialog v-model="showCreateDialog" max-width="300">
            <v-card>
                <v-card-title class="text-h6">모임 생성</v-card-title>
                <v-card-text>
                    <div v-if="hasMaxGatherings">
                        만들 수 있는 모임의 최대 개수는 8개입니다.
                    </div>
                    <div v-else>
                        모임을 생성하시겠습니까?
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="showCreateDialog = false">취소</v-btn>
                    <v-btn 
                        color="primary" 
                        variant="text" 
                        @click="goToCreateGathering"
                        :disabled="hasMaxGatherings"
                    >확인</v-btn>
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
            userInfo: null,
            loading: false,
            error: null,
            categories: [
                { id: 1, name: '운동/스포츠', image: 'sports' },
                { id: 2, name: '책/글', image: 'book' },
                { id: 3, name: '공예', image: 'craft' },
                { id: 4, name: '스포츠관람', image: 'watching' },
                { id: 5, name: '반려동물', image: 'pet' },
                { id: 6, name: '음악/악기', image: 'music' },
                { id: 7, name: '여행', image: 'travel' },
                { id: 8, name: '문화/공연', image: 'culture' },
                { id: 9, name: '댄스/무용', image: 'dance' },
                { id: 10, name: '사교/인맥', image: 'social' },
                { id: 11, name: '사진/영상', image: 'photo' },
                { id: 12, name: '요리', image: 'cook' }
            ],
            myGatherings: [],
            loadingGatherings: false,
            gatheringError: null,
            recommendedGatherings: [],
            loadingRecommended: false,
            recommendedError: null,
            showCreateDialog: false,
            upcomingMeetings: [],
            loadingMeetings: false,
            meetingError: null,
            selectedDateIndex: 0
        }
    },
    computed: {
        filteredRecommendedGatherings() {
            if (!this.recommendedGatherings || !this.myGatherings) return [];
            
            // 내 모임의 ID 목록 생성
            const myGatheringIds = this.myGatherings.map(g => g.id);
            
            // 내 모임에 포함되지 않은 추천 모임만 필터링
            return this.recommendedGatherings.filter(g => !myGatheringIds.includes(g.id));
        },
        hasMaxGatherings() {
            return this.myGatherings.length >= 8;
        },
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
            if (this.meetingsByDate.length === 0 || this.selectedDateIndex >= this.meetingsByDate.length) {
                return [];
            }
            
            return this.meetingsByDate[this.selectedDateIndex].meetings;
        },
        dateButtons() {
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
        }
    },
    mounted() {
        this.fetchUserProfile();
        this.fetchMyGatherings();
        this.fetchUpcomingMeetings();
    },
    watch: {
        userInfo(newValue) {
            if (newValue && newValue.detailAddress) {
                this.fetchRecommendedGatherings();
            }
        }
    },
    methods: {
        async fetchUserProfile() {
            this.loading = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/myprofile`);
                this.userInfo = response.data.result;
            } catch (err) {
                console.error('사용자 정보를 불러오는데 실패했습니다:', err);
                this.error = '사용자 정보를 불러오는데 실패했습니다.';
            } finally {
                this.loading = false;
            }
        },
        async fetchMyGatherings() {
            this.loadingGatherings = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/mygatherings`);
                this.myGatherings = response.data.result || [];
            } catch (err) {
                console.error('모임 정보를 불러오는데 실패했습니다:', err);
                this.gatheringError = '모임 정보를 불러오는데 실패했습니다.';
            } finally {
                this.loadingGatherings = false;
            }
        },
        async fetchRecommendedGatherings() {
            if (!this.userInfo || !this.userInfo.detailAddress) return;
            
            this.loadingRecommended = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/search?region=${this.userInfo.region}`);
                this.recommendedGatherings = response.data.result || [];
            } catch (err) {
                console.error('추천 모임을 불러오는데 실패했습니다:', err);
                this.recommendedError = '추천 모임을 불러오는데 실패했습니다.';
            } finally {
                this.loadingRecommended = false;
            }
        },
        goToAddressUpdate() {
            this.$router.push('/silverpotion/user/update/adress');
        },
        goToGatheringDetail(gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
        },
        goToCreateGathering() {
            this.showCreateDialog = false;
            if (!this.hasMaxGatherings) {
                this.$router.push('/silverpotion/gathering/create');
            }
        },
        goToSearchWithCategory(category) {
            // 카테고리 ID와 이름을 쿼리 파라미터로 전달
            this.$router.push({
                path: '/silverpotion/gathering/search',
                query: { 
                    categoryId: category.id,
                    categoryName: category.name
                }
            });
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
        formatDateForApi(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
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
        }
    }
}
</script>

<style scoped>
.category-container {
    margin-top: 10px;
}
.category-item {
    cursor: pointer;
    padding: 8px;
}
.category-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
}
.category-name {
    font-size: 12px;
    margin-top: 4px;
}
.create-gathering-btn {
    position: fixed;
    bottom: calc(24px + var(--v-layout-bottom, 0px));
    left: calc(50% + 330px); /* 중앙에서 오른쪽으로 100px */
    transform: translateX(-50%);
    z-index: 100;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.date-selector {
    overflow-x: auto;
}
.attendees-avatars {
    display: flex;
    flex-wrap: wrap;
    max-width: 120px;
}
.empty-meetings-container {
    min-height: 380px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>