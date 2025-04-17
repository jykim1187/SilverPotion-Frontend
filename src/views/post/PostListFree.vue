<template>
    <div class="post-list">
        <PostHeader />
        <div class="post-feed">
            <div v-for="post in posts" :key="post.id" class="post-card">
                <!-- 게시물 헤더 -->
                <div class="post-header">
                    <div class="user-info">
                        <img :src="post.profileImage" class="profile-image" alt="프로필 이미지">
                        <span class="nickname">{{ post.nickname }}</span>
                    </div>
                    <div class="post-date">{{ formatDate(post.createdAt) }}</div>
                </div>

                <!-- 게시물 이미지 -->
                <div class="post-images" v-if="post.imageUrls && post.imageUrls.length">
                    <div class="slider-container">
                        <div class="slider" :style="{ transform: `translateX(-${post.currentSlide * 100}%)` }">
                            <img v-for="(image, index) in post.imageUrls" 
                                :key="index" 
                                :src="image" 
                                alt="게시물 이미지">
                        </div>
                        <div class="slider-dots" v-if="post.imageUrls.length > 1">
                            <span v-for="(_, index) in post.imageUrls" 
                                :key="index" 
                                :class="['dot', { active: index === post.currentSlide }]"
                                @click="setSlide(post, index)"></span>
                        </div>
                        <button v-if="post.imageUrls.length > 1" 
                                class="slider-button prev" 
                                @click="prevSlide(post)">&lt;</button>
                        <button v-if="post.imageUrls.length > 1" 
                                class="slider-button next" 
                                @click="nextSlide(post)">&gt;</button>
                    </div>
                </div>
                
                <!-- 좋아요/댓글 아이콘 -->
                <div class="post-actions">
                    <!-- 좋아요 수와 댓글 수 -->
                    <div class="counts-section">
                        <div class="counts-row">
                            <p class="likes-count" @click="showLikeList(post.postId)">
                                좋아요 <strong>{{ post.likeCount }}</strong>개
                            </p>
                            <p class="comments-count" @click="goToPostDetail(post.postId)">
                                댓글 <strong>{{ post.commentCount }}</strong>개
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="post-actions-section">
                    <v-btn text @click="toggleLike(post)" class="post-action-button like-button">
                        <div class="action-content">
                            <i :class="post.isLike ? 'mdi mdi-heart red-heart' : 'mdi mdi-heart-outline'"></i>
                            <span :class="{'red-text': post.isLike}">좋아요 {{ post.likeCount }}</span>
                        </div>
                    </v-btn>
                    <v-btn text @click="goToPostDetail(post.postId)" class="post-action-button">
                        <div class="action-content">
                            <i class="mdi mdi-comment-outline"></i>
                            <span>댓글 {{ post.commentCount }}</span>
                        </div>
                    </v-btn>
                </div>
                
                <!-- 게시물 내용 -->
                <div class="post-content" v-if="post.content">
                    <div class="content-wrapper">
                        <div class="content-line">
                            <span class="content" :class="{ 'truncated': !post.showFullContent }">
                                {{ post.content }}
                            </span>
                            <button v-if="post.content && post.content.length > 30 && !post.showFullContent" 
                                    class="more-button"
                                    @click="showMore(post)">
                                ...더보기
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 게시물 액션 버튼 -->
                <div class="comments-section">
                    <button class="comments-count-button" @click="goToPostDetail(post.postId)" v-if="post.commentCount > 0">
                        댓글 {{ post.commentCount }}개 모두 보기
                    </button>
                </div>
            </div>
        </div>
        <div v-if="loading" class="loading">로딩 중...</div>
    </div>
</template>

<script>
import PostHeader from '@/components/PostHeader.vue';
import axios from 'axios';

