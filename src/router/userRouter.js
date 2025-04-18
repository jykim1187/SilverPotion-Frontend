import LoginPage from "@/views/LoginPage.vue";
import MainHome from "@/views/MainHome.vue";
import UserCreate from "@/views/UserCreate.vue";
import UserList from "@/views/UserList.vue";
import HealthData from "@/components/HealthData.vue";
import HealthDataPage from "@/views/HealthDataPage.vue";
import BuyItem from "@/views/BuyItem.vue";
import VisualChat from "@/views/visualChat.vue";
import MyPage from "@/views/MyPage.vue";

export const userRouter =[
{
        path:'/',
        name: 'MainHome',
        component: MainHome
    },
    {
        path:'/silverpotion/user/create',
        name: 'UserCreate',
        component: UserCreate
    },
    {
        path:'/silverpotion/user/login',
        name: 'LoginPage',
        component: LoginPage
    },
    
    {
        path:'/silverpotion/user/list',
        name: 'UserList',
        component: UserList
    }, 
     {
        path:'/silverpotion/healthdata',
        name: 'HealthData',
        component: HealthData
    },
    {
        path:'/silverpotion/healthdatapage',
        name: 'HealthDataPage',
        component: HealthDataPage
    },
    // 힐링포션 구매  페이지
    {
        path:'/silverpotion/buyitem',
        name: 'BuyItem',
        component: BuyItem
    },
    // 화상통화 페이지
    {
        path:'/silverpotion/visualchat/:loginId',
        name: 'VisualChat',
        component: VisualChat
    },
    // 마이페이지
    {
        path:'/silverpotion/mypage',
        name: 'MyPage',
        component: MyPage
    },












]