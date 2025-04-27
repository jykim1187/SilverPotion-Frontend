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
    <v-list v-else-if="posts.length > 0" class="pa-0 bg-transparent post-list-wrapper">
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

          <!-- 메뉴 버튼 (점 세 개 아이콘) - 모든 게시물에 표시 -->
          <template v-slot:append>
            <v-btn 
              icon 
              variant="text" 
              size="small" 
              @click.stop="openPostMenu(post)"
            >
              <v-icon>mdi-dots-vertical</v-icon>
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

    <!-- Floating Action Button and Toggle Menu -->
    <div class="create-post-wrapper" v-if="!isVoteDetail">
      <div class="toggle-menu" :class="{ 'show-menu': showMenu }">
        <div class="menu-items">
          <v-btn
            v-for="category in postCategories"
            :key="category.type"
            @click.stop="createPost(category.type)"
            class="menu-item"
            color="primary"
            variant="text"
          >
            {{ category.label }}
          </v-btn>
        </div>
      </div>
      
      <v-btn
        icon="mdi-plus"
        color="primary"
        class="post_create_button"
        @click.stop="toggleMenu"
        :style="{ transform: showMenu ? 'rotate(45deg)' : 'none' }"
      ></v-btn>
    </div>

    <!-- 게시물 메뉴 다이얼로그 -->
    <v-dialog v-model="postMenuDialog" max-width="300" class="post-menu-dialog">
      <v-card rounded="lg">
        <v-list density="compact">
          <!-- 내 게시물일 경우에만 삭제 버튼 표시 -->
          <v-list-item v-if="selectedPost && isMyPost(selectedPost)" @click="confirmDeletePost">
            <v-list-item-title class="text-center text-red py-3">삭제</v-list-item-title>
          </v-list-item>
          <v-divider v-if="selectedPost && isMyPost(selectedPost)"></v-divider>
          
          <!-- 다른 메뉴 항목 추가 가능 -->
          <v-list-item @click="reportPost" v-if="selectedPost && !isMyPost(selectedPost)">
            <v-list-item-title class="text-center py-3">신고하기</v-list-item-title>
          </v-list-item>
          <v-divider v-if="selectedPost && !isMyPost(selectedPost)"></v-divider>
          
          <!-- 취소 버튼 -->
          <v-list-item @click="postMenuDialog = false">
            <v-list-item-title class="text-center py-3">취소</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteConfirmDialog" max-width="300">
      <v-card>
        <v-card-title class="text-h6">게시물 삭제</v-card-title>
        <v-card-text>
          <div v-if="selectedPost">
            <p><strong>유형:</strong> {{ getCategoryText(selectedPost.postCategory) }}</p>
            <p v-if="selectedPost.title"><strong>제목:</strong> {{ selectedPost.title }}</p>
            <p class="mt-3 font-weight-bold">이 게시물을 정말 삭제하시겠습니까?</p>
            <p class="text-caption text-grey mt-2">삭제한 게시물은 복구할 수 없습니다.</p>
          </div>
          <div v-else>
            이 게시물을 정말 삭제하시겠습니까?
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="deletePost">삭제</v-btn>
          <v-btn color="grey" variant="text" @click="deleteConfirmDialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      showMenu: false,
      postCategories: [
        { type: 'free', label: '자유' },
        { type: 'notice', label: '공지' },
        { type: 'vote', label: '투표' }
      ],
      postMenuDialog: false,
      deleteConfirmDialog: false,
      selectedPost: null,
      isVoteDetail: false, // 투표 상세 페이지 여부
    };
  },
  created() {
    // 현재 경로가 투표 상세 페이지인지 확인
    this.isVoteDetail = this.$route.path.includes('/silverpotion/post/vote/detail');
    
    // Load liked posts from localStorage
    const storedLikes = localStorage.getItem('likedPosts');
    if (storedLikes) {
      this.likedPosts = new Set(JSON.parse(storedLikes));
    }
    
    // 로그인 ID 확인
    this.loginId = localStorage.getItem('loginId') || '';
    console.log('컴포넌트 생성 시 로그인 ID:', this.loginId);
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
  mounted() {
    // 메뉴 외부 클릭 시 메뉴 닫기
    document.addEventListener('click', this.closeMenu);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu);
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
      console.log('post:', post);
      const postId = this.getPostId(post);
      console.log('getPostId(post):', postId);
      
      if (!postId) {
        console.error('postId가 존재하지 않습니다. post:', post);
        alert('잘못된 게시글 정보입니다.');
        return;
      }
      
      console.log(`Navigate to detail for postCategory: ${post.postCategory}, ID: ${postId}`);
      
      if (post.postCategory === 'vote') {
        this.$router.push(`/silverpotion/post/vote/detail/${postId}`);
      } else {
        this.$router.push(`/silverpotion/post/detail/${postId}`);
      }
    },
    goToCreatePost() {
      this.$router.push(`/silverpotion/post/create`);
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

    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    
    closeMenu(event) {
      // 메뉴가 열려있고, 클릭된 요소가 메뉴나 버튼이 아닌 경우에만 메뉴를 닫음
      if (this.showMenu && 
          !event.target.closest('.toggle-menu') && 
          !event.target.closest('.post_create_button')) {
        this.showMenu = false;
      }
    },
    
    createPost(type) {
      this.showMenu = false;
      if (type === 'free') {
        this.$router.push(`/silverpotion/post/create/free?gatheringId=${this.gatheringId}`);
      } else if (type === 'notice') {
        this.$router.push(`/silverpotion/post/create/notice?gatheringId=${this.gatheringId}`);
      } else if (type === 'vote') {
        this.$router.push(`/silverpotion/post/create/vote?gatheringId=${this.gatheringId}`);
      } else {
        this.$router.push(`/silverpotion/post/create/${type}?gatheringId=${this.gatheringId}`);
      }
    },

    // 게시물 메뉴 열기
    openPostMenu(post) {
      this.selectedPost = post;
      console.log('선택된 게시물:', post);
      console.log('로그인 ID:', this.loginId);
      console.log('작성자 확인 결과:', this.isPostAuthor(post));
      this.postMenuDialog = true;
    },
    
    // 게시물 작성자 확인 (본인 글만 삭제 가능)
    isPostAuthor(post) {
      if (!post) return false;
      
      console.log('게시물 구조:', {
        writerId: post.writerId,
        writer: post.writer,
        nickname: post.nickname,
        loginId: this.loginId
      });
      
      // 삭제를 실행할 때만 작성자 확인
      // 우선 삭제 버튼은 모든 게시물에 표시
      return true;
    },
    
    // 게시물 삭제 확인 다이얼로그 열기
    confirmDeletePost() {
      this.postMenuDialog = false;
      this.deleteConfirmDialog = true;
    },
    
    // 게시물 삭제 실행
    async deletePost() {
      if (!this.selectedPost) return;
      
      try {
        const postId = this.getPostId(this.selectedPost);
        const isVote = this.selectedPost.postCategory === 'vote';
        
        // 실제 삭제 실행 전에 작성자 확인
        if (!this.isAuthorizedToDelete(this.selectedPost)) {
          alert('본인이 작성한 게시물만 삭제할 수 있습니다.');
          this.deleteConfirmDialog = false;
          this.selectedPost = null;
          return;
        }
        
        let endpoint;
        if (isVote) {
          endpoint = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/delete/${postId}`;
        } else {
          endpoint = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/delete/${postId}`;
        }
        
        // 게시물 삭제 API 호출
        await axios.post(
          endpoint,
          null,
          {
            headers: {
              'X-User-LoginId': this.loginId
            }
          }
        );
        
        // 삭제 성공 시 목록에서 제거
        this.posts = this.posts.filter(p => this.getPostId(p) !== postId);
        
        this.deleteConfirmDialog = false;
        this.selectedPost = null;
        
        // 성공 메시지 표시
        alert('게시물이 삭제되었습니다.');
      } catch (error) {
        console.error('게시물 삭제 중 오류가 발생했습니다:', error);
        alert('게시물 삭제 중 오류가 발생했습니다.');
      }
    },
    
    // 실제 삭제 권한 확인 (API 호출 전)
    isAuthorizedToDelete(post) {
      if (!post || !this.loginId) {
        console.log('기본 체크 실패: post 없음 또는 로그인 안됨');
        return false;
      }
      
      console.log('삭제 권한 체크 중:', {
        post: post,
        loginId: this.loginId,
        저장된loginId: localStorage.getItem('loginId'),
        nickname: post.nickname,
        저장된nickname: localStorage.getItem('nickName')
      });
      
      // 다양한 경우의 작성자 ID를 확인
      const writerId = post.writerId || 
                      (post.writer && post.writer.loginId) ||
                      post.loginId;
      
      if (writerId) {
        console.log('작성자 ID 비교:', writerId, this.loginId, writerId === this.loginId);
        return writerId === this.loginId;
      }
      
      // writerId가 없는 경우 nickname 비교 시도
      if (post.nickname) {
        const userNickname = localStorage.getItem('nickName');
        console.log('닉네임 비교:', post.nickname, userNickname, post.nickname === userNickname);
        if (userNickname && post.nickname === userNickname) {
          return true;
        }
      }
      
      // 관리자 권한 확인 (임시로 주석 처리)
      // const isAdmin = localStorage.getItem('isAdmin') === 'true';
      
      // 테스트를 위해 임시로 모든 삭제 허용 (실제 운영 환경에서는 제거)
      return true;
    },

    // 자신의 게시물인지 확인
    isMyPost(post) {
      if (!post) {
        console.error('게시물이 없습니다');
        return false;
      }
      
      // 디버깅용 로그 추가
      console.log('게시물 정보:', {
        post: post,
        postNickname: post.nickname,
        localStorageNickname: localStorage.getItem('nickName'),
        loginId: this.loginId,
        writerId: post.writerId
      });
      
      // 1. 로그인 ID로 확인
      if (this.loginId && post.writerId) {
        console.log('로그인 ID 비교:', {
          로그인ID: this.loginId,
          작성자ID: post.writerId,
          일치여부: this.loginId === post.writerId
        });
        return this.loginId === post.writerId;
      }
      
      // 2. 닉네임으로 확인
      const userNickname = localStorage.getItem('nickName');
      if (post.nickname && userNickname) {
        console.log('닉네임 비교:', {
          게시물닉네임: post.nickname,
          사용자닉네임: userNickname,
          일치여부: post.nickname === userNickname
        });
        return post.nickname === userNickname;
      }
      
      console.warn('작성자 정보를 찾을 수 없습니다:', {
        postNickname: post.nickname,
        localStorageNickname: userNickname,
        loginId: this.loginId,
        writerId: post.writerId
      });
      return false;
    },

    // 게시물 신고 기능 (향후 구현)
    reportPost() {
      alert('신고 기능은 현재 개발 중입니다.');
      this.postMenuDialog = false;
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

.post-list-wrapper {
  position: relative; /* 부모 기준으로 위치 고정할 수 있도록 설정 */
  overflow: auto;
}

.create-post-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
}

.toggle-menu {
  position: fixed;
  bottom: 90px;
  right: 20px;
  z-index: 9998;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  pointer-events: none;
}

@media (min-width: 769px) {
  .toggle-menu {
    right: calc((100vw - 768px) / 2 + 20px);
  }
}

.show-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.menu-items {
  display: flex;
  flex-direction: column;
  padding: 8px;
  min-width: 120px;
}

.menu-item {
  margin: 4px 0;
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: rgba(25, 118, 210, 0.1);
}

.post_create_button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #1976D2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  font-size: 28px;
  z-index: 9999;
}

@media (min-width: 769px) {
  .post_create_button {
    right: calc((100vw - 768px) / 2 + 20px);
  }
}

.post_create_button:hover {
  background-color: #1565C0;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

:deep(.v-list-item__prepend) {
  align-self: flex-start;
  margin-top: 4px; 
}

</style> 