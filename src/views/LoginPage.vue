<template>
    <v-container fluid class="fill-height pa-0 ma-0">
        <v-row align="center" justify="center" class="ma-0">
            <v-col cols="12" sm="10" md="8" lg="6" class="pa-0">
                <v-card class="login-container">
                    <v-card-text class="login-content">
                        <h1 class="welcome-text">실버포션</h1>
                        <p class="sub-text">안녕하세요!<br>실버포션에 오신 것을 환영합니다</p>
                        
                        <v-form @submit.prevent="doLogin" class="login-form">
                            <v-text-field
                                v-model="loginId"
                                label="아이디"
                                name="login"
                                prepend-inner-icon="mdi-account-outline"
                                type="text"
                                required
                                outlined
                                class="mb-4"
                                :rules="[v => !!v || '로그인 ID를 입력해주세요']"
                                @keyup.enter="doLogin"

                            ></v-text-field>
                            
                            <v-text-field
                                v-model="password"
                                label="비밀번호"
                                name="password"
                                prepend-inner-icon="mdi-lock-outline"
                                type="password"
                                required
                                outlined
                                class="mb-4"
                                :rules="[v => !!v || '비밀번호를 입력해주세요']"
                                @keyup.enter="doLogin"
                            ></v-text-field>
                            
                            <v-btn
                                color="#8BBEE8"
                                @click="doLogin"
                                block
                                x-large
                                class="login-btn"
                                height="56"
                            >
                                로그인
                            </v-btn>
                        </v-form>
                    </v-card-text>
                    
                    <v-divider class="my-4"></v-divider>
                    
                    <v-card-actions class="justify-center px-4">
                        <v-row>
                            <v-col cols="6" class="text-center">
                                <v-btn
                                    color="#4285F4"
                                    class="white--text social-btn"
                                    block
                                    @click="googleLogin"
                                    x-large
                                    height="56"
                                >
                                    <v-img
                                        src="@/assets/google.png"
                                        max-height="24"
                                        max-width="24"
                                        class="mr-2"
                                    ></v-img>
                                    Google
                                </v-btn>
                            </v-col>
                            <v-col cols="6" class="text-center">
                                <v-btn
                                    color="#FEE500"
                                    class="social-btn"
                                    block
                                    @click="kakaoLogin"
                                    x-large
                                    height="56"
                                >
                                    <v-img
                                        src="@/assets/kakao.png"
                                        max-height="24"
                                        max-width="24"
                                        class="mr-2"
                                    ></v-img>
                                    Kakao
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-actions>
                    
                    <v-card-actions class="justify-center mt-4">
                        <v-btn
                            text
                            color="#8BBEE8"
                            to="/silverpotion/user/create"
                            class="signup-btn"
                            x-large
                        >
                            회원가입
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios'
import emitter from '@/event-bus';
import WebSocketManager from '@/WebSocketManager';
// import { jwtDecode } from 'jwt-decode'

