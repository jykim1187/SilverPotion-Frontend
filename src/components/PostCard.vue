<template>
    <div class="post-card">
        <div class="post-header">
            <div class="user-info">
                <img :src="post.profileImage || require('@/assets/default-profile.png')" class="profile-image" alt="프로필 이미지">
                <span class="nickname">{{ post.nickname }}</span>
            </div>
            <div class="post-date">{{ formatDate(post.createdAt) }}</div>
        </div>
        
        <div class="post-content">
            <div v-if="post.imageUrls && post.imageUrls.length > 0" class="post-images">
                <img 
                    v-for="(imageUrl, index) in post.imageUrls" 
                    :key="index"
                    :src="imageUrl" 
                    alt="게시물 이미지"
                    class="post-image"
                >
            </div>
            <div class="post-text">
                <span v-if="post.content.length > 100 && !showFullContent">
                    {{ post.content.substring(0, 100) }}...
                    <button class="show-more-btn" @click="showFullContent = true">더보기</button>
                </span>
                <span v-else>
                    {{ post.content }}
                    <button v-if="post.content.length > 100 && showFullContent" 
                            class="show-less-btn" 
                            @click="showFullContent = false">
                        접기
                    </button>
                </span>
            </div>
        </div>

        <!-- 좋아요와 댓글 아이콘 -->
        <PostIcons
          :is-liked="post.isLiked"
          :like-count="post.likeCount"
          :comment-count="post.commentCount"
          @toggle-like="toggleLike"
          @show-comments="focusComment"
        />

        <div class="comments-section">
            <div v-for="comment in post.comments" :key="comment.id" class="comment">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-text">{{ comment.content }}</span>
            </div>
            <div class="comment-input">
                <input 
                    type="text" 
                    v-model="newComment" 
                    placeholder="댓글 달기..."
                    @keyup.enter="addComment"
                    ref="commentInput"
                >
                <button 
                    class="post-button" 
                    :disabled="!newComment.trim()"
                    @click="addComment"
                >
                    게시
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import PostIcons from './PostIcons.vue';

export default {
    name: 'PostCard',
    components: {
        PostIcons
    },
    props: {
        post: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            newComment: '',
            showFullContent: false
        }
    },
    methods: {
        formatDate(date) {
            const d = new Date(date);
            const now = new Date();
            const diff = now - d;
            
            if (diff < 60000) return '방금 전';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
            if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;
            
            return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
        },
        async toggleLike() {
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
                
                const { likeCount, isLiked } = response.data.result;
                this.$emit('update:post', {
                    ...this.post,
                    likeCount,
                    isLiked
                });
            } catch (error) {
                console.error('좋아요 처리 중 오류가 발생했습니다:', error);
            }
        },
        focusComment() {
            this.$refs.commentInput.focus();
        },
        async addComment() {
            if (!this.newComment.trim()) return;
            
            try {
                const loginId = localStorage.getItem('loginId');
                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/${this.post.id}/comment`,
                    {
                        content: this.newComment
                    },
                    {
                        headers: {
                            'X-User-LoginId': loginId
                        }
                    }
                );
                
                this.$emit('update:post', {
                    ...this.post,
                    comments: response.data.result.comments
                });
                this.newComment = '';
            } catch (error) {
                console.error('댓글 작성 중 오류가 발생했습니다:', error);
            }
        }
    }
}
</script>

<style scoped>
.post-card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.profile-image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.nickname {
    font-weight: 600;
    color: #333;
}

.post-date {
    font-size: 12px;
    color: #666;
}

.post-content {
    margin-bottom: 16px;
}

.post-images {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
}

.post-image {
    width: 100%;
    border-radius: 8px;
    object-fit: cover;
}

.post-text {
    font-size: 14px;
    color: #333;
    line-height: 1.5;
    white-space: pre-line;
}

.show-more-btn,
.show-less-btn {
    background: none;
    border: none;
    color: #666;
    padding: 0;
    margin-left: 4px;
    cursor: pointer;
    font-size: 14px;
}

.show-more-btn:hover,
.show-less-btn:hover {
    color: #1976d2;
}

.post-actions {
    margin-bottom: 12px;
}

.action-buttons {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
}

.action-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 24px;
    color: #333;
    transition: color 0.2s;
}

.action-button:hover {
    color: #1976d2;
}

.action-button.liked {
    color: #ff4081;
}

.likes-count {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.comments-section {
    border-top: 1px solid #eee;
    padding-top: 12px;
}

.comment {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
}

.comment-author {
    font-weight: 600;
    color: #333;
}

.comment-text {
    color: #333;
}

.comment-input {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.comment-input input {
    flex: 1;
    border: none;
    padding: 8px;
    font-size: 14px;
    outline: none;
}

.post-button {
    background: none;
    border: none;
    color: #1976d2;
    font-weight: 600;
    cursor: pointer;
    padding: 8px;
}

.post-button:disabled {
    color: #ccc;
    cursor: not-allowed;
}

@media (max-width: 430px) {
    .post-card {
        padding: 12px;
        margin-bottom: 12px;
    }
    
    .action-button {
        font-size: 20px;
    }
    
    .comment-input input {
        font-size: 13px;
    }
    
    .post-images {
        gap: 6px;
    }
}
</style> 