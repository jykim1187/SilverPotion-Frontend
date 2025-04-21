<template>
    <div class="post-list">
        <PostHeader 
            title="투표 게시판"
            :show-search="true"
            :show-filter="true"
            @search="handleSearch"
            @filter="handleFilter"
        />
        <div class="post-feed">
            <PostCard 
                v-for="post in posts" 
                :key="post.votedId" 
                :post="post"
                @update:post="updatePost"
            />
            <div v-if="loading" class="loading">
                <div class="spinner"></div>
            </div>
            <div v-if="!loading && posts.length === 0" class="no-posts">
                등록된 투표가 없습니다.
            </div>
            <div v-if="!loading && posts.length > 0 && currentPage < totalPages" class="load-more">
                <button @click="loadMore" class="load-more-btn">더 보기</button>
            </div>
        </div>
    </div>
</template>

<script>
import PostHeader from '@/components/PostHeader.vue';
import PostCard from '@/components/PostCard.vue';
import axios from 'axios';

export default {
    name: 'PostListVote',
    components: {
        PostHeader,
        PostCard
    },
    data() {
        return {
            posts: [],
            loading: false,
            currentPage: 1,
            pageSize: 5,
            totalPages: 0,
            totalElements: 0,
            searchQuery: '',
            filterOption: 'all'
        }
    },
    created() {
        this.fetchPosts();
    },
    methods: {
        handleSearch(query) {
            this.searchQuery = query;
            this.currentPage = 1;
            this.fetchPosts();
        },
        handleFilter(option) {
            this.filterOption = option;
            this.currentPage = 1;
            this.fetchPosts();
        },
        async fetchPosts() {
            try {
                this.loading = true;
                const loginId = localStorage.getItem('loginId');
                const response = await axios.get(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/list`,
                    {
                        params: {
                            page: this.currentPage - 1,
                            size: this.pageSize,
                            search: this.searchQuery,
                            filter: this.filterOption
                        },
                        headers: {
                            'X-User-LoginId': loginId
                        }
                    }
                );
                console.log('API 응답:', response.data);
                
                const voteList = response.data.result.content;
                this.posts = voteList.map(post => ({
                    ...post,
                    type: 'VOTE',
                    title: post.title || '',
                    description: post.description || '',
                    profileImage: post.profileImage ? 
                        `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/profile-image/${post.profileImage}` : 
                        require('@/assets/default-profile.png'),
                    nickname: post.nickname || '익명',
                    createdAt: post.createdTime || '',
                    voteLikeCount: post.voteLikeCount || 0,
                    commentCount: post.commentCount || 0,
                    isLike: post.isLike || 'N',
                    votedId: post.votedId,
                    voteOptions: post.voteOptions || [],
                    multipleChoice: post.multipleChoice || false
                }));
                
                this.totalPages = response.data.result.totalPages;
                this.totalElements = response.data.result.totalElements;
                
                console.log('처리된 투표 목록:', this.posts);
            } catch (error) {
                console.error('게시물 조회 실패:', error);
                alert('게시물을 불러오는데 실패했습니다.');
            } finally {
                this.loading = false;
            }
        },
        async loadMore() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                await this.fetchPosts();
            }
        },
        updatePost(updatedPost) {
            const index = this.posts.findIndex(post => post.votedId === updatedPost.votedId);
            if (index !== -1) {
                this.posts.splice(index, 1, updatedPost);
            }
        }
    }
}
</script>

<style scoped>
.post-list {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
    padding: 16px;
}

.post-feed {
    margin-top: 16px;
}

.loading {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #1976d2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.no-posts {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 16px;
}

.load-more {
    text-align: center;
    padding: 20px;
}

.load-more-btn {
    padding: 8px 16px;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.load-more-btn:hover {
    background-color: #1565c0;
}

@media (max-width: 430px) {
    .post-list {
        padding: 8px;
    }
    
    .post-feed {
        margin-top: 8px;
    }
    
    .no-posts {
        font-size: 14px;
        padding: 20px;
    }
    
    .load-more-btn {
        font-size: 13px;
        padding: 6px 12px;
    }
}
</style>