<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">검색</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <!-- 검색 입력 필드 -->
            <div class="position-relative">
                <v-text-field
                    v-model="keyword"
                    label="검색어를 입력하세요"
                    variant="outlined"
                    density="compact"
                    hide-details
                    append-inner-icon="mdi-magnify"
                    @click:append-inner="searchKeyword"
                    @keydown.enter="searchKeyword"
                    @input="getSuggestions"
                    class="mb-4"
                ></v-text-field>
                
                <!-- 자동완성 드롭다운 -->
                <v-card 
                    v-if="suggestions.length > 0 && showSuggestions" 
                    class="suggestion-dropdown" 
                    elevation="3"
                >
                    <v-list density="compact">
                        <v-list-item
                            v-for="(suggestion, index) in suggestions"
                            :key="index"
                            @click="selectSuggestion(suggestion)"
                            :ripple="true"
                            hover
                        >
                            <v-list-item-title>{{ suggestion }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-card>
            </div>

            <!-- 검색 결과가 없을 때 -->
            <v-card v-if="searched && !hasResults" flat class="text-center pa-4 mb-4">
                <v-icon size="48" color="grey">mdi-alert-circle-outline</v-icon>
                <p class="text-body-1 mt-2">검색 결과가 없습니다.</p>
            </v-card>

            <!-- 검색 결과 - 모임 -->
            <div v-if="searchResults.gatherings && searchResults.gatherings.length > 0">
                <h2 class="text-h6 font-weight-bold mb-2">'{{ keyword }}' 모임 내 검색 결과</h2>
                <v-list>
                    <v-list-item 
                        v-for="gathering in searchResults.gatherings" 
                        :key="`gathering-${gathering.id}`"
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
                                <div class="d-flex align-center ml-3">
                                    <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                                    <span class="text-caption">{{ gathering.region }}</span>
                                    <v-icon size="x-small" class="ml-2 mr-1">mdi-account-multiple</v-icon>
                                    <span class="text-caption">{{ gathering.peopleCount || 0 }}/{{ gathering.maxPeople || '제한없음' }}명</span>
                                    <span class="text-caption text-grey ml-2">{{ gathering.introduce || '모임 소개가 없습니다.' }}</span>
                                </div>
                            </div>
                        </div>
                    </v-list-item>
                </v-list>
            </div>

            <!-- 검색 결과 - 정모 -->
            <div v-if="searchResults.meetings && searchResults.meetings.length > 0" class="mt-4">
                <h2 class="text-h6 font-weight-bold mb-2">'{{ keyword }}' 정모 내 검색 결과</h2>
                <v-list>
                    <v-list-item 
                        v-for="meeting in searchResults.meetings" 
                        :key="`meeting-${meeting.id}`"
                        class="mb-2"
                        @click="goToMeetingDetail(meeting.gatheringId, meeting.id)"
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
                                <span class="font-weight-medium">{{ meeting.name }}</span>
                                <v-chip
                                    size="x-small"
                                    class="ml-2"
                                    color="primary"
                                    variant="outlined"
                                >
                                    {{ meeting.category || '카테고리 정보 없음' }}
                                </v-chip>
                                <div class="d-flex align-center ml-3">
                                    <v-icon size="x-small" class="mr-1">mdi-calendar</v-icon>
                                    <span class="text-caption">{{ formatDate(meeting.meetingDate) }} {{ formatTime(meeting.meetingTime) }}</span>
                                    <v-icon size="x-small" class="ml-2 mr-1">mdi-map-marker</v-icon>
                                    <span class="text-caption">{{ meeting.place }}</span>
                                    <v-icon size="x-small" class="ml-2 mr-1">mdi-account-multiple</v-icon>
                                    <span class="text-caption">{{ meeting.attendeesCount || 0 }}/{{ meeting.maxPeople }}명</span>
                                    <v-icon size="x-small" class="ml-2 mr-1">mdi-currency-krw</v-icon>
                                    <span class="text-caption">{{ meeting.cost }}원</span>
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
    </v-container>
</template>

<script>
import axios from 'axios';

export default{
    data(){
        return {
            keyword: '',
            searchResults: {
                gatherings: [],
                meetings: []
            },
            searched: false,
            loading: false,
            suggestions: [],
            showSuggestions: false,
            suggestionsDebounceTimeout: null,
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
            ]
        }
    },
    computed: {
        hasResults() {
            return (this.searchResults.gatherings && this.searchResults.gatherings.length > 0) || 
                   (this.searchResults.meetings && this.searchResults.meetings.length > 0);
        }
    },
    mounted() {
        // 페이지 클릭 시 자동완성 드롭다운 닫기
        document.addEventListener('click', this.closeSuggestions);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.closeSuggestions);
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        async searchKeyword() {
            if (!this.keyword.trim()) return;
            
            this.loading = true;
            this.searched = true;
            this.showSuggestions = false;
            
            try {
                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/opensearch`,
                    {
                        "gatheringSearchRequest": {
                            "keyword": this.keyword
                        },
                        "meetingSearchRequest": {
                            "keyword": this.keyword
                        }
                    }
                );
                
                if (response.data && response.data.result) {
                    this.searchResults = response.data.result;
                    
                    // 모임 정보 추가 조회
                    if (this.searchResults.gatherings && this.searchResults.gatherings.length > 0) {
                        await this.fetchGatheringsDetails();
                    }
                    
                    // 정모 정보 추가 조회
                    if (this.searchResults.meetings && this.searchResults.meetings.length > 0) {
                        await this.fetchMeetingsDetails();
                    }
                }
            } catch (error) {
                console.error('검색 중 오류가 발생했습니다:', error);
                this.searchResults = {
                    gatherings: [],
                    meetings: []
                };
            } finally {
                this.loading = false;
            }
        },
        async getSuggestions() {
            // 디바운스 처리 - 타이핑이 끝난 후 300ms 후에 API 호출
            clearTimeout(this.suggestionsDebounceTimeout);
            
            if (!this.keyword.trim()) {
                this.suggestions = [];
                this.showSuggestions = false;
                return;
            }
            
            this.suggestionsDebounceTimeout = setTimeout(async () => {
                try {
                    const response = await axios.get(
                        `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/suggest?prefix=${this.keyword}`
                    );
                    
                    if (response.data && response.data.result) {
                        this.suggestions = response.data.result;
                        this.showSuggestions = this.suggestions.length > 0;
                    }
                } catch (error) {
                    console.error('자동완성 데이터를 가져오는 중 오류가 발생했습니다:', error);
                    this.suggestions = [];
                    this.showSuggestions = false;
                }
            }, 300);
        },
        selectSuggestion(suggestion) {
            this.keyword = suggestion;
            this.showSuggestions = false;
            this.searchKeyword();
        },
        closeSuggestions(event) {
            // 검색 필드나 자동완성 드롭다운 외부를 클릭하면 드롭다운 닫기
            const searchField = this.$el.querySelector('.v-text-field');
            const dropdown = this.$el.querySelector('.suggestion-dropdown');
            
            if (searchField && dropdown && 
                !searchField.contains(event.target) && 
                !dropdown.contains(event.target)) {
                this.showSuggestions = false;
            }
        },
        async fetchGatheringsDetails() {
            const updatedGatherings = await Promise.all(
                this.searchResults.gatherings.map(async (gathering) => {
                    try {
                        const response = await axios.get(
                            `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${gathering.id}`
                        );
                        
                        if (response.data && response.data.result) {
                            return {
                                ...gathering,
                                ...response.data.result
                            };
                        }
                        return gathering;
                    } catch (error) {
                        console.error(`모임 정보 조회 실패 (ID: ${gathering.id}):`, error);
                        return gathering;
                    }
                })
            );
            
            this.searchResults.gatherings = updatedGatherings;
        },
        async fetchMeetingsDetails() {
            const updatedMeetings = await Promise.all(
                this.searchResults.meetings.map(async (meeting) => {
                    try {
                        const response = await axios.get(
                            `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/${meeting.id}`
                        );
                        
                        if (response.data && response.data.result) {
                            // 모임 정보도 함께 조회
                            const gatheringResponse = await axios.get(
                                `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${meeting.gatheringId}`
                            );
                            
                            const gatheringInfo = gatheringResponse.data.result || {};
                            const meetingData = response.data.result;
                            
                            // attendees 배열에서 참가자 수 계산
                            const attendeesCount = meetingData.attendees ? meetingData.attendees.length : 0;
                            
                            return {
                                ...meeting,
                                ...meetingData,
                                attendeesCount: attendeesCount,
                                gatheringName: gatheringInfo.gatheringName,
                                category: gatheringInfo.category
                            };
                        }
                        return meeting;
                    } catch (error) {
                        console.error(`정모 정보 조회 실패 (ID: ${meeting.id}):`, error);
                        return meeting;
                    }
                })
            );
            
            this.searchResults.meetings = updatedMeetings;
        },
        goToGatheringDetail(gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
        },
        goToMeetingDetail(gatheringId, meetingId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}/meeting/${meetingId}`);
        },
        getCategoryName(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.name : '카테고리 정보 없음';
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

.position-relative {
    position: relative;
}

.suggestion-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    margin-top: -4px;
}
</style>