<template>
    <div class="post-list">
        <PostHeader />
        <div class="post-feed">
            <PostCard 
                v-for="post in posts" 
                :key="post.postId" 
                :post="post"
                @update:post="updatePost"
            />
        </div>
    </div>
</template>

<script>
import PostHeader from '@/components/PostHeader.vue';
import PostCard from '@/components/PostCard.vue';
import axios from 'axios';

export default {
    name: 'PostListNotice',
    components: {
        PostHeader,
        PostCard
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
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/notice/list`,
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
                    profileImage: post.profileImage || require('@/assets/default-profile.png'),
                    nickname: post.nickname || '익명',
                    createdAt: post.createdTime
                }));
            } catch (error) {
                console.error('공지 게시물을 불러오는데 실패했습니다:', error);
            } finally {
                this.loading = false;
            }
        },
        updatePost(updatedPost) {
            const index = this.posts.findIndex(post => post.postId === updatedPost.postId);
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
}

.post-feed {
    padding: 16px;
}

@media (max-width: 430px) {
    .post-feed {
        padding: 8px;
    }
}
</style>