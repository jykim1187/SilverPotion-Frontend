<template>
    <div class="user-info-container">
        <div class="info-card">
            <h1 class="title">건강 정보 입력</h1>
            <form @submit.prevent="submitForm" class="form-container">
                <div class="input-group">
                    <label>키 (cm)</label>
                    <input type="number" v-model="userInfo.height" placeholder="키를 입력하세요">
                </div>
                
                <div class="input-group">
                    <label>몸무게 (kg)</label>
                    <input type="number" v-model="userInfo.weight" placeholder="몸무게를 입력하세요">
                </div>

                <div class="disease-group">
                    <label>질병</label>
                    <div class="checkbox-container">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="userInfo.diseases" value="고혈압">
                            고혈압
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="userInfo.diseases" value="당뇨">
                            당뇨
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="userInfo.diseases" value="관절염">
                            관절염
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="userInfo.diseases" value="고지혈증">
                            고지혈증
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="userInfo.diseases" value="심혈관질환">
                            심혈관질환
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="userInfo.diseases" value="기타">
                            기타
                        </label>
                    </div>
                </div>

                <div class="input-group">
                    <label>목표 걸음수</label>
                    <input type="number" v-model="userInfo.targetSteps" placeholder="하루 목표 걸음수를 입력하세요">
                </div>

                <div class="input-group">
                    <label>목표 소모 칼로리</label>
                    <input type="number" v-model="userInfo.targetCalories" placeholder="하루 목표 소모 칼로리를 입력하세요">
                </div>

                <div class="input-group">
                    <label>흡연 습관 (개비/일)</label>
                    <input type="number" v-model="userInfo.smoking" placeholder="하루 흡연량을 입력하세요">
                </div>

                <div class="input-group">
                    <label>음주 습관</label>
                    <select v-model="userInfo.drinking">
                        <option value="">선택하세요</option>
                        <option value="전혀 안함">전혀 안함</option>
                        <option value="월 1-2회">월 1-2회</option>
                        <option value="주 1-2회">주 1-2회</option>
                        <option value="주 3회 이상">주 3회 이상</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>운동 습관 (회/주)</label>
                    <input type="number" v-model="userInfo.exercise" placeholder="주당 운동 횟수를 입력하세요">
                </div>

                <button type="submit" class="submit-btn">저장하기</button>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserInfoDetailAdd',
    data() {
        return {
            userInfo: {
                height: '',
                weight: '',
                diseases: [],
                targetSteps: '',
                targetCalories: '',
                smoking: '',
                drinking: '',
                exercise: ''
            }
        }
    },
    methods: {
        submitForm() {
            console.log('제출된 정보:', this.userInfo)
            // API 호출 로직 추가 예정
        }
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
}

.input-group label {
    font-weight: 600;
    color: #2c3e50;
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

.submit-btn {
    background: #4CAF50;
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.3s ease;
}

.submit-btn:hover {
    background: #45a049;
}

@media (max-width: 768px) {
    .info-card {
        padding: 1rem;
    }
    
    .checkbox-container {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>