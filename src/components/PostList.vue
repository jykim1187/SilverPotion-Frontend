<template>
  <div>
    <v-card 
      v-for="post in posts" 
      :key="post.postId" 
      class="mb-4" 
    >
      <div class="d-flex align-center">
        <v-card-title class="flex-grow-1" @click="goToPostDetail(post.postId)">
          {{ post.title }}
          <v-chip v-if="post.isVote" size="small" color="primary" class="ml-2">투표</v-chip>
        </v-card-title>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn 
              icon 
              v-bind="props" 
              class="mr-2"
              variant="text"
              density="default"
              size="small"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="showReportDialog(post)" v-if="!isAuthor(post)">
              <v-list-item-title>
                <v-icon color="warning" size="small" class="mr-2">mdi-alert</v-icon>
                신고하기
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="deletePost(post)" v-if="isAuthor(post)">
              <v-list-item-title class="text-red">
                <v-icon color="error" size="small" class="mr-2">mdi-delete</v-icon>
                삭제하기
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <v-card-text @click="goToPostDetail(post.postId)">
        <div>{{ post.content }}</div>
        <div class="text-caption text-medium-emphasis mt-2">
          {{ post.nickName }} • {{ formatDate(post.createdTime) }}
        </div>
      </v-card-text>
    </v-card>

    <!-- 신고 다이얼로그 -->
    <v-dialog v-model="showReportDialog" max-width="400">
      <v-card>
        <v-card-title>신고</v-card-title>
        <v-card-text>
          <v-select
            v-model="reportSmallCategory"
            label="신고 사유 선택"
            :items="reportCategories"
            item-title="text"
            item-value="value"
            variant="outlined"
            required
            :rules="[v => !!v || '신고 사유를 선택해주세요']"
            class="mb-4"
          ></v-select>
          <v-textarea
            v-model="reportContent"
            label="상세 내용"
            hint="신고 사유에 대한 상세 내용을 작성해주세요."
            rows="4"
            variant="outlined"
            :rules="[v => !!v || '상세 내용을 입력해주세요']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showReportDialog = false">취소</v-btn>
          <v-btn color="error" variant="text" @click="submitReport">신고</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default {
  name: 'PostList',
  data() {
    return {
      posts: [],
      loading: false,
      userId: localStorage.getItem('userId'),
      showReportDialog: false,
      reportSmallCategory: '',
      reportContent: '',
      reportCategories: [
        { text: '성적행위', value: 'SEXUAL_CONTENT' },
        { text: '혐오발언', value: 'HATE_SPEECH' },
        { text: '사기', value: 'FRAUD' },
        { text: '폭력', value: 'VIOLENCE' },
        { text: '불법', value: 'ILLEGAL_ACT' },
        { text: '따돌림', value: 'BULLYING' }
      ],
      selectedPost: null
    };
  },
  created() {
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      try {
        this.loading = true;
        const loginId = localStorage.getItem('loginId');
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/list`,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        this.posts = response.data.result || [];
        console.log('게시물 목록:', this.posts);
      } catch (error) {
        console.error('게시글 목록을 가져오는데 실패했습니다:', error);
        alert('게시글 목록을 가져오는데 실패했습니다.');
      } finally {
        this.loading = false;
      }
    },
    goToPostDetail(postId) {
      this.$router.push(`/silverpotion/post/detail/${postId}`);
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
    isAuthor(post) {
      const loginId = localStorage.getItem('loginId');
      console.log('작성자 확인:', {
        currentLoginId: loginId,
        postLoginId: post.loginId,
        isAuthor: loginId === post.loginId
      });
      return loginId === post.loginId;
    },
    showReportDialog(post) {
      this.selectedPost = post;
      this.showReportDialog = true;
    },
    async submitReport() {
      if (!this.reportSmallCategory || !this.reportContent) {
        alert('신고 사유와 상세 내용을 모두 입력해주세요.');
        return;
      }

      try {
        const loginId = localStorage.getItem('loginId');
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/report/create`,
          {
            referenceId: this.selectedPost.postId,
            reportBigCategory: 'POST',
            reportSmallCategory: this.reportSmallCategory,
            content: this.reportContent,
            reportedId: this.selectedPost.writerId
          },
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        alert('신고가 접수되었습니다.');
        this.showReportDialog = false;
        this.reportSmallCategory = '';
        this.reportContent = '';
        this.selectedPost = null;
      } catch (error) {
        console.error('신고 처리 중 오류가 발생했습니다:', error);
        alert('신고 처리 중 오류가 발생했습니다.');
      }
    },
    async deletePost(post) {
      if (!confirm('이 게시물을 삭제하시겠습니까?')) {
        return;
      }

      try {
        const loginId = localStorage.getItem('loginId');
        const endpoint = post.isVote 
          ? `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/delete/${post.postId}`
          : `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/delete/${post.postId}`;

        await axios.post(
          endpoint,
          null,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        // 삭제 후 목록 새로고침
        this.fetchPosts();
        alert('게시물이 삭제되었습니다.');
      } catch (error) {
        console.error('게시물 삭제에 실패했습니다:', error);
        alert('게시물 삭제에 실패했습니다.');
      }
    }
  }
};
</script>

<style scoped>
.v-card {
  cursor: pointer;
}
</style> 