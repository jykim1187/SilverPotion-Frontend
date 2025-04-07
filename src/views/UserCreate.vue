<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title class="text-h5 text-center">회원가입</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="userCreate">
                <v-text-field
                  label="로그인 ID"
                  v-model="loginId"
                  required
                />
                <v-text-field
                  label="이메일"
                  v-model="email"
                  type="email"
                  required
                />
                <v-text-field
                  label="비밀번호"
                  v-model="password"
                  type="password"
                  required
                />
                <v-text-field
                  label="이름"
                  v-model="name"
                  required
                />
                <v-select
                  label="성별"
                  v-model="sex"
                  :items="sexOptions"
                  required
                />
                <v-text-field
                  label="전화번호"
                  v-model="phoneNumber"
                  required
                />
                <v-text-field
                  label="생년월일 (YYYY-MM-DD)"
                  v-model="birthday"
                  required
                />
                <v-text-field
                  label="닉네임 (8자 이내)"
                  v-model="nickName"
                  required
                />
                <v-text-field
                  label="주소"
                  v-model="address"
                  required
                />
                <v-text-field
                  label="도로명 주소"
                  v-model="streetAddress"
                />
                <v-text-field
                  label="상세 주소"
                  v-model="detailAddress"
                />
                <v-btn type="submit" color="primary" block>회원가입</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        loginId: "",
        name: "",
        email: "",
        password: "",
        sex: null,
        phoneNumber: "",
        birthday: "",
        nickName: "",
        address: "",
        streetAddress: "",
        detailAddress: "",
        sexOptions: [
          { text: "남자", value: "MALE" },
          { text: "여자", value: "FEMALE" },
        ],
      };
    },
    methods: {
      async userCreate() {
        const data = {
          loginId: this.loginId,
          name: this.name,
          email: this.email,
          password: this.password,
          sex: this.sex,
          phoneNumber: this.phoneNumber,
          birthday: this.birthday,
          nickName: this.nickName,
          address: this.address,
          streetAddress: this.streetAddress,
          detailAddress: this.detailAddress,
        };
        try {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/create`,
            data
          );
          alert("회원가입 완료!");
          this.$router.push("/");
        } catch (error) {
          alert("회원가입 실패: " + error.response?.data?.message || error);
        }
      },
    },
  };
  </script>
  