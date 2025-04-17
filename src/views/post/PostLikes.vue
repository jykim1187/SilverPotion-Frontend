<template>
  <div class="likes-list">
    <!-- 헤더 부분 -->
    <div class="detail-header">
      <div class="back-button" @click="goBack">
        <span class="mdi mdi-arrow-left"></span>
        <span class="header-title">좋아요</span>
      </div>
    </div>

    <!-- 좋아요 목록 -->
    <div class="likes-container">
      <div class="like-item" v-for="user in likeUsers" :key="user.id">
        <div class="user-info">
          <img :src="user.profileImage" class="profile-image" alt="프로필 이미지">
          <span class="nickname">{{ user.nickname }}</span>
        </div>
      </div>
      <div v-if="loading" class="loading">로딩 중...</div>
      <div v-if="!loading && likeUsers.length === 0" class="no-likes">
        좋아요를 누른 사용자가 없습니다.
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PostLikes',
  data() {
    return {
      likeUsers: [],
      loading: false
    };
  },
  created() {
    this.fetchLikeUsers();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchLikeUsers() {
      try {
        this.loading = true;
        const postId = this.$route.params.id;
        const loginId = localStorage.getItem('loginId');
        
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/${postId}/likes`,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        if (response.data && response.data.result) {
          this.likeUsers = response.data.result.map(user => ({
            ...user,
            profileImage: user.profileImage || require('@/assets/default-profile.png')
          }));
        }
      } catch (error) {
        console.error('좋아요 목록을 불러오는데 실패했습니다:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.likes-list {
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.detail-header {
  position: sticky;
  top: 0;
  background-color: #f5f5f5;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  z-index: 10;
  display: flex;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.back-button .mdi-arrow-left {
  font-size: 24px;
  margin-right: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.likes-container {
  background-color: white;
  padding: 16px;
}

.like-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.nickname {
  font-weight: 500;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.no-likes {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}
</style> 