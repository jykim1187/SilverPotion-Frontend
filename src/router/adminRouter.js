import AdminDashboard from "@/views/admin/AdminDashboard.vue";
import ReportList from '@/views/admin/report/reportList.vue';
import ReportDetail from '@/views/admin/report/reportDetail.vue';
import AdminUserList from '@/views/admin/user/adminUserList.vue';
import AdminUserDetail from '@/views/admin/user/userDetail.vue';

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
        component: AdminUserList
    },
    // 관리자 - 유저 상세
    {
        path: '/silverpotion/admins/detail/:userId',
        name: 'UserDetail',
        component: AdminUserDetail
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