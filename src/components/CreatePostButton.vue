<template>
  <div class="create-post-wrapper">
    <div class="toggle-menu" :class="{ 'show-menu': showMenu }" v-if="showMenu">
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
      <div v-else-if="error" class="text-center error-text py-3">
        카테고리를 불러오는데 실패했습니다.
      </div>
      <div v-else class="menu-items">
        <v-btn
          v-for="category in categories"
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
    
    <!-- 작성 버튼 -->
    <v-btn
      icon="mdi-plus"
      color="primary"
      class="post_create_button"
      @click.stop="toggleMenu"
      elevation="4"
      :style="{ transform: showMenu ? 'rotate(45deg)' : 'none' }"
    ></v-btn>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CreatePostButton',
  props: {
    gatheringId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      showMenu: false,
      categories: [
        { type: 'FREE', label: '자유' },
        { type: 'NOTICE', label: '공지' },
        { type: 'POLL', label: '투표' }
      ],
      loading: false,
      error: false
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
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    closeMenu() {
      this.showMenu = false;
    },
    async fetchCategories() {
      try {
        this.loading = true;
        this.error = false;
        
        const loginId = localStorage.getItem('loginId');
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/init`,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        if (response.data && response.data.result) {
          this.categories = response.data.result.filter(category => 
            ['FREE', 'NOTICE', 'POLL'].includes(category.type)
          );
        }
      } catch (error) {
        console.error('카테고리 목록을 가져오는데 실패했습니다:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    createPost(type) {
      this.showMenu = false;
      if (type === 'FREE') {
        const path = this.gatheringId 
          ? `/silverpotion/post/create/free?gatheringId=${this.gatheringId}` 
          : '/silverpotion/post/create/free';
        this.$router.push(path);
      } else if (type === 'NOTICE') {
        const path = this.gatheringId 
          ? `/silverpotion/post/create/notice?gatheringId=${this.gatheringId}` 
          : '/silverpotion/post/create/notice';
        this.$router.push(path);
      } else if (type === 'POLL') {
        const path = this.gatheringId 
          ? `/silverpotion/post/create/vote?gatheringId=${this.gatheringId}` 
          : '/silverpotion/post/create/vote';
        this.$router.push(path);
      } else {
        const path = this.gatheringId 
          ? `/silverpotion/post/create/${type.toLowerCase()}?gatheringId=${this.gatheringId}` 
          : `/silverpotion/post/create/${type.toLowerCase()}`;
        this.$router.push(path);
      }
    }
  }
}
</script>

<style scoped>
.create-post-wrapper {
  position: relative;
  width: 100%;
  height: 0;
}

.post_create_button {
  position: fixed;
  bottom: 50px;
  right: 50px;
  z-index: 9999;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  transition: all 0.3s ease;
  width: 56px;
  height: 56px;
}

/* 웹 버전에서 콘텐츠 영역 내부에 버튼 위치시키기 */
@media (min-width: 769px) {
  .post_create_button {
    right: calc((100vw - 768px) / 2 + 50px);
  }
}

.post_create_button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
}

.toggle-menu {
  position: fixed;
  bottom: 120px;
  right: 50px;
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
    right: calc((100vw - 768px) / 2 + 50px);
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

.error-text {
  color: #f44336;
  font-size: 14px;
  padding: 8px 16px;
}

@media (max-width: 768px) {
  .post_create_button {
    bottom: 30px;
    right: 30px;
  }
  
  .toggle-menu {
    bottom: 100px;
    right: 30px;
  }
}
</style> 