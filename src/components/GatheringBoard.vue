  <template>
    <v-container fluid class="pa-0">
      <!-- 헤더 -->
      <v-card flat class="header-card" color="#E8F1FD">
        <v-card-text class="d-flex align-center pa-2">
          <v-btn icon @click="$router.back()" class="mr-2" flat>
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">게시판</h1>
        </v-card-text>
      </v-card>

      <!-- 탭 메뉴 -->
      <div class="content-wrapper">
        <v-tabs 
          v-model="activeTab" 
          centered 
          grow 
          class="tab-container" 
          bg-color="#E8F1FD"
          color="primary"
        >
          <v-tab value="home" class="tab-item" color="primary">
            <span class="primary--text">홈</span>
          </v-tab>
          <v-tab value="board" class="tab-item" color="primary">
            <span class="primary--text">게시판</span>
          </v-tab>
          <v-tab value="chat" class="tab-item" color="primary">
            <span class="primary--text">채팅</span>
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="mt-12">
          <!-- 홈 탭 -->
          <v-window-item value="home">
            <router-view :gatheringId="gatheringId"></router-view>
          </v-window-item>

          <!-- 게시판 탭 -->
          <v-window-item value="board">
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
            <v-dialog v-model="postMenuDialog" max-width="300" :scrim="false">
              <v-card rounded="lg">
                <v-list density="compact" class="text-center">
                  <!-- 내 게시물일 경우에만 삭제 버튼 표시 -->
                  <v-list-item v-if="selectedPost && isMyPost(selectedPost)" @click="confirmDeletePost">
                    <v-list-item-title class="text-center text-red py-3">삭제</v-list-item-title>
                  </v-list-item>
                  <v-divider v-if="selectedPost && isMyPost(selectedPost)"></v-divider>
                  
                  <!-- 신고하기 버튼 -->
                  <v-list-item @click="openReportDialog" v-if="selectedPost && !isMyPost(selectedPost)">
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

            <!-- 게시물 신고 다이얼로그 -->
            <v-dialog v-model="showReportDialog" max-width="400">
              <v-card class="dialog-card">
                <v-card-title class="dialog-title">게시물 신고</v-card-title>
                <v-card-text class="dialog-content">
                  <v-select
                    v-model="reportSmallCategory"
                    label="신고 사유 선택"
                    :items="reportCategories"
                    item-title="text"
                    item-value="value"
                    variant="outlined"
                    required
                    :rules="[v => !!v || '신고 사유를 선택해주세요']"
                    class="mb-4 report-field"
                    rounded="lg"
                  ></v-select>
                  <v-textarea
                    v-model="reportContent"
                    label="상세 내용"
                    hint="신고 사유에 대한 상세 내용을 작성해주세요."
                    rows="4"
                    variant="outlined"
                    :rules="[v => !!v || '상세 내용을 입력해주세요']"
                    class="report-field"
                    rounded="lg"
                  ></v-textarea>
                </v-card-text>
                <v-card-actions class="dialog-actions">
                  <v-spacer></v-spacer>
                  <v-btn color="grey-darken-1" variant="text" @click="showReportDialog = false">취소</v-btn>
                  <v-btn color="error" variant="text" @click="submitReport">신고</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-window-item>

          <!-- 채팅 탭 -->
          <v-window-item value="chat">
            <div v-if="isGatheringMember">
              <v-card class="mt-4">
                <v-card-title class="text-center text-h6">
                  모임 채팅
                </v-card-title>
                <v-card-text>
                  <div class="chat-box">
                    <div 
                      v-for="(msg, index) in messages"
                      :key="index"
                      :class="['chat-message', msg.senderId === userId ? 'sent' : 'received' ]"
                    >
                      <template v-if="msg.senderId === userId">
                        <div class="message-content">
                          {{ msg.content }}
                          <span class="time" v-if="msg.createdAt">{{ formatTime(msg.createdAt) }}</span>
                        </div>
                      </template>
                      <template v-else>
                        <div class="message-content">
                          {{ msg.content }}
                          <span class="time" v-if="msg.createdAt">{{ formatTime(msg.createdAt) }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                  <v-text-field
                    v-model="newMessage"
                    label="메시지 입력"
                    @keyup.enter="sendMessage"
                  />
                  <v-btn color="primary" block @click="sendMessage">전송</v-btn>
                </v-card-text>
              </v-card>
            </div>
            <div v-else class="empty-container">
              <v-icon size="x-large" color="grey-lighten-1">mdi-account-alert</v-icon>
              <p class="mt-3 text-grey-darken-1">모임원만 이용 가능합니다.</p>
            </div>
          </v-window-item>
        </v-window>
      </div>
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
        activeTab: 'board', // 기본값을 'board'로 설정
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
      activeTab(newValue) {
        if (newValue === 'home') {
          this.$router.push(`/silverpotion/gathering/home/${this.gatheringId}`);
        }
      }
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
        if (!post) {
          return null;
        }

        // 투표 게시물인 경우
        if (post.postCategory?.toLowerCase() === 'vote') {
          const voteId = post.voteId || post.votedId || post.id;
          if (!voteId) {
            return null;
          }
          return voteId;
        }
        
        // 일반 게시물인 경우
        const postId = post.postId || post.id;
        if (!postId) {
          return null;
        }
        return postId;
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

        let apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/list/${this.gatheringId}`;
        if (this.selectedCategory === 'free') {
          apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/free/list/${this.gatheringId}`;
        } else if (this.selectedCategory === 'notice') {
          apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/notice/list/${this.gatheringId}`;
        } else if (this.selectedCategory === 'vote') {
          apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/list/${this.gatheringId}`;
        }

        const params = {
              page: pageToFetch,
              size: this.pageSize,
          };

        try {
          
          const response = await axios.get(apiUrl, { 
            params,
            headers: {
              'X-User-LoginId': this.loginId
            }
          });
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
              if (!loadMore) {
                  this.posts = []; // Clear posts if structure is wrong on initial load
              }
          }
          
        } catch (error) {
          alert('게시글 목록을 가져오는데 실패했습니다.');
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
              return dateString;
          }
      },
      goToPostDetail(post) {
        const postId = this.getPostId(post);
        
        if (!postId) {
          alert('잘못된 게시글 정보입니다.');
          return;
        }
        
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
          const postId = this.getPostId(post);
          if (!postId) {
            alert('잘못된 게시글입니다.');
            return;
          }

          // 투표 게시물인지 카테고리로 확인
          const isVote = post.postCategory?.toLowerCase() === 'vote';
          let response;
          
          if (isVote) {
            response = await axios.post(
              `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/like/${postId}`,
              null,
              { headers: { 'X-User-LoginId': this.loginId } }
            );
          } else {
            response = await axios.post(
              `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/${postId}`,
              null,
              { headers: { 'X-User-LoginId': this.loginId } }
            );
          }

          const result = response.data.result;
          post.likeCount = result.likeCount;
          post.isLike = result.liked ? 'Y' : 'N';

          // 좋아요 상태를 localStorage에 저장
          const key = `${post.postCategory}_${isVote ? 'VOTE' : 'POST'}_${postId}`;
          if (result.liked) {
            this.likedPosts.add(key);
          } else {
            this.likedPosts.delete(key);
          }
          localStorage.setItem('likedPosts', JSON.stringify(Array.from(this.likedPosts)));
        } catch (error) {
          alert('좋아요 처리 중 오류가 발생했습니다.');
        }
      },
      
      isPostLiked(postId, postCategory) {
        // 먼저 현재 게시물의 좋아요 상태 확인
        const post = this.posts.find(p => {
          const currentPostId = this.getPostId(p);
          return currentPostId === postId && 
                p.postCategory === postCategory && 
                p.postType === (postCategory === 'vote' ? 'VOTE' : 'POST');
        });
        
        if (post && (post.isLike === 'Y' || post.isLike === true)) {
          return true;
        }
        
        // localStorage의 likedPosts에서 확인
        const postType = postCategory === 'vote' ? 'VOTE' : 'POST';
        const key = `${postCategory}_${postType}_${postId}`;
        return this.likedPosts.has(key);
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
        this.postMenuDialog = true;
      },
      
      // 게시물 작성자 확인 (본인 글만 삭제 가능)
      isPostAuthor(post) {
        if (!post) return false;
        return this.isMyPost(post);
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
          alert('게시물 삭제 중 오류가 발생했습니다.');
        }
      },
      
      // 실제 삭제 권한 확인 (API 호출 전)
      isAuthorizedToDelete(post) {
        if (!post || !this.loginId) {
          return false;
        }
        return this.isMyPost(post);
      },

      // 자신의 게시물인지 확인
      isMyPost(post) {
        if (!post) {
          return false;
        }
        
        // 1. 로그인 ID로 확인 (writer.loginId 사용)
        if (this.loginId && post.writer?.loginId) {
          return this.loginId === post.writer.loginId;
        }
        
        // 2. 닉네임으로 확인
        const userNickname = localStorage.getItem('nickName');
        if (post.nickname && userNickname) {
          return post.nickname === userNickname;
        }
        
        return false;
      },

      // 게시물 신고 기능 (향후 구현)
      reportPost() {
        alert('신고 기능은 현재 개발 중입니다.');
        this.postMenuDialog = false;
      },

      // 신고 다이얼로그 열기
      openReportDialog() {
        this.postMenuDialog = false;
        this.showReportDialog = true;
      },
      
      // 신고 제출
      async submitReport() {
        if (!this.selectedPost || !this.loginId) return;
        
        try {
          const reportData = {
            referenceId: this.getPostId(this.selectedPost),
            reportBigCategory: 'POST', // 게시물에서 신고 시 자동으로 POST
            reportSmallCategory: this.reportSmallCategory,
            content: this.reportContent,
            reportedId: this.selectedPost.writerId
          };
          
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/report/create`,
            reportData,
            {
              headers: {
                'X-User-LoginId': this.loginId
              }
            }
          );
          
          if (response.status === 201) {
            alert('신고가 접수되었습니다.');
            this.showReportDialog = false;
            this.reportSmallCategory = '';
            this.reportContent = '';
            this.$router.push(`/silverpotion/gathering/home/${this.gatheringId}`); // 신고 성공 시 게시판 페이지로 이동
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            if (error.response.data.message === 'Self Report') {
              alert('자신의 게시물은 신고할 수 없습니다.');
            } else if (error.response.data.message === 'Duplicate Report') {
              alert('이미 신고한 게시물입니다.');
            } else {
              alert('신고 처리 중 오류가 발생했습니다.');
            }
          } else {
            alert('신고 처리 중 오류가 발생했습니다.');
          }
        }
      },
    },
  };
  </script>

  <style scoped>
  /* 헤더 스타일 */
  .header-card {
      position: fixed;
      top: 56px;
      left: 0;
      right: 0;
      z-index: 999;
      max-width: 768px;
      margin: 0 auto;
      width: 100%;
  }

  /* 콘텐츠 래퍼 */
  .content-wrapper {
      margin-top: 56px;
      padding-bottom: 16px;
  }

  /* 탭 스타일링 */
  .tab-container {
      background-color: white;
      position: sticky;
      top: 112px;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      overflow: hidden;
  }

  .tab-item {
      font-weight: 600;
      letter-spacing: 0.5px;
  }

  .primary--text {
      color: #1976d2 !important;
  }

  .v-tab--selected {
      font-weight: 700;
  }

  .v-tab--selected .primary--text {
      color: #1976d2 !important;
  }

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

  .post-menu-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    z-index: 9999;
  }

  /* 리스트 아이템 중앙 정렬을 위한 스타일 */
  :deep(.v-list-item) {
    justify-content: center !important;
  }

  :deep(.v-list-item__content) {
    justify-content: center !important;
  }

  /* 다이얼로그 위치 조정 */
  :deep(.v-dialog) {
    position: fixed !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }

  :deep(.v-overlay__content) {
    position: fixed !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }

  .dialog-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    z-index: 9999;
  }

  .dialog-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 16px;
  }

  .dialog-content {
    margin-bottom: 16px;
  }

  .report-field {
    margin-bottom: 16px;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  /* 채팅 관련 스타일 */
  .chat-box {
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chat-message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    word-wrap: break-word;
  }

  .sent {
    align-self: flex-end;
  }

  .received {
    align-self: flex-start;
  }

  .message-content {
    padding: 8px 12px;
    border-radius: 12px;
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }

  .sent .message-content {
    background-color: #e3f2fd;
    color: #1976d2;
    border-bottom-right-radius: 0;
  }

  .received .message-content {
    background-color: #f5f5f5;
    color: #333;
    border-bottom-left-radius: 0;
  }

  .time {
    font-size: 0.75rem;
    color: #888;
    display: inline-block;
    white-space: nowrap;
  }

  .empty-container {
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 32px;
    min-height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  </style> 