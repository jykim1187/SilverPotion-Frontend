<template>
    <v-container>
        <!-- 회원 주소 정보 버튼 -->
        <div class="d-flex justify-start">
            <v-card 
                class="address-card" 
                variant="outlined" 
                hover 
                @click="openRegionModal"
            >
                <div v-if="userInfo" class="d-flex align-center pa-3">
                    <v-avatar color="primary" size="36" class="mr-3">
                        <v-icon color="white">mdi-map-marker</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-caption text-grey">활동지역</div>
                        <div class="font-weight-medium">{{ userInfo.region || '주소 정보가 없습니다. 클릭하여 주소를 설정하세요.' }}</div>
                    </div>
                    <v-spacer></v-spacer>
                    <v-icon>mdi-chevron-right</v-icon>
                </div>
                <div v-else class="d-flex align-center pa-3">
                    <v-progress-circular indeterminate color="primary" size="16" class="mr-2"></v-progress-circular>
                    <span>주소 정보를 불러오는 중...</span>
                </div>
            </v-card>
        </div>

        <!-- 카테고리 제목 -->
        <h2 class="text-h6 font-weight-medium mb-4">모임 카테고리</h2>

        <!-- 카테고리 버튼 - 그리드 레이아웃으로 변경 -->
        <div class="category-container">
            <v-row dense>
                <v-col v-for="(category, index) in categories" 
                       :key="index" 
                       cols="2" 
                       sm="6" 
                       md="2" 
                       lg="2"
                       class="pa-1"
                >
                    <div class="category-item text-center" @click="goToSearchWithCategory(category)">
                        <v-avatar size="40" class="mb-1">
                            <v-img :src="require(`@/assets/category/${category.image}.png`)" alt="카테고리 이미지"></v-img>
                        </v-avatar>
                        <div class="category-name">{{ category.name }}</div>
                    </div>
                </v-col>
            </v-row>
        </div>
        
        <!-- 내 모임 섹션 -->
        <div class="d-flex justify-space-between align-center mt-6 mb-4">
            <h2 class="text-h6 font-weight-medium">내 모임</h2>
            <v-btn 
                v-if="myGatherings.length > 0"
                variant="text" 
                color="primary"
                @click="$router.push('/silverpotion/gathering/mygathering')"
            >
                더보기 <v-icon>mdi-chevron-right</v-icon>
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
                        </div>
                        <div class="d-flex align-center mt-1">
                            <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                            <span class="text-caption">{{ gathering.region }}</span>
                            <v-icon size="x-small" class="ml-2 mr-1">mdi-account-multiple</v-icon>
                            <span class="text-caption">{{ gathering.peopleCount }}/{{ gathering.maxPeople }}명</span>
                        </div>
                    </div>
                </v-list-item>
            </v-list>
        </div>
        
        <!-- 내 주변 모임 섹션 -->
        <div class="mt-8">
            <div class="d-flex justify-space-between align-center mb-4">
                <h2 class="text-h6 font-weight-medium">추천 모임</h2>
                <v-btn variant="text" color="primary" @click="$router.push('/silverpotion/gathering/recommendGathering')">
                    더보기 <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </div>
            
            <div v-if="loadingRecommended" class="text-center my-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <span class="ml-2">모임 정보를 불러오는 중...</span>
            </div>
            
            <div v-else-if="filteredRecommendedGatherings.length === 0" class="text-center pa-4">
                <v-icon size="large" color="grey">mdi-map-marker-off</v-icon>
                <p class="mt-2">주변에 모임이 없습니다.</p>
            </div>
            
            <div v-else>
                <v-list>
                    <v-list-item 
                        v-for="gathering in filteredRecommendedGatherings.slice(0, 5)" 
                        :key="gathering.id"
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
                                    {{ gathering.category || getCategoryName(gathering.categoryId) }}
                                </v-chip>
                            </div>
                            <div class="d-flex align-center mt-1">
                                <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                                <span class="text-caption">{{ gathering.region }}</span>
                                <v-icon size="x-small" class="ml-2 mr-1">mdi-account-multiple</v-icon>
                                <span class="text-caption">{{ gathering.peopleCount || 0 }}/{{ gathering.maxPeople || '제한없음' }}명</span>
                            </div>
                            <div class="text-caption text-grey mt-1" v-if="gathering.introduce">
                                {{ gathering.introduce }}
                            </div>
                        </div>
                    </v-list-item>
                </v-list>
            </div>
        </div>
        
        <!-- 추천 정모 섹션 -->
        <div class="mt-8">
            <div class="d-flex justify-space-between align-center mb-4">
                <h2 class="text-h6 font-weight-medium">추천 정모</h2>
                <v-btn variant="text" color="primary" @click="$router.push('/silverpotion/gathering/recommendMeeting')">
                    더보기 <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </div>
            
            <div v-if="loadingMeetings" class="text-center my-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <span class="ml-2">정모 정보를 불러오는 중...</span>
            </div>
            
            <div v-else-if="upcomingMeetings.length === 0" class="text-center pa-4">
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
                <div v-if="selectedDateMeetings.length === 0" class="text-center pa-4 empty-meetings-container">
                    <p>선택한 날짜에 예정된 정모가 없습니다.</p>
                </div>
                
                <div v-else>
                    <v-list>
                        <v-list-item 
                            v-for="meeting in selectedDateMeetings.slice(0, 3)" 
                            :key="meeting.meetingId"
                            class="mb-2"
                            @click="goToGatheringDetail(meeting.gatheringId)"
                            :ripple="true"
                            hover
                        >
                            <template v-slot:prepend>
                                <v-avatar size="50" rounded>
                                    <v-img :src="meeting.imageUrl || require('@/assets/default-gathering.png')" 
                                           cover
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
                                <div class="text-caption text-grey mt-1">
                                    <span>{{ meeting.gatheringName || '모임 정보 없음' }}</span>
                                </div>
                            </div>
                        </v-list-item>
                    </v-list>
                </div>
            </div>
        </div>
        
        <!-- 모임 생성 버튼 -->
        <v-btn
            class="create-gathering-btn"
            style="background-color: #E8F1FD; color: #1976d2;"
            icon
            size="70px"
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

        <!-- 지역 선택 모달 추가 -->
        <v-dialog
          v-model="regionModalOpen"
          max-width="800px"
          persistent
        >
          <v-card>
            <v-card-title class="headline">
              활동지역 선택
            </v-card-title>
            
            <v-card-text>
              <KakaoMap 
                ref="kakaoMapRef"
                @region-selected="handleRegionSelected"
              />
            </v-card-text>
            
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="red"
                text
                @click="regionModalOpen = false"
              >
                취소
              </v-btn>
              <v-btn
                color="primary"
                text
                @click="confirmRegionSelection"
                :loading="updatingRegion"
              >
                확인
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import axios from 'axios';
import KakaoMap from '@/views/gathering/RegionSelect.vue';

