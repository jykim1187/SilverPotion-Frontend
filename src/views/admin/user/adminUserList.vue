<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 ml-3">회원 관리</span>
    </div>

    <!-- 검색 필터 -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search.name"
              label="이름"
              variant="outlined"
              density="comfortable"
              @input="searchUsers"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search.email"
              label="이메일"
              variant="outlined"
              density="comfortable"
              @input="searchUsers"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="search.nickname"
              label="닉네임"
              variant="outlined"
              density="comfortable"
              @input="searchUsers"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 사용자 목록 -->
    <v-card>
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="users"
        :loading="loading"
        :items-length="totalItems"
        @update:page="handlePageChange"
        @update:items-per-page="handleItemsPerPageChange"
        class="elevation-1"
        @click:row="goToUserDetail"
      >
        <template #[`item.role`]="{ item }">
          <v-chip
            :color="item.role === 'ADMIN' ? 'primary' : 'grey'"
            size="small"
          >
            {{ item.role === 'ADMIN' ? '관리자' : '일반' }}
          </v-chip>
        </template>

        <template #[`item.banYn`]="{ item }">
          <v-chip
            :color="item.raw?.banYn === 'Y' ? 'error' : 'success'"
            size="small"
          >
            {{ item.raw?.banYn === 'Y' ? '정지' : '정상' }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn
            v-if="item.raw?.banYn === 'N'"
            color="error"
            variant="text"
            size="small"
            @click="banUser(item.raw)"
          >
            정지
          </v-btn>
          <v-btn
            v-else
            color="success"
            variant="text"
            size="small"
            @click="unbanUser(item.raw)"
          >
            해제
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: false,
      users: [],
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      search: {
        name: '',
        email: '',
        nickname: ''
      },
      headers: [
        { title: 'ID', key: 'id', align: 'center' },
        { title: '이름', key: 'name', align: 'center' },
        { title: '이메일', key: 'email', align: 'center' },
        { title: '닉네임', key: 'nickname', align: 'center' },
        { title: '생년월일', key: 'birthday', align: 'center' },
        { title: '지역', key: 'region', align: 'center' },
        { title: '권한', key: 'role', align: 'center' },
        { title: '가입일', key: 'createdDate', align: 'center' },
        { title: '상태', key: 'banYn', align: 'center' }
      ]
    };
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        this.$router.push('/silverpotion/user/login');
        return;
      }

      if (role !== 'ADMIN') {
        alert('관리자 권한이 필요합니다.');
        this.$router.push('/');
        return;
      }

      this.loading = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/users`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-User-Role': role
            },
            params: {
              page: this.page - 1,
              size: this.itemsPerPage,
              sort: 'id,desc',
              name: this.search.name || undefined,
              email: this.search.email || undefined,
              nickname: this.search.nickname || undefined
            }
          }
        );
        
        if (response.data?.result?.content) {
          this.users = response.data.result.content.map(user => ({
            ...user,
            banYn: user.banYn || 'N',
            role: user.role || 'USER'
          }));
          this.totalItems = response.data.result.totalElements;
        } else {
          this.users = [];
          this.totalItems = 0;
        }
      } catch (error) {
        console.error('사용자 목록 조회 실패:', error);
        if (error.response?.status === 403) {
          alert('관리자 권한이 필요합니다.');
          this.$router.push('/');
        }
      } finally {
        this.loading = false;
      }
    },
    searchUsers() {
      this.page = 1;
      this.fetchUsers();
    },
    handlePageChange(newPage) {
      console.log('Page changed to:', newPage);
      this.page = newPage;
      this.fetchUsers();
    },
    handleItemsPerPageChange(newItemsPerPage) {
      console.log('Items per page changed to:', newItemsPerPage);
      this.itemsPerPage = newItemsPerPage;
      this.page = 1;
      this.fetchUsers();
    },
    async banUser(user) {
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/ban/${user.id}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        this.fetchUsers();
      } catch (error) {
        console.error('사용자 정지 실패:', error);
      }
    },
    async unbanUser(user) {
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/unban/${user.id}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        this.fetchUsers();
      } catch (error) {
        console.error('사용자 정지 해제 실패:', error);
      }
    },
    goToUserDetail(event, { item }) {
      console.log('Clicked item:', item);
      console.log('Item raw:', item.raw);
      console.log('Item role:', item.raw?.role);
      
      // item.raw가 없으면 item 자체를 사용
      const userData = item.raw || item;
      
      if (!userData?.id) {
        console.error('Invalid user data:', userData);
        return;
      }
      
      this.$router.push(`/silverpotion/admins/detail/${userData.id}`);
    }
  }
};
</script>

<style scoped>
.v-data-table {
  width: 100%;
}
</style>
