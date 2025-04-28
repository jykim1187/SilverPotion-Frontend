<template>
  <div class="split-container">
    <div class="logo-overlay">
      <!-- 로고 버전 간 전환을 위한 선택기 (이 부분을 언커멘트하여 활성화할 수 있습니다) -->
      <!-- <div class="logo-selector">
        <button @click="logoVersion = 1" :class="{'active': logoVersion === 1}">1</button>
        <button @click="logoVersion = 2" :class="{'active': logoVersion === 2}">2</button>
        <button @click="logoVersion = 3" :class="{'active': logoVersion === 3}">3</button>
        <button @click="logoVersion = 4" :class="{'active': logoVersion === 4}">4</button>
        <button @click="logoVersion = 5" :class="{'active': logoVersion === 5}">5</button>
      </div> -->

      <!-- 로고 버전 1: 가로형 심플 디자인 -->
      <div class="logo-modern logo-v1" v-show="logoVersion === 1">
        <div class="logo-icon">
          <v-icon size="36" color="#5E72E4">mdi-leaf</v-icon>
        </div>
        <div class="logo-text">
          <h1>실버포션</h1>
          <p>건강한 일상을 위한 동반자</p>
        </div>
      </div>

      <!-- 로고 버전 2: 세로형 미니멀 디자인 -->
      <div class="logo-modern logo-v2" v-show="logoVersion === 2">
        <div class="logo-icon">
          <v-icon size="42" color="#94DAFF">mdi-leaf</v-icon>
        </div>
        <div class="logo-text text-center">
          <h1>실버포션</h1>
          <div class="divider"></div>
          <p>건강한 일상을 위한 동반자</p>
        </div>
      </div>

      <!-- 로고 버전 3: 원형 모던 디자인 -->
      <div class="logo-modern logo-v3" v-show="logoVersion === 3">
        <div class="logo-icon-circle">
          <v-icon size="32" color="white">mdi-leaf</v-icon>
        </div>
        <div class="logo-text">
          <h1>실버포션</h1>
          <p>건강한 일상을 위한 동반자</p>
        </div>
      </div>

      <!-- 로고 버전 4: 타이포그래피 중심 디자인 -->
      <div class="logo-modern logo-v4">
        <h1 class="typography-logo">
          <span class="silver">Silver</span>
          <span class="potion">Potion</span>
          <v-icon class="leaf-icon" size="20" color="#8ED1FC">mdi-leaf</v-icon>
        </h1>
        <p>건강한 일상을 위한 동반자</p>
      </div>

      <!-- 로고 버전 5: 미니멀리즘 디자인 -->
      <div class="logo-modern logo-v5" v-show="logoVersion === 5 || !logoVersion">
        <div class="minimal-logo">
          <v-icon size="28" color="#FFB2B8">mdi-leaf</v-icon>
          <h1>실버포션</h1>
        </div>
        <div class="slogan-box">
          <p>건강한 일상을 위한 동반자</p>
        </div>
      </div>
    </div>

    <div 
      class="split-half health-side" 
      @mouseenter="showTooltip('health')" 
      @mouseleave="hideTooltip"
    >
      <div class="content-wrapper">
        <div class="icon-circle health-circle">
          <v-icon size="48" color="white">mdi-heart-pulse</v-icon>
        </div>
        <h2>건강</h2>
        <p>실시간 건강 모니터링 서비스</p>
        
        <!-- 버튼 스타일 선택기 -->
        <div v-if="showButtonStyles">
          <div class="button-style-selector">
            <span @click="buttonStyle = 1" :class="{'active': buttonStyle === 1}">스타일 1</span>
            <span @click="buttonStyle = 2" :class="{'active': buttonStyle === 2}">스타일 2</span>
            <span @click="buttonStyle = 3" :class="{'active': buttonStyle === 3}">스타일 3</span>
          </div>
        </div>
        
        <!-- 버튼 스타일 1: 기본 -->
        <router-link 
          v-if="buttonStyle === 1"
          to="/silverpotion/healthdatapage" 
          class="action-btn health-btn"
        >
          시작하기
          <v-icon right>mdi-arrow-right</v-icon>
        </router-link>
        
        <!-- 버튼 스타일 2: 텍스트 링크 -->
        <router-link 
          v-else-if="buttonStyle === 2"
          to="/silverpotion/healthdatapage" 
          class="text-link health-link"
        >
          <span>시작하기</span>
          <v-icon small>mdi-arrow-right</v-icon>
        </router-link>
        
        <!-- 버튼 스타일 3: 미니멀 -->
        <router-link 
          v-else
          to="/silverpotion/healthdatapage" 
          class="minimal-link health-minimal"
        >
          시작하기
        </router-link>
        
        <transition name="fade">
          <div class="side-tooltip" v-if="tooltips.health">
            건강기록을 실시간으로 보고싶다면?
          </div>
        </transition>
      </div>
    </div>

    <div 
      class="split-half gathering-side" 
      @mouseenter="showTooltip('gathering')" 
      @mouseleave="hideTooltip"
    >
      <div class="content-wrapper">
        <div class="icon-circle gathering-circle">
          <v-icon size="48" color="white">mdi-account-group</v-icon>
        </div>
        <h2>모임</h2>
        <p>다양한 취미 소모임 활동</p>
        
        <!-- 버튼 스타일 1: 기본 -->
        <router-link 
          v-if="buttonStyle === 1"
          to="/silverpotion/gathering/main" 
          class="action-btn gathering-btn"
        >
          참여하기
          <v-icon right>mdi-arrow-right</v-icon>
        </router-link>
        
        <!-- 버튼 스타일 2: 텍스트 링크 -->
        <router-link 
          v-else-if="buttonStyle === 2"
          to="/silverpotion/gathering/main" 
          class="text-link gathering-link"
        >
          <span>참여하기</span>
          <v-icon small>mdi-arrow-right</v-icon>
        </router-link>
        
        <!-- 버튼 스타일 3: 미니멀 -->
        <router-link 
          v-else
          to="/silverpotion/gathering/main" 
          class="minimal-link gathering-minimal"
        >
          참여하기
        </router-link>
        
        <transition name="fade">
          <div class="side-tooltip" v-if="tooltips.gathering">
           취미 같이 즐길 사람을 찾는다면?
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tooltips: {
        health: false,
        gathering: false
      },
      logoVersion: 4,  // 기본 로고 버전
      buttonStyle: 3,    // 기본 버튼 스타일
      showButtonStyles: false  // 버튼 스타일 선택기 표시 여부
    }
  },
  methods: {
    showTooltip(type) {
      this.tooltips[type] = true;
    },
    hideTooltip() {
      this.tooltips.health = false;
      this.tooltips.gathering = false;
    }
  }
}
</script>

