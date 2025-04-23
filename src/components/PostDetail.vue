<template>
  <v-container>
    <!-- 뒤로가기 헤더 -->
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 ml-3">게시글</span>
    </div>

    <!-- 게시물 상세 정보 -->
    <div class="post-detail mb-4">
      <!-- 프로필 정보와 날짜 -->
      <div class="d-flex align-center mb-2">
        <v-avatar size="40" class="mr-3">
          <v-img :src="post.profileImage || require('@/assets/default-profile.png')"></v-img>
        </v-avatar>
        <div>
          <div class="font-weight-bold">{{ post.nickName }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(post.createdTime) }}
            <span v-if="post.isUpdate === 'Y'" class="ml-2">(수정됨)</span>
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </div>

      <!-- 게시글 제목과 내용 -->
      <div class="text-h6 mb-3">{{ post.title }}</div>
      <div class="text-body-1 mb-4">{{ post.content }}</div>
      
      <!-- 이미지 표시 -->
      <v-row v-if="post.imageList && post.imageList.length > 0">
        <v-col v-for="(image, index) in post.imageList" :key="index" cols="12">
          <v-img :src="image" max-height="300" contain class="rounded"></v-img>
        </v-col>
      </v-row>

      <!-- 구분선 -->
      <v-divider class="my-3"></v-divider>

      <!-- 좋아요, 댓글 버튼 -->
      <div class="d-flex">
        <v-btn
          variant="text"
          :prepend-icon="post.isLike === 'Y' ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
          :color="post.isLike === 'Y' ? 'red' : ''"
          @click="toggleLike"
          class="flex-grow-1"
        >
          <span>좋아요</span>
        </v-btn>
        <v-btn 
          variant="text" 
          prepend-icon="mdi-comment-outline"
          class="flex-grow-1"
        >
          <span>댓글 달기</span>
        </v-btn>
      </div>

      <!-- 좋아요 카운트 -->
      <div class="d-flex align-center py-2 px-3">
        <div class="like-avatars mr-2" v-if="post.postLikeCount > 0">
          <!-- 실제로는 좋아요 누른 사용자 프로필 이미지가 필요하지만, 지금은 기본 이미지 사용 -->
          <div class="like-avatar-circle">
            <v-img src="@/assets/default-profile.png" width="20" height="20" class="rounded-circle"></v-img>
          </div>
        </div>
        <span class="text-body-2">
          <span v-if="post.postLikeCount > 0" class="like-count" @click="showLikesDialog">
            <strong>{{ post.postLikeCount }}명</strong>이 좋아합니다
          </span>
          <span v-else>
            제일 먼저 좋아요를 눌러주세요!
          </span>
        </span>
      </div>
    </div>

    <!-- 댓글 섹션 -->
    <div>
      <!-- 댓글 개수 표시 -->
      <div class="text-caption text-medium-emphasis mb-3">댓글 {{ commentList.length }}개</div>

      <!-- 댓글 목록 -->
      <div v-for="comment in commentList" :key="comment.commentId" class="mb-4">
        <div class="d-flex">
          <v-avatar size="36" class="mr-2">
            <v-img :src="comment.profileImage || require('@/assets/default-profile.png')"></v-img>
          </v-avatar>
          <div class="comment-bubble">
            <div class="font-weight-bold">{{ comment.nickName }}</div>
            <div v-if="editingComment !== comment.commentId">{{ comment.content }}</div>
            <v-textarea
              v-else
              v-model="editedCommentContent"
              rows="2"
              auto-grow
              variant="outlined"
              hide-details
              density="compact"
              class="mt-1"
            ></v-textarea>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ formatDate(comment.createdTime) }}
              <span v-if="comment.isUpdate === 'Y'" class="ml-2">(수정됨)</span>
            </div>
            <!-- 댓글 수정 버튼 -->
            <div v-if="editingComment === comment.commentId" class="d-flex justify-end mt-1">
              <v-btn 
                variant="text" 
                size="small" 
                color="primary" 
                @click="updateComment(comment.commentId)"
                :disabled="!editedCommentContent.trim()"
              >
                저장
              </v-btn>
              <v-btn variant="text" size="small" @click="cancelEdit">취소</v-btn>
            </div>
          </div>
          <v-spacer></v-spacer>
          <!-- 댓글 메뉴 (인스타그램 스타일) -->
          <v-btn 
            icon="mdi-dots-horizontal" 
            variant="text" 
            density="comfortable" 
            size="small"
            color="grey-darken-2"
            class="comment-menu-btn"
            @click="openCommentOptions(comment.commentId)"
          ></v-btn>
        </div>
        
        <!-- 좋아요, 답글 버튼 -->
        <div class="ml-12 d-flex">
          <v-btn
            variant="text"
            size="small"
            class="pa-0 mr-4"
            :color="comment.isLike === 'Y' ? 'red' : ''"
            @click="toggleCommentLike(comment)"
          >
            좋아요
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            class="pa-0"
            @click="startReply(comment)"
          >
            답글 달기
          </v-btn>
          
          <!-- 답글 보기/숨기기 버튼 (답글이 있을 경우만 표시) -->
          <v-btn
            v-if="comment.replies && comment.replies.length > 0"
            variant="text"
            size="small"
            class="pa-0 ml-4"
            @click="toggleReplies(comment.commentId)"
          >
            {{ expandedComments.has(comment.commentId) ? '답글 숨기기' : `답글 ${comment.replies.length}개 보기` }}
          </v-btn>
        </div>

        <!-- 대댓글 작성 -->
        <div v-if="replyingTo === comment.commentId" class="ml-12 mt-2">
          <v-textarea
            v-model="newReply"
            label="답글을 입력하세요"
            rows="2"
            auto-grow
            variant="outlined"
            hide-details
            density="compact"
          ></v-textarea>
          <div class="text-right mt-2">
            <v-btn color="primary" @click="submitReply" :disabled="!newReply.trim()">
              답글 작성
            </v-btn>
            <v-btn variant="text" @click="cancelReply">취소</v-btn>
          </div>
        </div>

        <!-- 대댓글 목록 -->
        <div v-if="comment.replies && comment.replies.length > 0 && expandedComments.has(comment.commentId)" class="ml-12 mt-2">
          <div 
            v-for="reply in getVisibleReplies(comment)" 
            :key="reply.commentId"
            class="d-flex mb-2"
          >
            <v-avatar size="32" class="mr-2">
              <v-img :src="reply.profileImage || require('@/assets/default-profile.png')"></v-img>
            </v-avatar>
            <div class="comment-bubble">
              <div class="font-weight-bold">{{ reply.nickName }}</div>
              <div v-if="editingComment !== reply.commentId">{{ reply.content }}</div>
              <v-textarea
                v-else
                v-model="editedCommentContent"
                rows="2"
                auto-grow
                variant="outlined"
                hide-details
                density="compact"
                class="mt-1"
              ></v-textarea>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ formatDate(reply.createdTime) }}
                <span v-if="reply.isUpdate === 'Y'" class="ml-2">(수정됨)</span>
              </div>
              <!-- 대댓글 수정 버튼 -->
              <div v-if="editingComment === reply.commentId" class="d-flex justify-end mt-1">
                <v-btn 
                  variant="text" 
                  size="small" 
                  color="primary" 
                  @click="updateComment(reply.commentId)"
                  :disabled="!editedCommentContent.trim()"
                >
                  저장
                </v-btn>
                <v-btn variant="text" size="small" @click="cancelEdit">취소</v-btn>
              </div>
            </div>
            <v-spacer></v-spacer>
            <!-- 대댓글 메뉴 (인스타그램 스타일) -->
            <v-btn 
              icon="mdi-dots-horizontal" 
              variant="text" 
              density="comfortable" 
              size="small"
              color="grey-darken-2"
              class="comment-menu-btn"
              @click="openCommentOptions(reply.commentId)"
            ></v-btn>
          </div>
          
          <!-- 더보기 버튼 -->
          <div v-if="hasMoreReplies(comment)" class="text-center mt-1">
            <v-btn
              variant="text"
              size="small"
              @click="showMoreReplies(comment)"
            >
              더보기
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 인스타그램 스타일 옵션 다이얼로그 -->
    <v-dialog v-model="optionsDialog" max-width="300" class="instagram-options-dialog">
      <v-card rounded="lg">
        <v-list density="compact">
          <v-list-item @click="editSelectedComment">
            <v-list-item-title class="text-center py-3">수정</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="confirmDeleteSelected" color="error">
            <v-list-item-title class="text-center text-red py-3">삭제</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="optionsDialog = false">
            <v-list-item-title class="text-center py-3">취소</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 좋아요 목록 다이얼로그 -->
    <v-dialog v-model="likesDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="text-h6">좋아요</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="likesDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <v-list>
            <!-- 좋아요 데이터가 있을 경우 표시 -->
            <div v-if="likes.length > 0">
              <v-list-item v-for="like in likes" :key="like.userId" class="py-2">
                <template v-slot:prepend>
                  <v-avatar size="40">
                    <v-img :src="like.profileImage || require('@/assets/default-profile.png')"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ like.nickName }}</v-list-item-title>
              </v-list-item>
            </div>
            <!-- 좋아요 데이터가 없을 경우 -->
            <div v-else class="py-5 text-center">
              <p class="text-body-1 text-medium-emphasis">좋아요 정보를 불러오는 중...</p>
            </div>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="300">
      <v-card>
        <v-card-title class="text-h6">댓글 삭제</v-card-title>
        <v-card-text>이 댓글을 정말 삭제하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteComment">삭제</v-btn>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 댓글 작성 입력창 -->
    <div class="comment-input">
      <div class="comment-input-container">
        <v-textarea
          v-model="newComment"
          placeholder="댓글을 달아주세요..."
          rows="1"
          auto-grow
          variant="plain"
          hide-details
          density="comfortable"
        ></v-textarea>
        <v-btn 
          color="primary" 
          @click="submitComment" 
          :disabled="!newComment.trim()"
          class="ml-2"
        >
          전송
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default {
  name: 'PostDetail',
  data() {
    return {
      post: {
        userId: null,
        nickName: '',
        title: '',
        profileImage: '',
        postId: null,
        imageList: [],
        content: '',
        postLikeCount: 0,
        createdTime: null,
        isUpdate: 'N',
        isLike: 'N'
      },
      commentList: [],
      newComment: '',
      newReply: '',
      replyingTo: null,
      loading: false,
      expandedComments: new Set(),
      visibleRepliesCount: {},
      // 댓글 수정/삭제 관련 데이터
      editingComment: null,
      editedCommentContent: '',
      deleteDialog: false,
      commentToDelete: null,
      // 인스타그램 스타일 옵션 다이얼로그
      optionsDialog: false,
      selectedCommentId: null,
      // 좋아요 관련 데이터
      likesDialog: false,
      likes: [],
      // 로그인한 사용자 정보
      loginId: localStorage.getItem('loginId')
    };
  },
  created() {
    this.fetchPostDetail();
  },
  methods: {
    async fetchPostDetail() {
      try {
        this.loading = true;
        const loginId = localStorage.getItem('loginId');
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/detail/${this.$route.params.postId}`,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        const result = response.data.result;
        this.post = {
          ...result,
          imageList: result.imageList || []
        };
        this.commentList = result.commentList || [];
      } catch (error) {
        console.error('게시물 상세 정보를 가져오는데 실패했습니다:', error);
        alert('게시물 상세 정보를 가져오는데 실패했습니다.');
      } finally {
        this.loading = false;
      }
    },
    async toggleLike() {
      try {
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/${this.post.postId}`,
          null,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        const result = response.data.result;
        this.post.isLike = result.liked ? 'Y' : 'N';
        this.post.postLikeCount = result.likeCount;
      } catch (error) {
        console.error('좋아요 처리 중 오류가 발생했습니다:', error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
      }
    },
    async submitComment() {
      try {
        const loginId = localStorage.getItem('loginId');
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/create`,
          {
            postId: this.$route.params.postId,
            voteId: null,
            content: this.newComment
          },
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        this.newComment = '';
        this.fetchPostDetail(); // 댓글 목록 새로고침
      } catch (error) {
        console.error('댓글 작성 중 오류가 발생했습니다:', error);
        alert('댓글 작성 중 오류가 발생했습니다.');
      }
    },
    async submitReply() {
      try {
        const loginId = localStorage.getItem('loginId');
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/reply`,
          {
            parentId: this.replyingTo,
            content: this.newReply
          },
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        this.newReply = '';
        this.replyingTo = null;
        this.fetchPostDetail(); // 댓글 목록 새로고침
      } catch (error) {
        console.error('답글 작성 중 오류가 발생했습니다:', error);
        alert('답글 작성 중 오류가 발생했습니다.');
      }
    },
    startReply(comment) {
      this.replyingTo = comment.commentId;
    },
    cancelReply() {
      this.replyingTo = null;
      this.newReply = '';
    },
    async toggleCommentLike(comment) {
      try {
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/like/${comment.commentId}`,
          null,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        const result = response.data.result;
        comment.isLike = result.liked ? 'Y' : 'N';
        comment.likeCount = result.likeCount;
      } catch (error) {
        console.error('댓글 좋아요 처리 중 오류가 발생했습니다:', error);
        alert('댓글 좋아요 처리 중 오류가 발생했습니다.');
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return format(date, 'M월 d일 a h:mm', { locale: ko });
      } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
      }
    },
    // 대댓글 표시/숨기기 토글
    toggleReplies(commentId) {
      if (this.expandedComments.has(commentId)) {
        this.expandedComments.delete(commentId);
        this.visibleRepliesCount[commentId] = 0;
      } else {
        this.expandedComments.add(commentId);
        this.visibleRepliesCount[commentId] = 5; // 초기에 5개만 표시
      }
    },
    
    // 대댓글 더 보기
    showMoreReplies(comment) {
      const currentVisible = this.visibleRepliesCount[comment.commentId] || 5;
      const totalReplies = comment.replies.length;
      this.visibleRepliesCount[comment.commentId] = Math.min(currentVisible + 5, totalReplies);
    },
    
    // 표시할 대댓글 목록 계산
    getVisibleReplies(comment) {
      if (!this.expandedComments.has(comment.commentId)) {
        return [];
      }
      
      const visibleCount = this.visibleRepliesCount[comment.commentId] || 5;
      return comment.replies.slice(0, visibleCount);
    },
    
    // 더 보기 버튼 표시 여부
    hasMoreReplies(comment) {
      const visibleCount = this.visibleRepliesCount[comment.commentId] || 5;
      return comment.replies.length > visibleCount;
    },

    // 인스타그램 스타일 댓글 옵션 열기
    openCommentOptions(commentId) {
      this.selectedCommentId = commentId;
      this.optionsDialog = true;
    },

    // 선택된 댓글 수정 시작
    editSelectedComment() {
      // 선택된 댓글 찾기
      const comment = this.findCommentById(this.selectedCommentId);
      if (comment) {
        this.startEditComment(comment);
      }
      this.optionsDialog = false;
    },

    // 선택된 댓글 삭제 확인
    confirmDeleteSelected() {
      this.commentToDelete = this.selectedCommentId;
      this.optionsDialog = false;
      this.deleteDialog = true;
    },

    // ID로 댓글 찾기 (댓글과 대댓글 모두 검색)
    findCommentById(commentId) {
      // 메인 댓글에서 검색
      let comment = this.commentList.find(c => c.commentId === commentId);
      if (comment) return comment;
      
      // 대댓글에서 검색
      for (const mainComment of this.commentList) {
        if (mainComment.replies && mainComment.replies.length > 0) {
          const reply = mainComment.replies.find(r => r.commentId === commentId);
          if (reply) return reply;
        }
      }
      return null;
    },

    // 댓글/대댓글 수정 시작
    startEditComment(comment) {
      this.editingComment = comment.commentId;
      this.editedCommentContent = comment.content;
    },

    // 댓글/대댓글 수정 취소
    cancelEdit() {
      this.editingComment = null;
      this.editedCommentContent = '';
    },

    // 댓글/대댓글 수정 저장
    async updateComment(commentId) {
      try {
        const loginId = localStorage.getItem('loginId');
        await axios.patch(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/update`,
          {
            commentId: commentId,
            content: this.editedCommentContent
          },
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        this.editingComment = null;
        this.editedCommentContent = '';
        this.fetchPostDetail(); // 댓글 목록 새로고침
      } catch (error) {
        console.error('댓글 수정 중 오류가 발생했습니다:', error);
        alert('댓글 수정 중 오류가 발생했습니다.');
      }
    },

    // 댓글/대댓글 삭제 실행
    async deleteComment() {
      try {
        const loginId = localStorage.getItem('loginId');
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/delete/${this.commentToDelete}`,
          null,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        this.deleteDialog = false;
        this.commentToDelete = null;
        this.fetchPostDetail(); // 댓글 목록 새로고침
      } catch (error) {
        console.error('댓글 삭제 중 오류가 발생했습니다:', error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      }
    },

    // 댓글 작성자 확인 (수정/삭제 권한)
    isCommentOwner(comment) {
      // 현재 로그인한 사용자가 댓글 작성자인지 확인
      console.log('Comment userId:', comment.userId, 'Current loginId:', this.loginId, 'Type loginId:', typeof this.loginId);
      // 개발 중에는 항상 true 반환 (모든 사용자가 모든 댓글 수정/삭제 가능)
      return true; 
      // 실제 운영 시에는 아래 코드로 교체
      // return this.loginId && comment.userId === parseInt(this.loginId);
    },

    // 좋아요 목록 다이얼로그 표시
    async showLikesDialog() {
      this.likesDialog = true;
      this.likes = [];
      
      try {
        // 실제 API가 있다면 여기서 좋아요 누른 사용자 목록을 가져옵니다
        // const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/users/${this.post.postId}`);
        // this.likes = response.data.result || [];
        
        // 현재는 더미 데이터로 대체
        setTimeout(() => {
          this.likes = [
            { userId: 1, nickName: '사용자1', profileImage: null },
            { userId: 2, nickName: '사용자2', profileImage: null },
            { userId: 3, nickName: '사용자3', profileImage: null }
          ];
        }, 500);
      } catch (error) {
        console.error('좋아요 목록을 가져오는데 실패했습니다:', error);
      }
    },
  }
};
</script>

