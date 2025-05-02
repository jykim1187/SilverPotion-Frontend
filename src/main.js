import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from '@/router/index.js'
import axios from 'axios';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@fortawesome/fontawesome-free/css/all.css'
import { useKakao } from 'vue3-kakao-maps/@utils';

useKakao('d71cbc8ba66037e7a51920d4429cfeb2');
const app = createApp(App);

axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if(token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error);
    }
)

axios.interceptors.response.use(
    response => response,
    async error => {
        if(error.response && error.response.status === 401 ) {
            try{
                const refreshToken = localStorage.getItem('refreshToken')
                localStorage.removeItem('token')
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/refresh-token`, {refreshToken})
                console.log(response)
                const token = response.data.result.token;
                localStorage.setItem('token', token)
                window.location.reload()
            } catch(e) {
                localStorage.clear()
                window.location.href = "/silverpotion/user/login"
            }
        }
        return Promise.reject(error)
    }
)

app.use(router);
app.use(vuetify);
app.mount('#app');
app.component('VueDatePicker', VueDatePicker);

