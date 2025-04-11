<template>
    <div>
        카카오 로그인 진행 중...
    </div>
</template>

<script>
import axios from 'axios';


export default{
    created(){
        const code = new URL(window.location.href).searchParams.get('code');
        console.log(code);
        this.sendCodeToServer(code);
    },
    methods: {
        async sendCodeToServer(code){
            const response = await axios.post("http://localhost:8080/user-service/silverpotion/user/kakao/login", {code});
            console.log(response);
            if(response.data.status_message === "need_sign_up"){
                const userData = response.data.result;
                //회원가입 화면 이동하면서 데이터 전달
                this.$router.push({
                    name: 'UserCreate',
                    query: {
                        loginId: userData.loginId,
                        email: userData.email,
                        name: userData.nickname
                    }
                });
            }else if(response.data.status_message === "success"){
                console.log(response);
                const token = response.data.result.token;
                const refreshToken = response.data.result.refreshToken;
                console.log(refreshToken);
                localStorage.setItem("token", token);
                if(refreshToken){
                    localStorage.setItem("refreshToken", refreshToken);
                }
                window.location.href = "/";   
            }
        
        }
    },
}
</script>