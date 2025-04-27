<template>
  <div>
    <v-card 
      v-for="post in posts" 
      :key="post.postId" 
      class="mb-4" 
      @click="goToPostDetail(post.postId)"
    >
      <v-card-title>{{ post.title }}</v-card-title>
      <v-card-text>
        <div>{{ post.content }}</div>
        <div class="text-caption text-medium-emphasis mt-2">
          {{ post.nickName }} • {{ formatDate(post.createdTime) }}
        </div>
      </v-card-text>
    </v-card>
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
      loading: false
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
    }
  }
};
</script>

<style scoped>
.v-card {
  cursor: pointer;
}
</style> 