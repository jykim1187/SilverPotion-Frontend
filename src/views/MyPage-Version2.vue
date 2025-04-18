<template>
  <div class="my-page-container">
    <div class="header">
      <h1>마이 페이지</h1>
    </div>
    
    <div class="card-grid">
      <!-- 섹션 1: 내 정보 카드 -->
      <div class="profile-card">
        <div class="card-header">
          <h2>내 정보</h2>
          <button class="edit-button" @click="goToEditProfile">
            <i class="icon-edit"></i>수정하기
          </button>
        </div>
        
        <div class="card-content">
          <div class="profile-image-container">
            <img src="@/assets/default-profile.png" alt="프로필 이미지" class="profile-image" />
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">이름</div>
              <div class="info-value">{{ userInfo.name }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">닉네임</div>
              <div class="info-value">{{ userInfo.nickname }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">성별</div>
              <div class="info-value">{{ userInfo.gender }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">생일</div>
              <div class="info-value">{{ userInfo.birthday }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">휴대폰</div>
              <div class="info-value">{{ userInfo.phone }}</div>
            </div>
            <div class="info-item wide">
              <div class="info-label">주소</div>
              <div class="info-value">{{ userInfo.address }}</div>
            </div>
            <div class="info-item wide">
              <div class="info-label">활동지역</div>
              <div class="info-value">{{ userInfo.activeArea }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 섹션 2: 보호자 목록 카드 -->
      <div class="connection-card">
        <div class="card-header">
          <h2>연결된 보호자</h2>
        </div>
        
        <div class="connection-avatars">
          <div v-for="guardian in guardians" :key="guardian.id" class="avatar-item">
            <div class="avatar-container">
              <img :src="guardian.profileImg" alt="보호자 프로필" class="avatar-image" />
            </div>
            <div class="avatar-name">{{ guardian.name }}</div>
          </div>
          
          <div v-if="guardians.length === 0" class="empty-notice">
            <i class="icon-empty"></i>
            <span>연결된 보호자가 없습니다</span>
          </div>
        </div>
      </div>
      
      <!-- 섹션 3: 피보호자 목록 카드 -->
      <div class="connection-card">
        <div class="card-header">
          <h2>연결된 피보호자</h2>
        </div>
        
        <div class="connection-avatars">
          <div v-for="ward in wards" :key="ward.id" class="avatar-item">
            <div class="avatar-container">
              <img :src="ward.profileImg" alt="피보호자 프로필" class="avatar-image" />
            </div>
            <div class="avatar-name">{{ ward.name }}</div>
          </div>
          
          <div v-if="wards.length === 0" class="empty-notice">
            <i class="icon-empty"></i>
            <span>연결된 피보호자가 없습니다</span>
          </div>
        </div>
      </div>
      
      <!-- 섹션 4: 힐링포션 카드 -->
      <div class="potion-card">
        <div class="card-header">
          <h2>힐링포션</h2>
        </div>
        
        <div class="potion-content">
          <div class="potion-info">
            <img src="@/assets/potion-icon.png" alt="힐링포션" class="potion-icon" />
            <div class="potion-count">
              <span class="count-number">{{ potionCount }}</span>
              <span class="count-label">개</span>
            </div>
          </div>
          
          <button class="charge-button" @click="goToCharge">
            <i class="icon-plus"></i>충전하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyPage',
  data() {
    return {
      userInfo: {
        name: '홍길동',
        gender: '남성',
        birthday: '1990-01-01',
        nickname: '실버왕',
        phone: '010-1234-5678',
        address: '서울특별시 강남구',
        activeArea: '서울 강남',
      },
      guardians: [
        { id: 1, name: '김보호', profileImg: '@/assets/guardian1.png' },
        { id: 2, name: '이돌봄', profileImg: '@/assets/guardian2.png' },
      ],
      wards: [
        { id: 1, name: '박피보', profileImg: '@/assets/ward1.png' },
      ],
      potionCount: 15
    }
  },
  methods: {
    goToEditProfile() {
      this.$router.push('/edit-profile');
    },
    goToCharge() {
      this.$router.push('/charge-potion');
    }
  }
}
</script>

<style scoped>
.my-page-container {
  max-width: 90%;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  font-size: 2rem;
  color: #333;
  position: relative;
  display: inline-block;
}

.header h1:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #8A2BE2;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* 모든 카드 공통 스타일 */
.profile-card, .connection-card, .potion-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.profile-card:hover, .connection-card:hover, .potion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.profile-card {
  grid-column: span 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f9f7ff;
  border-bottom: 1px solid #eee;
}

.card-header h2 {
  font-size: 1.4rem;
  color: #8A2BE2;
  margin: 0;
}

/* 프로필 카드 스타일 */
.card-content {
  padding: 20px;
  display: flex;
}

.profile-image-container {
  margin-right: 30px;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #8A2BE2;
  box-shadow: 0 5px 15px rgba(138, 43, 226, 0.3);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  flex: 1;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item.wide {
  grid-column: span 3;
}

.info-label {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 5px;
}

.info-value {
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

.edit-button {
  background-color: #8A2BE2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-button:hover {
  background-color: #7623c0;
}

.icon-edit {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 5px;
  background-color: white;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E");
}

/* 연결 카드 스타일 */
.connection-avatars {
  display: flex;
  flex-wrap: wrap;
  padding: 20px;
  gap: 20px;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #8A2BE2;
  transition: transform 0.3s;
}

.avatar-item:hover .avatar-image {
  transform: scale(1.05);
}

.avatar-name {
  font-size: 1rem;
  color: #333;
  text-align: center;
}

.empty-notice {
  width: 100%;
  text-align: center;
  padding: 20px;
  color: #888;
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-empty {
  display: block;
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
  opacity: 0.5;
  background-color: #888;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z'/%3E%3C/svg%3E");
}

/* 힐링포션 카드 스타일 */
.potion-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.potion-info {
  display: flex;
  align-items: center;
}

.potion-icon {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.2));
}

.potion-count {
  display: flex;
  align-items: baseline;
}

.count-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #8A2BE2;
  line-height: 1;
}

.count-label {
  font-size: 1.2rem;
  color: #666;
  margin-left: 5px;
}

.charge-button {
  background-color: #FF6B6B;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: bold;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s, background-color 0.3s;
}

.charge-button:hover {
  background-color: #ff5252;
  transform: scale(1.05);
}

.icon-plus {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 5px;
  background-color: white;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E");
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E");
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-card {
    grid-column: span 1;
  }
  
  .card-content {
    flex-direction: column;
    align-items: center;
  }
  
  .profile-image-container {
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
  }
  
  .info-item.wide {
    grid-column: span 2;
  }
}
</style>
</code_block_to_apply_changes_from>
</rewritten_file>