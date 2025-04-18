<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">정모 수정</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <div v-if="isLoading" class="text-center my-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">정모 정보를 불러오는 중...</p>
            </div>
            
            <div v-else-if="error" class="text-center my-8">
                <v-alert type="error">{{ error }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchMeetingData">다시 시도</v-btn>
            </div>
            
            <v-form v-else ref="form" v-model="isFormValid" @submit.prevent="updateMeeting">
                <!-- 정모 이미지 업로드 -->
                <div class="text-center mb-6">
                    <div class="avatar-container position-relative">
                        <v-avatar size="150" rounded class="mb-2" @click="triggerFileInput" style="cursor: pointer">
                            <v-img 
                                :src="previewImage || (meetingData.imageUrl || require('@/assets/default-gathering.png'))" 
                                cover
                                alt="정모 이미지"
                            ></v-img>
                            <div class="edit-overlay">
                                <v-icon color="white">mdi-pencil</v-icon>
                            </div>
                        </v-avatar>
                    </div>
                    <div>
                        <v-file-input
                            ref="fileInput"
                            v-model="imageFile"
                            accept="image/*"
                            prepend-icon=""
                            variant="outlined"
                            density="compact"
                            hide-details
                            class="d-none"
                            @change="previewSelectedImage"
                        ></v-file-input>
                    </div>
                </div>

                <!-- 정모명 입력 -->
                <v-text-field
                    v-model="meetingData.name"
                    label="정모명"
                    variant="outlined"
                    :rules="[v => !!v || '정모명을 입력해주세요', v => v.length <= 30 || '정모명은 30자 이내로 입력해주세요']"
                    counter="30"
                    required
                ></v-text-field>

                <!-- 날짜 선택 -->
                <v-text-field
                    v-model="meetingData.meetingDate"
                    label="날짜"
                    variant="outlined"
                    type="date"
                    :rules="[v => !!v || '날짜를 선택해주세요']"
                    required
                ></v-text-field>

                <!-- 시간 선택 -->
                <v-text-field
                    v-model="meetingData.meetingTime"
                    label="시간"
                    variant="outlined"
                    type="time"
                    :rules="[v => !!v || '시간을 선택해주세요']"
                    required
                ></v-text-field>

                <!-- 장소 입력 -->
                <v-text-field
                    v-model="meetingData.place"
                    label="장소"
                    variant="outlined"
                    :rules="[v => !!v || '장소를 입력해주세요', v => v.length <= 100 || '장소는 100자 이내로 입력해주세요']"
                    counter="100"
                    required
                ></v-text-field>

                <!-- 비용 입력 -->
                <v-text-field
                    v-model.number="meetingData.cost"
                    label="비용"
                    variant="outlined"
                    type="number"
                    :rules="[
                        v => v !== null && v !== undefined && v !== '' || '비용을 입력해주세요',
                        v => v >= 0 || '비용은 0원 이상이어야 합니다'
                    ]"
                    min="0"
                    required
                ></v-text-field>

                <!-- 수정 버튼 -->
                <div class="d-flex justify-end mt-6">
                    <v-btn
                        color="primary"
                        type="submit"
                        :loading="isSubmitting"
                        :disabled="!isFormValid || isSubmitting"
                    >
                        수정하기
                    </v-btn>
                </div>
            </v-form>
        </div>
    </v-container>
</template>

<script>
import axios from 'axios';

export default{
    data(){
        return {
            meetingId: null,
            gatheringId: null,
            meetingData: {
                name: '',
                meetingDate: '',
                meetingTime: '',
                place: '',
                cost: 0,
                imageUrl: null
            },
            imageFile: null,
            previewImage: null,
            isFormValid: false,
            isSubmitting: false,
            isLoading: true,
            error: null
        }
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        triggerFileInput() {
            this.$refs.fileInput.$el.querySelector('input').click();
        },
        previewSelectedImage() {
            if (this.imageFile) {
                this.previewImage = URL.createObjectURL(this.imageFile);
            } else {
                this.previewImage = null;
            }
        },
        async fetchMeetingData() {
            this.isLoading = true;
            this.error = null;
            
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/${this.meetingId}`);
                
                if (response.data.result) {
                    const meetingData = response.data.result;
                    
                    // 가져온 데이터로 폼 초기화
                    this.meetingData = {
                        name: meetingData.name,
                        meetingDate: meetingData.meetingDate,
                        meetingTime: meetingData.meetingTime,
                        place: meetingData.place,
                        cost: meetingData.cost,
                        imageUrl: meetingData.imageUrl
                    };
                    
                    // 모임 ID 저장
                    this.gatheringId = meetingData.gatheringId;
                } else {
                    throw new Error('정모 정보를 불러오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('정모 정보를 불러오는데 실패했습니다:', error);
                this.error = '정모 정보를 불러오는데 실패했습니다. 다시 시도해주세요.';
            } finally {
                this.isLoading = false;
            }
        },
        async updateMeeting() {
            if (!this.$refs.form.validate()) return;
            
            this.isSubmitting = true;
            try {
                // FormData 객체 생성
                const formData = new FormData();
                formData.append('name', this.meetingData.name);
                formData.append('meetingDate', this.meetingData.meetingDate);
                formData.append('meetingTime', this.meetingData.meetingTime);
                formData.append('place', this.meetingData.place);
                formData.append('cost', this.meetingData.cost);
                
                // 이미지 파일이 있는 경우에만 추가
                if (this.imageFile) {
                    formData.append('imageFile', this.imageFile);
                }
                
                // 정모 수정 API 호출
                const response = await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/update/${this.meetingId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                // 성공 시 모임 상세 페이지로 이동
                if (response.data.status_code === 200) {
                    alert('정모 정보가 수정되었습니다.');
                    this.$router.push(`/silverpotion/gathering/home/${this.gatheringId}`);
                }
            } catch (error) {
                console.error('정모 수정 실패:', error);
                alert('정모 수정에 실패했습니다. 다시 시도해주세요.');
            } finally {
                this.isSubmitting = false;
            }
        }
    },
    mounted() {
        // URL 파라미터에서 정모 ID 가져오기
        this.meetingId = this.$route.params.meetingId;
        
        if (this.meetingId) {
            // 정모 정보 불러오기
            this.fetchMeetingData();
        } else {
            // 정모 ID가 없는 경우 이전 페이지로 이동
            this.$router.go(-1);
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

.avatar-container {
    display: inline-block;
}

.position-relative {
    position: relative;
}

.edit-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.3s;
}

.avatar-container:hover .edit-overlay {
    opacity: 1;
}

.d-none {
    display: none;
}
</style>