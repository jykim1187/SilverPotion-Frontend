<template>
    <div class="user-info-container">
        <div class="info-card">
            <h1 class="title">{{ currentStep === 1 ? '건강 정보 입력' : '정신 건강 조사' }}</h1>
            <form @submit.prevent="validateAndSubmit" class="form-container">
                <!-- 신체 건강 섹션 -->
                <div v-if="currentStep === 1">
                    <div class="input-group">
                        <label>키 (cm) <span class="required">*</span></label>
                        <input type="number" v-model="userInfo.height" placeholder="키를 입력하세요" required>
                        <div v-if="errors.height" class="error-message">{{ errors.height }}</div>
                    </div>
                    
                    <div class="input-group">
                        <label>몸무게 (kg) <span class="required">*</span></label>
                        <input type="number" v-model="userInfo.weight" placeholder="몸무게를 입력하세요" required>
                        <div v-if="errors.weight" class="error-message">{{ errors.weight }}</div>
                    </div>

                    <div class="disease-group">
                        <label class="section-label">질병 <span class="required">*</span></label>
                        <div class="checkbox-container">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="userInfo.disease" value="없음">
                                <span class="option-text">없음</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="userInfo.disease" value="고혈압">
                                <span class="option-text">고혈압</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="userInfo.disease" value="당뇨">
                                <span class="option-text">당뇨</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="userInfo.disease" value="관절염">
                                <span class="option-text">관절염</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="userInfo.disease" value="고지혈증">
                                <span class="option-text">고지혈증</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="userInfo.disease" value="심혈관질환">
                                <span class="option-text">심혈관질환</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="userInfo.disease" value="기타" @change="toggleOtherDisease">
                                <span class="option-text">기타</span>
                            </label>
                        </div>
                        <div v-if="showOtherDiseaseInput" class="other-disease-input">
                            <input type="text" v-model="otherDisease" placeholder="기타 질병을 입력하세요" @blur="addOtherDisease">
                        </div>
                        <div v-if="errors.disease" class="error-message">{{ errors.disease }}</div>
                    </div>

                    <div class="input-group smoking-group">
                        <label>흡연 습관 <span class="required">*</span></label>
                        <select v-model="userInfo.smokingHabit" required>
                            <option value="">선택하세요</option>
                            <option value="전혀 안함">전혀 안함</option>
                            <option value="하루 5개피 이하">하루 5개피 이하</option>
                            <option value="하루 반갑 이상">하루 반갑 이상</option>
                            <option value="하루 한갑 이상">하루 한갑 이상</option>
                        </select>
                        <div v-if="errors.smokingHabit" class="error-message">{{ errors.smokingHabit }}</div>
                    </div>

                    <div class="input-group">
                        <label>음주 습관 <span class="required">*</span></label>
                        <select v-model="userInfo.alcoholHabit" required>
                            <option value="">선택하세요</option>
                            <option value="전혀 안함">전혀 안함</option>
                            <option value="월 1-2회">월 1-2회</option>
                            <option value="주 1-2회">주 1-2회</option>
                            <option value="주 3회 이상">주 3회 이상</option>
                        </select>
                        <div v-if="errors.alcoholHabit" class="error-message">{{ errors.alcoholHabit }}</div>
                    </div>

                    <div class="input-group">
                        <label>운동 습관 <span class="required">*</span></label>
                        <select v-model="userInfo.exerciseHabit" required>
                            <option value="">선택하세요</option>
                            <option value="전혀 안함">전혀 안함</option>
                            <option value="월 1-2회">월 1-2회</option>
                            <option value="주 1-2회">주 1-2회</option>
                            <option value="주 3회 이상">주 3회 이상</option>
                            <option value="거의 매일">거의 매일</option>
                        </select>
                        <div v-if="errors.exerciseHabit" class="error-message">{{ errors.exerciseHabit }}</div>
                    </div>

                    <div class="input-group">
                        <label>목표 걸음수 <span class="required">*</span></label>
                        <input type="number" v-model="userInfo.targetStep" placeholder="하루 목표 걸음수를 입력하세요" required>
                        <div v-if="errors.targetStep" class="error-message">{{ errors.targetStep }}</div>
                    </div>

                    <div class="input-group">
                        <label>목표 소모 칼로리 <span class="required">*</span></label>
                        <input type="number" v-model="userInfo.targetCalory" placeholder="하루 목표 소모 칼로리를 입력하세요" required>
                        <div v-if="errors.targetCalory" class="error-message">{{ errors.targetCalory }}</div>
                    </div>

                    <button type="button" @click="validateAndNext" class="submit-btn">다음 페이지로</button>
                </div>
                
                <!-- 정신 건강 조사 섹션 -->
                <div v-if="currentStep === 2" class="mental-health-form">
                    <div class="questions-container">
                        <div class="question-group">
                            <label class="question-label">Q1. 최근 일주일 동안 다른 사람과 대화한 횟수는?</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q1" value="0">
                                    <span>매일 여러 번 대화했다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q1" value="1">
                                    <span>하루에 1번 이상 대화했다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q1" value="2">
                                    <span>일주일에 1~2번 정도 대화했다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q1" value="3">
                                    <span>거의 대화하지 않았다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q1" class="error-message">{{ errors.q1 }}</div>
                        </div>

                        <div class="question-group">
                            <label class="question-label">Q2. 나를 걱정하거나 돌봐주는 사람이 주변에 있다고 느끼나요?</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q2" value="0">
                                    <span>항상 그렇다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q2" value="1">
                                    <span>가끔 그렇다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q2" value="2">
                                    <span>드물게 느낀다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q2" value="3">
                                    <span>전혀 없다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q2" class="error-message">{{ errors.q2 }}</div>
                        </div>

                        <div class="question-group">
                            <label class="question-label">Q3. 혼자 있는 시간이 외롭다고 느끼나요?</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q3" value="0">
                                    <span>거의 느끼지 않는다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q3" value="1">
                                    <span>가끔 외롭다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q3" value="2">
                                    <span>종종 외롭다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q3" value="3">
                                    <span>항상 외롭다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q3" class="error-message">{{ errors.q3 }}</div>
                        </div>

                        <div class="question-group">
                            <label class="question-label">Q4. 새로운 것을 배우거나 시도하는 것에 대한 의지가 있나요?</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q4" value="0">
                                    <span>매우 높다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q4" value="1">
                                    <span>보통이다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q4" value="2">
                                    <span>관심이 적다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q4" value="3">
                                    <span>전혀 없다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q4" class="error-message">{{ errors.q4 }}</div>
                        </div>

                        <div class="question-group">
                            <label class="question-label">Q5. 일상에 변화를 주고 싶은 마음이 있나요?</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q5" value="0">
                                    <span>강하게 느낀다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q5" value="1">
                                    <span>어느 정도 느낀다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q5" value="2">
                                    <span>거의 느끼지 않는다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q5" value="3">
                                    <span>전혀 느끼지 않는다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q5" class="error-message">{{ errors.q5 }}</div>
                        </div>

                        <div class="question-group">
                            <label class="question-label">Q6. 나는 내 자신에 대해 긍정적으로 생각한다.</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q6" value="0">
                                    <span>매우 그렇다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q6" value="1">
                                    <span>대체로 그렇다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q6" value="2">
                                    <span>별로 그렇지 않다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q6" value="3">
                                    <span>전혀 그렇지 않다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q6" class="error-message">{{ errors.q6 }}</div>
                        </div>

                        <div class="question-group">
                            <label class="question-label">Q7. 내 삶은 의미가 있다고 느낀다.</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q7" value="0">
                                    <span>매우 그렇다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q7" value="1">
                                    <span>대체로 그렇다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q7" value="2">
                                    <span>별로 느끼지 않는다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q7" value="3">
                                    <span>전혀 느끼지 않는다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q7" class="error-message">{{ errors.q7 }}</div>
                        </div>

                        <div class="question-group">
                            <label class="question-label">Q8. 하루 동안 에너지가 충분하다고 느끼나요?</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q8" value="0">
                                    <span>항상 충분하다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q8" value="1">
                                    <span>가끔 충분하다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q8" value="2">
                                    <span>자주 피곤하다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q8" value="3">
                                    <span>거의 항상 피곤하다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q8" class="error-message">{{ errors.q8 }}</div>
                        </div>

                        <div class="question-group">
                            <label class="question-label">Q9. 최근 일상생활(산책, 집안일 등)에서 쉽게 지친다고 느끼나요?</label>
                            <div class="radio-container">
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q9" value="0">
                                    <span>거의 지치지 않는다 (0점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q9" value="1">
                                    <span>가끔 지친다 (1점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q9" value="2">
                                    <span>자주 지친다 (2점)</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" v-model="mentalHealth.q9" value="3">
                                    <span>거의 항상 지친다 (3점)</span>
                                </label>
                            </div>
                            <div v-if="errors.q9" class="error-message">{{ errors.q9 }}</div>
                        </div>
                    </div>

                    <div class="button-group">
                        <button type="button" @click="prevStep" class="back-btn">이전</button>
                        <button type="submit" class="submit-btn">저장하기</button>
                    </div>
                </div>
            </form>
        </div>
        
        <!-- 스낵바 메시지 -->
        <div class="snackbar" v-if="snackbar.show" :class="snackbar.color">
            {{ snackbar.message }}
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: 'UserInfoDetailAdd',
    data() {
        return {
            currentStep: 1, // 1: 신체 건강, 2: 정신 건강
            showOtherDiseaseInput: false,
            otherDisease: '',
            userInfo: {
                height: '',
                weight: '',
                disease: [],
                smokingHabit: '',
                alcoholHabit: '',
                exerciseHabit: '',
                targetStep: '',
                targetCalory: '',
                isolationScore: '',
                driveScore: '',
                selfEsteemScore: '',
                energyScore: ''
            },
            mentalHealth: {
                q1: '',
                q2: '',
                q3: '',
                q4: '',
                q5: '',
                q6: '',
                q7: '',
                q8: '',
                q9: ''
            },
            errors: {
                height: '',
                weight: '',
                disease: '',
                smokingHabit: '',
                alcoholHabit: '',
                exerciseHabit: '',
                targetStep: '',
                targetCalory: '',
                q1: '',
                q2: '',
                q3: '',
                q4: '',
                q5: '',
                q6: '',
                q7: '',
                q8: '',
                q9: ''
            },
         snackbar: {
            show: false,
            message: '',
            color: ''
         }
        }
    },
    methods: {
        toggleOtherDisease(event) {
            this.showOtherDiseaseInput = event.target.checked;
            // 체크 해제 시 기타 질병 정보 삭제
            if (!event.target.checked) {
                const index = this.userInfo.disease.findIndex(d => d !== '기타' && !['없음', '고혈압', '당뇨', '관절염', '고지혈증', '심혈관질환'].includes(d));
                if (index !== -1) {
                    this.userInfo.disease.splice(index, 1);
                }
                this.otherDisease = '';
            }
        },
        addOtherDisease() {
            if (this.otherDisease.trim() !== '') {
                // 기존에 있던 기타 질병 제거
                const index = this.userInfo.disease.findIndex(d => d !== '기타' && !['없음', '고혈압', '당뇨', '관절염', '고지혈증', '심혈관질환'].includes(d));
                if (index !== -1) {
                    this.userInfo.disease.splice(index, 1);
                }
                // 새로운 기타 질병 추가
                this.userInfo.disease.push(this.otherDisease.trim());
            }
        },
        validateStep1() {
            let isValid = true;
            this.clearErrors();

            if (!this.userInfo.height) {
                this.errors.height = '키를 입력해주세요';
                isValid = false;
            }
            
            if (!this.userInfo.weight) {
                this.errors.weight = '몸무게를 입력해주세요';
                isValid = false;
            }
            
            if (this.userInfo.disease.length === 0) {
                this.errors.disease = '질병 항목을 선택해주세요';
                isValid = false;
            }
            
            if (!this.userInfo.smokingHabit) {
                this.errors.smokingHabit = '흡연 습관을 선택해주세요';
                isValid = false;
            }
            
            if (!this.userInfo.alcoholHabit) {
                this.errors.alcoholHabit = '음주 습관을 선택해주세요';
                isValid = false;
            }
            
            if (!this.userInfo.exerciseHabit) {
                this.errors.exerciseHabit = '운동 습관을 선택해주세요';
                isValid = false;
            }
            
            if (!this.userInfo.targetStep) {
                this.errors.targetStep = '목표 걸음수를 입력해주세요';
                isValid = false;
            }
            
            if (!this.userInfo.targetCalory) {
                this.errors.targetCalory = '목표 소모 칼로리를 입력해주세요';
                isValid = false;
            }
            
            return isValid;
        },
        validateStep2() {
            let isValid = true;
            
            for (let i = 1; i <= 9; i++) {
                const fieldName = `q${i}`;
                if (!this.mentalHealth[fieldName]) {
                    this.errors[fieldName] = `질문 ${i}에 답변해주세요`;
                    isValid = false;
                }
            }
            
            return isValid;
        },
        clearErrors() {
            for (const key in this.errors) {
                this.errors[key] = '';
            }
        },
        validateAndNext() {
            if (this.validateStep1()) {
                this.nextStep();
            } else {
                // 오류가 있는 첫 번째 필드로 스크롤
                this.$nextTick(() => {
                    const firstError = document.querySelector('.error-message');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }
        },
        validateAndSubmit() {
            if (this.currentStep === 1) {
                if (this.validateStep1()) {
                    this.nextStep();
                }
            } else if (this.currentStep === 2) {
                if (this.validateStep2()) {
                    this.submitForm();
                } else {
                    // 오류가 있는 첫 번째 필드로 스크롤
                    this.$nextTick(() => {
                        const firstError = document.querySelector('.error-message');
                        if (firstError) {
                            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    });
                }
            }
        },
        nextStep() {
            this.currentStep = 2;
        },
        prevStep() {
            this.currentStep = 1;
        },
        calculateScores() {
            // 고립감 점수 (문항 1-3)
            const isolation = parseInt(this.mentalHealth.q1) + 
                              parseInt(this.mentalHealth.q2) + 
                              parseInt(this.mentalHealth.q3);
            
            // 의욕 점수 (문항 4-5)
            const motivation = parseInt(this.mentalHealth.q4) + 
                               parseInt(this.mentalHealth.q5);
            
            // 자존감 점수 (문항 6-7)
            const selfEsteem = parseInt(this.mentalHealth.q6) + 
                               parseInt(this.mentalHealth.q7);
            
            // 에너지 점수 (문항 8-9)
            const energy = parseInt(this.mentalHealth.q8) + 
                           parseInt(this.mentalHealth.q9);
            
            return {
                isolation,
                motivation,
                selfEsteem,
                energy
            }
        },
       async submitForm() {
            // 질병 문자열로 변환 (쉼표로 구분)
            const diseaseString = this.userInfo.disease.join(',');
            
            // 정신 건강 점수 계산
            const scores = this.calculateScores();
            
            // 계산된 점수 저장
            this.userInfo.isolationScore = scores.isolation;
            this.userInfo.driveScore = scores.motivation;
            this.userInfo.selfEsteemScore = scores.selfEsteem;
            this.userInfo.energyScore = scores.energy;
            
            // 모든 정보를 하나로 합침
            const formData = {
                ...this.userInfo,
                disease: diseaseString
            }
            
            console.log('제출된 정보:', formData)
            
            try {
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/detailhealthinfo/create`, formData)
                console.log(response)
                this.showSnackbar('정보가 성공적으로 저장되었습니다.', 'success');
                
                // 스낵바가 표시되도록 타이머 설정
                setTimeout(() => {
                    this.$router.push('/silverpotion/healthdatapage');
                }, 1000);
            } catch (error) {
                console.error('서버 요청 오류:', error);
                this.showSnackbar('정보 저장 중 오류가 발생했습니다.', 'error');
            }
        },

    showSnackbar(message, color) {
      this.snackbar.show = true;
      this.snackbar.message = message;
      this.snackbar.color = color;
    },
    }
}
</script>

<style scoped>
.user-info-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.info-card {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.8rem;
}

.form-container {
    display: grid;
    gap: 1.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.input-group label, .disease-group label, .section-label {
    font-weight: 700;
    color: #2c3e50;
    font-size: 1.05rem;
}

.input-group input,
.input-group select {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.checkbox-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 0.5rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.option-text {
    font-weight: normal;
    color: #495057;
}

.disease-group {
    margin-bottom: 2rem;
}

.smoking-group {
    margin-top: 2rem;
}

.other-disease-input {
    margin-top: 1rem;
}

.other-disease-input input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
}

.required {
    color: #dc3545;
    margin-left: 2px;
}

.error-message {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.submit-btn {
    background: #4CAF50;
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.3s ease;
    width: 100%;
    margin-top: 1rem;
}

.submit-btn:hover {
    background: #45a049;
}

/* 정신 건강 조사 스타일 */
.mental-health-form {
    display: grid;
    gap: 2rem;
}

.questions-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.question-section {
    display: none;
}

.question-group {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.question-label {
    display: block;
    margin-bottom: 0.8rem;
    font-weight: 600;
    color: #2c3e50;
    border-left: 3px solid #4CAF50;
    padding-left: 10px;
}

.radio-container {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding-left: 13px;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.radio-label span {
    font-size: 0.95rem;
}

.button-group {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
}

.back-btn {
    background: #e9ecef;
    color: #495057;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.3s ease;
    flex: 1;
}

.back-btn:hover {
    background: #dee2e6;
}

@media (max-width: 768px) {
    .info-card {
        padding: 1rem;
    }
    
    .checkbox-container {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .button-group {
        flex-direction: column;
    }
    
    .back-btn, .submit-btn {
        margin-bottom: 0.5rem;
    }

    .question-section {
        padding: 1rem;
    }
}

/* 스낵바 스타일 */
.snackbar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 16px 24px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
    min-width: 250px;
    text-align: center;
}

.success {
    background-color: #4caf50;
}

.error {
    background-color: #f44336;
}

.info {
    background-color: #2196f3;
}
</style>