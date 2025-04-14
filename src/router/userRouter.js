import LoginPage from "@/views/LoginPage.vue";
import MainHome from "@/views/MainHome.vue";
import UserCreate from "@/views/UserCreate.vue";
import UserList from "@/views/UserList.vue";


export const userRouter =[
{
        path:'/',
        name: 'MainHome',
        component: MainHome
    },
    {
        path:'/user-service/silverpotion/user/create',
        name: 'UserCreate',
        component: UserCreate
    },
    {
        path:'/user-service/silverpotion/user/login',
        name: 'LoginPage',
        component: LoginPage
    },
    
    {
        path:'/user-service/silverpotion/user/list',
        name: 'UserList',
        component: UserList
    },












]