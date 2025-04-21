<template>
  <!-- 아이콘 +제목 텍스트 -->
  <v-dialog v-model="showDialog" max-width="500px">
    <v-card class="link-request-card">
      <v-card-title class="link-request-title">
        <div class="title-icon-wrapper">
          <v-icon color="primary" size="36">{{ currentStep === 1 ? 'mdi-cash-multiple' : 'mdi-link-variant' }}</v-icon>
        </div>
        <h2>{{ currentStep === 1 ? '보호자 연결 가능 개수' : '보호자 연결 요청' }}</h2>
      </v-card-title>
      
      <!-- 1단계: 캐시템 정보 표시 -->
      <template v-if="currentStep === 1">
        <v-card-text class="link-request-content">
          <div class="cash-item-info">
            <div class="cash-item-count">
              <div class="count-circle">
                <span class="count-number">{{ cashItemCount }}</span>
              </div>
              <p class="count-label">보유 힐링포션 개수</p>
            </div>
            <div class="cash-item-description">
              <p>보호자 연결을 위해서는 힐링포션 1개가 필요합니다.</p>
              <p>현재 {{ cashItemCount }}개의 힐링포션을 보유하고 있습니다.</p>
              <!-- <p v-if="cashItemCount === 0" class="warning-text">힐링포션이 없습니다. 충전이 필요합니다.</p> -->
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="link-request-actions">
          <v-spacer></v-spacer>
          <v-btn 
            text
            color="grey darken-1"
            @click="closeDialog"
            class="cancel-btn"
          >
            취소
          </v-btn>
          <v-btn
            color="orange darken-1"
            class="charge-btn"
            @click="goToCharge"
          >
            힐링포션 충전하기
          </v-btn>
          <v-btn
            :disabled="cashItemCount === 0"
            color="primary"
            class="next-btn"
            @click="goToNextStep"
          >
            연결하러 가기
          </v-btn>
        </v-card-actions>
      </template>
      
      <!-- 2단계: 휴대폰 번호 입력 -->
      <template v-else>
        <v-card-text class="link-request-content">
          <div class="description">
            <p>보호자로 연결하고 싶은 분의 휴대폰 번호를 입력해주세요.</p>
            <p>연결이 되면 해당 사용자의 건강 데이터를 확인할 수 있습니다.</p>
          </div>
          
          <v-form ref="form" v-model="isFormValid" lazy-validation class="phone-form">
            <div class="phone-input-wrapper">
              <v-text-field
                v-model="phoneNumber"
                label="휴대폰 번호"
                placeholder="01012345678"
                :rules="phoneRules"
                prefix="☎"
                outlined
                dense
                clearable
                class="phone-input"
                hint="'-' 없이 숫자만 입력해주세요"
                persistent-hint
                @input="formatPhoneNumber"
              ></v-text-field>
            </div>
            
            <div class="error-message" v-if="errorMessage">
              {{ errorMessage }}
            </div>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="link-request-actions">
          <v-spacer></v-spacer>
          <v-btn
            text
            color="grey darken-1"
            @click="goBackStep"
            class="back-btn"
          >
            뒤로가기
          </v-btn>
          <v-btn
            :disabled="!isFormValid"
            color="primary"
            class="send-btn"
            :loading="isLoading"
            @click="sendRequest"
          >
            연결 요청 보내기
          </v-btn>
        </v-card-actions>
      </template>
      
      <!-- 성공 메시지 스낵바 -->
      <v-snackbar
        v-model="showSuccessMessage"
        timeout="3000"
        color="success"
        bottom
      >
        연결 요청이 성공적으로 전송되었습니다.
      </v-snackbar>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LinkRequestToProcteor',
  props: {
    value: Boolean
  },
  data() {
    return {
      currentStep: 1, // 시작은 1단계: 캐시템 정보
      cashItemCount: 0, // 기본값
      phoneNumber: '',
      isFormValid: false,
      errorMessage: '',
      isLoading: false,
      showSuccessMessage: false,
      phoneRules: [
        v => !!v || '휴대폰 번호를 입력해주세요',
        v => /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/.test(v) || '올바른 휴대폰 번호 형식이 아닙니다'
      ]
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
        if (!val) {
          this.resetForm();
        }
      }
    }
  },
  mounted() {
    this.fetchCashItemCount();
  },
  methods: {
    async fetchCashItemCount() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/myownpotion`);
        console.log(response);
        this.cashItemCount = response.data.result;
      } catch (error) {
        console.error('힐링포션 정보 가져오기 실패:', error);
        this.cashItemCount = 0;
      }
    },
    formatPhoneNumber() {
      // 숫자만 입력되도록 처리
      this.phoneNumber = this.phoneNumber.replace(/[^0-9]/g, '');
    },
    resetForm() {
      this.currentStep = 1;
      this.phoneNumber = '';
      this.errorMessage = '';
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },
    closeDialog() {
      this.showDialog = false;
    },
    goToCharge() {
      // 캐시템 충전 페이지로 이동
      this.closeDialog();
      this.$router.push('/silverpotion/buyitem');
    },
    goToNextStep() {
      this.currentStep = 2;
    },
    goBackStep() {
      this.currentStep = 1;
    },
    async sendRequest() {
      if (!this.$refs.form.validate()) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/carelink/sendFromDependent`, {
          phoneNumber: this.phoneNumber
        });
        console.log(response);
        
        if (response.data.result === 'success') {
          this.showSuccessMessage = true;
          // 힐링포션 카운트 감소 (실제로는 백엔드에서 처리)
          this.cashItemCount--;
          
          // 2초 후 모달 닫기
          setTimeout(() => {
            this.closeDialog();
          }, 2000);
        } else {
          this.errorMessage = response.data.message || '연결 요청 중 오류가 발생했습니다';
        }
      } catch (error) {
        console.error('연결 요청 실패:', error);
        this.errorMessage = error.response?.data?.message || '연결 요청 중 오류가 발생했습니다';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.link-request-card {
  border-radius: 16px;
  overflow: hidden;
}

.link-request-title {
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
}

.title-icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(63, 81, 181, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.link-request-title h2 {
  font-size: 1.6rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.link-request-content {
  padding: 16px 24px;
}

/* 캐시템 정보 스타일 */
.cash-item-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cash-item-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.count-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(63, 81, 181, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border: 2px solid #3f51b5;
}

.count-number {
  font-size: 3rem;
  font-weight: 700;
  color: #3f51b5;
}

.count-label {
  font-size: 1rem;
  color: #555;
  margin: 0;
}

.cash-item-description {
  margin-bottom: 16px;
}

.cash-item-description p {
  margin-bottom: 8px;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

.warning-text {
  color: #f44336;
  font-weight: 500;
}

/* 설명 스타일 */
.description {
  margin-bottom: 24px;
  text-align: center;
}

.description p {
  color: #666;
  margin-bottom: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.phone-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.phone-input-wrapper {
  width: 100%;
  max-width: 350px;
  margin-bottom: 16px;
}

.error-message {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 8px;
  text-align: center;
}

.link-request-actions {
  padding: 16px 24px 24px;
}

.cancel-btn, .back-btn, .charge-btn, .next-btn, .send-btn {
  min-width: 100px;
  font-weight: 500;
}

.charge-btn, .next-btn, .send-btn {
  margin-left: 8px;
}
</style>
