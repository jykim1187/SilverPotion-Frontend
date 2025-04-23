<template>
  <v-container fluid class="pa-0">
    <!-- Category Filter Buttons -->
    <v-sheet class="mb-4 pa-2 overflow-x-auto" style="white-space: nowrap;">
      <v-chip
        v-for="category in categories"
        :key="category.value"
        :color="selectedCategory === category.value ? 'primary' : 'grey-lighten-3'"
        class="mr-2"
        @click="selectCategory(category.value)"
        :disabled="loading" 
      >
        {{ category.text }}
      </v-chip>
    </v-sheet>

    <!-- Loading Indicator -->
    <div v-if="loading && posts.length === 0" class="text-center pa-5">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Post List -->
    <v-list v-else-if="posts.length > 0" class="pa-0 bg-transparent">
      <v-card
        v-for="(post, index) in filteredPosts" 
        :key="post.id + '-' + post.postCategory + '-' + index" 
        class="mb-3 pa-0" 
        flat 
        border
        @click="goToPostDetail(post)"
      >
        <v-list-item class="pa-3">
          <!-- Header: Avatar, Nickname, Time, Menu -->
          <template v-slot:prepend>
            <v-avatar size="36" class="mr-3">
              <!-- Always use default image -->
              <v-img :src="require('@/assets/default-gathering.png')"></v-img>
            </v-avatar>
          </template>

          <!-- Nickname is already displayed here -->
          <v-list-item-title class="font-weight-bold text-body-2">{{ post.nickname }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ formatRelativeDate(post.createdAt) }}</v-list-item-subtitle>

          <template v-slot:append>
            <v-btn icon variant="text" size="small">
              <v-icon>mdi-dots-vertical</v-icon>
              <!-- TODO: Add Menu for options like edit/delete -->
            </v-btn>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <!-- Content Section -->
        <div class="pa-3">
          <!-- VOTE TYPE -->
          <div v-if="post.postCategory === 'vote'">
            <div class="d-flex align-start mb-2">
              <v-icon class="mr-3 mt-1">mdi-checkbox-marked-outline</v-icon>
              <div class="flex-grow-1">
                <p class="font-weight-bold mb-1">{{ post.title }}</p>
                <p v-if="post.description" class="text-caption text-medium-emphasis mb-1">{{ post.description }}</p>
                <p v-if="post.multipleChoice !== null" class="text-caption text-medium-emphasis">
                  {{ post.multipleChoice ? '복수선택' : '단일선택' }}
                </p>
              </div>
            </div>
            <div>
              <v-chip size="x-small" label class="mt-2">{{ getCategoryText(post.postCategory) }}</v-chip>
              <div class="px-3 py-1">
                <v-btn 
                  variant="text" 
                  size="small" 
                  :prepend-icon="isPostLiked(getPostId(post), post.postCategory) ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
                  :color="isPostLiked(getPostId(post), post.postCategory) ? 'red' : ''"
                  @click.stop="toggleLike(post)"
                >
                  <span class="text-caption">좋아요 {{ getLikeCount(getPostId(post), post.postCategory) }}</span>
                </v-btn>
                <v-btn variant="text" size="small" prepend-icon="mdi-comment-outline">
                  <span class="text-caption">댓글 {{ post.commentCount || 0 }}</span>
                </v-btn>
              </div>
            </div>
             
          </div>

          <!-- POST TYPE (FREE, NOTICE, etc.) -->
          <div v-else>
            <p class="font-weight-bold mb-2">{{ post.title }}</p>
            <p class="text-body-2 mb-2 text-medium-emphasis content-preview">{{ post.content }}</p>
            <!-- Image Display -->
            <v-img 
              v-if="post.imageUrls && post.imageUrls.length > 0"
              :src="post.imageUrls[0]" 
              max-height="200"
              cover
              class="rounded mb-2"
            ></v-img>
             <!-- Category Chip -->
            <v-chip size="x-small" label class="mt-2">{{ getCategoryText(post.postCategory) }}</v-chip>
            <div class="px-3 py-1">
                <v-btn 
                  variant="text" 
                  size="small" 
                  :prepend-icon="isPostLiked(getPostId(post), post.postCategory) ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
                  :color="isPostLiked(getPostId(post), post.postCategory) ? 'red' : ''"
                  @click.stop="toggleLike(post)"
                >
                  <span class="text-caption">좋아요 {{ getLikeCount(getPostId(post), post.postCategory) }}</span>
                </v-btn>
                <v-btn variant="text" size="small" prepend-icon="mdi-comment-outline">
                  <span class="text-caption">댓글 {{ post.commentCount || 0 }}</span>
                </v-btn>
              </div>
          </div>
        </div>

        <!-- Footer: Likes & Comments (for non-votes) -->
        <div v-if="post.postCategory !== 'vote'">
          <v-divider></v-divider>
        </div>
        
      </v-card>
      
      <!-- Load More Button -->
      <div v-if="showLoadMoreButton" class="text-center my-4">
          <v-btn 
            @click="loadMorePosts"
            :loading="loading"
            variant="outlined"
            color="primary"
          >
            더보기
          </v-btn>
      </div>
    </v-list>

    <!-- No Posts Message -->
    <div v-else-if="!loading && posts.length === 0" class="text-center pa-5 grey lighten-4 rounded">
      <p>표시할 게시글이 없습니다.</p>
    </div>

    <!-- Floating Action Button to Create Post -->
    <v-btn
      icon="mdi-plus"
      color="primary"
      position="fixed"
      location="bottom right"
      class="ma-4"
      @click="goToCreatePost"
    ></v-btn>
  </v-container>
