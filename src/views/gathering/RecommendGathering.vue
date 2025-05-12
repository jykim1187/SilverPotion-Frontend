<template>
    <v-container>
        <v-card flat class="fixed-header" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">추천 모임</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <!-- 회원 주소 정보 버튼 -->
            <div class="d-flex justify-start mb-4">
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

            <!-- 필터 칩 영역 -->
            <div class="filter-chips mb-4">
                <h3 class="text-subtitle-1 font-weight-medium mb-2">필터</h3>
                <div class="d-flex flex-wrap">
                    <!-- 지역 필터 칩 -->
                    <v-chip
                        class="ma-1 filter-chip"
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
                        class="ma-1 filter-chip"
                        :color="activeFilter === category.name ? 'primary' : ''"
                        :variant="activeFilter === category.name ? 'flat' : 'outlined'"
                        @click="setFilter(category.name)"
                    >
                        {{ category.name }}
                    </v-chip>
                </div>
            </div>

            <div v-if="loading" class="text-center my-8 loading-container">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">사용자 정보를 불러오는 중...</p>
            </div>
            
            <div v-else-if="error" class="text-center my-8 error-container">
                <v-alert type="error">{{ error }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchUserProfile">다시 시도</v-btn>
            </div>
            
            <div v-else-if="loadingRecommended" class="text-center my-8 loading-container">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">추천 모임을 불러오는 중...</p>
            </div>
            
            <div v-else-if="recommendedError" class="text-center my-8 error-container">
                <v-alert type="error">{{ recommendedError }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchRecommendedGatherings">다시 시도</v-btn>
            </div>
            
            <div v-else-if="filteredGatherings.length === 0" class="text-center pa-4 empty-container">
                <v-icon size="large" color="grey">mdi-map-search</v-icon>
                <p class="mt-2 mb-4">선택한 필터에 맞는 모임이 없습니다.</p>
                <v-btn color="primary" variant="tonal" class="search-btn" rounded="lg" @click="goToGatheringSearch">모임 찾기</v-btn>
            </div>
            
            <div v-else>
                <v-list>
                    <v-list-item 
                        v-for="gathering in filteredGatherings" 
                        :key="gathering.id"
                        class="mb-3 gathering-card"
                        @click="goToGatheringDetail(gathering.id)"
                        :ripple="true"
                        hover
                    >
                        <template v-slot:prepend>
                            <v-avatar size="60" rounded>
                                <v-img :src="gathering.imageUrl || require('@/assets/default-gathering.png')" 
                                       contain
                                       bg-color="#f5f5f5"
                                       alt="모임 이미지"></v-img>
                            </v-avatar>
                        </template>
                        
                        <div>
                            <div class="d-flex align-center mb-1">
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
            myGatherings: [],
            loadingGatherings: false,
            gatheringError: null,
            recommendedGatherings: [],
            loadingRecommended: false,
            recommendedError: null,
            activeFilter: 'region', // 기본 필터는 지역
            allGatherings: [], // 모든 모임을 저장할 배열
            regionModalOpen: false,
            updatingRegion: false,
            selectedRegionData: null, // 카카오맵에서 선택한 지역 데이터
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
        },

        handleRegionSelected(regionData) {
            console.log('선택된 지역:', regionData);
            this.selectedRegionData = regionData;
        },

        async confirmRegionSelection() {
            if (!this.selectedRegionData) {
                alert('지역을 선택해주세요.');
                return;
            }
            
            this.updatingRegion = true;
            
            try {
                // 선택한 지역으로 사용자 정보 업데이트
                await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/update`,
                    {
                        region: this.selectedRegionData.name
                    }
                );
                
                // 사용자 정보 다시 불러오기
                await this.fetchUserProfile();
                
                // 추천 모임 다시 불러오기
                if (this.userInfo && this.userInfo.region) {
                    await this.fetchRecommendedGatherings();
                }
                
                // 모달 닫기
                this.regionModalOpen = false;
                
                // 성공 메시지 표시
                alert('활동지역이 업데이트되었습니다.');
            } catch (err) {
                console.error('활동지역 업데이트 실패:', err);
                alert('활동지역 업데이트에 실패했습니다.');
            } finally {
                this.updatingRegion = false;
            }
        },
        
        // 지역 선택 모달 열기
        openRegionModal() {
            this.regionModalOpen = true;
            this.selectedRegionData = null;
        }
    },
    mounted() {
        this.fetchUserProfile();
    }
}
</script>

<style scoped>
.search-btn {
    min-width: 100px;
    transition: all 0.3s ease;
}

.search-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
    margin-top: 110px; /* 헤더 높이 + 기존 헤더 컴포넌트 높이에 맞게 조정 */
    padding: 0 16px;
    padding-bottom: 80px;
}

.text-primary {
    color: #1976d2 !important;
}

/* 주소 카드 스타일링 */
.address-card {
    border-radius: 12px;
    margin-bottom: 16px;
    transition: all 0.2s ease;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.address-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 필터 칩 스타일링 */
.filter-chips {
    margin-top: 16px;
}

.filter-chip {
    border-radius: 20px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.filter-chip:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 섹션 제목 스타일 */
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

/* 모임 카드 스타일링 */
.gathering-card {
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    border: none !important;
}

.gathering-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* v-list-item 기본 스타일 재정의 */
:deep(.v-list-item__prepend) {
    padding-right: 16px;
}

:deep(.v-list-item) {
    padding: 12px 16px;
}

:deep(.v-list) {
    background-color: transparent;
    padding: 0;
}

/* 빈 상태 컨테이너 */
.empty-container {
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
.loading-container, .error-container {
    padding: 24px;
    border-radius: 12px;
    background-color: #f9f9f9;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

/* 반응형 스타일링 */
@media (max-width: 600px) {
    .gathering-card {
        margin-bottom: 8px;
    }
    
    :deep(.v-list-item__prepend) {
        padding-right: 12px;
    }
    
    :deep(.v-list-item) {
        padding: 10px 12px;
    }
    
    .v-avatar {
        width: 50px !important;
        height: 50px !important;
    }
    
    .text-subtitle-1 {
        font-size: 0.9rem !important;
    }
    
    .filter-chip {
        margin: 4px !important;
    }
}
</style>