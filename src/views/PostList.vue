<template>
    <div class="post-list">
        <div class="post-list-container">
            <button 
                v-for="type in postTypes" 
                :key="type.value"
                :class="{ 'active': selectedType === type.value }"
                @click="selectedType = type.value"
                class="type-button"
            >
                {{ type.label }}
            </button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedType: 'all',
            postTypes: [
                { label: '전체', value: 'all' },
                { label: '공지', value: 'notice' },
                { label: '자유', value: 'free' },
                { label: '투표', value: 'vote' }
            ]
        }
    },
    watch: {
        selectedType(newType) {
            // 선택된 유형이 변경될 때 필요한 로직 추가
            this.fetchPosts(newType);
        }
    },
    methods: {
        fetchPosts(type) {
            // 선택된 유형에 따라 게시물을 불러오는 로직 구현
            console.log('Fetching posts for type:', type);
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

.post-list-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
}

.type-button {
    flex: 1;
    padding: 6px 12px;
    border: none;
    background: none;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    white-space: nowrap;
}

.type-button:hover {
    color: #1976d2;
}

.type-button.active {
    color: #1976d2;
    font-weight: 500;
}

@media (max-width: 430px) {
    .post-list {
        width: 100%;
    }
    
    .post-list-container {
        padding: 8px;
    }
    
    .type-button {
        padding: 4px 8px;
        font-size: 13px;
    }
}
</style>