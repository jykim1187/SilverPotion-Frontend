<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">추천 모임</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <!-- 회원 주소 정보 버튼 -->
            <div class="d-flex justify-start mb-4">
                <v-card 
                    class="pa-3" 
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

            <!-- 필터 칩 영역 -->
            <div class="filter-chips mb-4">
                <h3 class="text-subtitle-1 font-weight-medium mb-2">필터</h3>
                <div class="d-flex flex-wrap">
                    <!-- 지역 필터 칩 -->
                    <v-chip
                        class="ma-1"
                        :color="activeFilter === 'region' ? 'primary' : ''"
                        :variant="activeFilter === 'region' ? 'flat' : 'outlined'"
                        @click="setFilter('region')"
                    >
                        <v-icon start size="small">mdi-map-marker</v-icon>
                        지역
                    </v-chip>
                    
                    <!-- 내 모임 카테고리 기반 필터 칩들 -->
                    <v-chip
                        v-for="category in uniqueCategories"
                        :key="category.id"
                        class="ma-1"
                        :color="activeFilter === category.name ? 'primary' : ''"
                        :variant="activeFilter === category.name ? 'flat' : 'outlined'"
                        @click="setFilter(category.name)"
                    >
                        {{ category.name }}
                    </v-chip>
                </div>
            </div>

            <div v-if="loading" class="text-center my-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">사용자 정보를 불러오는 중...</p>
            </div>
            
            <div v-else-if="error" class="text-center my-8">
                <v-alert type="error">{{ error }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchUserProfile">다시 시도</v-btn>
            </div>
            
            <div v-else-if="loadingRecommended" class="text-center my-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">추천 모임을 불러오는 중...</p>
            </div>
            
            <div v-else-if="recommendedError" class="text-center my-8">
                <v-alert type="error">{{ recommendedError }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchRecommendedGatherings">다시 시도</v-btn>
            </div>
            
            <div v-else-if="filteredGatherings.length === 0" class="text-center pa-4">
                <v-icon size="large" color="grey">mdi-map-search</v-icon>
                <p class="mt-2">선택한 필터에 맞는 모임이 없습니다.</p>
                <v-btn color="primary" class="mt-4" @click="goToGatheringSearch">모임 찾기</v-btn>
            </div>
            
            <div v-else>
                <v-list>
                    <v-list-item 
                        v-for="gathering in filteredGatherings" 
                        :key="gathering.id"
                        class="mb-3"
                        @click="goToGatheringDetail(gathering.id)"
                        :ripple="true"
                        hover
                        variant="outlined"
                    >
                        <template v-slot:prepend>
                            <v-avatar size="60" rounded>
                                <v-img :src="gathering.imageUrl || require('@/assets/default-gathering.png')" 
                                       cover
                                       alt="모임 이미지"></v-img>
                            </v-avatar>
                        </template>
                        
                        <div>
                            <div class="d-flex align-center mb-1">
                                <span class="font-weight-medium text-subtitle-1">{{ gathering.gatheringName }}</span>
                                <v-chip
                                    size="x-small"
                                    class="ml-2"
                                    color="primary"
                                    variant="outlined"
                                >
                                    {{ gathering.category }}
                                </v-chip>
                            </div>
                            
                            <div class="d-flex align-center">
                                <v-icon size="x-small" class="mr-1">mdi-map-marker</v-icon>
                                <span class="text-caption">{{ gathering.region }}</span>
                                <v-icon size="x-small" class="ml-3 mr-1">mdi-account-multiple</v-icon>
                                <span class="text-caption">{{ gathering.peopleCount }}/{{ gathering.maxPeople }}명</span>
                            </div>
                            
                            <div class="text-caption text-grey mt-1 text-truncate" style="max-width: 250px">
                                {{ gathering.introduce || '모임 소개가 없습니다.' }}
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
            userInfo: null,
            loading: false,
            error: null,
            myGatherings: [],
            loadingGatherings: false,
            gatheringError: null,
            recommendedGatherings: [],
            loadingRecommended: false,
            recommendedError: null,
            activeFilter: 'region', // 기본 필터는 지역
            allGatherings: [] // 모든 모임을 저장할 배열
        }
    },
    computed: {
        // 내 모임에서 고유한 카테고리 목록 추출
        uniqueCategories() {
            if (!this.myGatherings || this.myGatherings.length === 0) return [];
            
            const categories = this.myGatherings.map(g => ({
                name: g.category,
                id: g.category // 카테고리 이름을 ID로 사용
            }));
            
            // 중복 제거
            return Array.from(new Map(categories.map(item => [item.id, item])).values());
        },
        
        // 현재 선택된 필터에 따라 모임 필터링
        filteredGatherings() {
            if (!this.allGatherings || this.allGatherings.length === 0) return [];
            
            // 내 모임의 ID 목록 생성 (이미 가입한 모임 제외)
            const myGatheringIds = this.myGatherings.map(g => g.id);
            
            // 기본 필터: 내 모임에 포함되지 않은 모임만 필터링
            let filtered = this.allGatherings.filter(g => !myGatheringIds.includes(g.id));
            
            // 지역 필터가 활성화된 경우
            if (this.activeFilter === 'region') {
                if (this.userInfo && this.userInfo.region) {
                    filtered = filtered.filter(g => g.region === this.userInfo.region);
                }
            } 
            // 카테고리 필터가 활성화된 경우
            else {
                filtered = filtered.filter(g => g.category === this.activeFilter);
            }
            
            return filtered;
        }
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        
        // 필터 설정
        setFilter(filterName) {
            if (this.activeFilter === filterName) {
                // 이미 선택된 필터를 다시 클릭하면 지역 필터로 돌아감
                this.activeFilter = 'region';
            } else {
                this.activeFilter = filterName;
            }
            
            // 카테고리 필터가 선택된 경우 해당 카테고리의 모임 검색
            if (this.activeFilter !== 'region') {
                this.searchGatheringsByCategory(this.activeFilter);
            } else if (this.userInfo && this.userInfo.region) {
                // 지역 필터가 선택된 경우 지역 기반 모임 검색
                this.fetchRecommendedGatherings();
            }
        },
        
        // 카테고리별 모임 검색
        async searchGatheringsByCategory(category) {
            this.loadingRecommended = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/search?category=${category}`);
                this.allGatherings = response.data.result || [];
            } catch (err) {
                console.error('카테고리 모임을 불러오는데 실패했습니다:', err);
                this.recommendedError = '카테고리 모임을 불러오는데 실패했습니다.';
            } finally {
                this.loadingRecommended = false;
            }
        },
        
        async fetchUserProfile() {
            this.loading = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/myprofile`);
                this.userInfo = response.data.result;
                
                // 사용자 정보를 가져온 후 내 모임과 추천 모임 정보 가져오기
                await this.fetchMyGatherings();
                if (this.userInfo && this.userInfo.detailAddress) {
                    await this.fetchRecommendedGatherings();
                }
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
                this.allGatherings = response.data.result || [];
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
        
        goToGatheringMain() {
            this.$router.push('/silverpotion/gathering/main');
        },

        goToGatheringSearch() {
            this.$router.push('/silverpotion/gathering/search');
        },
        
        goToSearchWithCategory(category) {
            this.$router.push({
                path: '/silverpotion/gathering/search',
                query: { 
                    categoryName: category
                }
            });
        }
    },
    mounted() {
        this.fetchUserProfile();
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

.filter-chips {
    margin-top: 10px;
}
</style>