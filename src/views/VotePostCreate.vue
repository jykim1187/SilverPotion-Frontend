<template>
  <v-container>
    <!-- 뒤로가기 헤더 -->
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 ml-3">투표 만들기</span>
      <v-spacer></v-spacer>
      <v-btn 
        color="primary" 
        @click="savePost" 
        :loading="loading"
        :disabled="!isFormValid"
      >
        완료
      </v-btn>
    </div>

    <v-form ref="form" v-model="isFormValid">
      <!-- 제목 입력 -->
      <v-text-field
        v-model="postData.title"
        label="투표 제목"
        :rules="titleRules"
        variant="outlined"
        class="mb-4"
        hide-details="auto"
      ></v-text-field>

      <!-- 설명 입력 (선택) -->
      <v-textarea
        v-model="postData.description"
        label="투표 설명 (선택 사항)"
        variant="outlined"
        class="mb-4"
        auto-grow
        rows="3"
        hide-details="auto"
      ></v-textarea>

      <!-- 투표 항목 입력 -->
      <div class="my-4">
        <div class="d-flex align-center mb-2">
          <h3 class="text-subtitle-1">투표 항목</h3>
          <v-spacer></v-spacer>
          <v-btn 
            size="small" 
            variant="text" 
            prepend-icon="mdi-plus" 
            @click="addOption"
          >
            항목 추가
          </v-btn>
        </div>

        <v-card class="pa-4 mb-4" variant="outlined">
          <div 
            v-for="(option, index) in postData.voteOptions" 
            :key="index"
            class="d-flex align-center mb-2"
          >
            <v-text-field
              v-model="option.optionText"
              :label="`항목 ${index + 1}`"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || '항목을 입력해주세요']"
              hide-details="auto"
              class="flex-grow-1 mr-2"
            ></v-text-field>
            <v-btn 
              icon 
              variant="text" 
              color="error" 
              size="small"
              :disabled="postData.voteOptions.length <= 2"
              @click="removeOption(index)"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="text-caption text-grey mt-2">최소 2개 이상의 항목이 필요합니다.</div>
        </v-card>
      </div>

      <!-- 투표 설정 -->
      <v-card class="pa-4 mb-4" variant="outlined">
        <h3 class="text-subtitle-1 mb-3">투표 설정</h3>
        
        <!-- 복수 선택 여부 -->
        <v-switch
          v-model="postData.multipleChoice"
          label="복수 선택 허용"
          color="primary"
          hide-details
          class="mb-4"
        ></v-switch>
        
        <!-- 종료 시간 설정 -->
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-clock-outline</v-icon>
          <span class="text-body-2">투표 종료 시간: {{ formatCloseTime }}</span>
          <v-tooltip location="top" text="투표는 생성 후 48시간 동안 유효합니다.">
            <template v-slot:activator="{ props }">
              <v-icon class="ml-2" size="small" v-bind="props">mdi-information-outline</v-icon>
            </template>
          </v-tooltip>
        </div>
      </v-card>
    </v-form>

    <!-- 상태 알림 스낵바 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">닫기</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export default {
  name: 'VotePostCreate',
  data() {
    return {
      postData: {
        title: '',
        description: '',
        voteOptions: [
          { optionText: '' },
          { optionText: '' },
          { optionText: '' }
        ],
        multipleChoice: false
      },
      isFormValid: false,
      loading: false,
      voteId: null,
      category: null,
      titleRules: [
        v => !!v || '제목을 입력해주세요',
        v => (v && v.length <= 100) || '제목은 100자 이내로 입력해주세요',
      ],
      snackbar: {
        show: false,
        text: '',
        color: ''
      }
    };
  },
  computed: {
    gatheringId() {
      return this.$route.query.gatheringId;
    },
    // 투표 종료 시간 (현재로부터 48시간 후)
    formatCloseTime() {
      const closeTime = addDays(new Date(), 2);
      return format(closeTime, 'yyyy년 MM월 dd일 a h시 mm분', { locale: ko });
    }
  },
  created() {
    // 임시 투표 ID 생성
    this.initPost();
  },
  methods: {
    async initPost() {
      try {
        this.loading = true;
        const loginId = localStorage.getItem('loginId');
        
        // 임시 게시글 초기화 API 호출
        const requestData = {
          postCategory: 'vote', // 백엔드 Enum 형식에 맞춤
        };
        
        // gatheringId가 있는 경우에만 추가
        if (this.gatheringId) {
          requestData.gatheringId = this.gatheringId;
        }
        
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/init`,
          requestData,
          {
            headers: {
              'X-User-LoginId': loginId,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data && response.data.result) {
          const result = response.data.result;
          this.voteId = result.postId;
          this.category = result.category;
          console.log('임시 투표 생성 성공:', result);
        } else {
          this.showSnackbar('임시 투표 생성에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('임시 투표 생성 실패:', error);
        this.showSnackbar('임시 투표 생성에 실패했습니다.', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    addOption() {
      this.postData.voteOptions.push({ optionText: '' });
    },
    
    removeOption(index) {
      if (this.postData.voteOptions.length > 2) {
        this.postData.voteOptions.splice(index, 1);
      }
    },
    
    async savePost() {
      if (!this.$refs.form.validate()) return;
      if (!this.voteId) {
        this.showSnackbar('임시 투표가 생성되지 않았습니다. 다시 시도해주세요.', 'error');
        return;
      }
      
      // 유효성 검사 - 빈 항목 확인
      const hasEmptyOption = this.postData.voteOptions.some(option => !option.optionText.trim());
      if (hasEmptyOption) {
        this.showSnackbar('모든 투표 항목을 입력해주세요.', 'error');
        return;
      }
      
      try {
        this.loading = true;
        const loginId = localStorage.getItem('loginId');
        
        // FormData 생성
        const formData = new FormData();
        
        // 기본 필드 추가
        formData.append('title', this.postData.title);
        formData.append('description', this.postData.description || '');
        formData.append('multipleChoice', this.postData.multipleChoice);
        
        // 투표 옵션 추가
        this.postData.voteOptions.forEach((option, index) => {
          formData.append(`voteOptions[${index}].optionText`, option.optionText.trim());
        });
        
        // 디버깅 로깅
        console.log('전송할 투표 제목:', this.postData.title);
        console.log('전송할 투표 설명:', this.postData.description);
        console.log('복수 선택 여부:', this.postData.multipleChoice);
        console.log('투표 항목 목록:');
        this.postData.voteOptions.forEach((option, index) => {
          console.log(`항목 ${index + 1}:`, option.optionText);
        });
        
        // 투표 최종 저장 API 호출
        const response = await axios({
          method: 'put',
          url: `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/update/vote/${this.voteId}`,
          data: formData,
          headers: {
            'X-User-LoginId': loginId,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('서버 응답:', response.data);
        
        if (response.data && response.data.result) {
          this.showSnackbar('투표가 생성되었습니다.', 'success');
          
          // 투표 상세 페이지로 이동 (응답에서 ID 가져오기)
          const createdVoteId = this.voteId;
          
          setTimeout(() => {
            // 게시글 목록 또는 상세 페이지로 이동
            if (this.gatheringId) {
              this.$router.push(`/silverpotion/vote/${createdVoteId}?gatheringId=${this.gatheringId}`);
            } else {
              this.$router.push(`/silverpotion/vote/${createdVoteId}`);
            }
          }, 1000); // 1초 후 이동 (스낵바 메시지 확인할 시간 부여)
        }
      } catch (error) {
        console.error('투표 저장 실패:', error);
        if (error.response) {
          console.error('에러 상태:', error.response.status);
          console.error('에러 데이터:', error.response.data);
        }
        this.showSnackbar('투표 저장에 실패했습니다.', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    showSnackbar(text, color = 'info') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    }
  }
};
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}
</style> 