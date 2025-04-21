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
                <div class="post-images" v-if="post.type !== 'VOTE' && post.imageUrls && post.imageUrls.length">
                    <div class="slider-container">
                        <div class="slider" :style="{ transform: `translateX(-${post.currentSlide * 100}%)` }">
                            <img v-for="(image, index) in post.imageUrls" 
                                :key="index" 
                                :src="image" 
                                @click="goToPostDetail(post.postId)"
                                alt="게시물 이미지">
                        </div>
                        <div class="slider-dots" v-if="post.imageUrls.length > 1">
                            <span v-for="(_, index) in post.imageUrls" 
                                :key="index" 
                                :class="['dot', { active: index === post.currentSlide }]"
                                @click.stop="setSlide(post, index)"></span>
                        </div>
                        <button v-if="post.imageUrls.length > 1" 
                                class="slider-button prev" 
                                @click.stop="prevSlide(post)">&lt;</button>
                        <button v-if="post.imageUrls.length > 1" 
                                class="slider-button next" 
                                @click.stop="nextSlide(post)">&gt;</button>
                    </div>
                </div>
                
                <!-- 투표 게시물인 경우 -->
                <div v-if="post.type === 'VOTE'" class="vote-container">
                    <div class="vote-header">
                        <h3 class="vote-title">{{ post.title }}</h3>
                        <p class="vote-description">{{ post.description }}</p>
                    </div>
                    <div class="vote-options">
                        <div v-for="(option, index) in post.voteOptions" 
                             :key="index" 
                             class="vote-option"
                             @click="selectVoteOption(post, index)">
                            <div class="option-content">
                                <span class="option-text">{{ option }}</span>
                                <span class="option-count" v-if="post.voteCounts && post.voteCounts[index]">
                                    {{ post.voteCounts[index] }}명
                                </span>
                            </div>
                            <div class="option-progress" 
                                 :style="{ width: calculateProgress(post, index) + '%' }">
                            </div>
                        </div>
                    </div>
                    <div class="vote-info">
                        <span class="vote-count">{{ post.voteCount || 0 }}명 참여</span>
                        <span class="vote-multiple" v-if="post.multipleChoice">복수선택 가능</span>
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
                <div class="post-actions-section">
                  <button @click="toggleLike(post)" class="post-action-button like-button">
                    <div class="action-content">
                      <i :class="post.isLike ? 'mdi mdi-heart red-heart' : 'mdi mdi-heart-outline'"></i>
                      <span :class="{'red-text': post.isLike}">좋아요</span>
                    </div>
                  </button>
                  <button @click="goToPostDetail(post.postId)" class="post-action-button">
                    <div class="action-content">
                      <i class="mdi mdi-comment-outline"></i>
                      <span>댓글 달기</span>
                    </div>
                  </button>
                </div>

                <!-- 댓글 섹션 -->
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
import { toggleLike } from '@/utils/likeUtils';

