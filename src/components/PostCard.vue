<template>
    <div class="post-card">
        <div class="post-header">
            <div class="user-info">
                <img 
                    :src="post.profileImage || require('@/assets/default-profile.png')" 
                    class="profile-image" 
                    alt="프로필 이미지"
                    @error="handleImageError"
                >
                <span class="nickname">{{ post.nickname }}</span>
            </div>
            <div class="post-date">{{ formatDate(post.createdAt) }}</div>
        </div>
        
        <div class="post-content">
            <div v-if="post.type === 'VOTE'" class="vote-content">
                <h3 class="vote-title">{{ post.title }}</h3>
                <p class="vote-description">{{ post.description }}</p>
                <div class="vote-options" v-if="post.voteOptions && post.voteOptions.length > 0">
                    <div v-for="(option, index) in post.voteOptions" :key="index" class="vote-option">
                        <input 
                            type="checkbox" 
                            v-if="post.multipleChoice"
                            :id="'option-' + post.votedId + '-' + index"
                            :value="option"
                            v-model="selectedOptions"
                        >
                        <input 
                            type="radio" 
                            v-else
                            :id="'option-' + post.votedId + '-' + index"
                            :value="option"
                            v-model="selectedOption"
                            :name="'vote-' + post.votedId"
                        >
                        <label :for="'option-' + post.votedId + '-' + index">{{ option }}</label>
                    </div>
                    <button 
                        class="vote-submit-btn" 
                        @click="submitVote"
                        :disabled="!canSubmitVote"
                    >
                        투표하기
                    </button>
                </div>
            </div>
            <div v-else class="post-text">
                <span v-if="post.content && post.content.length > 100 && !showFullContent">
                    {{ post.content.substring(0, 100) }}...
                    <button class="show-more-btn" @click="showFullContent = true">더보기</button>
                </span>
                <span v-else>
                    {{ post.content }}
                    <button v-if="post.content && post.content.length > 100 && showFullContent" 
                            class="show-less-btn" 
                            @click="showFullContent = false">
                        접기
                    </button>
                </span>
            </div>
        </div>

        <!-- 좋아요와 댓글 아이콘 -->
        <PostIcons
          :is-liked="post.isLike === 'Y'"
          :like-count="post.voteLikeCount"
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
            showFullContent: false,
            selectedOptions: [],
            selectedOption: null
        }
    },
    computed: {
        canSubmitVote() {
            if (this.post.multipleChoice) {
                return this.selectedOptions.length > 0;
            } else {
                return this.selectedOption !== null;
            }
        }
    },
    methods: {
        formatDate(date) {
            if (!date) return '';
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
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/${this.post.votedId}`,
                    {},
                    {
                        headers: {
                            'X-User-LoginId': loginId
                        }
                    }
                );
                
                const { voteLikeCount, isLike } = response.data.result;
                this.$emit('update:post', {
                    ...this.post,
                    voteLikeCount,
                    isLike
                });
            } catch (error) {
                console.error('좋아요 처리 중 오류가 발생했습니다:', error);
                alert('좋아요 처리 중 오류가 발생했습니다.');
            }
        },
        async submitVote() {
            try {
                const loginId = localStorage.getItem('loginId');
                const selectedVotes = this.post.multipleChoice ? this.selectedOptions : [this.selectedOption];
                
                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/${this.post.votedId}`,
                    {
                        voteOptions: selectedVotes
                    },
                    {
                        headers: {
                            'X-User-LoginId': loginId
                        }
                    }
                );
                
                // 투표 완료 후 상태 업데이트
                this.$emit('update:post', {
                    ...this.post,
                    ...response.data.result
                });
                
                // 선택 초기화
                this.selectedOptions = [];
                this.selectedOption = null;
                
                alert('투표가 완료되었습니다.');
            } catch (error) {
                console.error('투표 처리 중 오류가 발생했습니다:', error);
                alert('투표 처리 중 오류가 발생했습니다.');
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
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/${this.post.votedId}/comment`,
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
                alert('댓글 작성 중 오류가 발생했습니다.');
            }
        },
        handleImageError(event) {
            console.log('프로필 이미지 로드 실패:', event.target.src);
            event.target.src = require('@/assets/default-profile.png');
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
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #f0f0f0;
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

.vote-content {
    margin-bottom: 16px;
}

.vote-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}

.vote-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    line-height: 1.5;
}

.vote-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.vote-option {
    display: flex;
    align-items: center;
    gap: 8px;
}

.vote-option input[type="radio"],
.vote-option input[type="checkbox"] {
    width: 16px;
    height: 16px;
}

.vote-option label {
    font-size: 14px;
    color: #333;
    cursor: pointer;
}

.vote-submit-btn {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

.vote-submit-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.vote-submit-btn:hover:not(:disabled) {
    background-color: #1565c0;
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
    
    .vote-title {
        font-size: 16px;
    }
    
    .vote-description {
        font-size: 13px;
    }
    
    .vote-option label {
        font-size: 13px;
    }
    
    .vote-submit-btn {
        font-size: 13px;
        padding: 6px 12px;
    }
}
</style> 