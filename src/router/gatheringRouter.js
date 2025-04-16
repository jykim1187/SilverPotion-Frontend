import GatheringCreate from "@/views/gathering/GatheringCreate.vue";
import GatheringHome from "@/views/gathering/GatheringHome.vue";
import GatheringMain from "@/views/gathering/GatheringMain.vue";
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
    
]