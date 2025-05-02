import LoginPage from "@/views/LoginPage.vue";
import MainHome from "@/views/MainHome.vue";
import UserCreate from "@/views/UserCreate.vue";
import HealthData from "@/components/HealthData.vue";
import HealthDataPage from "@/views/HealthDataPage.vue";
import BuyItem from "@/views/BuyItem.vue";
import VisualChat from "@/views/visualChat.vue";
import MyPage from "@/views/MyPage.vue";
import MyPageUpdate from "@/views/MyPageUpdate.vue";
import UserInfoDetailAdd from "@/views/Health/UserInfoDetailAdd.vue";
import AdminPage from "@/views/admin/AdminDashboard.vue";
import UserDetail from '@/views/admin/user/userDetail.vue';
import UserList from '@/views/admin/user/adminUserList.vue';

export const userRouter = [
    {
        path: '/',
        name: 'MainHome',
        component: MainHome
    },
    {
        path: '/silverpotion/user/create',
        name: 'UserCreate',
        component: UserCreate
    },
    {
        path: '/silverpotion/user/login',
        name: 'LoginPage',
        component: LoginPage
    },
    {
        path: '/silverpotion/healthdata',
        name: 'HealthData',
        component: HealthData
    },
    {
        path: '/silverpotion/healthdatapage',
        name: 'HealthDataPage',
        component: HealthDataPage
    },
    {
        path: '/silverpotion/buyitem',
        name: 'BuyItem',
        component: BuyItem
    },
    {
        path: '/silverpotion/visualchat/:loginId',
        name: 'VisualChat',
        component: VisualChat
    },
    {
        path: '/silverpotion/mypage',
        name: 'MyPage',
        component: MyPage
    },
    {
        path: '/silverpotion/mypageupdate',
        name: 'MyPageUpdate',
        component: MyPageUpdate
    },
    {
        path: '/silverpotion/userhealthinfodetail',
        name: 'UserInfoDetailAdd',
        component: UserInfoDetailAdd
    },
    // 관리자 페이지
    {
        path: '/silverpotion/admin',
        name: 'AdminPage',
        component: AdminPage
    },
    // 관리자 - 유저 목록
    {
        path: '/silverpotion/admin/users',
        name: 'userList',
        component: UserList
    },
    // 관리자 - 유저 상세
    {
        path: '/silverpotion/admin/detail/:userId',
        name: 'UserDetail',
        component: UserDetail
    }
];