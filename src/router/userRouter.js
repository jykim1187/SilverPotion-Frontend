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












]