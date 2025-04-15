<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="4" md="6">
                <v-card>
                    <v-card-title class="text-h5 text-center">로그인</v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="doLogin">
                            <v-text-field 
                            label="로그인ID"
                            v-model="loginId"
                            type="loginId"
                            required
                            ></v-text-field>
                            
                            <v-text-field 
                            label="password"
                            v-model="password"
                            type="password"
                            required
                            >
                            </v-text-field>
                            <v-btn type="submit" color="primary" block>로그인</v-btn>
                        </v-form>
                        <v-row>
                            <v-col cols="4" class="d-flex justify-center">
                                <img 
                                  src="@/assets/google.png" 
                                  style="max-height: 40px; width: auto;"
                                  @click="googleLogin()"
                                />
                            </v-col>
                            <v-col cols="4" class="d-flex justify-center">
                                <img 
                                  src="@/assets/kakao.png" 
                                  style="max-height: 40px; width: auto;"
                                  @click="kakaoLogin()"
                                />
                            </v-col>
                            <v-col cols="4" class="d-flex justify-center">
                                <img 
                                  src="@/assets/samsung.png" 
                                  style="max-height: 40px; width: auto;"
                                  @click="samsungLogin()"
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import axios from 'axios'
import emitter from '@/event-bus';
// import { jwtDecode } from 'jwt-decode'

export default {
  data() {
    return {
      loginId: "",
      password: "",
      googleUrl: "https://accounts.google.com/o/oauth2/auth",
      googleClientId: "73727762121-skf00kqrlnfjput7t493mmdifss29170.apps.googleusercontent.com",
      googleRedirectUri: "http://localhost:3000/oauth/google/redirect",
      googleScope: "openid email profile",
      googleResponseType: "code",
      kakaoUrl: "https://kauth.kakao.com/oauth/authorize",
      kakaoClientId: "740a1fc6969a1fc6c821d81a2236d3fe",
      kakaoRedirectUri: "http://localhost:3000/oauth/kakao/redirect",
    }
  },
  methods: {
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
        console.log(response)
        const token = response.data.result.token
        const refreshToken = response.data.result.refreshToken

        // 저장
        localStorage.setItem("token", token)
        localStorage.setItem("refreshToken", refreshToken)
        emitter.emit('loginChanged');
        // 디코딩해서 로그인 ID와 권한 추출 (선택)
        // const role = jwtDecode(token).role
        // const loginId = jwtDecode(token).sub
        localStorage.setItem("role", response.data.result.role)
        localStorage.setItem("loginId", response.data.result.id)
        localStorage.setItem("nickName", response.data.result.nickName)
        localStorage.setItem("profileImage", response.data.result.profileImage)
        localStorage.setItem("userId", response.data.result.userId)

        // 리디렉션
        console.log("Login 성공! now routing to /");
        this.$router.push('/');
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
