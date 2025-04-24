<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">모임 생성</h1>
            </v-card-text>
        </v-card>
        
        <div class="content-wrapper">
            <!-- 단계 표시 -->
            <v-stepper v-model="currentStep" class="mb-6">
                <v-stepper-header>
                    <v-stepper-item step="1" title="카테고리 선택"></v-stepper-item>
                    <v-divider></v-divider>
                    <v-stepper-item step="2" title="모임 정보 입력"></v-stepper-item>
                </v-stepper-header>
            </v-stepper>
            
            <!-- 카테고리 선택 단계 -->
            <div v-if="currentStep === 1">
                <h2 class="text-h6 font-weight-medium mb-4">모임 카테고리 선택</h2>
                
                <!-- 메인 카테고리 선택 -->
                <div class="category-container">
                    <v-row>
                        <!-- 첫 번째 줄 (6개) -->
                        <v-col v-for="(category, index) in categories.slice(0, 6)" :key="index" cols="12" sm="6" md="4" lg="2">
                            <div 
                                class="category-item text-center" 
                                :class="{ 'category-selected': selectedCategory === category.id }"
                                @click="selectCategory(category.id)"
                            >
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
                            <div 
                                class="category-item text-center" 
                                :class="{ 'category-selected': selectedCategory === category.id }"
                                @click="selectCategory(category.id)"
                            >
                                <v-avatar size="50" class="mb-1">
                                    <v-img :src="require(`@/assets/category/${category.image}.png`)" alt="카테고리 이미지"></v-img>
                                </v-avatar>
                                <div class="category-name">{{ category.name }}</div>
                            </div>
                        </v-col>
                    </v-row>
                </div>
                
                <!-- 상세 카테고리 선택 (메인 카테고리가 선택된 경우에만 표시) -->
                <div v-if="selectedCategory && subCategories.length > 0" class="mt-8">
                    <h3 class="text-subtitle-1 font-weight-medium mb-4">상세 카테고리 선택 (최대 2개)</h3>
                    <v-alert v-if="selectedSubCategories.length >= 2" type="info" class="mb-4">
                        최대 2개의 상세 카테고리를 선택할 수 있습니다.
                    </v-alert>
                    
                    <div class="sub-category-container">
                        <v-chip-group
                            v-model="selectedSubCategories"
                            column
                            multiple
                            max="2"
                        >
                            <v-chip
                                v-for="subCategory in subCategories"
                                :key="subCategory.id"
                                :value="subCategory.id"
                                filter
                                variant="outlined"
                                color="primary"
                                class="ma-1"
                            >
                                {{ subCategory.name }}
                            </v-chip>
                        </v-chip-group>
                    </div>
                </div>
                
                <!-- 다음 단계 버튼 -->
                <div class="d-flex justify-end mt-8">
                    <v-btn
                        color="primary"
                        :disabled="!selectedCategory || selectedSubCategories.length === 0"
                        @click="goToNextStep"
                    >
                        다음
                    </v-btn>
                </div>
            </div>
            
            <!-- 모임 정보 입력 단계 -->
            <div v-else-if="currentStep === 2">
                <h2 class="text-h6 font-weight-medium mb-4">모임 정보 입력</h2>
                
                <v-form ref="form" v-model="isFormValid" @submit.prevent="createGathering">
                    <!-- 모임명 입력 -->
                    <v-text-field
                        v-model="gatheringData.gatheringName"
                        label="모임명"
                        variant="outlined"
                        :rules="[v => !!v || '모임명을 입력해주세요', v => (v && v.length <= 30) || '모임명은 30자 이내로 입력해주세요']"
                        counter="30"
                        class="mb-4"
                        required
                    ></v-text-field>
                    
                    <!-- 활동지역 입력 -->
                    <v-text-field
                        v-model="gatheringData.region"
                        label="활동지역"
                        variant="outlined"
                        :rules="[v => !!v || '활동지역을 입력해주세요']"
                        placeholder="예: 서울시 강남구, 부산시 해운대구"
                        class="mb-4"
                        required
                    ></v-text-field>
                    
                    <!-- 모임 소개 입력 -->
                    <v-textarea
                        v-model="gatheringData.introduce"
                        label="모임 소개"
                        variant="outlined"
                        :rules="[v => !!v || '모임 소개를 입력해주세요', v => (v && v.length <= 500) || '모임 소개는 500자 이내로 입력해주세요']"
                        counter="500"
                        auto-grow
                        rows="4"
                        class="mb-4"
                        required
                    ></v-textarea>
                    
                    <!-- 정원 입력 -->
                    <v-slider
                        v-model="gatheringData.maxPeople"
                        label="정원"
                        min="2"
                        max="100"
                        step="1"
                        thumb-label
                        class="mb-6"
                    >
                        <template v-slot:append>
                            <v-text-field
                                v-model="gatheringData.maxPeople"
                                type="number"
                                style="width: 70px"
                                density="compact"
                                variant="outlined"
                                min="2"
                                max="100"
                                hide-details
                                @update:model-value="validateMaxPeople"
                            ></v-text-field>
                        </template>
                    </v-slider>
                    
                    <!-- 선택한 카테고리 정보 표시 -->
                    <v-card class="mb-6 pa-4" variant="outlined">
                        <div class="text-subtitle-1 font-weight-medium mb-2">선택한 카테고리</div>
                        <div class="d-flex align-center mb-2">
                            <v-chip color="primary" class="mr-2">
                                {{ getCategoryName(gatheringData.categoryId) }}
                            </v-chip>
                        </div>
                        <div class="text-subtitle-1 font-weight-medium mb-2">선택한 상세 카테고리</div>
                        <div class="d-flex flex-wrap">
                            <v-chip 
                                v-for="subCategoryId in gatheringData.gatheringCategoryDetailIds" 
                                :key="subCategoryId"
                                variant="outlined"
                                color="primary"
                                class="mr-2 mb-2"
                            >
                                {{ getSubCategoryName(subCategoryId) }}
                            </v-chip>
                        </div>
                    </v-card>
                    
                    <!-- 버튼 그룹 -->
                    <div class="d-flex justify-space-between mt-8">
                        <v-btn
                            variant="outlined"
                            @click="currentStep = 1"
                        >
                            이전
                        </v-btn>
                        
                        <v-btn
                            color="primary"
                            type="submit"
                            :loading="isSubmitting"
                            :disabled="!isFormValid"
                        >
                            모임 생성
                        </v-btn>
                    </div>
                </v-form>
            </div>
        </div>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            currentStep: 1,
            selectedCategory: null,
            selectedSubCategories: [],
            isFormValid: false,
            isSubmitting: false,
            gatheringData: {
                categoryId: null,
                gatheringCategoryDetailIds: [],
                gatheringName: '',
                region: '',
                introduce: '',
                maxPeople: 10
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
            }
        };
    },
    computed: {
        subCategories() {
            return this.selectedCategory ? this.allSubCategories[this.selectedCategory] || [] : [];
        }
    },
    methods: {
        selectCategory(categoryId) {
            if (this.selectedCategory === categoryId) {
                // 이미 선택된 카테고리를 다시 클릭하면 선택 해제
                this.selectedCategory = null;
                this.selectedSubCategories = [];
            } else {
                // 새로운 카테고리 선택
                this.selectedCategory = categoryId;
                this.selectedSubCategories = [];
            }
        },
        goToNextStep() {
            // 선택한 카테고리와 상세 카테고리 저장
            this.gatheringData.categoryId = this.selectedCategory;
            this.gatheringData.gatheringCategoryDetailIds = [...this.selectedSubCategories];
            
            // 다음 단계로 이동
            this.currentStep = 2;
        },
        validateMaxPeople() {
            // 숫자 범위 검증 (2~100)
            const value = parseInt(this.gatheringData.maxPeople);
            if (isNaN(value) || value < 2) {
                this.gatheringData.maxPeople = 2;
            } else if (value > 100) {
                this.gatheringData.maxPeople = 100;
            }
        },
        getCategoryName(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? category.name : '';
        },
        getSubCategoryName(subCategoryId) {
            for (const categoryId in this.allSubCategories) {
                const subCategory = this.allSubCategories[categoryId].find(sc => sc.id === subCategoryId);
                if (subCategory) {
                    return subCategory.name;
                }
            }
            return '';
        },
        async createGathering() {
            if (!this.$refs.form.validate()) return;
            
            this.isSubmitting = true;
            try {
                // 모임 생성 API 호출
                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/create`,
                    this.gatheringData
                );
                console.log(response);
                // 성공 시 모임 상세 페이지로 이동
                if (response.data.result) {

                    const gatheringId = response.data.result.gatheringId;
                    this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
                }
            } catch (error) {
                console.error('모임 생성 실패:', error);
                // 에러 처리 로직 추가
                alert('모임 생성에 실패했습니다. 다시 시도해주세요.');
            } finally {
                this.isSubmitting = false;
            }
        },
        handleBackButton() {
            if (this.currentStep === 2) {
                // 정보 입력 단계에서는 카테고리 선택 단계로 돌아감
                this.currentStep = 1;
            } else {
                // 카테고리 선택 단계에서는 이전 페이지로 이동
                this.$router.go(-1);
            }
        }
    }
};
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
</style>