export default {
  data() {
    return {
      loginId: "",
      password: "",
      userName: "",
      googleUrl: "https://accounts.google.com/o/oauth2/auth",
      googleClientId: "73727762121-skf00kqrlnfjput7t493mmdifss29170.apps.googleusercontent.com",
      googleRedirectUri: "https://www.silverpotion.site/oauth/google/redirect",
      googleScope: "openid email profile",
      googleResponseType: "code",
      kakaoUrl: "https://kauth.kakao.com/oauth/authorize",
      kakaoClientId: "740a1fc6969a1fc6c821d81a2236d3fe",
      kakaoRedirectUri: "https://www.silverpotion.site/oauth/kakao/redirect",
    }
  },
  methods: {
    handleFocus(event) {
      event.target.parentElement.classList.add('v-input--is-focused')
      event.target.parentElement.querySelector('.v-label').style.opacity = '0'
    },
    handleBlur(event) {
      if (!event.target.value) {
        event.target.parentElement.classList.remove('v-input--is-focused')
        event.target.parentElement.querySelector('.v-label').style.opacity = '1'
      }
    },
     // 일반 로그인
    async doLogin() {
      try {
        const loginData = {
          loginId: this.loginId,
          password: this.password,
        }

        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/login`,
          loginData
        )
        console.log('Login Response:', response.data);
        
        const token = response.data.result.token;
        const refreshToken = response.data.result.refreshToken;
        const role = response.data.result.role;
        const adminRole = response.data.result.adminRole;

        // 저장
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("role", role);
        localStorage.setItem("adminRole", adminRole);
        localStorage.setItem("loginId", response.data.result.id);
        localStorage.setItem("userName", response.data.result.name);
        localStorage.setItem("nickName", response.data.result.nickName);
        localStorage.setItem("profileImage", response.data.result.profileImage);
        
        // userId가 null이 아닐 때만 저장
        const userId = response.data.result.userId;
        if (userId != null) {
          localStorage.setItem('userId', userId);
        }

        // 저장된 값 확인
        console.log('Stored Token:', localStorage.getItem('token'));
        console.log('Stored Role:', localStorage.getItem('role'));
        console.log('Stored AdminRole:', localStorage.getItem('adminRole'));

        // 리디렉션
        console.log("Login 성공! now routing to /");
        WebSocketManager.token = token;
        WebSocketManager.loginId = response.data.result.id;
        await this.$router.push('/');
        this.$nextTick(() => {
            console.log("📢 loginChanged 이벤트 발행");
            emitter.emit('loginChanged');
        });

       // 앱에 로그인 아이디 전달  
        if(window.AndroidBridge && window.AndroidBridge.sendLoginId) {
        window.AndroidBridge.sendLoginId(this.loginId);
        }
      } catch (error) {
        alert('로그인 실패! 아이디 또는 비밀번호를 확인하세요.')
        console.error('로그인 에러:', error)
      }
    },
    googleLogin(){
      const auth_uri = `${this.googleUrl}?client_id=${this.googleClientId}&redirect_uri=${this.googleRedirectUri}&response_type=code&scope=${this.googleScope}&access_type=offline&prompt=consent`;
      window.location.href = auth_uri;
    },
    kakaoLogin(){
      const auth_url = `${this.kakaoUrl}?client_id=${this.kakaoClientId}&redirect_uri=${this.kakaoRedirectUri}&response_type=code`;
      window.location.href = auth_url;
    }

  }
}
</script>

<style scoped>
.fill-height {
    min-height: 100vh;
    background: linear-gradient(135deg, #E8F4FF 0%, #FFF5F0 100%);
    padding: 0;
    margin: 0;
}

.login-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 40px 24px;
    border-radius: 16px !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
    background: white !important;
}

.login-content {
    width: 100%;
    padding: 0 !important;
}

.welcome-text {
    font-size: 2.5rem;
    font-weight: 700;
    color: #4A6B8A;
    margin-bottom: 16px;
    text-align: center;
    font-family: 'Noto Sans KR', sans-serif;
}

.sub-text {
    font-size: 1.25rem;
    color: #666666;
    margin-bottom: 48px;
    text-align: center;
    font-family: 'Noto Sans KR', sans-serif;
    line-height: 1.6;
}

.login-form {
    margin-bottom: 32px;
}

.custom-input {
    border-radius: 12px !important;
    margin-bottom: 24px !important;
}

.custom-input :deep(.v-input__slot) {
    border-radius: 12px !important;
    background-color: #FFFFFF !important;
    border: 2px solid #E0E0E0 !important;
    min-height: 56px !important;
}

.custom-input :deep(.v-label) {
    font-size: 1.1rem !important;
    color: #666666 !important;
    opacity: 1;
}

.custom-input :deep(input) {
    font-size: 1.2rem !important;
    padding: 12px 0 !important;
    color: #333333 !important;
}

.custom-input :deep(.v-input__prepend-inner) {
    margin-top: 12px !important;
}

.login-btn {
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 1.2rem !important;
    color: white !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 8px rgba(139, 190, 232, 0.3) !important;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(139, 190, 232, 0.4) !important;
}

.social-btn {
    border-radius: 12px !important;
    font-weight: 500 !important;
    font-size: 1.1rem !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    transition: all 0.3s ease !important;
}

.social-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

.signup-btn {
    font-weight: 600 !important;
    font-size: 1.1rem !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
}

@media (max-width: 600px) {
    .login-container {
        padding: 32px 16px;
    }
    
    .welcome-text {
        font-size: 2.2rem;
    }
    
    .sub-text {
        font-size: 1.1rem;
    }
    
    .custom-input :deep(input) {
        font-size: 1.1rem !important;
    }
    
    .login-btn, .social-btn {
        height: 52px !important;
        font-size: 1.1rem !important;
    }
}
</style>
