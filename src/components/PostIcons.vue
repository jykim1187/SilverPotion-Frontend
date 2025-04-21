<template>
  <div class="post-icons">
    <div class="icon-container">
      <button 
        class="action-button" 
        :class="{ 'liked': isLiked }"
        @click="toggleLike"
      >
        <span class="mdi" :class="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"></span>
      </button>
      <span class="count">{{ likeCount }}</span>
    </div>
    <div class="icon-container">
      <button class="action-button" @click="showComments">
        <span class="mdi mdi-comment-outline"></span>
      </button>
      <span class="count">{{ commentCount }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostIcons',
  props: {
    isLiked: {
      type: Boolean,
      default: false
    },
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    toggleLike() {
      this.$emit('toggle-like');
    },
    showComments() {
      this.$emit('show-comments');
    }
  }
}
</script>

<style scoped>
@import '@mdi/font/css/materialdesignicons.min.css';

.post-icons {
  display: flex;
  gap: 20px;
  padding: 10px 0;
}

.icon-container {
  display: flex;
  align-items: center;
  gap: 5px;
}

.action-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mdi {
  font-size: 24px;
  color: #333;
  transition: color 0.2s;
}

.action-button:hover .mdi {
  color: #1976d2;
}

.action-button.liked .mdi {
  color: #ff4081;
}

.count {
  font-size: 14px;
  color: #666;
}

@media (max-width: 430px) {
  .mdi {
    font-size: 20px;
  }
  
  .count {
    font-size: 12px;
  }
}
</style> 