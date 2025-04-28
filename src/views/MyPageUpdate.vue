<template>
  <div class="profile-edit-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.go(-1)">
        <v-icon>mdi-arrow-left</v-icon>
      </button>
      <h1 class="title">내 정보 수정</h1>
    </div>

    <v-container class="form-container">
      <!-- <v-row>
        <v-col cols="12">
          <div class="profile-avatar">
            <v-avatar size="100" color="primary">
              <span v-if="!userImage" class="white--text headline">{{ getInitials }}</span>
              <img v-else :src="userImage" alt="프로필 이미지" />
            </v-avatar>
          </div>
        </v-col>
      </v-row> -->

      <v-form ref="form" class="edit-form">
        <!-- 이름 (수정 불가) -->
        <div class="form-group readonly">
          <div class="form-label">
            <v-icon color="primary">mdi-account</v-icon>
            <span>이름</span>
          </div>
          <v-text-field 
            v-model="userData.name" 
            outlined 
            disabled 
            readonly
            hide-details
            color="primary"
            class="readonly-input" 
          ></v-text-field>
        </div>

        <!-- 성별 (수정 불가) -->
        <div class="form-group readonly">
          <div class="form-label">
            <v-icon color="primary">mdi-gender-male-female</v-icon>
            <span>성별</span>
          </div>
          <v-text-field 
            :value="userData.sex === 'MALE' ? '남성' : '여성'" 
            outlined 
            disabled 
            readonly
            hide-details
            color="primary"
            class="readonly-input" 
          ></v-text-field>
        </div>

        <!-- 생년월일 (수정 불가) -->
        <div class="form-group readonly">
          <div class="form-label">
            <v-icon color="primary">mdi-calendar</v-icon>
            <span>생년월일</span>
          </div>
          <v-text-field 
            v-model="userData.birthday" 
            outlined 
            disabled 
            readonly
            hide-details
            color="primary"
            class="readonly-input" 
          ></v-text-field>
        </div>

        <!-- 닉네임 -->
        <div class="form-group">
          <div class="form-label">
            <v-icon color="primary">mdi-account-badge</v-icon>
            <span>닉네임</span>
          </div>
          <v-text-field 
            v-model="userData.nickName" 
            placeholder="8자 이내로 입력해주세요" 
            :rules="[rules.required, rules.maxLength]"
            outlined 
            hide-details="auto"
            color="primary"
            @blur="validateNickName"
          ></v-text-field>
          <div v-if="nickNameCheck.checked" :class="['validation-message', nickNameCheck.valid ? 'valid' : 'invalid']">
            {{ nickNameCheck.message }}
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <div class="form-label">
            <v-icon color="primary">mdi-lock</v-icon>
            <span>비밀번호</span>
          </div>
          <v-text-field 
            v-model="userData.password" 
            type="password"
            placeholder="8자 이상 입력해주세요" 
            :rules="[rules.password]"
            outlined 
            hide-details="auto"
            color="primary"
          ></v-text-field>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="form-group">
          <div class="form-label">
            <v-icon color="primary">mdi-lock-check</v-icon>
            <span>비밀번호 확인</span>
          </div>
          <v-text-field 
            v-model="passwordConfirm" 
            type="password"
            placeholder="비밀번호를 다시 입력해주세요" 
            :rules="[rules.passwordMatch]"
            outlined 
            hide-details="auto"
            color="primary"
          ></v-text-field>
        </div>

        <!-- 휴대폰 번호 -->
        <div class="form-group">
          <div class="form-label">
            <v-icon color="primary">mdi-phone</v-icon>
            <span>휴대폰 번호</span>
          </div>
          <v-text-field 
            v-model="userData.phoneNumber" 
            placeholder="01012345678('-'을 빼고 입력해주세요)" 
            :rules="[rules.required, rules.phone]"
            outlined 
            hide-details="auto"
            color="primary"
          ></v-text-field>
        </div>

        <!-- 주소 -->
        <div class="form-group">
          <div class="form-label">
            <v-icon color="primary">mdi-map-marker</v-icon>
            <span>주소</span>
          </div>
          <v-text-field 
            v-model="userData.address" 
            placeholder="주소 검색" 
            @click="handleAddressSearch"
            readonly
            :rules="[rules.required]"
            outlined 
            hide-details="auto"
            color="primary"
          ></v-text-field>
        </div>

        <!-- 상세 주소 -->
        <div class="form-group">
          <div class="form-label">
            <v-icon color="primary">mdi-home-floor-a</v-icon>
            <span>상세 주소</span>
          </div>
          <v-text-field 
            v-model="userData.detailAddress" 
            placeholder="상세주소를 입력해주세요" 
            outlined 
            hide-details="auto"
            color="primary"
          ></v-text-field>
        </div>

        <!-- 활동지역 -->
        <div class="form-group">
          <div class="form-label">
            <v-icon color="primary">mdi-map-marker-radius</v-icon>
            <span>활동지역</span>
          </div>
          <v-text-field 
            v-model="userData.region" 
            placeholder="활동지역을 입력해주세요" 
            outlined 
            hide-details="auto"
            color="primary"
          ></v-text-field>
        </div>

        <!-- 제출 버튼 -->
        <div class="submit-btn-container">
          <v-btn 
            color="primary" 
            x-large 
            rounded 
            block 
            :loading="loading"
            class="save-btn"
            @click="updateUserInfo"
          >
            <v-icon left>mdi-content-save</v-icon>
            변경사항 저장
          </v-btn>
        </div>
      </v-form>
    </v-container>

    <!-- 스낵바 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MyPageUpdate',
  data() {
    return {
      loading: false,
      userImage: null,
      userData: {
        name: '',
        nickName: '',
        email: '',
        password: '',
        sex: '',
        phoneNumber: '',
        birthday: '',
        address: '',
        detailAddress: '',
        region: '',
        zipcode: '',
      },
      passwordConfirm: '',
      rules: {
        required: v => !!v || '필수 입력항목입니다',
        password: v => !v || v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
        passwordMatch: v => !this.userData.password || v === this.userData.password || '비밀번호가 일치하지 않습니다',
        maxLength: v => v.length <= 8 || '8자 이내로 입력해주세요',
        phone: v => /^\d{3}\d{3,4}\d{4}$/.test(v) || '올바른 전화번호 형식이 아닙니다',
      },
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
      nickNameCheck: {
        checked: false,
        valid: false,
        message: ''
      },
      debounceTimeout: null,
      originalNickName: '', // 원래 닉네임 저장
    };
  },
  computed: {
    getInitials() {
      return this.userData.name ? this.userData.name.charAt(0).toUpperCase() : '';
    }
  },
  mounted() {
    this.getUserInfo();
  },
  methods: {
    async getUserInfo() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/myprofile`);
        console.log(response);
        
        // 사용자 정보 설정
        const userInfo = response.data.result;
        this.userData = {
          name: userInfo.name,
          nickName: userInfo.nickName,
          email: userInfo.email || '',
          password: '', // 비밀번호는 초기화
          sex: userInfo.sex,
          phoneNumber: userInfo.phoneNumber,
          birthday: userInfo.birthday,
          address: userInfo.address,
          detailAddress: userInfo.detailAddress,
          region: userInfo.region,
          zipcode: userInfo.zipcode || '',
        };
        this.originalNickName = userInfo.nickName; // 원래 닉네임 저장
        this.userImage = userInfo.profileImage;
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        this.showSnackbar('사용자 정보를 불러오는데 실패했습니다.', 'error');
      }
    },
    
    handleAddressSearch() {
      new window.daum.Postcode({
        oncomplete: (data) => {
          let fullRoadAddr = data.roadAddress;
          let extraRoadAddr = '';

          if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
            extraRoadAddr += data.bname;
          }
          if(data.buildingName !== '' && data.apartment === 'Y'){
            extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          if(extraRoadAddr !== ''){
            extraRoadAddr = ' (' + extraRoadAddr + ')';
          }
          if(fullRoadAddr !== ''){
            fullRoadAddr += extraRoadAddr;
          }

          this.userData.zipcode = data.zonecode;
          this.userData.address = fullRoadAddr;
        }
      }).open();
    },
    
    showSnackbar(message, color) {
      this.snackbar.show = true;
      this.snackbar.message = message;
      this.snackbar.color = color;
    },
    
    async validateNickName() {
      // 닉네임이 비어있으면 검증하지 않음
      if (!this.userData.nickName) {
        this.nickNameCheck.checked = false;
        return;
      }

      // 원래 닉네임과 같으면 검증하지 않음 (변경이 없는 경우)
      if (this.userData.nickName === this.originalNickName) {
        this.nickNameCheck.checked = false;
        return;
      }

      // 디바운스 처리 (이전 타이머 취소)
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      // 300ms 후에 실행
      this.debounceTimeout = setTimeout(async () => {
        try {
          // 닉네임 중복 체크 API 호출
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/checkDuplicate`, 
            { params: { field: 'nickName', value: this.userData.nickName } }
          );
          
          // 결과 업데이트
          const isDuplicate = response.data.result;
          this.nickNameCheck.checked = true;
          this.nickNameCheck.valid = !isDuplicate;
          
          if (isDuplicate) {
            this.nickNameCheck.message = '이미 사용 중인 닉네임입니다.';
          } else {
            this.nickNameCheck.message = '사용 가능한 닉네임입니다.';
          }
        } catch (error) {
          console.error('닉네임 중복 확인 실패:', error);
          this.nickNameCheck.checked = true;
          this.nickNameCheck.valid = false;
          this.nickNameCheck.message = '중복 확인에 실패했습니다.';
        }
      }, 300);
    },
    
    async updateUserInfo() {
      if (!this.$refs.form.validate()) return;
      
      // 닉네임 중복 체크 상태 확인
      if (this.nickNameCheck.checked && !this.nickNameCheck.valid) {
        this.showSnackbar('중복된 닉네임입니다. 다시 확인해주세요.', 'error');
        return;
      }
      
      this.loading = true;
      try {
        // 업데이트할 데이터 준비
        const updateData = {
          nickName: this.userData.nickName,
          phoneNumber: this.userData.phoneNumber,
          address: this.userData.address,
          detailAddress: this.userData.detailAddress,
          region: this.userData.region,
        };
        
        // 비밀번호가 입력된 경우에만 포함
        if (this.userData.password) {
          updateData.password = this.userData.password;
        }
        
        // 사용자 정보 업데이트 API 호출
        const response = await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/update`, 
          updateData
        );
        
        console.log(response);
        this.showSnackbar('정보가 성공적으로 업데이트되었습니다.', 'success');
        
        // 마이페이지로 이동
        setTimeout(() => {
          this.$router.push('/silverpotion/mypage');
        }, 1500);
      } catch (error) {
        console.error('정보 업데이트 실패:', error);
        this.showSnackbar('정보 업데이트에 실패했습니다.', 'error');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.profile-edit-page {
  max-width: 768px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  margin-bottom: 24px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin: 0;
}

.back-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.form-container {
  padding: 0 16px;
}

.profile-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  margin-bottom: 8px;
  transition: transform 0.2s;
}

.form-group:hover {
  transform: translateY(-2px);
}

.form-group.readonly {
  opacity: 0.8;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.form-label span {
  margin-left: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.readonly-input {
  background-color: #f5f5f5;
}

.submit-btn-container {
  margin-top: 24px;
  margin-bottom: 16px;
}

.save-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.validation-message {
  font-size: 12px;
  margin-top: 5px;
  padding-left: 5px;
}

.validation-message.valid {
  color: #4caf50;
}

.validation-message.invalid {
  color: #f44336;
}

/* 다크 모드 */
@media (prefers-color-scheme: dark) {
  .page-header {
    background-color: #1e1e1e;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  
  .title {
    color: #fff;
  }
  
  .back-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .form-label span {
    color: #aaa;
  }
  
  .readonly-input {
    background-color: #2a2a2a;
  }
}
</style>