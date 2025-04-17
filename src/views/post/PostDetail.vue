<template>
  <div class="post-detail">
    <!-- 헤더 부분 -->
    <div class="detail-header">
      <div class="back-button" @click="goBack">
        <span class="mdi mdi-arrow-left"></span>
        <span class="header-title">게시글</span>
      </div>
      <div class="header-options">
        <button class="post-status" v-if="post && post.status">{{ post.status }}</button>
        <button class="options-button">
          <span class="mdi mdi-dots-vertical"></span>
        </button>
      </div>
    </div>

    <!-- 게시글 내용 -->
    <div class="post-container" v-if="post">
      <!-- 작성자 정보 -->
      <div class="author-info">
        <div class="author-profile">
          <img :src="post.profileImage" class="profile-image" alt="프로필 이미지">
          <div class="author-details">
            <div class="author-name">{{ post.nickname }}</div>
            <div class="post-date">{{ formatDate(post.createdAt) }}</div>
          </div>
        </div>
      </div>

      <!-- 게시글 내용 -->
      <div class="post-content">
        <p class="post-text">{{ post.content }}</p>
      </div>

      <!-- 이미지 슬라이더 -->
      <div class="post-images" v-if="post.imageUrls && post.imageUrls.length">
        <div class="slider-container">
          <div class="slider" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <img v-for="(image, index) in post.imageUrls" 
                 :key="index" 
                 :src="image" 
                 alt="게시물 이미지">
          </div>
          <div class="slider-dots" v-if="post.imageUrls.length > 1">
            <span v-for="(_, index) in post.imageUrls" 
                  :key="index" 
                  :class="['dot', { active: index === currentSlide }]"
                  @click="setSlide(index)"></span>
          </div>
          <button v-if="post.imageUrls.length > 1" 
                  class="slider-button prev" 
                  @click="prevSlide">&lt;</button>
          <button v-if="post.imageUrls.length > 1" 
                  class="slider-button next" 
                  @click="nextSlide">&gt;</button>
        </div>
      </div>

      <!-- 좋아요/댓글 버튼 -->
      <div class="action-buttons">
        <button class="action-button like-button" @click="toggleLike">
          <span class="action-icon">
            <span class="mdi" :class="post.isLike ? 'mdi-heart' : 'mdi-heart-outline'"></span>
          </span>
          <span class="action-text">좋아요</span>
        </button>
        <button class="action-button comment-button" @click="focusCommentInput">
          <span class="action-icon">
            <span class="mdi mdi-comment-outline"></span>
          </span>
          <span class="action-text">댓글 달기</span>
        </button>
      </div>

      <!-- 좋아요 정보 -->
      <div class="likes-info" v-if="post.likeCount > 0">
        <p class="likes-count" @click="showLikesList">
          좋아요 <strong>{{ post.likeCount }}</strong>개
        </p>
      </div>

      <!-- 댓글 목록 -->
      <div class="comments-container">
        <p class="comments-count" v-if="comments.length > 0">
          댓글 <strong>{{ comments.length }}</strong>개
        </p>
        <div class="comment" v-for="comment in comments" :key="comment.id">
          <div class="comment-author">
            <img :src="comment.profileImage" class="comment-profile-image" alt="프로필 이미지">
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author-name">{{ comment.nickname }}</span>
                <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-actions">
                <button class="comment-like" @click="toggleCommentLike(comment)">
                  <span>좋아요</span>
                </button>
                <button class="comment-reply" @click="setReplyTo(comment)">
                  <span>답글 달기</span>
                </button>
              </div>
            </div>
            <button class="comment-options">
              <span class="mdi mdi-dots-vertical"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 댓글 입력 영역 -->
    <div class="comment-input-container">
      <input 
        type="text" 
        ref="commentInput"
        v-model="newComment" 
        placeholder="댓글을 달아주세요..."
        class="comment-input"
      />
      <button 
        class="send-button" 
        :disabled="!newComment.trim()" 
        @click="submitComment"
      >
        전송
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PostDetail',
  data() {
    return {
      post: null,
      comments: [],
      currentSlide: 0,
      newComment: '',
      replyTo: null,
      loading: false
    };
  },
  created() {
    console.log('PostDetail 컴포넌트가 생성되었습니다.');
    console.log('라우트 파라미터 id:', this.$route.params.id);
    this.fetchPostDetail();
    this.fetchComments();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchPostDetail() {
      try {
        this.loading = true;
        const postId = this.$route.params.id;
        console.log('게시글 상세 조회 요청 시작, postId:', postId);
        
        if (!postId) {
          console.error('게시글 ID가 없습니다');
          return;
        }
        
        const loginId = localStorage.getItem('loginId');
        console.log('로그인 ID:', loginId);
        
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/detail/${postId}`;
        console.log('API URL:', apiUrl);
        
        const response = await axios.get(
          apiUrl,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        console.log('게시글 상세 조회 응답:', response.data);
        
        if (response.data && response.data.result) {
          const postData = response.data.result;
          this.post = {
            id: postData.postId,
            content: postData.content,
            nickname: postData.nickName,
            title: postData.title,
            createdAt: postData.createdTime,
            profileImage: postData.profileImage || require('@/assets/default-profile.png'),
            imageUrls: postData.imageList || [],
            isLike: postData.isLike === 'Y',
            likeCount: postData.postLikeCount || 0,
            commentCount: postData.commentList ? postData.commentList.length : 0,
            isUpdate: postData.isUpdate === 'Y'
          };
          
          // 백엔드에서 댓글 목록을 함께 반환하는 경우
          if (postData.commentList && postData.commentList.length > 0) {
            this.comments = postData.commentList.map(comment => ({
              id: comment.commentId,
              content: comment.content,
              nickname: comment.nickName,
              createdAt: comment.createdTime,
              profileImage: comment.profileImage || require('@/assets/default-profile.png'),
              isLike: comment.isLike === 'Y',
              likeCount: comment.commentLikeCount || 0
            }));
          } else {
            // 댓글이 없거나 별도 API 호출 필요한 경우 댓글 목록 초기화
            this.comments = [];
          }
        }
      } catch (error) {
        console.error('게시글을 불러오는데 실패했습니다:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchComments() {
      // 백엔드에서 댓글 목록을 함께 반환하는 경우 별도로 댓글을 조회할 필요 없음
      if (this.comments.length > 0) return;

      try {
        const postId = this.$route.params.id;
        const loginId = localStorage.getItem('loginId');
        
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/${postId}/comments`,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        if (response.data && response.data.result) {
          this.comments = response.data.result.map(comment => ({
            id: comment.commentId,
            content: comment.content,
            nickname: comment.nickName,
            createdAt: comment.createdTime,
            profileImage: comment.profileImage || require('@/assets/default-profile.png'),
            isLike: comment.isLike === 'Y',
            likeCount: comment.commentLikeCount || 0
          }));
        }
      } catch (error) {
        console.error('댓글을 불러오는데 실패했습니다:', error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        // YYYY년 MM월 DD일 HH:MM 형식으로 변환
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${month}월 ${day}일 오전${hours}:${minutes}`;
      } catch (error) {
        console.error('날짜 포맷팅 중 오류 발생:', error);
        return '';
      }
    },
    async toggleLike() {
      if (!this.post) return;
      
      try {
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/${this.post.id}`,
          {},
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        if (response.data && response.data.result) {
          this.post.isLike = response.data.result.isLiked === 'Y' || response.data.result.isLiked === true;
          this.post.likeCount = response.data.result.likeCount;
          console.log('좋아요 응답:', response.data.result);
        }
      } catch (error) {
        console.error('좋아요 처리 중 오류가 발생했습니다:', error);
      }
    },
    async toggleCommentLike(comment) {
      try {
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/comment/like/${comment.id}`,
          {},
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        if (response.data && response.data.result) {
          comment.isLike = response.data.result.isLiked === 'Y' || response.data.result.isLiked === true;
          comment.likeCount = response.data.result.likeCount;
          console.log('댓글 좋아요 응답:', response.data.result);
        }
      } catch (error) {
        console.error('댓글 좋아요 처리 중 오류가 발생했습니다:', error);
      }
    },
    async submitComment() {
      if (!this.newComment.trim() || !this.post) return;
      
      try {
        const loginId = localStorage.getItem('loginId');
        const postId = this.post.id;
        
        const payload = {
          content: this.newComment.trim(),
          parentId: this.replyTo ? this.replyTo.id : null
        };
        
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/${postId}/comment`,
          payload,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        if (response.data && response.data.result) {
          // 새 댓글 추가
          const newComment = {
            id: response.data.result.commentId,
            content: response.data.result.content,
            nickname: response.data.result.nickName || '익명',
            createdAt: response.data.result.createdTime || new Date().toISOString(),
            profileImage: response.data.result.profileImage || require('@/assets/default-profile.png'),
            isLike: false,
            likeCount: 0
          };
          
          // 댓글 목록에 새 댓글 추가
          this.comments.push(newComment);
          
          // 입력 필드 초기화
          this.newComment = '';
          this.replyTo = null;
          
          // 댓글 카운트 업데이트
          this.post.commentCount = this.comments.length;
        }
      } catch (error) {
        console.error('댓글 작성 중 오류가 발생했습니다:', error);
      }
    },
    setReplyTo(comment) {
      this.replyTo = comment;
      this.$refs.commentInput.focus();
    },
    focusCommentInput() {
      this.$refs.commentInput.focus();
    },
    setSlide(index) {
      this.currentSlide = index;
    },
    prevSlide() {
      this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : this.post.imageUrls.length - 1;
    },
    nextSlide() {
      this.currentSlide = this.currentSlide < this.post.imageUrls.length - 1 ? this.currentSlide + 1 : 0;
    },
    showLikesList() {
      if (this.post) {
        this.$router.push(`/silverpotion/post/${this.post.id}/likes`);
      }
    }
  }
};
</script>

