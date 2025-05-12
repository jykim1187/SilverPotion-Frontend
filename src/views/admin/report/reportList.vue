<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 ml-3">신고 목록</span>
    </div>

    <!-- 검색 필터 -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="search.reporterNickname"
              label="신고자 유저 닉네임"
              variant="outlined"
              density="comfortable"
              @input="searchReports"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="search.nickname"
              label="신고당한 유저 닉네임"
              variant="outlined"
              density="comfortable"
              @input="searchReports"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="search.reportBigCategory"
              :items="bigCategories"
              label="신고 대유형"
              variant="outlined"
              density="comfortable"
              @update:modelValue="searchReports"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="search.reportSmallCategory"
              :items="smallCategories"
              label="신고 소유형"
              variant="outlined"
              density="comfortable"
              @update:modelValue="searchReports"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="search.reportStatus"
              :items="statuses"
              label="처리 상태"
              variant="outlined"
              density="comfortable"
              @update:modelValue="searchReports"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 신고 목록 -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="reports"
        :loading="loading"
        :items-per-page="10"
        :page="page"
        :total-items="totalItems"
        @update:page="handlePageChange"
        class="elevation-1"
        @click:row="goToReportDetail"
      >
        <template #[`item.reportBigCategory`]="{ item }">
          {{ getBigCategoryLabel(item.reportBigCategory) }}
        </template>

        <template #[`item.reportSmallCategory`]="{ item }">
          {{ getSmallCategoryLabel(item.reportSmallCategory) }}
        </template>

        <template #[`item.reportStatus`]="{ item }">
          <v-chip
            :color="getStatusColor(item.reportStatus)"
            size="small"
          >
            {{ getStatusLabel(item.reportStatus) }}
          </v-chip>
        </template>

        <template #[`item.reportedTime`]="{ item }">
          {{ item.reportedTime?.split('T')[0] }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: false,
      reports: [],
      page: 1,
      totalItems: 0,
      search: {
        reporterNickname: '',
        nickname: '',
        reportBigCategory: null,
        reportSmallCategory: null,
        reportStatus: null
      },
      bigCategories: [
        { title: '없음', value: null },
        { title: '채팅', value: 'CAHT' },
        { title: '게시물', value: 'POST' },
        { title: '유저', value: 'USER' },
        { title: '모임', value: 'GATHERING' }
      ],
      smallCategories: [
        { title: '없음', value: null },
        { title: '성적 행위', value: 'SEXUAL_CONTENT' },
        { title: '혐오 발언', value: 'HATE_SPEECH' },
        { title: '사기', value: 'FRAUD' },
        { title: '폭력', value: 'VIOLENCE' },
        { title: '불법', value: 'ILLEGAL_ACT' },
        { title: '따돌림', value: 'BULLYING' }
      ],
      statuses: [
        { title: '대기', value: 'WAIT' },
        { title: '완료', value: 'COMPLETE' }
      ],
      headers: [
        { title: '신고 ID', key: 'reportId', align: 'center' },
        { title: '신고자 유저 닉네임', key: 'reporterNickname', align: 'center' },
        { title: '신고당한 유저 닉네임', key: 'reportedNickname', align: 'center' },
        { title: '대유형', key: 'reportBigCategory', align: 'center' },
        { title: '소유형', key: 'reportSmallCategory', align: 'center' },
        { title: '내용', key: 'content', align: 'center' },
        { title: '상태', key: 'reportStatus', align: 'center' },
        { title: '신고일', key: 'reportedTime', align: 'center' }
      ]
    };
  },
  created() {
    this.checkAuthAndFetchData();
  },
  methods: {
    checkAuthAndFetchData() {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const loginId = localStorage.getItem('loginId');
      const userId = localStorage.getItem('userId');

      if (!token || !role || !loginId || !userId) {
        alert('로그인이 필요합니다.');
        this.$router.push('/silverpotion/user/login');
        return;
      }

      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        alert('관리자 권한이 필요합니다.');
        this.$router.push('/');
        return;
      }

      this.fetchReports();
    },
    async fetchReports() {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const loginId = localStorage.getItem('loginId');
      const userId = localStorage.getItem('userId');
      
      this.loading = true;
      try {
        const params = {
          page: this.page - 1,
          size: 10,
          sort: 'createdTime,desc'
        };

        // 검색 조건이 있는 경우에만 파라미터에 추가
        if (this.search.reporterNickname) params.name = this.search.reporterNickname;
        if (this.search.nickname) params.nickname = this.search.nickname;
        if (this.search.reportBigCategory) params.reportBigCategory = this.search.reportBigCategory;
        if (this.search.reportSmallCategory) params.reportSmallCategory = this.search.reportSmallCategory;
        if (this.search.reportStatus) params.reportStatus = this.search.reportStatus;

        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/report/list`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-User-LoginId': loginId,
              'X-User-Role': role,
              'X-User-Id': userId
            },
            params: params
          }
        );

        console.log('API Response:', response.data);
        if (response.data?.result?.content) {
          this.reports = response.data.result.content;
          this.totalItems = response.data.result.totalElements;
          console.log('Reports data:', this.reports);
        }
      } catch (error) {
        console.error('신고 목록 조회 실패:', error);
        if (error.response?.status === 403) {
          alert('관리자 권한이 필요합니다.');
          this.$router.push('/');
        } else if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          this.$router.push('/silverpotion/user/login');
        }
      } finally {
        this.loading = false;
      }
    },
    searchReports() {
      this.page = 1;
      this.fetchReports();
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.fetchReports();
    },
    getBigCategoryLabel(category) {
      if (!category) return '';
      const found = this.bigCategories.find(item => item.value === category);
      return found ? found.title : category;
    },
    getSmallCategoryLabel(category) {
      if (!category) return '';
      const found = this.smallCategories.find(item => item.value === category);
      return found ? found.title : category;
    },
    getStatusLabel(status) {
      const found = this.statuses.find(item => item.value === status);
      return found ? found.title : status;
    },
    getStatusColor(status) {
      switch (status) {
        case 'WAIT': return 'error';
        case 'COMPLETE': return 'success';
        default: return 'grey';
      }
    },
    goToReportDetail(event, { item }) {
      if (!item.reportId) return;
      this.$router.push(`/silverpotion/admins/report/detail/${item.reportId}`);
    }
  }
};
</script>

<style scoped>
.v-data-table {
  width: 100%;
}
</style>
