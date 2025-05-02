import AdminDashboard from "@/views/admin/AdminDashboard.vue";
import UserDetail from '@/views/admin/user/userDetail.vue';
import UserList from '@/views/admin/user/adminUserList.vue';
import ReportList from '@/views/admin/report/reportList.vue';
import ReportDetail from '@/views/admin/report/reportDetail.vue';

export const adminRouter = [

    {
        path: '/silverpotion/admins',
        name: 'AdminDashboard',
        component: AdminDashboard
    },
    // 관리자 - 유저 목록
    {
        path: '/silverpotion/admins/users',
        name: 'userList',
        component: UserList
    },
    // 관리자 - 유저 상세
    {
        path: '/silverpotion/admins/detail/:userId',
        name: 'UserDetail',
        component: UserDetail
    },
    // 관리자 - 신고 목록
    {
        path: '/silverpotion/admins/report/list',
        name: 'ReportList',
        component: ReportList
    },
    // 관리자 - 신고 상세
    {
        path: '/silverpotion/admins/report/detail/:reportId',
        name: 'ReportDetail',
        component: ReportDetail
    }
];