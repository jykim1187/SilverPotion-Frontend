<template>
  <div class="floating-signup-container">
    <div class="floating-header">
      <div class="brand-circle">
        <v-icon size="28" color="white">mdi-leaf</v-icon>
      </div>
      <h1>실버포션</h1>
      <p>회원이 되어 다양한 서비스를 이용하세요</p>
    </div>

    <v-form ref="form" class="floating-form">
      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-account</v-icon>
          <span>아이디</span>
        </div>
        <v-text-field
          v-model="formData.loginId"
          placeholder="사용하실 아이디를 입력해주세요"
          :rules="[rules.required]"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
          @blur="validateField('loginId')"
        />
        <div v-if="checkResults.loginId.checked" :class="['validation-message', checkResults.loginId.valid ? 'valid' : 'invalid']">
          {{ checkResults.loginId.message }}
        </div>
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-email</v-icon>
          <span>이메일</span>
        </div>
        <v-text-field
          v-model="formData.email"
          placeholder="example@email.com"
          :rules="[rules.required, rules.email]"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
          @blur="validateField('email')"
        />
        <div v-if="checkResults.email.checked" :class="['validation-message', checkResults.email.valid ? 'valid' : 'invalid']">
          {{ checkResults.email.message }}
        </div>
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-lock</v-icon>
          <span>비밀번호</span>
        </div>
        <v-text-field
          v-model="formData.password"
          type="password"
          placeholder="8자 이상 입력해주세요"
          :rules="[rules.required, rules.password]"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
        />
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-account-circle</v-icon>
          <span>이름</span>
        </div>
        <v-text-field
          v-model="formData.name"
          placeholder="실명을 입력해주세요"
          :rules="[rules.required]"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
        />
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-gender-male-female</v-icon>
          <span>성별</span>
        </div>
        <div class="gender-buttons">
          <v-btn
            :color="formData.sex === 'MALE' ? 'primary' : ''"
            :outlined="formData.sex !== 'MALE'"
            class="gender-btn"
            @click="formData.sex = 'MALE'"
            elevation="0"
          >
            <v-icon left>mdi-gender-male</v-icon>
            남성
          </v-btn>
          <v-btn
            :color="formData.sex === 'FEMALE' ? 'primary' : ''"
            :outlined="formData.sex !== 'FEMALE'"
            class="gender-btn"
            @click="formData.sex = 'FEMALE'"
            elevation="0"
          >
            <v-icon left>mdi-gender-female</v-icon>
            여성
          </v-btn>
        </div>
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-phone</v-icon>
          <span>전화번호</span>
        </div>
        <v-text-field
          v-model="formData.phoneNumber"
          placeholder="01012345678('-'을 빼고 입력해주세요)"
          :rules="[rules.required, rules.phone]"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
        />
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-calendar</v-icon>
          <span>생년월일</span>
        </div>
        <v-text-field
          v-model="formData.birthday"
          placeholder="생년월일을 '-' 없이 숫자 8자리만 입력해주세요 (ex.19940818)"
          :rules="[rules.required, rules.birthday]"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
        />
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-account-badge</v-icon>
          <span>닉네임</span>
        </div>
        <v-text-field
          v-model="formData.nickName"
          placeholder="8자 이내로 입력해주세요"
          :rules="[rules.required, rules.maxLength]"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
          @blur="validateField('nickName')"
        />
        <div v-if="checkResults.nickName.checked" :class="['validation-message', checkResults.nickName.valid ? 'valid' : 'invalid']">
          {{ checkResults.nickName.message }}
        </div>
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-map-marker</v-icon>
          <span>주소</span>
        </div>
        <v-text-field
          v-model="formData.address"
          placeholder="주소 검색"
          readonly
          @click="handleAddressSearch"
          :rules="[rules.required]"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
        />
        <div id="address-layer" ref="addressLayer" style="display:none; margin-top:10px; height:400px; border:1px solid #ddd;"></div>
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">
            mdi-home-floor-a
          </v-icon>
          <span>상세주소</span>
        </div>
        <v-text-field
          v-model="formData.detailAddress"
          placeholder="상세주소를 입력해주세요"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
        />
      </div>

      <div class="floating-input-wrapper">
        <div class="floating-label">
          <v-icon color="primary" size="20">mdi-map-marker</v-icon>
          <span>활동지역</span>
        </div>
        <v-text-field
          v-model="formData.region"
          placeholder="활동지역을 선택해주세요"
          readonly
          @click="openRegionModal"
          filled
          dense
          background-color="transparent"
          hide-details="auto"
          class="floating-input"
        />
      </div>

      <div class="floating-actions">
        <v-btn
          color="primary"
          rounded
          block
          height="52"
          class="floating-submit-btn"
          @click="handleSubmit"
          :loading="loading"
          elevation="2"
        >
          <v-icon left>mdi-check-circle</v-icon>
          가입하기
        </v-btn>
      </div>
    </v-form>

    <div class="floating-footer">
      <p>이미 계정이 있으신가요? <a href="#" class="primary--text">로그인</a></p>
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
          >
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import KakaoMap from '@/views/gathering/RegionSelect.vue';