export default{
    components: {
        KakaoMap
    },
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
            selectedDateIndex: 0,
            
            // 지역 선택 모달 관련 변수 추가
            regionModalOpen: false,
            selectedRegion: null,
            updatingRegion: false
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
                    // meetingTime이 배열인 경우 처리
                    if (Array.isArray(a.meetingTime) && Array.isArray(b.meetingTime)) {
                        // 시간을 비교
                        if (a.meetingTime[0] !== b.meetingTime[0]) {
                            return a.meetingTime[0] - b.meetingTime[0];
                        }
                        // 시간이 같으면 분을 비교
                        return a.meetingTime[1] - b.meetingTime[1];
                    }
                    
                    // meetingTime이 문자열인 경우 처리
                    if (typeof a.meetingTime === 'string' && typeof b.meetingTime === 'string') {
                        return a.meetingTime.localeCompare(b.meetingTime);
                    }
                    
                    // 타입이 다른 경우 안전하게 처리
                    return 0;
                });
            });
            
            return Object.entries(groupedMeetings).map(([date, meetings]) => ({
                date,
                meetings
            })).sort((a, b) => new Date(a.date) - new Date(b.date));
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
        },
        selectedDateMeetings() {
            if (this.meetingsByDate.length === 0 || this.selectedDateIndex === null || this.selectedDateIndex < 0 || this.selectedDateIndex >= this.meetingsByDate.length) {
                return [];
            }
            
            return this.meetingsByDate[this.selectedDateIndex].meetings;
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
        // 지역 선택 모달 열기
        openRegionModal() {
            this.regionModalOpen = true;
        },
        
        // 지역 선택 이벤트 처리
        handleRegionSelected(region) {
            this.selectedRegion = region;
        },
        
        // 지역 선택 확인 및 업데이트
        async confirmRegionSelection() {
            if (!this.selectedRegion) {
                this.regionModalOpen = false;
                return;
            }
            
            this.updatingRegion = true;
            
            try {
                // 선택한 지역으로 사용자 정보 업데이트
                await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/update`,
                    {
                        region: this.selectedRegion.name
                    }
                );
                
                // 사용자 정보 다시 불러오기
                await this.fetchUserProfile();
                
                // 추천 모임 다시 불러오기
                if (this.userInfo && this.userInfo.detailAddress) {
                    await this.fetchRecommendedGatherings();
                }
                
                // 성공 메시지 표시 (alert 사용)
                alert('활동지역이 업데이트되었습니다.');
            } catch (err) {
                console.error('활동지역 업데이트 실패:', err);
                alert('활동지역 업데이트에 실패했습니다.');
            } finally {
                this.updatingRegion = false;
                this.regionModalOpen = false;
            }
        },
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
            // 이 메서드는 이제 사용하지 않음 (모달로 대체)
        },
        goToGatheringDetail(gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
        },
        goToMeetingDetail(gatheringId, meetingId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}/meeting/${meetingId}`);
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
        formatTime(timeValue) {
            if (!timeValue) return '';
            
            // timeValue가 배열인 경우 ([시간, 분] 형식)
            if (Array.isArray(timeValue)) {
                const [hours, minutes] = timeValue;
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
            
            // timeValue가 문자열인 경우 (HH:MM:SS 형식)
            if (typeof timeValue === 'string') {
                // HH:MM:SS 형식에서 HH:MM 형식으로 변환
                return timeValue.substring(0, 5);
            }
            
            return '';
        },
        formatCost(cost) {
            return cost > 0 ? `${cost.toLocaleString()}원` : '회비없음';
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
        },
        getCategoryName(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.name : '카테고리 정보 없음';
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
/* 전체 컨테이너 스타일 */
.v-container {
    max-width: 960px;
    padding-bottom: 80px;
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

/* 섹션 제목 스타일 */
.text-h6 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
    position: relative;
    display: inline-block;
}

.text-h6::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 24px;
    height: 2px;
    background-color: var(--v-primary-base, #1976d2);
}

/* 주소 카드 스타일링 */
.address-card {
    border-radius: 16px;
    transition: all 0.3s ease;
    background-color: #f9f9f9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 24px;
}

.address-card:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 카테고리 스타일링 */
.category-container {
    margin-top: 16px;
}

.category-item {
    cursor: pointer;
    padding: 12px 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    transition: all 0.2s ease;
}

.category-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-name {
    font-size: 12px;
    margin-top: 8px;
    text-align: center;
    word-break: keep-all;
    color: #424242;
    font-weight: 500;
}

/* 모임 및 정모 카드 스타일링 */
.v-list-item {
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.v-list-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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

/* 날짜 선택기 스타일링 - 새 디자인 */
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

/* 빈 정모 컨테이너 */
.empty-meetings-container {
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 24px;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 모임 생성 버튼 */
.create-gathering-btn {
    position: fixed;
    bottom: calc(24px + var(--v-layout-bottom, 0px));
    right: 24px;
    z-index: 100;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.create-gathering-btn:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

/* 모바일 화면에서 버튼 위치 조정 */
@media (max-width: 600px) {
    .create-gathering-btn {
        bottom: 16px;
        right: 16px;
    }
    
    .category-name {
        font-size: 10px;
    }
    
    .v-container {
        padding-left: 12px;
        padding-right: 12px;
    }
    
    .text-h6 {
        font-size: 1.1rem;
    }
    
    .v-list-item {
        margin-bottom: 8px;
    }
}

/* 태블릿 화면 최적화 */
@media (min-width: 601px) and (max-width: 960px) {
    .create-gathering-btn {
        bottom: 20px;
        right: 20px;
    }
}

/* 애니메이션 효과 */
.v-list-item, .category-item, .address-card, .v-btn.ma-1 {
    will-change: transform, box-shadow;
}

/* 다이얼로그 스타일링 */
:deep(.v-dialog > .v-card) {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

:deep(.v-card-title) {
    font-weight: 600;
    padding-top: 20px;
}

:deep(.v-card-actions) {
    padding: 16px;
}
</style>