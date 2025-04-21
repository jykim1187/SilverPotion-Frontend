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
            <i :class="post.isLike ? 'mdi mdi-heart red-heart' : 'mdi mdi-heart-outline'"></i>
          </span>
          <span :class="{'red-text': post.isLike}">좋아요</span>
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
              <template v-if="comment.isEditing">
                <div class="comment-edit-container">
                  <input 
                    type="text" 
                    v-model="comment.editContent" 
                    class="comment-edit-input"
                    @keyup.enter="updateComment(comment)"
                  />
                  <div class="comment-edit-actions">
                    <button class="edit-cancel" @click="cancelEdit(comment)">취소</button>
                    <button class="edit-save" @click="updateComment(comment)">저장</button>
                  </div>
                </div>
              </template>
              <template v-else>
                <p class="comment-text" v-if="!comment.isDelete">{{ comment.content }}</p>
                <p class="comment-text deleted" v-else>삭제된 댓글입니다.</p>
                <div class="comment-actions" v-if="!comment.isDelete">
                  <button class="comment-like" @click="toggleCommentLike(comment)">
                    <span class="like-icon">
                      <i :class="comment.isLike ? 'mdi mdi-heart red-heart' : 'mdi mdi-heart-outline'"></i>
                    </span>
                    <span :class="{'red-text': comment.isLike}">좋아요 {{ comment.likeCount }}</span>
                  </button>
                  <button class="comment-reply" @click="setReplyTo(comment)">
                    <span>답글 달기</span>
                  </button>
                </div>
              </template>
            </div>
            <div class="comment-options-container">
              <button class="comment-options" @click="toggleCommentOptions(comment)">
                <span class="mdi mdi-dots-vertical"></span>
              </button>
              <div class="comment-options-menu" v-if="comment.showOptions">
                <button class="option-item edit" @click="startEdit(comment)">수정</button>
                <button class="option-item delete" @click="deleteComment(comment)">삭제</button>
              </div>
            </div>
          </div>
          <!-- 대댓글 입력 영역 -->
          <div class="reply-input-container" v-if="replyTo && replyTo.id === comment.id">
            <input 
              type="text" 
              v-model="replyContent" 
              class="reply-input"
              placeholder="답글을 입력하세요..."
              @keyup.enter="submitReply(comment)"
            />
            <div class="reply-actions">
              <button class="reply-cancel" @click="cancelReply">취소</button>
              <button class="reply-submit" @click="submitReply(comment)">답글</button>
            </div>
          </div>
          <!-- 대댓글 목록 -->
          <div class="replies-container" v-if="comment.replies && comment.replies.length > 0">
            <div class="reply" v-for="reply in visibleReplies(comment)" :key="reply.id">
              <div class="reply-author">
                <img :src="reply.profileImage" class="reply-profile-image" alt="프로필 이미지">
                <div class="reply-content">
                  <div class="reply-header">
                    <span class="reply-author-name">{{ reply.nickname }}</span>
                    <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
                    <div class="reply-options-container">
                      <button class="reply-options" @click="toggleReplyOptions(reply)">
                        <span class="mdi mdi-dots-vertical"></span>
                      </button>
                      <div class="reply-options-menu" v-if="reply.showOptions">
                        <button class="option-item edit" @click="startReplyEdit(reply)">수정</button>
                        <button class="option-item delete" @click="deleteReply(reply)">삭제</button>
                      </div>
                    </div>
                  </div>
                  <template v-if="reply.isEditing">
                    <div class="reply-edit-container">
                      <input 
                        type="text" 
                        v-model="reply.editContent" 
                        class="reply-edit-input"
                        @keyup.enter="updateReply(reply)"
                      />
                      <div class="reply-edit-actions">
                        <button class="edit-cancel" @click="cancelReplyEdit(reply)">취소</button>
                        <button class="edit-save" @click="updateReply(reply)">저장</button>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <p class="reply-text" v-if="!reply.isDelete">{{ reply.content }}</p>
                    <p class="reply-text deleted" v-else>삭제된 댓글입니다.</p>
                    <div class="reply-actions" v-if="!reply.isDelete">
                      <button class="reply-like" @click="toggleReplyLike(reply)">
                        <span class="like-icon">
                          <i :class="reply.isLike ? 'mdi mdi-heart red-heart' : 'mdi mdi-heart-outline'"></i>
                        </span>
                        <span :class="{'red-text': reply.isLike}">좋아요 {{ reply.likeCount }}</span>
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div class="show-more-replies" v-if="comment.replies.length > 5">
              <button class="show-more-button" @click="toggleShowMoreReplies(comment)">
                {{ comment.visibleReplyCount >= comment.replies.length ? '답글 숨기기' : `답글 ${Math.min(5, comment.replies.length - comment.visibleReplyCount)}개 더 보기` }}
              </button>
            </div>
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
import { toggleLike } from '@/utils/likeUtils';