export default {
  components: {
    KakaoMap
  },
  data() {
    return {
      loading: false,
      formData: {
        loginId: '',
        email: '',
        password: '',
        name: '',
        sex: null,
        phoneNumber: '',
        birthday: '',
        nickName: '',
        address: '',
        detailAddress: '',
        zipcode: '',
        region: '', // 활동지역
      },
      regionModalOpen: false,
      selectedRegion: null,
      rules: {
        required: v => !!v || '필수 입력항목입니다',
        email: v => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다',
        password: v => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
        maxLength: v => v.length <= 8 || '8자 이내로 입력해주세요',
        phone: v => /^\d{3}\d{3,4}\d{4}$/.test(v) || '올바른 전화번호 형식이 아닙니다',
        birthday: v => /^\d{8}$/.test(v) || '생년월일을 숫자 8자리만 입력해주세요 (ex.19940818)',  
      },
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
      checkResults: {
        loginId: { 
          checked: false, 
          valid: false, 
          message: '' 
        },
        email: { 
          checked: false, 
          valid: false, 
          message: '' 
        },
        nickName: { 
          checked: false, 
          valid: false, 
          message: '' 
        },
      },
      debounceTimeout: null
    }
  },
  created() {
    // URL 쿼리 파라미터에서 구글 로그인 정보 가져오기
    const { loginId, email, name } = this.$route.query;
    if (loginId) {
      this.formData.loginId = loginId;
      this.validateField('loginId');
    }
    if (email) {
      this.formData.email = email;
      this.validateField('email');
    }
    if (name) this.formData.name = name;
  },
  methods: {
    // 지역 선택 모달 열기
    openRegionModal() {
      this.regionModalOpen = true;
    },
    
    // 지역 선택 이벤트 처리
    handleRegionSelected(region) {
      this.selectedRegion = region;
    },
    
    // 지역 선택 확인
    confirmRegionSelection() {
      if (this.selectedRegion) {
        this.formData.region = this.selectedRegion.name;
      }
      this.regionModalOpen = false;
    },

    handleAddressSearch() {
      // 모바일과 PC 환경을 모두 지원하기 위해 분기 처리
      const width = window.innerWidth;
      const element_layer = this.$refs.addressLayer;
      
      if (width <= 768) { // 모바일 환경으로 판단
        // 레이어 표시
        element_layer.style.display = 'block';
        
        new window.daum.Postcode({
          oncomplete: (data) => {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드
            let fullRoadAddr = data.roadAddress; // 도로명 주소 변수
            let extraRoadAddr = ''; // 도로명 조합형 주소 변수

            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                extraRoadAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
              extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 도로명, 지번 조합형 주소가 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraRoadAddr !== ''){
                extraRoadAddr = ' (' + extraRoadAddr + ')';
            }
            // 도로명, 지번 주소의 유무에 따라 해당 조합형 주소를 추가한다.
            if(fullRoadAddr !== ''){
                fullRoadAddr += extraRoadAddr;
            }

            // 우편번호와 주소 정보를 해당 필드에 넣는다.
            this.formData.zipcode = data.zonecode; //5자리 새우편번호 사용
            this.formData.address = fullRoadAddr;
            
            // 레이어 숨기기
            element_layer.style.display = 'none';
          },
          width : '100%',
          height : '100%',
          maxSuggestItems : 5
        }).embed(element_layer);
      } else { // PC 환경
        new window.daum.Postcode({
          oncomplete: (data) => {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드
            let fullRoadAddr = data.roadAddress; // 도로명 주소 변수
            let extraRoadAddr = ''; // 도로명 조합형 주소 변수

            // 법정동명이 있을 경우 추가한다. (법정리는 제외)
            if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                extraRoadAddr += data.bname;
            }
            // 건물명이 있고, 공동주택일 경우 추가한다.
            if(data.buildingName !== '' && data.apartment === 'Y'){
              extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            // 도로명, 지번 조합형 주소가 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
            if(extraRoadAddr !== ''){
                extraRoadAddr = ' (' + extraRoadAddr + ')';
            }
            // 도로명, 지번 주소의 유무에 따라 해당 조합형 주소를 추가한다.
            if(fullRoadAddr !== ''){
                fullRoadAddr += extraRoadAddr;
            }

            // 우편번호와 주소 정보를 해당 필드에 넣는다.
            this.formData.zipcode = data.zonecode; //5자리 새우편번호 사용
            this.formData.address = fullRoadAddr;
          }
        }).open();
      }

      console.log(this.formData);
    },

    showSnackbar(message, color) {
      this.snackbar.show = true;
      this.snackbar.message = message;
      this.snackbar.color = color;
    },

    async validateField(field) {
      // 값이 비어있으면 검증하지 않음
      if (!this.formData[field]) {
        this.checkResults[field].checked = false;
        return;
      }

      // 디바운스 처리 (이전 타이머 취소)
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      // 300ms 후에 실행
      this.debounceTimeout = setTimeout(async () => {
        try {
          // 필드별 중복 체크 API 호출
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/checkDuplicate`, 
            { params: { field, value: this.formData[field] } }
          );
          
          // 결과 업데이트
          const isDuplicate = response.data.result;
          this.checkResults[field].checked = true;
          this.checkResults[field].valid = !isDuplicate;
          
          if (isDuplicate) {
            if (field === 'loginId') {
              this.checkResults[field].message = '이미 사용 중인 아이디입니다.';
            } else if (field === 'email') {
              this.checkResults[field].message = '이미 사용 중인 이메일입니다.';
            } else if (field === 'nickName') {
              this.checkResults[field].message = '이미 사용 중인 닉네임입니다.';
            }
          } else {
            this.checkResults[field].message = '사용 가능합니다.';
          }
        } catch (error) {
          console.error(`${field} 중복 확인 실패:`, error);
          this.checkResults[field].checked = true;
          this.checkResults[field].valid = false;
          this.checkResults[field].message = '중복 확인에 실패했습니다.';
        }
      }, 300);
    },

    async handleSubmit() {
      if (!this.$refs.form.validate()) return;
      
      // 중복 체크 상태 확인
      if (
        (this.checkResults.loginId.checked && !this.checkResults.loginId.valid) ||
        (this.checkResults.email.checked && !this.checkResults.email.valid) ||
        (this.checkResults.nickName.checked && !this.checkResults.nickName.valid)
      ) {
        this.showSnackbar('중복된 정보가 있습니다. 다시 확인해주세요.', 'error');
        return;
      }
      
      this.loading = true;
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/create`, this.formData);
        console.log(response);
        this.showSnackbar('회원가입이 완료되었습니다!', 'success');
        //웹뷰에 전달. 즉 브라우저에는 무시되고 폰에서만 작동되는 코드임. 폰에 입력한 전화번호 전달
        if(window.AndroidBridge && window.AndroidBridge.sendPhoneNumber) {
          window.AndroidBridge.sendPhoneNumber(this.formData.phoneNumber);
        }
        //홈화면으로 라우팅
        this.$router.push('/silverpotion/user/login');
      } catch (error) {
        this.showSnackbar('회원가입 실패', 'error');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.floating-signup-container {
  background: #f9fafc;
  min-height: 100vh;
  padding: 24px;
}

.floating-header {
  text-align: center;
  margin-bottom: 40px;
}

.brand-circle {
  width: 56px;
  height: 56px;
  background: var(--v-primary-base);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.floating-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.floating-header p {
  color: #666;
  font-size: 14px;
}

.floating-form {
  margin-bottom: 24px;
}

.floating-input-wrapper {
  position: relative;
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.floating-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.floating-label span {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-left: 8px;
}

.floating-input {
  margin-top: 4px;
}

.floating-input :deep(.v-input__slot) {
  min-height: 40px !important;
  box-shadow: none !important;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 0;
}

.floating-input :deep(.v-text-field__details) {
  display: none;
}

.gender-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.gender-btn {
  flex: 1;
  height: 40px;
  text-transform: none;
  letter-spacing: 0;
}

.floating-actions {
  margin-top: 32px;
}

.floating-submit-btn {
  text-transform: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.floating-footer {
  text-align: center;
  margin-top: 24px;
}

.floating-footer p {
  font-size: 14px;
  color: #666;
}

/* 중복확인 메시지 스타일 */
.validation-message {
  font-size: 12px;
  margin-top: 4px;
  padding-left: 4px;
}

.valid {
  color: #4caf50;
}

.invalid {
  color: #f44336;
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .floating-signup-container {
    background: #121212;
  }

  .floating-header h1 {
    color: #fff;
  }

  .floating-header p {
    color: #aaa;
  }

  .floating-input-wrapper {
    background: #1e1e1e;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .floating-label span {
    color: #aaa;
  }

  .floating-input :deep(.v-input__slot) {
    border-bottom: 1px solid #333;
  }

  .floating-footer p {
    color: #aaa;
  }
}
</style>
