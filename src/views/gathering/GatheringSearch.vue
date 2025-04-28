<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">검색</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <!-- 검색창 추가 -->
            <div class="search-container mb-4">
                <v-form @submit.prevent="searchByKeyword">
                    <v-text-field
                        v-model="keyword"
                        placeholder="모임 또는 정모 검색"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="search-field"
                        prepend-inner-icon="mdi-magnify"
                        @click:prepend-inner="searchByKeyword"
                        @keyup.enter="searchByKeyword"
                        @input="getSuggestions"
                        @focus="showSuggestions = suggestions.length > 0"
                        @blur="hideSearchSuggestions"
                    >
                        <template v-slot:append>
                            <v-btn
                                v-if="keyword"
                                icon="mdi-close"
                                variant="text"
                                size="small"
                                @click="clearSearch"
                            ></v-btn>
                        </template>
                    </v-text-field>
                </v-form>
                
                <!-- 자동완성 제안 -->
                <div v-if="showSuggestions" class="suggestions-container">
                    <div 
                        v-for="(suggestion, index) in suggestions" 
                        :key="index"
                        class="suggestion-item"
                        @click="selectSuggestion(suggestion)"
                    >
                        <v-icon size="small" class="mr-2">mdi-magnify</v-icon>
                        <span>{{ suggestion }}</span>
                    </div>
                </div>
            </div>
            
            <!-- 카테고리 선택 영역 -->
            <div class="category-container">
                <h3 class="text-subtitle-1 font-weight-medium mb-2">카테고리</h3>
                <v-row dense>
                    <v-col v-for="(category, index) in categories" 
                           :key="index" 
                           cols="2" 
                           sm="6" 
                           md="2" 
                           lg="2"
                           class="pa-1"
                    >
                        <div 
                            class="category-item text-center" 
                            :class="{ 'category-selected': selectedCategory === category.id }"
                            @click="selectCategory(category.id)"
                        >
                            <v-avatar size="40" class="mb-1">
                                <v-img :src="require(`@/assets/category/${category.image}.png`)" alt="카테고리 이미지"></v-img>
                            </v-avatar>
                            <div class="category-name">{{ category.name }}</div>
                        </div>
                    </v-col>
                </v-row>
            </div>
            
            <!-- 상세 카테고리 선택 (메인 카테고리가 선택된 경우에만 표시) -->
            <div v-if="selectedCategory && subCategories.length > 0" class="mt-4">
                <h3 class="text-subtitle-1 font-weight-medium mb-2">상세 카테고리</h3>
                
                <div class="sub-category-container">
                    <v-chip
                        v-for="subCategory in subCategories"
                        :key="subCategory.id"
                        :value="subCategory.id"
                        :color="selectedSubCategory === subCategory.id ? 'primary' : ''"
                        :variant="selectedSubCategory === subCategory.id ? 'flat' : 'outlined'"
                        class="ma-1"
                        @click="selectSubCategory(subCategory.id)"
                    >
                        {{ subCategory.name }}
                    </v-chip>
                </div>
            </div>
            
            <!-- 키워드 검색 결과 영역 -->
            <div v-if="keywordSearchResults.gatherings && keywordSearchResults.gatherings.length > 0" class="mt-6">
                <h3 class="text-subtitle-1 font-weight-medium mb-2">'{{ keyword }}' 모임 검색 결과</h3>
                
                <v-list>
                    <v-list-item 
                        v-for="gathering in keywordSearchResults.gatherings" 
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
            
            <!-- 키워드 검색 결과 - 정모 -->
            <div v-if="keywordSearchResults.meetings && keywordSearchResults.meetings.length > 0" class="mt-4">
                <h3 class="text-subtitle-1 font-weight-medium mb-2">'{{ keyword }}' 정모 검색 결과</h3>
                <v-list>
                    <v-list-item 
                        v-for="meeting in keywordSearchResults.meetings" 
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
                                <span class="text-caption">{{ meeting.attendeesCount || 0 }}/{{ meeting.maxPeople }}명</span>
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
            
            <!-- 카테고리 검색 결과 영역 -->
            <div v-if="!keyword && (searchResults.length > 0 || isLoading)" class="search-results mt-6">
                <h3 class="text-subtitle-1 font-weight-medium mb-2">검색 결과</h3>
                
                <div v-if="isLoading" class="text-center my-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>
                
                <div v-else-if="searchResults.length === 0" class="text-center my-4">
                    <v-icon size="large" color="grey">mdi-map-marker-off</v-icon>
                    <p class="mt-2">검색 결과가 없습니다.</p>
                </div>
                
                <div v-else>
                    <v-list>
                        <v-list-item 
                            v-for="gathering in searchResults"
                            :key="gathering.id"
                            class="mb-2"
                            @click="goToGatheringDetail(gathering.id)"
                            :ripple="true"
                            hover
                        >
                            <template v-slot:prepend>
                                <v-avatar size="50" rounded>
                                    <v-img :src="gathering.imageUrl || require('@/assets/default-gathering.png')" 
                                           contain
                                           bg-color="#f5f5f5"
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
                                <div class="text-caption text-grey mt-1" v-if="gathering.introduce">
                                    {{ gathering.introduce }}
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
            selectedCategory: null,
            selectedSubCategory: null,
            isLoading: false,
            searchResults: [],
            keyword: '',
            keywordSearchResults: {
                gatherings: [],
                meetings: []
            },
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
            allSubCategories: {
                1: [ // 운동/스포츠
                    { id: 1, name: '게이트볼' },
                    { id: 2, name: '골프' },
                    { id: 3, name: '당구/포켓볼' },
                    { id: 4, name: '러닝/마라톤' },
                    { id: 5, name: '배드민턴' },
                    { id: 6, name: '수영' },
                    { id: 7, name: '자전거' },
                    { id: 8, name: '족구' },
                    { id: 9, name: '축구/풋살' },
                    { id: 10, name: '탁구' }
                ],
                2: [ // 책/글
                    { id: 11, name: '책/독서' },
                    { id: 12, name: '인문학' },
                    { id: 13, name: '심리학' },
                    { id: 14, name: '철학' },
                    { id: 15, name: '역사' },
                    { id: 16, name: '시사/경제' },
                    { id: 17, name: '작문/글쓰기' }
                ],
                3: [ // 공예
                    { id: 18, name: '가구/목공예' },
                    { id: 19, name: '가죽공예' },
                    { id: 20, name: '도자/점토공예' },
                    { id: 21, name: '미술/그림' },
                    { id: 22, name: '소품공예' },
                    { id: 23, name: '자수/뜨개질' },
                    { id: 24, name: '천연비누/화장품' },
                    { id: 25, name: '캔들/디퓨저' },
                    { id: 26, name: '플라워아트' }
                ],
                4: [ // 스포츠관람
                    { id: 27, name: '농구KBL' },
                    { id: 28, name: '배구V리그' },
                    { id: 29, name: '야구KBO' },
                    { id: 30, name: '축구K리그' },
                    { id: 31, name: '해외축구' },
                    { id: 32, name: 'e스포츠' }
                ],
                5: [ // 반려동물
                    { id: 33, name: '강아지' },
                    { id: 34, name: '고양이' },
                    { id: 35, name: '물고기' },
                    { id: 36, name: '파충류' },
                    { id: 37, name: '설치류' }
                ],
                6: [ // 음악/악기
                    { id: 38, name: '국악/사물놀이' },
                    { id: 39, name: '기타/베이스' },
                    { id: 40, name: '노래/보컬' },
                    { id: 41, name: '바이올린' },
                    { id: 42, name: '밴드/합주' },
                    { id: 43, name: '오카리나' },
                    { id: 44, name: '재즈' },
                    { id: 45, name: '찬양/CCM' },
                    { id: 46, name: '클래식' },
                    { id: 47, name: '피아노' }
                ],
                7: [ // 여행
                    { id: 48, name: '국내여행' },
                    { id: 49, name: '낚시' },
                    { id: 50, name: '등산' },
                    { id: 51, name: '산책/트래킹' },
                    { id: 52, name: '캠핑/백패킹' },
                    { id: 53, name: '해외여행' }
                ],
                8: [ // 문화/공연
                    { id: 54, name: '고궁/문화재탐방' },
                    { id: 55, name: '공연/연극' },
                    { id: 56, name: '뮤지컬/오페라' },
                    { id: 57, name: '영화' },
                    { id: 58, name: '전시회' }
                ],
                9: [ // 댄스/무용
                    { id: 59, name: '라틴댄스' },
                    { id: 60, name: '밸리댄스' },
                    { id: 61, name: '사교댄스' },
                    { id: 62, name: '스윙댄스' },
                    { id: 63, name: '재즈댄스' },
                    { id: 64, name: '한국무용' },
                    { id: 65, name: '현대무용' }
                ],
                10: [ // 사교/인맥
                    { id: 66, name: '결혼' },
                    { id: 67, name: '나이' },
                    { id: 68, name: '맛집/미식회' },
                    { id: 69, name: '와인/커피/차' },
                    { id: 70, name: '지역' },
                    { id: 71, name: '파티' }
                ],
                11: [ // 사진/영상
                    { id: 72, name: '디지털카메라' },
                    { id: 73, name: '영상제작' },
                    { id: 74, name: '필름카메라' },
                    { id: 75, name: 'DSLR' }
                ],
                12: [ // 요리
                    { id: 76, name: '한식' },
                    { id: 77, name: '양식' },
                    { id: 78, name: '중식' },
                    { id: 79, name: '일식' },
                    { id: 80, name: '제과제빵' },
                    { id: 81, name: '주류제조/칵테일' }
                ]
            },
            suggestions: [],
            showSuggestions: false,
            suggestionsDebounceTimeout: null,
        }
    },
    computed: {
        subCategories() {
            return this.selectedCategory ? this.allSubCategories[this.selectedCategory] || [] : [];
        },
        selectedCategoryName() {
            if (!this.selectedCategory) return null;
            const category = this.categories.find(c => c.id === this.selectedCategory);
            return category ? category.name : null;
        },
        selectedSubCategoryName() {
            if (!this.selectedSubCategory) return null;
            const subCategory = this.subCategories.find(sc => sc.id === this.selectedSubCategory);
            return subCategory ? subCategory.name : null;
        }
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        selectCategory(categoryId) {
            if (this.selectedCategory === categoryId) {
                // 이미 선택된 카테고리를 다시 클릭하면 선택 해제
                this.selectedCategory = null;
                this.selectedSubCategory = null;
            } else {
                // 새로운 카테고리 선택
                this.selectedCategory = categoryId;
                this.selectedSubCategory = null;
            }
            // 카테고리 변경 시 검색 실행
            this.searchGatherings();
            // 키워드 검색 결과 초기화
            this.keyword = '';
            this.keywordSearchResults = { gatherings: [], meetings: [] };
        },
        selectSubCategory(subCategoryId) {
            if (this.selectedSubCategory === subCategoryId) {
                // 이미 선택된 상세 카테고리를 다시 클릭하면 선택 해제
                this.selectedSubCategory = null;
            } else {
                // 새로운 상세 카테고리 선택
                this.selectedSubCategory = subCategoryId;
            }
            // 상세 카테고리 변경 시 검색 실행
            this.searchGatherings();
            // 키워드 검색 결과 초기화
            this.keyword = '';
            this.keywordSearchResults = { gatherings: [], meetings: [] };
        },
        async searchGatherings() {
            this.isLoading = true;
            this.searchResults = [];
            
            try {
                let url = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/search`;
                let params = {};
                
                if (this.selectedSubCategory) {
                    // 상세 카테고리로 검색
                    params.categoryDetail = this.selectedSubCategoryName;
                } else if (this.selectedCategory) {
                    // 메인 카테고리로 검색
                    const category = this.categories.find(c => c.id === this.selectedCategory);
                    if (category) {
                        params.category = category.name;
                    }
                } else {
                    // 카테고리 선택 없이 전체 검색
                    // 아무 파라미터도 추가하지 않음
                }
                
                const response = await axios.get(url, { params });
                
                if (response.data && response.data.result) {
                    this.searchResults = response.data.result;
                }
            } catch (error) {
                console.error('모임 검색 실패:', error);
                // 에러 처리
            } finally {
                this.isLoading = false;
            }
        },
        goToGatheringDetail(gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
        },
        goToMeetingDetail(gatheringId, meetingId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}/meeting/${meetingId}`);
        },
        async searchByKeyword() {
            if (!this.keyword.trim()) return;
            
            this.isLoading = true;
            this.keywordSearchResults = { gatherings: [], meetings: [] };
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
                    this.keywordSearchResults = response.data.result;
                    
                    // 모임 정보 추가 조회
                    if (this.keywordSearchResults.gatherings && this.keywordSearchResults.gatherings.length > 0) {
                        await this.fetchGatheringsDetails();
                    }
                    
                    // 정모 정보 추가 조회
                    if (this.keywordSearchResults.meetings && this.keywordSearchResults.meetings.length > 0) {
                        await this.fetchMeetingsDetails();
                    }
                }
                
                // 카테고리 선택 초기화
                this.selectedCategory = null;
                this.selectedSubCategory = null;
                this.searchResults = [];
            } catch (error) {
                console.error('검색 중 오류가 발생했습니다:', error);
                this.keywordSearchResults = {
                    gatherings: [],
                    meetings: []
                };
            } finally {
                this.isLoading = false;
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
            this.searchByKeyword();
        },
        async fetchGatheringsDetails() {
            try {
                // 모임 ID 목록 추출
                const gatheringIds = this.keywordSearchResults.gatherings.map(g => g.id);
                
                // 모임 상세 정보 조회를 위한 병렬 요청
                const detailsPromises = gatheringIds.map(id => 
                    axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${id}`)
                );
                
                // 모든 요청 완료 대기
                const responses = await Promise.all(detailsPromises);
                
                // 응답 데이터 처리
                responses.forEach((response) => {
                    if (response.data && response.data.result) {
                        const detailData = response.data.result;
                        
                        // 기존 검색 결과에 상세 정보 병합
                        const gatheringIndex = this.keywordSearchResults.gatherings.findIndex(g => g.id === detailData.id);
                        if (gatheringIndex !== -1) {
                            this.keywordSearchResults.gatherings[gatheringIndex] = {
                                ...this.keywordSearchResults.gatherings[gatheringIndex],
                                ...detailData,
                                // 필요한 경우 특정 필드 매핑
                                memberCount: detailData.memberCount || detailData.peopleCount,
                                maxPeople: detailData.maxPeople,
                                region: detailData.region,
                                introduce: detailData.introduce
                            };
                        }
                    }
                });
            } catch (error) {
                console.error('모임 상세 정보 조회 중 오류가 발생했습니다:', error);
            }
        },
        async fetchMeetingsDetails() {
            try {
                const updatedMeetings = await Promise.all(
                    this.keywordSearchResults.meetings.map(async (meeting) => {
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
                
                // 업데이트된 정모 정보로 교체
                this.keywordSearchResults.meetings = updatedMeetings;
            } catch (error) {
                console.error('정모 상세 정보 조회 중 오류가 발생했습니다:', error);
            }
        },
        clearSearch() {
            this.keyword = '';
            this.keywordSearchResults = { gatherings: [], meetings: [] };
            // 카테고리 검색 결과 표시
            this.searchGatherings();
        },
        formatDate(dateValue) {
            if (!dateValue) return '';
            
            // 배열 형식인 경우 ([년, 월, 일] 형식)
            if (Array.isArray(dateValue)) {
                const [year, month, day] = dateValue;
                return `${year}년 ${month}월 ${day}일`;
            }
            
            // 문자열 형식인 경우 (YYYY-MM-DD 형식)
            if (typeof dateValue === 'string') {
                const parts = dateValue.split('-');
                if (parts.length === 3) {
                    return `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;
                }
                return dateValue;
            }
            
            return '';
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
        getCategoryName(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.name : '카테고리 정보 없음';
        },
        hideSearchSuggestions() {
            setTimeout(() => {
                this.showSuggestions = false;
            }, 200);
        },
    },
    mounted() {
        // URL 쿼리 파라미터에서 카테고리 정보 가져오기
        const categoryId = parseInt(this.$route.query.categoryId);
        
        if (categoryId && !isNaN(categoryId)) {
            // 유효한 카테고리 ID가 있으면 해당 카테고리 선택
            this.selectedCategory = categoryId;
            // 카테고리 선택 후 검색 실행
            this.searchGatherings();
        } else {
            // 카테고리 정보가 없으면 전체 모임 검색
            this.searchGatherings();
        }
    },
    // URL 쿼리 파라미터가 변경될 때 카테고리 선택 업데이트
    watch: {
        '$route.query': {
            handler(newQuery) {
                const categoryId = parseInt(newQuery.categoryId);
                if (categoryId && !isNaN(categoryId)) {
                    this.selectedCategory = categoryId;
                    this.selectedSubCategory = null;
                    this.searchGatherings();
                }
            },
            immediate: true
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

.text-primary {
    color: #1976d2 !important;
}

.content-wrapper {
    margin-top: 110px; /* 헤더 높이 + 기존 헤더 컴포넌트 높이에 맞게 조정 */
    padding: 0 16px;
}

.category-container {
    margin-top: 10px;
}

.category-item {
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.category-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.category-selected {
    background-color: rgba(var(--v-theme-primary), 0.1);
    border: 1px solid rgb(var(--v-theme-primary));
}

.category-name {
    font-size: 12px;
    margin-top: 4px;
}

.sub-category-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.search-results {
    margin-top: 24px;
}

.v-list-item {
    border-radius: 12px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
}

.v-list-item:hover {
    background-color: rgba(0, 0, 0, 0.03);
}

.text-subtitle-1 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
    position: relative;
    display: inline-block;
}

.text-subtitle-1::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 24px;
    height: 2px;
    background-color: var(--v-primary-base, #1976d2);
}

.content-wrapper {
    margin-top: 56px; /* 헤더 높이에 맞게 조정 */
    padding: 16px;
    padding-bottom: 80px;
}

.sub-category-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}

/* 검색창 스타일 */
.search-container {
    margin-bottom: 16px;
}

.search-field {
    border-radius: 8px;
    background-color: #f5f5f5;
}

.search-field :deep(.v-field__outline) {
    opacity: 0 !important;
}

.search-field :deep(.v-field__input) {
    padding: 8px 12px;
}

.search-field :deep(.v-field__prepend-inner) {
    padding-right: 8px;
}

/* 자동완성 스타일 */
.suggestions-container {
    position: absolute;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background-color: white;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.suggestion-item {
    padding: 10px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.suggestion-item:hover {
    background-color: #f5f5f5;
}

.search-container {
    position: relative;
}
</style>