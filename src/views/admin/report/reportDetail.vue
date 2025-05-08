<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 ml-3">신고 상세</span>
    </div>

    <v-card v-if="reportDetail" class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="reportDetail.name"
              label="신고당한 사용자"
              readonly
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="reportDetail.reportStatus"
              label="처리 상태"
              readonly
              variant="outlined"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="reportDetail.content"
              label="신고 내용"
              readonly
              variant="outlined"
              rows="4"
            ></v-textarea>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="adminComment"
              label="관리자 코멘트"
              variant="outlined"
              rows="4"
              :readonly="!isEditing"
              :rules="[v => !!v || '관리자 코멘트는 필수입니다']"
            ></v-textarea>
            <v-select
              v-if="isEditing"
              v-model="selectedStatus"
              :items="statuses"
              label="처리 상태"
              variant="outlined"
              class="mt-4"
              :rules="[v => !!v || '처리 상태는 필수입니다']"
            ></v-select>
            <div class="d-flex justify-end mt-2">
              <v-btn
                v-if="!isEditing"
                color="primary"
                @click="startEditing"
              >
                신고 처리
              </v-btn>
              <template v-else>
                <v-btn
                  color="error"
                  class="mr-2"
                  @click="cancelEditing"
                >
                  취소
                </v-btn>
                <v-btn
                  color="success"
                  @click="processReport"
                  :loading="saving"
                  :disabled="!adminComment || !selectedStatus"
                >
                  저장
                </v-btn>
              </template>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-else>
      <v-card-text class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ReportDetail',
  data() {
    return {
      reportDetail: null,
      loading: false,
      isEditing: false,
      saving: false,
      adminComment: '',
      originalComment: '',
      selectedStatus: null,
      statuses: [
        { title: '대기', value: 'WAIT' },
        { title: '완료', value: 'COMPLETE' }
      ]
    };
  },
  created() {
    this.fetchReportDetail();
  },
  methods: {
    async fetchReportDetail() {
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
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/report/detail/${this.$route.params.reportId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-User-LoginId': localStorage.getItem('loginId'),
              'X-User-Role': 'ADMIN'
            }
          }
        );

        if (response.data?.result) {
          this.reportDetail = response.data.result;
          this.adminComment = this.reportDetail.adminComment || '';
          this.originalComment = this.adminComment;
          this.selectedStatus = this.reportDetail.reportStatus;
        }
      } catch (error) {
        console.error('신고 상세 조회 실패:', error);
        if (error.response?.status === 403) {
          alert('관리자 권한이 필요합니다.');
          this.$router.push('/');
        } else {
          alert('신고 상세 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        this.loading = false;
      }
    },
    startEditing() {
      this.isEditing = true;
    },
    cancelEditing() {
      this.adminComment = this.originalComment;
      this.selectedStatus = this.reportDetail.reportStatus;
      this.isEditing = false;
    },
    async processReport() {
      const token = localStorage.getItem('token');
      if (!token) return;

      this.saving = true;
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/report/${this.$route.params.reportId}/process`,
          {
            adminComment: this.adminComment,
            reportStatus: this.selectedStatus
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-User-LoginId': localStorage.getItem('loginId'),
              'X-User-Role': 'ADMIN'
            }
          }
        );

        if (response.data?.status_code === 200) {
          this.originalComment = this.adminComment;
          this.isEditing = false;
          alert('신고가 처리되었습니다.');
          this.fetchReportDetail(); // 상태 업데이트를 위해 다시 조회
        }
      } catch (error) {
        console.error('신고 처리 실패:', error);
        alert('신고 처리에 실패했습니다.');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}
</style>
