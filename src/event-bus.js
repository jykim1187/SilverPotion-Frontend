import mitt from 'mitt';

const emitter = mitt();
export default emitter;

//event-bus를 쓰는 이유

//로그인/로그아웃 시 Header의 isLogin이 자동으로 반응하고 버튼 바뀜.

//새로고침 없이 반응형 동작 가능!

//Vuex나 Pinia 안 쓰고도 간단한 상태 관리 가능.