<style scoped>
.post-detail {
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fff;
  position: relative;
  padding-bottom: 60px; /* 댓글 입력 영역 높이만큼 여백 */
}

.detail-header {
  position: sticky;
  top: 0;
  background-color: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.back-button .mdi-arrow-left {
  font-size: 24px;
  margin-right: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-status {
  background-color: #e3f2fd;
  color: #2196f3;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: none;
}

.options-button {
  background: none;
  border: none;
  color: #777;
  font-size: 20px;
  cursor: pointer;
}

.post-container {
  padding: 0;
}

.author-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.author-profile {
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

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  font-size: 15px;
}

.post-date {
  color: #777;
  font-size: 13px;
  margin-top: 2px;
}

.post-content {
  padding: 16px;
}

.post-text {
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
  margin: 0;
}

.post-images {
  width: 100%;
  margin-bottom: 8px;
}

.slider-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.slider {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.slider img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
}

.slider-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.dot.active {
  background: white;
}

.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-button.prev {
  left: 10px;
}

.slider-button.next {
  right: 10px;
}

.action-buttons {
  display: flex;
  padding: 0 16px;
  margin: 8px 0;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  font-size: 14px;
}

.action-icon {
  font-size: 24px;
}

.likes-info {
  padding: 0 16px;
  margin-bottom: 8px;
}

.likes-count {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin: 0;
  cursor: pointer;
}

.likes-count strong {
  font-weight: 600;
}

.comments-container {
  padding: 0 16px;
  margin-top: 16px;
  border-top: 1px solid #eee;
}

.comments-count {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin: 16px 0 12px 0;
}

.comments-count strong {
  font-weight: 600;
}

.comment {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-author {
  display: flex;
  align-items: flex-start;
}

.comment-profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.comment-author-name {
  font-weight: 600;
  font-size: 14px;
  margin-right: 8px;
}

.comment-date {
  color: #999;
  font-size: 12px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 6px;
  margin-top: 0;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-like, .comment-reply {
  background: none;
  border: none;
  color: #777;
  font-size: 12px;
  padding: 0;
  cursor: pointer;
}

.comment-options {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0 0 0 8px;
}

.comment-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  max-width: 768px;
  margin: 0 auto;
}

.comment-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
}

.send-button {
  background-color: #4d99fb;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style> 