<style scoped>
.split-container {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.logo-overlay {
  position: absolute;
  top: 30px;
  left: 0;
  width: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 로고 선택기 스타일 */
.logo-selector {
  display: flex;
  margin-bottom: 15px;
}

.logo-selector button {
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  width: 28px;
  height: 28px;
  margin: 0 4px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-selector button.active {
  background: white;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* 공통 로고 스타일 */
.logo-modern {
  display: flex;
  align-items: center;
}

/* 로고 버전 1: 가로형 심플 디자인 */
.logo-v1 {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
}

.logo-v1 .logo-icon {
  margin-right: 12px;
}

/* 로고 버전 2: 세로형 미니멀 디자인 */
.logo-v2 {
  flex-direction: column;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.logo-v2 .logo-icon {
  margin-bottom: 10px;
}

.logo-v2 .logo-text {
  text-align: center;
}

.logo-v2 .divider {
  width: 30px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.8);
  margin: 6px auto 8px;
}

/* 로고 버전 3: 원형 모던 디자인 */
.logo-v3 {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
}

.logo-icon-circle {
  width: 48px;
  height: 48px;
  background-color: #FF9AA2; /* 파스텔 핑크 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

/* 로고 버전 4: 타이포그래피 중심 디자인 */
.logo-v4 {
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
}

.typography-logo {
  font-size: 32px;
  line-height: 1;
  color: white;
  margin-bottom: 6px;
  position: relative;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.silver {
  font-weight: 300;
  color: #E9F8FF;
}

.potion {
  font-weight: 700;
  color: white;
}

.leaf-icon {
  position: absolute;
  top: 0;
  margin-left: 4px;
}

.logo-v4 p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

/* 로고 버전 5: 미니멀리즘 디자인 */
.logo-v5 {
  flex-direction: column;
  align-items: center;
}

.minimal-logo {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.minimal-logo h1 {
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 0 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.slogan-box {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  backdrop-filter: blur(2px);
}

.slogan-box p {
  color: white;
  font-size: 10px;
  margin: 0;
  font-weight: 400;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text h1 {
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.logo-text p {
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  margin: 4px 0 0;
  font-weight: 400;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.text-center {
  text-align: center;
}

.split-half {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
}

.split-half:hover {
  flex: 1.3;
}

/* .health-side {
  background: linear-gradient(45deg, rgba(142, 209, 252, 0.9), rgba(111, 186, 242, 0.95)), url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover;
} */

.health-side {
  background: linear-gradient(45deg, rgba(255, 178, 184, 0.5), rgba(255, 154, 162, 0.5)), url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover;;
}

/* .gathering-side {
  background: linear-gradient(45deg, rgba(255, 178, 184, 0.9), rgba(255, 154, 162, 0.95)), url('https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover;
} */

.gathering-side {
  background: linear-gradient(45deg, rgba(142, 209, 252, 0.5), rgba(111, 186, 242, 0.5)), url('https://images.unsplash.com/photo-1517292987719-0369a794ec0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover;
}

.content-wrapper {
  text-align: center;
  color: white;
  padding: 20px;
  max-width: 330px;
  position: relative;
}

.icon-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
}

.health-side:hover .icon-circle {
  transform: scale(1.1);
}

.gathering-side:hover .icon-circle {
  transform: scale(1.1);
}

.health-circle {
  background: rgba(255, 255, 255, 0.25);
}

.gathering-circle {
  background: rgba(255, 255, 255, 0.25);
}

.content-wrapper h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.content-wrapper p {
  font-size: 18px;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 버튼 스타일 선택기 */
.button-style-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.button-style-selector span {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 10px;
  margin: 0 5px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.button-style-selector span.active {
  background: white;
  color: #333;
}

/* 버튼 스타일 1: 기본 */
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background-color: white;
  margin-bottom: 50px;
}

.health-btn {
  color: #FF9AA2;
}

.gathering-btn {
  color: #6FBAF2;
}

.action-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

/* 버튼 스타일 2: 텍스트 링크 */
.text-link {
  display: inline-flex;
  align-items: center;
  color: white;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-bottom: 50px;
}

.text-link span {
  border-bottom: 2px solid white;
  padding-bottom: 3px;
  margin-right: 5px;
}

.text-link:hover {
  transform: translateY(-3px);
  opacity: 0.9;
}

/* 버튼 스타일 3: 미니멀 */
.minimal-link {
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 50px;
  display: inline-block;
}

.minimal-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -8px;
  left: 0;
  background-color: white;
  transform: scaleX(0.5);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.minimal-link:hover::after {
  transform: scaleX(1);
}

.minimal-link:hover {
  opacity: 0.9;
}

.side-tooltip {
  position: absolute;
  width: 120%;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
}

.side-tooltip::after {
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent rgba(255, 255, 255, 0.95) transparent;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .split-container {
    flex-direction: column;
  }
  
  .split-half {
    min-height: 50vh;
  }
  
  .split-half:hover {
    flex: 1;
  }
  
  .logo-overlay {
    top: 20px;
  }
  
  .icon-circle {
    width: 80px;
    height: 80px;
  }
  
  .content-wrapper h2 {
    font-size: 28px;
  }
  
  .content-wrapper p {
    font-size: 16px;
  }
  
  .typography-logo {
    font-size: 26px;
  }
  
  .action-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>