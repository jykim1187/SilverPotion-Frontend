<template>
  <v-container>
    <!-- 뒤로가기 헤더 -->
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 ml-3">공지사항 작성</span>
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
        label="제목"
        :rules="titleRules"
        variant="outlined"
        class="mb-4"
        hide-details="auto"
      ></v-text-field>

      <!-- 내용 입력 -->
      <v-textarea
        v-model="postData.content"
        label="내용을 입력하세요"
        :rules="contentRules"
        variant="outlined"
        class="mb-4"
        auto-grow
        rows="8"
        hide-details="auto"
      ></v-textarea>

      <!-- 이미지 업로드 (선택 사항) -->
      <div class="mb-4">
        <v-file-input
          v-model="selectedFiles"
          label="이미지 추가 (선택 사항)"
          accept="image/*"
          multiple
          variant="outlined"
          prepend-icon="mdi-camera"
          @change="previewImages"
          :rules="imageRules"
          hide-details="auto"
        ></v-file-input>
      </div>

      <!-- 이미지 미리보기 -->
      <div v-if="imagePreviews.length > 0" class="image-preview-container mb-4">
        <v-card v-for="(preview, index) in imagePreviews" :key="index" class="image-preview-card">
          <v-img :src="preview" height="200" cover class="image-preview"></v-img>
          <v-btn 
            icon 
            size="small" 
            color="error" 
            class="remove-image-btn" 
            @click="removeImage(index)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card>
      </div>
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

export default {
  name: 'NoticePostCreate',
  data() {
    return {
      postData: {
        title: '',
        content: '',
        postImg: []
      },
      selectedFiles: [],
      imagePreviews: [],
      isFormValid: false,
      loading: false,
      postId: null,
      category: null,
      titleRules: [
        v => !!v || '제목을 입력해주세요',
        v => (v && v.length <= 100) || '제목은 100자 이내로 입력해주세요',
      ],
      contentRules: [
        v => !!v || '내용을 입력해주세요',
      ],
      imageRules: [
        files => !files || !files.length || files.length <= 5 || '이미지는 최대 5개까지 업로드 가능합니다',
        files => !files || !files.some(file => file.size > 5000000) || '이미지 크기는 5MB 이하여야 합니다',
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
    }
  },
  created() {
    // 임시 포스트 ID 생성
    this.initPost();
  },
  methods: {
    async initPost() {
      try {
        this.loading = true;
        const loginId = localStorage.getItem('loginId');
        
        // 임시 게시글 초기화 API 호출
        const requestData = {
          postCategory: 'notice', // 백엔드 Enum 형식에 맞춤
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
          this.postId = result.postId;
          this.category = result.category;
          console.log('임시 게시글 생성 성공:', result);
        } else {
          this.showSnackbar('임시 게시글 생성에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('임시 게시글 생성 실패:', error);
        this.showSnackbar('임시 게시글 생성에 실패했습니다.', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    previewImages() {
      this.imagePreviews = [];
      this.postData.postImg = [];
      
      if (!this.selectedFiles) return;
      
      // 파일을 FormData에 추가하고 미리보기 생성
      for (const file of this.selectedFiles) {
        this.postData.postImg.push(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    },
    
    removeImage(index) {
      this.imagePreviews.splice(index, 1);
      
      // 선택된 파일 배열에서도 제거
      const newFiles = [...this.selectedFiles];
      newFiles.splice(index, 1);
      this.selectedFiles = newFiles;
      
      // 포스트 데이터의 이미지 배열에서도 제거
      this.postData.postImg.splice(index, 1);
    },
    
    async savePost() {
      if (!this.$refs.form.validate()) return;
      if (!this.postId) {
        this.showSnackbar('임시 게시글이 생성되지 않았습니다. 다시 시도해주세요.', 'error');
        return;
      }
      
      try {
        this.loading = true;
        const loginId = localStorage.getItem('loginId');
        
        // FormData 생성
        const formData = new FormData();
        formData.append('title', this.postData.title);
        formData.append('content', this.postData.content);
        
        // 이미지 파일 추가 (선택 사항)
        if (this.postData.postImg.length > 0) {
          for (const file of this.postData.postImg) {
            formData.append('postImg', file);
          }
        }
        
        // 게시글 최종 저장 API 호출
        const response = await axios.put(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/update/notice/${this.postId}`,
          formData,
          {
            headers: {
              'X-User-LoginId': loginId,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (response.data && response.data.result) {
          this.showSnackbar('공지사항이 저장되었습니다.', 'success');
          
          // 게시글 목록으로 이동
          if (this.gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${this.gatheringId}`);
          } else {
            this.$router.push('/silverpotion/post/list');
          }
        }
      } catch (error) {
        console.error('공지사항 저장 실패:', error);
        this.showSnackbar('공지사항 저장에 실패했습니다.', 'error');
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
.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-preview-card {
  position: relative;
  width: calc(33.333% - 10px);
  min-width: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
}

@media (max-width: 600px) {
  .image-preview-card {
    width: calc(50% - 10px);
  }
}
</style> 