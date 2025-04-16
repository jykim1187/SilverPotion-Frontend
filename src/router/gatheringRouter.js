import GatheringCreate from "@/views/gathering/GatheringCreate.vue";
import GatheringHome from "@/views/gathering/GatheringHome.vue";
import GatheringMain from "@/views/gathering/GatheringMain.vue";
import GatheringManagement from "@/views/gathering/GatheringManagement.vue";
import GatheringSearch from "@/views/gathering/GatheringSearch.vue";
import GatheringUpdate from "@/views/gathering/GatheringUpdate.vue";
import MeetingCreate from "@/views/gathering/MeetingCreate.vue";
import MyGathering from "@/views/gathering/MyGathering.vue";
import RecommendGathering from "@/views/gathering/RecommendGathering.vue";
import RecommendMeeting from "@/views/gathering/RecommendMeeting.vue";

export const gatheringRouter= [
    {
        path:'/silverpotion/gathering/main',
        name:'GatheringMain',
        component: GatheringMain
    },
    {
        path:'/silverpotion/gathering/home/:gatheringId',
        name: 'GatheringHome',
        component: GatheringHome
    },
    {
        path:'/silverpotion/gathering/mygathering',
        name: 'MyGathering',
        component: MyGathering
    },
    {
        path:'/silverpotion/gathering/recommendGathering',
        name: 'RecommendGathering',
        component: RecommendGathering
    },
    {
        path:'/silverpotion/gathering/recommendMeeting',
        name: 'RecommendMeeting',
        component: RecommendMeeting
    },
    {
        path:'/silverpotion/gathering/create',
        name: 'GatheringCreate',
        component: GatheringCreate
    },
    {
        path:'/silverpotion/gathering/update/:gatheringId',
        name: 'GatheringUpdate',
        component: GatheringUpdate
    },
    {
        path:'/silverpotion/meeting/create',
        name: 'MeetingCreate',
        component: MeetingCreate
    },
    {
        path:'/silverpotion/gathering/management/:gatheringId',
        name: 'GatheringManagement',
        component: GatheringManagement
    },
    {
        path:'/silverpotion/gathering/search',
        name: 'GatheringSearch',
        component: GatheringSearch
    },
    
]