<style scoped>
.post-detail {
  background-color: white;
  border-radius: 8px;
}

.comment-bubble {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 8px 12px;
  max-width: 80%;
}

.comment-input {
  width: 780px;
  position: fixed;
  bottom: 0;
  left: 50%;
  right: 0;
  transform: translateX(-50%);
  padding: 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #e0e0e0;
  z-index: 1;
}

.comment-input-container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: calc(100% - 32px);
  padding: 8px 16px;
  margin: 0 auto;
}

/* Container의 반응형 너비에 맞추기 위한 미디어 쿼리 */
@media (min-width: 1264px) {
  .comment-input-container {
    max-width: 1185px; /* Vuetify의 .container.v-container--fluid 너비 */
  }
}

@media (min-width: 960px) and (max-width: 1263px) {
  .comment-input-container {
    max-width: 900px; /* Vuetify의 .container.v-container--fluid 너비 */
  }
}

.v-container {
  padding-bottom: 64px;
}

/* 인스타그램 스타일 옵션 다이얼로그 */
:deep(.instagram-options-dialog .v-card) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.instagram-options-dialog .v-list-item) {
  min-height: 48px;
  cursor: pointer;
}

/* 메뉴 버튼 스타일 */
.comment-menu-btn {
  opacity: 0.7;
}
.comment-menu-btn:hover {
  opacity: 1;
}

/* 좋아요 표시 스타일 */
.like-count {
  color: #262626;
  font-weight: 500;
  cursor: pointer;
}
.like-count:hover {
  text-decoration: underline;
}

.like-avatars {
  display: flex;
  align-items: center;
}

.like-avatar-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid white;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.2);
}
</style> 