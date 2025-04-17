<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">내 모임</h1>
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
            
            <div v-else-if="myGatherings.length === 0" class="text-center pa-4">
                <v-icon size="large" color="grey">mdi-account-group</v-icon>
                <p class="mt-2">참여 중인 모임이 없습니다.</p>
                <v-btn color="primary" class="mt-4" @click="goToGatheringMain">모임 찾기</v-btn>
            </div>
            
            <div v-else>
                <v-list>
                    <v-list-item 
                        v-for="gathering in myGatherings" 
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
}
</style>