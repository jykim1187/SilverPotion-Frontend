<template>
    <v-container>
        <v-card flat class="fixed-header" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">내 모임</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <div v-if="loadingGatherings" class="text-center my-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">모임 정보를 불러오는 중...</p>
            </div>
            
            <div v-else-if="gatheringError" class="text-center my-8">
                <v-alert type="error">{{ gatheringError }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchMyGatherings">다시 시도</v-btn>
            </div>
            
            <div v-else-if="myGatherings.length === 0" class="text-center pa-4 empty-container">
                <v-icon size="large" color="grey">mdi-account-group</v-icon>
                <p class="mt-2">참여 중인 모임이 없습니다.</p>
                <v-btn color="primary" class="mt-4" @click="goToGatheringMain">모임 찾기</v-btn>
            </div>
            
            <div v-else>
                <v-list>
                    <v-list-item 
                        v-for="gathering in myGatherings" 
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
            myGatherings: [],
            loadingGatherings: false,
            gatheringError: null
        }
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
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
        goToGatheringDetail(gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
        },
        goToGatheringMain() {
            this.$router.push('/silverpotion/gathering/main');
        }
    },
    mounted() {
        this.fetchMyGatherings();
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
    padding-bottom: 80px;
}

.text-primary {
    color: #1976d2 !important;
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
.text-center.my-8 {
    padding: 24px;
    border-radius: 12px;
    background-color: #f9f9f9;
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
}
</style>