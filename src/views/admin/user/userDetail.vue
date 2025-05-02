<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 ml-3">회원 상세 정보</span>
    </div>

    <v-card v-if="user" class="pa-4">
      <v-row>
        <!-- 기본 정보 -->
        <v-col cols="12" md="6">
          <v-card-title class="text-h6 mb-4">기본 정보</v-card-title>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>ID</v-list-item-title>
              <v-list-item-subtitle>{{ user.id }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-outline</v-icon>
              </template>
              <v-list-item-title>이름</v-list-item-title>
              <v-list-item-subtitle>{{ user.name }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-tag</v-icon>
              </template>
              <v-list-item-title>닉네임</v-list-item-title>
              <v-list-item-subtitle>{{ user.nickName }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-email</v-icon>
              </template>
              <v-list-item-title>이메일</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-phone</v-icon>
              </template>
              <v-list-item-title>전화번호</v-list-item-title>
              <v-list-item-subtitle>{{ user.phoneNumber }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- 계정 정보 -->
        <v-col cols="12" md="6">
          <v-card-title class="text-h6 mb-4">계정 정보</v-card-title>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-login</v-icon>
              </template>
              <v-list-item-title>로그인 ID</v-list-item-title>
              <v-list-item-subtitle>{{ user.loginId }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-key</v-icon>
              </template>
              <v-list-item-title>소셜 로그인</v-list-item-title>
              <v-list-item-subtitle>{{ user.socialType || '일반' }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-shield-account</v-icon>
              </template>
              <v-list-item-title>권한</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip :color="user.role === 'ADMIN' ? 'primary' : 'grey'" size="small">
                  {{ user.role === 'ADMIN' ? '관리자' : '일반' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-cancel</v-icon>
              </template>
              <v-list-item-title>계정 상태</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip :color="user.banYN === 'Y' ? 'error' : 'success'" size="small">
                  {{ user.banYN === 'Y' ? '정지' : '정상' }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="user.banYN === 'Y'">
              <template v-slot:prepend>
                <v-icon>mdi-clock-alert</v-icon>
              </template>
              <v-list-item-title>정지 만료일</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(user.banUntil) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- 추가 정보 -->
        <v-col cols="12" md="6">
          <v-card-title class="text-h6 mb-4">추가 정보</v-card-title>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-cake</v-icon>
              </template>
              <v-list-item-title>생년월일</v-list-item-title>
              <v-list-item-subtitle>{{ user.birthday }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-gender-male-female</v-icon>
              </template>
              <v-list-item-title>성별</v-list-item-title>
              <v-list-item-subtitle>{{ user.sex }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-map-marker</v-icon>
              </template>
              <v-list-item-title>지역</v-list-item-title>
              <v-list-item-subtitle>{{ user.region }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-potion</v-icon>
              </template>
              <v-list-item-title>힐링포션</v-list-item-title>
              <v-list-item-subtitle>{{ user.healingPotion }}개</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- 관계 정보 -->
        <v-col cols="12" md="6">
          <v-card-title class="text-h6 mb-4">관계 정보</v-card-title>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-group</v-icon>
              </template>
              <v-list-item-title>피보호자 수</v-list-item-title>
              <v-list-item-subtitle>{{ user.dependentCount }}명</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-account-supervisor</v-icon>
              </template>
              <v-list-item-title>보호자 수</v-list-item-title>
              <v-list-item-subtitle>{{ user.protectorCount }}명</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <!-- 관리 버튼 -->
      <v-card-actions class="justify-end mt-4">
        <v-btn
          v-if="user.banYN === 'N'"
          color="error"
          @click="openBanDialog"
          class="mr-2"
        >
          정지
        </v-btn>
        <v-btn
          v-if="user.banYN === 'Y'"
          color="success"
          @click="unbanUser"
          class="mr-2"
        >
          정지 해제
        </v-btn>
        <v-btn
          v-if="user.role !== 'ADMIN' && isSuperAdmin"
          color="primary"
          @click="registerAdmin"
          class="mr-2"
        >
          관리자 등록
        </v-btn>
        <v-btn
          v-if="user.role === 'ADMIN' && isSuperAdmin"
          color="error"
          @click="removeAdmin"
          class="mr-2"
        >
          관리자 해제
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 정지 기간 입력 모달 -->
    <v-dialog v-model="banDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">사용자 정지</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="banDays"
            label="정지 기간 (일)"
            type="number"
            min="1"
            variant="outlined"
            density="comfortable"
            :rules="[v => !!v || '정지 기간을 입력해주세요']"
          ></v-text-field>
          <div class="text-caption text-grey">
            * 정지 기간은 일 단위로 입력해주세요.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="banDialog = false">
            취소
          </v-btn>
          <v-btn color="error" @click="banUser" :disabled="!banDays">
            정지
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-progress-circular
      v-if="!user"
      indeterminate
      color="primary"
      class="d-flex justify-center align-center"
      style="width: 100%; height: 200px;"
    ></v-progress-circular>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      user: null,
      loading: false,
      banDialog: false,
      banDays: null,
      isSuperAdmin: localStorage.getItem('adminRole') === 'SUPER_ADMIN'
    };
  },
  created() {
    this.fetchUserDetail();
  },
  methods: {
    async fetchUserDetail() {
      this.loading = true;
      try {
        const userId = this.$route.params.userId;
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/detail/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-User-LoginId': localStorage.getItem('loginId'),
              'X-User-Id': localStorage.getItem('userId'),
              'X-User-Role': 'ROLE_ADMIN'
            }
          }
        );
        this.user = response.data.result;
      } catch (error) {
        console.error('사용자 상세 정보 조회 실패:', error);
        if (error.response?.status === 403) {
          alert('관리자 권한이 필요합니다.');
          this.$router.push('/silverpotion/admins');
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString();
    },
    openBanDialog() {
      this.banDays = null;
      this.banDialog = true;
    },
    async banUser() {
      if (!this.banDays) return;
      
      try {
        console.log('Ban request data:', {
          userId: this.user.id,
          banDays: this.banDays * 24 * 60
        });
        
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/ban`,
          {
            userId: this.user.id,
            banDays: this.banDays * 24 * 60 // 일을 분으로 변환
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-User-LoginId': localStorage.getItem('loginId'),
              'X-User-Id': localStorage.getItem('userId'),
              'X-User-Role': 'ROLE_ADMIN'
            }
          }
        );
        
        console.log('Ban response:', response.data);
        
        if (response.data.status_code === 200) {
          alert(`${this.user.name} 사용자가 ${this.banDays}일 동안 정지되었습니다.`);
          this.banDialog = false;
          this.banDays = null;
          window.location.reload(); // 페이지 새로고침
        }
      } catch (error) {
        console.error('사용자 정지 실패:', error);
        console.error('Error response:', error.response);
        alert('사용자 정지에 실패했습니다.');
      }
    },
    async unbanUser() {
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/unban/${this.user.id}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-User-LoginId': localStorage.getItem('loginId'),
              'X-User-Id': localStorage.getItem('userId'),
              'X-User-Role': 'ROLE_ADMIN'
            }
          }
        );
        this.fetchUserDetail();
      } catch (error) {
        console.error('사용자 정지 해제 실패:', error);
        alert('사용자 정지 해제에 실패했습니다.');
      }
    },
    async registerAdmin() {
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/register/${this.user.id}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-User-LoginId': localStorage.getItem('loginId'),
              'X-User-Id': localStorage.getItem('userId'),
              'X-User-Role': 'ROLE_ADMIN'
            }
          }
        );

        if (response.data.status_code === 200) {
          alert(`${this.user.name} 사용자가 관리자로 등록되었습니다.`);
          this.fetchUserDetail(); // 사용자 정보 새로고침
        }
      } catch (error) {
        console.error('관리자 등록 실패:', error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert('관리자 등록에 실패했습니다.');
        }
      }
    },
    async removeAdmin() {
      try {
        const response = await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/admins/delete/${this.user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'X-User-LoginId': localStorage.getItem('loginId'),
              'X-User-Id': localStorage.getItem('userId'),
              'X-User-Role': 'ROLE_ADMIN'
            }
          }
        );

        if (response.data.status_code === 200) {
          alert(`${this.user.name} 사용자의 관리자 권한이 해제되었습니다.`);
          this.fetchUserDetail(); // 사용자 정보 새로고침
        }
      } catch (error) {
        console.error('관리자 해제 실패:', error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert('관리자 해제에 실패했습니다.');
        }
      }
    }
  }
};
</script>

<style scoped>
.v-list-item {
  min-height: 48px;
}
</style>