export default {
  name: 'PostDetail',
  data() {
    return {
      post: null,
      comments: [],
      currentSlide: 0,
      newComment: '',
      replyTo: null,
      replyContent: '',
      loading: false
    };
  },
  created() {
    console.log('PostDetail 컴포넌트가 생성되었습니다.');
    console.log('라우트 파라미터 id:', this.$route.params.id);
    this.fetchPostDetail();
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
          
          // 기본 상태 - 서버에서 받은 좋아요 상태
          let isLike = false;
          if (postData.isLike === 'Y' || postData.isLike === 'y' || 
              postData.isLike === true || postData.isLike === 1) {
            isLike = true;
          }
          
          // 로컬 스토리지에서 좋아요 상태 가져오기
          const savedLikeState = localStorage.getItem(`like_state_${postId}`);
          if (savedLikeState) {
            // 로컬 스토리지 값이 있으면 그 값을 우선 사용
            isLike = savedLikeState === 'true';
          } else {
            // 없으면 서버에서 가져온 값을 로컬 스토리지에 저장
            localStorage.setItem(`like_state_${postId}`, isLike.toString());
          }
          
          this.post = {
            id: postData.postId,
            content: postData.content,
            nickname: postData.nickName,
            title: postData.title,
            createdAt: postData.createdTime,
            profileImage: postData.profileImage || require('@/assets/default-profile.png'),
            imageUrls: postData.imageList || [],
            isLike: isLike,
            likeCount: postData.postLikeCount || 0,
            commentCount: postData.commentList ? postData.commentList.length : 0,
            isUpdate: postData.isUpdate === 'Y'
          };
          
          // 댓글 목록 처리
          if (postData.commentList && postData.commentList.length > 0) {
            this.comments = postData.commentList.map(comment => {
              console.log('댓글 데이터:', comment);
              
              // 댓글 좋아요 상태와 카운트 로컬 스토리지에서 가져오기
              const commentLikeState = localStorage.getItem(`comment_like_${comment.commentId}`);
              const commentLikeCount = localStorage.getItem(`comment_like_count_${comment.commentId}`);
              const isCommentLiked = commentLikeState === 'true';
              const savedLikeCount = commentLikeCount ? parseInt(commentLikeCount) : null;
              
              // 대댓글 데이터 처리
              const replies = comment.replies ? comment.replies.map(reply => {
                // 대댓글 좋아요 상태와 카운트 로컬 스토리지에서 가져오기
                const replyLikeState = localStorage.getItem(`comment_like_${reply.commentId}`);
                const replyLikeCount = localStorage.getItem(`comment_like_count_${reply.commentId}`);
                const isReplyLiked = replyLikeState === 'true';
                const savedReplyLikeCount = replyLikeCount ? parseInt(replyLikeCount) : null;
                
                return {
                  id: reply.commentId,
                  content: reply.content,
                  nickname: reply.nickName,
                  createdAt: reply.createdTime,
                  profileImage: reply.profileImage || require('@/assets/default-profile.png'),
                  parentId: comment.commentId,
                  isLike: isReplyLiked,
                  likeCount: savedReplyLikeCount !== null ? savedReplyLikeCount : (reply.commentLikeCount || 0)
                };
              }) : [];
              
              return {
                id: comment.commentId,
                content: comment.content,
                nickname: comment.nickName,
                createdAt: comment.createdTime,
                profileImage: comment.profileImage || require('@/assets/default-profile.png'),
                isLike: isCommentLiked,
                likeCount: savedLikeCount !== null ? savedLikeCount : (comment.commentLikeCount || 0),
                replies: replies,
                visibleReplyCount: 0 // 초기 표시 개수를 0으로 변경
              };
            });
          } else {
            this.comments = [];
          }
        }
      } catch (error) {
        console.error('게시글을 불러오는데 실패했습니다:', error);
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      } finally {
        this.loading = false;
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
        const endpoint = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/${this.post.id}`;
        await toggleLike(this.post, endpoint);
      } catch (error) {
        // 에러는 이미 likeUtils에서 처리되었으므로 여기서는 추가적인 에러 처리가 필요한 경우에만 처리
        console.error('좋아요 처리 중 오류가 발생했습니다:', error);
      }
    },
    async toggleCommentLike(comment) {
      try {
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/like/${comment.id}`,
          {},
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        if (response.data && response.data.result) {
          const result = response.data.result;
          comment.isLike = result.isLike;
          comment.likeCount = result.count;
          // 로컬 스토리지에 좋아요 상태와 카운트 저장
          localStorage.setItem(`comment_like_${comment.id}`, result.isLike.toString());
          localStorage.setItem(`comment_like_count_${comment.id}`, result.count.toString());
          console.log('댓글 좋아요 응답:', result);
        }
      } catch (error) {
        console.error('댓글 좋아요 처리 중 오류가 발생했습니다:', error);
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      }
    },
    async toggleReplyLike(reply) {
      try {
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/like/${reply.id}`,
          {},
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        if (response.data && response.data.result) {
          const result = response.data.result;
          reply.isLike = result.isLike;
          reply.likeCount = result.count;
          // 로컬 스토리지에 좋아요 상태와 카운트 저장
          localStorage.setItem(`comment_like_${reply.id}`, result.isLike.toString());
          localStorage.setItem(`comment_like_count_${reply.id}`, result.count.toString());
          console.log('대댓글 좋아요 응답:', result);
        }
      } catch (error) {
        console.error('대댓글 좋아요 처리 중 오류가 발생했습니다:', error);
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      }
    },
    async submitComment() {
      if (!this.newComment.trim() || !this.post) return;
      
      try {
        const loginId = localStorage.getItem('loginId');
        const postId = this.post.id;
        
        const payload = {
          postId: postId,
          content: this.newComment.trim()
        };
        
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/create`,
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
            id: response.data.result,
            content: this.newComment.trim(),
            nickname: this.post.nickname, // 현재 사용자의 닉네임
            createdAt: new Date().toISOString(),
            profileImage: this.post.profileImage, // 현재 사용자의 프로필 이미지
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
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      }
    },
    setReplyTo(comment) {
      this.replyTo = comment;
      this.replyContent = '';
    },
    cancelReply() {
      this.replyTo = null;
      this.replyContent = '';
    },
    async submitReply(parentComment) {
      if (!this.replyContent.trim() || !this.replyTo) return;
      
      try {
        const loginId = localStorage.getItem('loginId');
        const payload = {
          parentId: parentComment.id,
          content: this.replyContent.trim()
        };
        
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/reply`,
          payload,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        if (response.data && response.data.result) {
          // 새 대댓글 추가
          const newReply = {
            id: response.data.result,
            content: this.replyContent.trim(),
            nickname: this.post.nickname, // 현재 사용자의 닉네임
            createdAt: new Date().toISOString(),
            profileImage: this.post.profileImage, // 현재 사용자의 프로필 이미지
            parentId: parentComment.id
          };
          
          // 대댓글 목록에 새 대댓글 추가
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.push(newReply);
          
          // 입력 필드 초기화
          this.replyContent = '';
          this.replyTo = null;
        }
      } catch (error) {
        console.error('대댓글 작성 중 오류가 발생했습니다:', error);
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      }
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
    },
    toggleCommentOptions(comment) {
      console.log('댓글 옵션 토글:', comment.id, comment);
      // 다른 댓글의 옵션 메뉴를 닫고 현재 댓글의 옵션 메뉴를 토글
      this.comments.forEach(c => {
        if (c.id !== comment.id) {
          c.showOptions = false;
        }
      });
      comment.showOptions = !comment.showOptions;
    },
    async deleteComment(comment) {
      if (!comment) return;
      
      console.log('댓글 삭제 시도:', comment.id, comment);
      
      try {
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/delete/${comment.id}`,
          {},
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        console.log('댓글 삭제 응답:', response.data);

        if (response.data && response.data.result) {
          comment.isDelete = true;
          comment.content = '삭제된 댓글입니다.';

          // 댓글 카운트 업데이트
          this.post.commentCount = this.comments.length;
          // 옵션 메뉴 닫기
          comment.showOptions = false;
        }
      } catch (error) {
        console.error('댓글 삭제 중 오류가 발생했습니다:', error);
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      }
    },
    startEdit(comment) {
      comment.isEditing = true;
      comment.editContent = comment.content;
      comment.showOptions = false;
    },
    cancelEdit(comment) {
      comment.isEditing = false;
      comment.editContent = '';
    },
    async updateComment(comment) {
      if (!comment.editContent.trim()) return;
      
      try {
        const loginId = localStorage.getItem('loginId');
        const payload = {
          commentId: comment.id,
          content: comment.editContent.trim()
        };
        
        const response = await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/update`,
          payload,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        if (response.data && response.data.result) {
          // 댓글 내용 업데이트
          comment.content = comment.editContent.trim();
          comment.isEditing = false;
          comment.editContent = '';
        }
      } catch (error) {
        console.error('댓글 수정 중 오류가 발생했습니다:', error);
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      }
    },
    toggleReplyOptions(reply) {
      console.log('대댓글 옵션 토글:', reply.id, reply);
      // 다른 대댓글의 옵션 메뉴를 닫고 현재 대댓글의 옵션 메뉴를 토글
      this.comments.forEach(comment => {
        if (comment.replies) {
          comment.replies.forEach(r => {
            if (r.id !== reply.id) {
              r.showOptions = false;
            }
          });
        }
      });
      reply.showOptions = !reply.showOptions;
    },
    async deleteReply(reply) {
      if (!reply) return;
      
      console.log('대댓글 삭제 시도:', reply.id, reply);
      
      try {
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/delete/${reply.id}`,
          {},
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        console.log('대댓글 삭제 응답:', response.data);

        if (response.data && response.data.result) {
          // 대댓글을 삭제 상태로 변경
          reply.isDelete = true;
          reply.content = '삭제된 댓글입니다.';
          // 옵션 메뉴 닫기
          reply.showOptions = false;
        }
      } catch (error) {
        console.error('대댓글 삭제 중 오류가 발생했습니다:', error);
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      }
    },
    startReplyEdit(reply) {
      reply.isEditing = true;
      reply.editContent = reply.content;
      reply.showOptions = false;
    },
    cancelReplyEdit(reply) {
      reply.isEditing = false;
      reply.editContent = '';
    },
    async updateReply(reply) {
      if (!reply.editContent.trim()) return;
      
      try {
        const loginId = localStorage.getItem('loginId');
        const payload = {
          commentId: reply.id,
          content: reply.editContent.trim()
        };
        
        const response = await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/update`,
          payload,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );

        if (response.data && response.data.result) {
          // 대댓글 내용 업데이트
          reply.content = reply.editContent.trim();
          reply.isEditing = false;
          reply.editContent = '';
        }
      } catch (error) {
        console.error('대댓글 수정 중 오류가 발생했습니다:', error);
        if (error.response) {
          console.error('에러 응답:', error.response.data);
          console.error('에러 상태:', error.response.status);
        }
      }
    },
    visibleReplies(comment) {
      return comment.replies.slice(0, comment.visibleReplyCount);
    },
    toggleShowMoreReplies(comment) {
      if (comment.visibleReplyCount >= comment.replies.length) {
        // 모든 대댓글이 표시된 상태에서 숨기기
        comment.visibleReplyCount = 0;
      } else {
        // 5개씩 더 보여주기
        comment.visibleReplyCount = Math.min(comment.visibleReplyCount + 5, comment.replies.length);
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

.red-heart {
  color: #e91e63 !important;
}

.red-text {
  color: #e91e63 !important;
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

.comment-options-container {
  position: relative;
}

.comment-options-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 120px;
}

.option-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.option-item.edit {
  color: #4d99fb;
}

.option-item.delete {
  color: #e91e63;
}

.option-item:hover {
  background-color: #f5f5f5;
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

.comment-edit-container {
  margin-top: 8px;
}

.comment-edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 8px;
}

.comment-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.edit-cancel, .edit-save {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.edit-cancel {
  background: none;
  border: 1px solid #ddd;
  color: #666;
}

.edit-save {
  background-color: #4d99fb;
  border: none;
  color: white;
}

.reply-input-container {
  margin: 8px 0 8px 60px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.replies-container {
  margin-left: 60px;
  margin-top: 8px;
  background-color: #fafafa;
  border-radius: 4px;
  padding: 8px;
}

.reply {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.reply:last-child {
  border-bottom: none;
}

.reply-author {
  display: flex;
  align-items: flex-start;
}

.reply-profile-image {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
  position: relative;
}

.reply-author-name {
  font-weight: 600;
  font-size: 13px;
  margin-right: 8px;
}

.reply-date {
  color: #999;
  font-size: 11px;
}

.reply-text {
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  color: #333;
}

.comment-actions, .reply-actions {
  display: flex;
  gap: 16px;
  margin-top: 4px;
}

.comment-like, .comment-reply, .reply-like {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #777;
  font-size: 12px;
  padding: 0;
  cursor: pointer;
}

.like-icon {
  font-size: 16px;
}

.red-heart {
  color: #e91e63 !important;
}

.red-text {
  color: #e91e63 !important;
}

.reply-options-container {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.reply-options-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 120px;
}

.reply-edit-container {
  margin-top: 8px;
}

.reply-edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 8px;
}

.reply-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.comment-text.deleted {
  color: #aaa;
  font-style: italic;
}

.show-more-replies {
  margin-top: 8px;
  padding: 0 16px;
  text-align: center;
}

.show-more-button {
  background: none;
  border: none;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.show-more-button:hover {
  color: #666;
  background-color: #f5f5f5;
}
</style> 