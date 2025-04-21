<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">정모 생성</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
                <!-- 정모 이미지 업로드 -->
                <div class="text-center mb-6">
                    <div class="avatar-container position-relative">
                        <v-avatar size="150" rounded class="mb-2" @click="triggerFileInput" style="cursor: pointer">
                            <v-img 
                                :src="previewImage || require('@/assets/default-gathering.png')" 
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
                            :rules="imageRules"
                        ></v-file-input>
                    </div>
                </div>

                <!-- 정모명 입력 -->
                <v-text-field
                    v-model="meeting.name"
                    label="정모명"
                    variant="outlined"
                    :rules="nameRules"
                    counter="50"
                    required
                ></v-text-field>

                <!-- 날짜 선택 -->
                <v-text-field
                    v-model="meeting.meetingDate"
                    label="날짜"
                    variant="outlined"
                    type="date"
                    :rules="dateRules"
                    :min="minDate"
                    required
                ></v-text-field>

                <!-- 시간 선택 -->
                <v-text-field
                    v-model="meeting.meetingTime"
                    label="시간"
                    variant="outlined"
                    type="time"
                    :rules="timeRules"
                    required
                ></v-text-field>

                <!-- 장소 입력 -->
                <v-text-field
                    v-model="meeting.place"
                    label="장소"
                    variant="outlined"
                    :rules="placeRules"
                    counter="100"
                    required
                ></v-text-field>

                <!-- 비용 입력 -->
                <v-text-field
                    v-model.number="meeting.cost"
                    label="비용"
                    variant="outlined"
                    type="number"
                    :rules="costRules"
                    min="0"
                    required
                ></v-text-field>

                <!-- 최대 인원 입력 -->
                <v-text-field
                    v-model.number="meeting.maxPeople"
                    label="최대 인원"
                    variant="outlined"
                    type="number"
                    :rules="maxPeopleRules"
                    min="1"
                    required
                ></v-text-field>

                <!-- 생성 버튼 -->
                <div class="d-flex justify-end mt-6">
                    <v-btn
                        color="primary"
                        type="submit"
                        :loading="isSubmitting"
                        :disabled="!valid || isSubmitting"
                        block
                    >
                        정모 생성하기
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
            valid: false,
            isSubmitting: false,
            imageFile: null,
            previewImage: null,
            meeting: {
                gatheringId: null,
                name: '',
                meetingDate: '',
                meetingTime: '',
                place: '',
                cost: '',
                maxPeople: ''
            },
            nameRules: [
                v => !!v || '정모 이름은 필수입니다',
                v => (v && v.length <= 50) || '정모 이름은 50자 이하여야 합니다'
            ],
            dateRules: [
                v => !!v || '날짜는 필수입니다'
            ],
            timeRules: [
                v => !!v || '시간은 필수입니다'
            ],
            placeRules: [
                v => !!v || '장소는 필수입니다'
            ],
            costRules: [
                v => !!v || '비용은 필수입니다',
                v => v >= 0 || '비용은 0 이상이어야 합니다'
            ],
            maxPeopleRules: [
                v => !!v || '최대 인원은 필수입니다',
                v => v > 0 || '최대 인원은 1명 이상이어야 합니다'
            ],
            imageRules: [
                v => !!v || '이미지는 필수입니다'
            ]
        }
    },
    computed: {
        minDate() {
            // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    },
    created() {
        // URL에서 gatheringId 파라미터 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        this.meeting.gatheringId = urlParams.get('gatheringId');
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
        async submitForm() {
            if (!this.$refs.form.validate()) return;
            
            this.isSubmitting = true;
            try {
                const formData = new FormData();
                
                // 텍스트 데이터 추가
                formData.append('gatheringId', this.meeting.gatheringId);
                formData.append('name', this.meeting.name);
                formData.append('meetingDate', this.meeting.meetingDate);
                formData.append('meetingTime', this.meeting.meetingTime);
                formData.append('place', this.meeting.place);
                formData.append('cost', this.meeting.cost);
                formData.append('maxPeople', this.meeting.maxPeople);
                
                // 이미지 파일 추가
                formData.append('imageFile', this.imageFile);
                
                // API 요청 보내기
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/create`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                // 성공 시 처리
                if (response.status === 200 || response.status === 201) {
                    alert('정모가 성공적으로 생성되었습니다.');
                    this.$router.go(-1); // 이전 페이지로 이동
                }
            } catch (error) {
                console.error('정모 생성 중 오류 발생:', error);
                alert('정모 생성에 실패했습니다. 다시 시도해주세요.');
            } finally {
                this.isSubmitting = false;
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