export default {
    name: 'PostListAll',
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
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/list`,
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
                
                const postsData = response.data.result.content;
                
                // 포스트 데이터 처리
                this.posts = postsData.map(post => {
                    // PostID 설정
                    const postId = post.id;
                    
                    // 기본 상태 - 서버에서 받은 좋아요 상태
                    let isLike = false;
                    if (post.isLike === 'Y' || post.isLike === 'y' || 
                        post.isLike === true || post.isLike === 1) {
                        isLike = true;
                    }
                    
                    // 로컬 스토리지에서 좋아요 상태와 개수 가져오기
                    const savedLikeState = localStorage.getItem(`like_state_${postId}`);
                    const savedLikeCount = localStorage.getItem(`like_count_${postId}`);
                    
                    if (savedLikeState) {
                        // 로컬 스토리지 값이 있으면 그 값을 우선 사용
                        isLike = savedLikeState === 'true';
                    } else {
                        // 없으면 서버에서 가져온 값을 로컬 스토리지에 저장
                        localStorage.setItem(`like_state_${postId}`, isLike.toString());
                    }
                    
                    // 좋아요 개수 처리
                    let likeCount = post.likeCount || 0;
                    if (savedLikeCount) {
                        // 로컬 스토리지에 저장된 좋아요 개수가 있으면 사용
                        likeCount = parseInt(savedLikeCount, 10);
                    } else {
                        // 없으면 서버에서 가져온 값을 로컬 스토리지에 저장
                        localStorage.setItem(`like_count_${postId}`, likeCount.toString());
                    }
                    
                    // 프로필 이미지 처리
                    let profileImage = post.profileImage;
                    if (!profileImage || (profileImage && !isNaN(profileImage))) {
                        profileImage = require('@/assets/default-profile.png');
                    }
                    
                    return {
                        ...post,
                        postId,
                        voteId: post.voteId || postId,
                        profileImage,
                        nickname: post.nickname || '익명',
                        createdAt: post.createdTime || post.createdAt || new Date().toISOString(),
                        imageUrls: post.imageUrls || [],
                        currentSlide: 0,
                        showFullContent: false,
                        newComment: '',
                        isLike,
                        likeCount,
                        commentCount: post.commentCount || 0
                    };
                });
                
                console.log('게시물 데이터 로드 완료:', this.posts.length);
            } catch (error) {
                console.error('게시물을 불러오는데 실패했습니다:', error);
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
                let endpoint;
                if (post.type === 'VOTE') {
                    endpoint = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/like/${post.voteId}`;
                } else {
                    endpoint = `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/like/${post.postId}`;
                }
                await toggleLike(post, endpoint);
            } catch (error) {
                console.error('좋아요 처리 중 오류가 발생했습니다:', error);
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
        async addComment(post) {
            if (!post.newComment.trim()) return;
            
            try {
                const loginId = localStorage.getItem('loginId');
                const response = await axios.post(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/${post.postId}/comment`,
                    {
                        content: post.newComment
                    },
                    {
                        headers: {
                            'X-User-LoginId': loginId
                        }
                    }
                );
                
                post.commentCount = response.data.result.commentCount;
                post.newComment = '';
            } catch (error) {
                console.error('댓글 작성 중 오류가 발생했습니다:', error);
            }
        },
        goToPostDetail(postId) {
            console.log('상세 페이지로 이동, 게시글 ID:', postId);
            if (!postId) {
                console.error('게시글 ID가 없습니다');
                return;
            }
            try {
                this.$router.push(`/silverpotion/post/detail/${postId}`);
            } catch (error) {
                console.error('라우팅 오류:', error);
            }
        },
        showLikeList(postId) {
            console.log('좋아요 목록 표시:', postId);
        },
        calculateProgress(post, index) {
            if (!post.voteCounts || post.voteCounts.length === 0 || post.voteCount === 0) {
                return 0;
            }
            return (post.voteCounts[index] / post.voteCount) * 100;
        },
        selectVoteOption(post, index) {
            // 투표 선택 로직 구현
            console.log('Selected vote option:', index, 'for post:', post.postId);
        }
    }
}
</script>

<style scoped>
@import '@mdi/font/css/materialdesignicons.min.css';

.post-list {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
    padding: 0 20px 0 20px;
}

.post-feed {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.post-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    width: 100%;
    margin: 0 auto;
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
    gap: 12px;
}

.profile-image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.nickname {
    font-weight: 600;
    color: #262626;
}

.post-date {
    font-size: 12px;
    color: #8e8e8e;
    margin-left: auto;
}

.post-images {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
}

.slider-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
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
    cursor: pointer;
}

.slider-dots {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
}

.dot.active {
    background-color: #0095f6;
}

.slider-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.3);
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
    padding: 12px 16px;
}

.counts-section {
    margin-top: 8px;
}

.counts-row {
    display: flex;
    gap: 16px;
}

.likes-count,
.comments-count {
    font-size: 14px;
    color: #262626;
    cursor: pointer;
}

.likes-count strong,
.comments-count strong {
    font-weight: 600;
}

.post-content {
    padding: 0 16px 12px;
}

.content-wrapper {
    margin-bottom: 8px;
}

.content-line {
    display: flex;
    align-items: center;
}

.content {
    font-size: 14px;
    color: #262626;
    line-height: 1.5;
}

.content.truncated {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.more-button {
    background: none;
    border: none;
    color: #8e8e8e;
    padding: 0;
    margin-left: 4px;
    cursor: pointer;
    font-size: 14px;
}

.post-actions-section {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 12px 16px;
    gap: 10px;
}

.post-action-button {
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    flex: 1;
    display: flex;
    justify-content: center;
    transition: background-color 0.2s;
}

.post-action-button:hover {
    background-color: #f0f0f0;
}

.action-content {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.mdi {
    font-size: 18px;
}

.comments-section {
    padding: 0 16px 12px;
}

.comments-count-button {
    background: none;
    border: none;
    color: #8e8e8e;
    padding: 0;
    cursor: pointer;
    font-size: 14px;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #8e8e8e;
}

@media (max-width: 430px) {
    .post-list {
        padding: 0;
    }
    
    .mdi {
        font-size: 20px;
    }
    
    .action-text {
        font-size: 14px;
    }
}

.red-heart {
  color: #e91e63 !important;
}

.red-text {
  color: #e91e63 !important;
}

/* 투표 게시물 스타일 */
.vote-container {
    padding: 16px;
    background-color: #f8f8f8;
    border-radius: 8px;
    margin: 12px 16px;
}

.vote-header {
    margin-bottom: 16px;
}

.vote-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
}

.vote-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
}

.vote-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.vote-option {
    position: relative;
    background-color: white;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.vote-option:hover {
    background-color: #f0f0f0;
}

.option-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
    position: relative;
}

.option-text {
    font-size: 14px;
    color: #333;
}

.option-count {
    font-size: 12px;
    color: #666;
}

.option-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: rgba(0, 149, 246, 0.1);
    border-radius: 8px;
    transition: width 0.3s ease;
}

.vote-info {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    font-size: 12px;
    color: #666;
}

.vote-count {
    color: #0095f6;
}

.vote-multiple {
    color: #666;
}
</style>