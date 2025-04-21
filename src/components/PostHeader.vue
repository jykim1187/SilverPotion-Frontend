<template>
    <div class="post-header">
        <div class="header-container">
            <div class="menu-container">
                <router-link 
                    v-for="menu in menus" 
                    :key="menu.value"
                    :to="menu.path"
                    class="menu-item"
                    :class="{ active: isActive(menu.path) }"
                >
                    {{ menu.label }}
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PostHeader',
    data() {
        return {
            menus: [
                { label: '전체', value: 'all', path: '/silverpotion/post/list' },
                { label: '자유', value: 'free', path: '/silverpotion/post/free/list' },
                { label: '공지', value: 'notice', path: '/silverpotion/post/notice/list' },
                { label: '투표', value: 'vote', path: '/silverpotion/post/vote/list' }
            ]
        }
    },
    methods: {
        isActive(path) {
            return this.$route.path === path;
        }
    }
}
</script>

<style scoped>
.post-header {
    width: 100%;
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 56px;
    z-index: 99;
}

.header-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 0 16px;
}

.menu-container {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    gap: 180px;
}

.menu-item {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    text-decoration: none;
    color: #666;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
}

.menu-item:hover {
    color: #1976d2;
}

.menu-item.active {
    color: #1976d2;
}

.menu-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background-color: #1976d2;
}

@media (max-width: 430px) {
    .header-container {
        padding: 0 8px;
    }
    
    .menu-item {
        font-size: 13px;
        padding: 8px 0;
    }
}
</style>