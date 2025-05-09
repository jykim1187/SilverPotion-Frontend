<template>
  <div class="buy-item-container">
    <div class="buy-item-card">
      <div class="header-section">
        <h1 class="page-title">힐링포션 구매</h1>
        <p class="page-subtitle">피보호자 연결을 위한 힐링포션을 충전해보세요</p>
      </div>
      
      <div class="potion-item">
        <div class="potion-image">
          <v-icon size="64" color="purple">mdi-flask-round-bottom</v-icon>
        </div>
        <div class="potion-info">
          <h2 class="potion-name">힐링포션</h2>
          <p class="potion-description">피보호자 1명당 1개의 힐링포션이 필요합니다.</p>
          <p class="potion-price">가격: <span class="price-value">1,000원</span> / 개</p>
        </div>
      </div>
      
      <div class="quantity-selector">
        <h3 class="quantity-title">구매 수량</h3>
        <div class="quantity-control">
          <v-btn icon @click="decreaseQuantity" :disabled="quantity <= 1">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <v-text-field
            v-model.number="quantity"
            type="number"
            min="1"
            max="100"
            class="quantity-input"
            outlined
            dense
            hide-details
            @input="validateQuantity"
          ></v-text-field>
          <v-btn icon @click="increaseQuantity" :disabled="quantity >= 100">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
      
      <div class="price-summary">
        <div class="summary-row">
          <span>수량:</span>
          <span>{{ quantity }}개</span>
        </div>
        <div class="summary-row">
          <span>단가:</span>
          <span>1,000원</span>
        </div>
        <v-divider class="my-3"></v-divider>
        <div class="summary-row total">
          <span>총 결제 금액:</span>
          <span class="total-price">{{ formatPrice(quantity * 1000) }}원</span>
        </div>
      </div>
      
      <div class="payment-actions">
        <v-btn text to="/health" class="cancel-btn">
          취소
        </v-btn>
        <v-btn color="primary" class="purchase-btn" @click="requestPayment" :loading="isLoading">
          결제하기
        </v-btn>
      </div>
    </div>
    
    <v-snackbar v-model="showSuccessMessage" color="success" timeout="3000">
      결제가 완료되었습니다.
    </v-snackbar>
    
    <v-snackbar v-model="showErrorMessage" color="error" timeout="3000">
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'BuyItem',
  data() {
    return {
      quantity: 1,
      isLoading: false,
      showSuccessMessage: false,
      showErrorMessage: false,
      errorMessage: '',
      IMP: null // 포트원 결제 객체
    };
  },
  mounted() {
    // 포트원 결제 SDK 로드
    this.loadPortOneSDK();
  },
  methods: {
    // 포트원 SDK 로드
    loadPortOneSDK() {
      const script = document.createElement('script');
      script.src = 'https://cdn.iamport.kr/v1/iamport.js';
      script.onload = () => {
        if (window.IMP) {
          this.IMP = window.IMP;
          this.IMP.init('imp47183178'); // 가맹점 식별코드 
        }
      };
      document.head.appendChild(script); //위에서 만든 script 태그를 head 태그에 추가하여 포트원 결제 모듈을 로드
    },
    
    // 수량 증가
    increaseQuantity() {
      if (this.quantity < 100) {
        this.quantity++;
      }
    },
    
    // 수량 감소
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    
    // 수량 유효성 검사
    validateQuantity() {
      // 숫자가 아닌 경우 1로 설정
      if (isNaN(this.quantity) || this.quantity === '') {
        this.quantity = 1;
        return;
      }
      
      // 입력 범위 제한 (1~100)
      this.quantity = Math.max(1, Math.min(100, parseInt(this.quantity)));
    },
    
    // 금액 포맷팅 (천 단위 콤마)
    formatPrice(price) {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    // 결제 요청
    async requestPayment() {
      if (!this.IMP) {
        // this.showError('결제 모듈이 로드되지 않았습니다.');
        return;
      }
      
      this.isLoading = true;
      
      try {
        const requestData = {quantity: this.quantity};
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/payment/prepare`,requestData);
        console.log(response)
        const {merchant_uid,amount,name} = response.data.result; 
        console.log("prepare에서 받은 merchant_uuid 값:", merchant_uid);

        this.IMP.request_pay(
                    {
                        channelKey: "channel-key-d8d8eede-bad7-473a-9605-2487a3dc042e",
                        pay_method: "card",
                        merchant_uid: merchant_uid, // 주문 고유 번호
                        name: name,
                        amount: amount,
                        // buyer_email: "gildong@gmail.com",
                        // buyer_name: "홍길동",
                        // buyer_tel: "010-4242-4242",
                        // buyer_addr: "서울특별시 강남구 신사동",
                        // buyer_postcode: "01181",
                    },
                    async (rsp) => {
                        if(rsp.success){
                            const verifyData ={
                                imp_uid: rsp.imp_uid,
                                merchant_uid: rsp.merchant_uid
                            };
                        console.log(verifyData)
                        const verifyRes = await axios.post("${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/payment/afterPayment",verifyData,{headers :{"X-User-LoginId" : this.loginId}})        
                        const result =verifyRes.data.result;
                        console.log(result)
                        this.showSuccessMessage = true;
                        this.$router.push('/silverpotion/');
                        // this.$router.go(-2);
                        } else{
                            alert("결제실패"+rsp.error_msg)
                        }
                    },
                    );

    } catch (error) {
      console.error('결제 준비 실패:', error);
    //   this.showError('결제 준비 실패했습니다. 다시 시도해주세요.');
    } finally {
      this.isLoading = false;
    }
    
    // 에러 표시
    // showError(message) {
    //   this.errorMessage = message;
    //   this.showErrorMessage = true;
    // }
  }
}
}
</script>

<style scoped>
.buy-item-container {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;
}

.buy-item-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #666;
  font-size: 1rem;
}

.potion-item {
  display: flex;
  background-color: #f9f5ff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  align-items: center;
}

.potion-image {
  background-color: rgba(156, 39, 176, 0.1);
  border-radius: 12px;
  height: 100px;
  width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 24px;
}

.potion-info {
  flex-grow: 1;
}

.potion-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.potion-description {
  color: #666;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.potion-price {
  font-size: 1.1rem;
  color: #333;
}

.price-value {
  font-weight: 700;
  color: #9c27b0;
}

.quantity-selector {
  margin-bottom: 30px;
}

.quantity-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.quantity-control {
  display: flex;
  align-items: center;
  max-width: 200px;
}

.quantity-input {
  margin: 0 8px;
  text-align: center;
}

:deep(.quantity-input .v-text-field__slot input) {
  text-align: center;
}

.price-summary {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1rem;
  color: #555;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.total-price {
  color: #9c27b0;
}

.payment-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  margin-right: 16px;
}

.purchase-btn {
  min-width: 120px;
}

@media (max-width: 600px) {
  .buy-item-card {
    padding: 20px;
  }
  
  .potion-item {
    flex-direction: column;
    text-align: center;
  }
  
  .potion-image {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .payment-actions {
    flex-direction: column;
  }
  
  .cancel-btn {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>