</template>

<script>
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const PAGE_SIZE = 5; // Match backend default or set desired size

export default {
  name: 'GatheringBoard',
  props: {
    gatheringId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      posts: [], 
      selectedCategory: 'all', // Default filter (lowercase)
      // Corrected categories to use lowercase values from backend enum
      categories: [
        { text: '전체', value: 'all' },
        { text: '공지', value: 'notice' },
        { text: '자유', value: 'free' },
        { text: '투표', value: 'vote' }, 
      ],
      // Pagination state
      currentPage: 0,
      totalPages: 0,
      pageSize: PAGE_SIZE,
      loading: false,
      likedPosts: new Set(), // Track liked posts
      loginId: localStorage.getItem('loginId') || '', // Get loginId from localStorage
    };
  },
  created() {
    // Load liked posts from localStorage
    const storedLikes = localStorage.getItem('likedPosts');
    if (storedLikes) {
      this.likedPosts = new Set(JSON.parse(storedLikes));
    }
  },
  computed: {
    filteredPosts() {

      if (this.selectedCategory === 'all') {
        return this.posts;
      }
      if (this.selectedCategory === 'vote') {
        // Assuming the main list endpoint includes votes, filter them here if 'vote' category is selected
        return this.posts.filter(post => post.postCategory === 'vote');
      }
       // Filter posts (non-votes) by their postCategory (lowercase)
      return this.posts.filter(post => post.postCategory !== 'vote' && post.postCategory === this.selectedCategory);
    },
    showLoadMoreButton() {
        // Show button if not loading and there are more pages
        return !this.loading && (this.currentPage < this.totalPages - 1);
    }
  },
  watch: {
    gatheringId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.resetAndFetchPosts(); // Reset and fetch when gatheringId changes
        }
      },
    },
  },
  methods: {

    getPostId(post) {
      if (post.postCategory === 'vote') {
        return post.votedId || post.id; // 투표: votedId (or id fallback)
      } else {
        return post.postId || post.id;  // 자유/공지: postId (or id fallback)
      }
    },

    resetAndFetchPosts() {
        this.posts = [];
        this.currentPage = 0;
        this.totalPages = 0;
        this.fetchPosts(false); // Fetch first page
    },
    async fetchPosts(loadMore = false) {
      if (!this.gatheringId || this.loading) return;
      
      this.loading = true;
      const pageToFetch = loadMore ? this.currentPage + 1 : 0;

      let apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/list`;
      if (this.selectedCategory === 'free') {
        apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/free/list`;
      } else if (this.selectedCategory === 'notice') {
        apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/notice/list`;
      } else if (this.selectedCategory === 'vote') {
        apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/list`;
      }

      const params = {
            page: pageToFetch,
            size: this.pageSize,
        };

      try {
         
        console.log(`Fetching posts: ${apiUrl} with params:`, params);

        const response = await axios.get(apiUrl, { params });
        const pageData = response.data.result; 

        if (pageData && pageData.content) {
            const newPosts = pageData.content;
            
            if (loadMore) {
                this.posts = [...this.posts, ...newPosts];
            } else {
                this.posts = newPosts;
            }
            this.totalPages = pageData.totalPages;
            this.currentPage = pageData.number; // Spring Page is 0-indexed
        } else {
             console.warn("Unexpected response structure:", response.data);
             if (!loadMore) {
                 this.posts = []; // Clear posts if structure is wrong on initial load
             }
        }
        
        // Sort posts by creation time, newest first (optional, backend might already sort)
        // this.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log('Fetched page:', this.currentPage + 1, 'Total pages:', this.totalPages);
        console.log('Current posts count:', this.posts.length);

      } catch (error) {
        console.error('게시글 목록을 가져오는데 실패했습니다:', error);
        // Optionally show an error message to the user
      } finally {
        this.loading = false;
      }
    },
    selectCategory(categoryValue) {
      if (this.selectedCategory === categoryValue || this.loading) return;
      
      this.selectedCategory = categoryValue;
      this.resetAndFetchPosts(); // Reset pagination and fetch first page for the new category
    },
    loadMorePosts() {
        this.fetchPosts(true); // Fetch next page
    },
    getCategoryText(categoryValue) {
        // Handle potential null or undefined categoryValue
        if (!categoryValue) return '미분류'; 
        
        // Corrected mapping to lowercase keys
        const categoryMap = {
            notice: '공지',
            free: '자유',
            vote: '투표' 

        };
        // Use lowercase for lookup
        return categoryMap[categoryValue.toLowerCase()] || categoryValue; 
    },
    formatRelativeDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return format(date, 'M월 d일 a h:mm', { locale: ko });
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    },
    goToPostDetail(post) {
      const postId = this.getPostId(post);
      console.log(`Navigate to detail for postCategory: ${post.postCategory}, ID: ${postId}`);
      if (post.postCategory === 'vote') {
         alert(`Vote Detail Page for ${post.id} (Not Implemented Yet)`);
         // this.$router.push(`/silverpotion/vote/${post.id}?gatheringId=${this.gatheringId}`);
      } else {
         alert(`Post Detail Page for ${post.id} (Not Implemented Yet)`);
         // this.$router.push(`/silverpotion/board/post/${post.id}?gatheringId=${this.gatheringId}`);
      }
    },
    goToCreatePost() {
    //   this.$router.push(`/silverpotion/post/create`);
    },
    async toggleLike(post) {
      if (!this.loginId) {
        alert('로그인이 필요합니다.');
        return;
      }

      try {
        const isVote = post.postCategory === 'vote';
        const postId = this.getPostId(post);
        
        console.log('게시물 객체:', post);
        console.log('게시물 ID:', postId);
        console.log('게시물 좋아요 시도:', postId);
        console.log('게시물 카테고리:', post.postCategory);
        console.log('현재 좋아요 상태:', this.isPostLiked(postId, post.postCategory));

        if (!postId) {
          console.error('게시물 ID가 없습니다:', post);
          return;
        }

        const endpoint = isVote 
          ? `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/like/${postId}`
          : `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/${postId}`;

        console.log('요청 URL:', endpoint);

        const response = await axios.post(
          endpoint,
          null,
          {
            headers: {
              'X-User-LoginId': this.loginId
            }
          }
        );

        console.log('서버 응답 전체:', response.data);
        
        // result 객체에서 데이터 추출
        const result = response.data.result;
        console.log('서버 응답 result:', result);
        
        const likeCount = result.likeCount;
        // liked 필드를 사용
        const isLiked = result.liked;
        
        console.log('처리된 응답 데이터:', { likeCount, isLiked });
        
        // 게시물 좋아요 수 업데이트
        post.likeCount = likeCount;
        post.isLike = isLiked ? 'Y' : 'N';
        
        // 좋아요 상태 업데이트
        const key = `${post.postCategory}_${postId}`;
        if (isLiked) {
          this.likedPosts.add(key);
          console.log('좋아요 추가됨:', key);
        } else {
          this.likedPosts.delete(key);
          console.log('좋아요 삭제됨:', key);
        }
        
        // localStorage에 저장할 배열 생성
        const likedPostsArray = Array.from(this.likedPosts);
        console.log('localStorage에 저장할 데이터:', likedPostsArray);
        
        // localStorage에 저장
        localStorage.setItem('likedPosts', JSON.stringify(likedPostsArray));
        
        
        // 저장된 데이터 확인
        const stored = localStorage.getItem('likedPosts');
        const parsed = JSON.parse(stored);
        console.log('localStorage 저장 확인:', parsed);
        
      } catch (error) {
        console.error('좋아요 처리 중 오류가 발생했습니다:', error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
      }
    },
    
    isPostLiked(postId, postCategory) {
      //localStorae 기반이 아니라 post객체 안의 islike 값으로 먼저 확인
      const post = this.posts.find(p => this.getPostId(p) === postId && p.postCategory === postCategory);
      if (post && (post.isLike === 'Y' || post.isLike === true)) {
        return true;
      }
      return this.likedPosts.has(`${postCategory}_${postId}`);
    },

    getLikeCount(postId, postCategory) {
      const post = this.posts.find(p => this.getPostId(p) === postId && p.postCategory === postCategory);
      return post && typeof post.likeCount === 'number' ? post.likeCount : 0;
    },
  },
};
</script>

<style scoped>
.overflow-x-auto {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

/* Hide scrollbar for cleaner look, but keep functionality */
.overflow-x-auto::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
.overflow-x-auto {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.bg-transparent {
    background-color: transparent !important;
}
.px-3 {
  position: relative;
  float: left;
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.content-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: calc(1.4em * 2);
}

:deep(.v-list-item__prepend) {
  align-self: flex-start;
  margin-top: 4px; 
}

</style> 