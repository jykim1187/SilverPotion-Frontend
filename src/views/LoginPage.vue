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
      password: ""
    }
  },
  methods: {
    async doLogin() {
      try {
        const loginData = {
          loginId: this.loginId,
          password: this.password
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
        // localStorage.setItem("role", role)
        localStorage.setItem("loginId", response.data.result.id)

        // 리디렉션
        console.log("Login 성공! now routing to /");
        this.$router.push('/');
      } catch (error) {
        alert('로그인 실패! 아이디 또는 비밀번호를 확인하세요.')
        console.error('로그인 에러:', error)
      }
    }
  }
}
</script>
