<template>
    <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">구글 로그인 처리 중...</div>
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
            const response = await axios.post("http://localhost:8080/user-service/silverpotion/user/google/login", {code});
            console.log(response);
            if(response.data.status_message === "need_sign_up"){
                const userData = response.data.result;
                //회원가입 화면 이동하면서 데이터 전달
                this.$router.push({
                    name: 'UserCreate',
                    query: {
                        loginId: userData.loginId,
                        email: userData.email,
                        name: userData.name
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

<style scoped>
.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f8f9fa;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #4285F4; /* 구글 블루 */
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

.loading-text {
    font-size: 1.2rem;
    color: #333;
    font-weight: 500;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>