export default {
    name: 'PostListFree',
    components: {
        PostHeader
    },
    data() {
        return {
            posts: [],
            page: 0,
            size: 5,
            loading: false
        }
    },
    created() {
        this.fetchPosts();
    },
    methods: {
        async fetchPosts() {
            try {
                this.loading = true;
                const loginId = localStorage.getItem('loginId');
                const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/free/list`;
                
                const response = await axios.get(
                    apiUrl,
                    {
                        params: {
                            page: this.page,
                            size: this.size
                        },
                        headers: {
                            'X-User-LoginId': loginId
                        }
                    }
                );
                
                this.posts = response.data.result.content.map(post => ({
                    ...post,
                    postId: post.id,
                    profileImage: post.profileImage && !isNaN(post.profileImage) 
                        ? require('@/assets/default-profile.png')
                        : post.profileImage || require('@/assets/default-profile.png'),
                    nickname: post.nickname || '익명',
                    createdAt: post.createdTime || post.createdAt || new Date().toISOString(),
                    imageUrls: post.imageUrls || [],
                    currentSlide: 0,
                    showFullContent: false,
                    newComment: '',
                    isLike: post.isLike === "Y",
                    likeCount: post.likeCount || 0,
                    commentCount: post.commentCount || 0
                }));
            } catch (error) {
                console.error('자유 게시물을 불러오는데 실패했습니다:', error);
                if (error.response) {
                    console.error('Error response:', error.response.data);
                }
            } finally {
                this.loading = false;
            }
        },
        formatDate(dateString) {
            if (!dateString) return '';
            
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                
                const now = new Date();
                const diff = now - date;
                
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                
                if (seconds < 60) return '방금';
                if (minutes < 60) return `${minutes}분`;
                if (hours < 24) return `${hours}시간`;
                if (days < 7) return `${days}일`;
                
                const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
                return `${months[date.getMonth()]} ${date.getDate()}일`;
            } catch (error) {
                console.error('날짜 포맷팅 중 오류 발생:', error);
                return '';
            }
        },
        async toggleLike(post) {
            try {
                if (!post || !post.postId) {
                    console.error('게시물 ID가 없습니다:', post);
                    return;
                }

                const loginId = localStorage.getItem('loginId');
                console.log('좋아요 요청 전:', {
                    postId: post.postId,
                    currentLikeCount: post.likeCount,
                    currentIsLike: post.isLike
                });

                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/${post.postId}`,
                    {},
                    {
                        headers: {
                            'X-User-LoginId': loginId
                        }
                    }
                );

                if (response.data && response.data.result) {
                    // 좋아요 상태와 개수를 즉시 업데이트
                    post.isLike = response.data.result.isLiked;
                    post.likeCount = response.data.result.likeCount;
                    
                    console.log('좋아요 응답:', response.data.result);
                    
                    // posts 배열에서 해당 게시물을 찾아 업데이트
                    const index = this.posts.findIndex(p => p.postId === post.postId);
                    if (index !== -1) {
                        this.posts[index] = {
                            ...this.posts[index],
                            isLike: response.data.result.isLiked,
                            likeCount: response.data.result.likeCount
                        };
                    }
                }
            } catch (error) {
                console.error('좋아요 처리 중 오류가 발생했습니다:', error);
                if (error.response) {
                    console.error('서버 응답:', error.response.data);
                }
            }
        },
        showMore(post) {
            post.showFullContent = true;
        },
        setSlide(post, index) {
            post.currentSlide = index;
        },
        prevSlide(post) {
            post.currentSlide = post.currentSlide > 0 ? post.currentSlide - 1 : post.imageUrls.length - 1;
        },
        nextSlide(post) {
            post.currentSlide = post.currentSlide < post.imageUrls.length - 1 ? post.currentSlide + 1 : 0;
        },
        goToPostDetail(postId) {
            this.$router.push(`/silverpotion/post/detail/${postId}`);
        },
        showLikeList(postId) {
            this.$router.push(`/silverpotion/post/${postId}/likes`);
        }
    }
}
</script>

<style scoped>
.post-list {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
    position: relative;
}

.post-feed {
    padding: 16px;
    padding-top: 0;
}

.post-card {
    background: white;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
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
    font-size: 14px;
}

.post-date {
    color: #666;
    font-size: 12px;
}

.post-images {
    position: relative;
    width: 100%;
    overflow: hidden;
}

.slider-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
}

.slider {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
}

.slider img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    flex-shrink: 0;
}

.slider-dots {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
}

.dot.active {
    background: white;
}

.slider-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slider-button.prev {
    left: 10px;
}

.slider-button.next {
    right: 10px;
}

.post-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
}

.post-action-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}

.action-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.red-heart {
    color: #e91e63 !important;
}

.red-text {
    color: #e91e63 !important;
}

.post-content {
    padding: 0 16px;
    margin-bottom: 8px;
}

.content-wrapper {
    font-size: 14px;
    line-height: 1.5;
}

.content {
    display: inline;
}

.content.truncated {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.more-button {
    color: #666;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 14px;
}

.comments-section {
    padding: 8px 16px;
    border-top: 1px solid #eee;
}

.comments-count-button {
    color: #666;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 14px;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

.content-text {
    white-space: pre-wrap;
    margin-bottom: 8px;
}

.counts-section {
    width: 100%;
    padding: 0;
}

.counts-row {
    display: flex;
    gap: 16px;
    margin-bottom: 10px;
}

.likes-count, .comments-count {
    font-size: 14px;
    color: #333;
    cursor: pointer;
    margin: 0;
}

.likes-count:hover, .comments-count:hover {
    text-decoration: underline;
}

.post-actions-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-top: 1px solid #eee;
}

@media (max-width: 430px) {
    .post-feed {
        padding: 8px;
    }
}
</style>