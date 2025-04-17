<template>
    <div class="user-profile">
      <div class="profile-header">
        <h2 v-if="parentType === 'healthData'">{{ userName }}님의 프로필</h2>
        <h2 v-else>{{ userInfo.nickname }}님의 프로필</h2>
        <button class="report-btn">
          <i class="fas fa-flag"></i> 신고하기
        </button>
      </div>
      
      <div class="profile-content">
        <div class="profile-image-container">
          <img :src="userInfo.profileImage || 'default-profile.jpg'" alt="프로필 사진" class="profile-image">
        </div>
        
        <div class="profile-info">
          <!-- 여기 userInfo.nickname 으로 바꾸면 닉네임 -->
          <h3 v-if="parentType === 'healthData'">{{ userName }}</h3>
          <h3 v-else>{{ userInfo.nickname }}</h3>
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ userInfo.address || '정보 없음' }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-birthday-cake"></i>
            <span>{{ formatBirthdate(userInfo.birthdate) || '정보 없음' }}</span>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="chat-btn" @click="startTextChat">
          <i class="fas fa-comments"></i> 1:1 채팅
        </button>
        <button class="video-btn" @click="startVideoChat">
          <i class="fas fa-video"></i> 화상 채팅
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'UserProfileComponent',
    props: {
      loginId: {
        type: String,
        required: true
      },
      userName: {
        type: String,
        default: '사용자'
      },
      userLongId: {
        type: Number,
        required: true
      },
      parentType:{
        type: String,
        default: 'healthData'
      }
    },
    data() {
      return {
        userInfo: {
          nickname: '',
          profileImage: '',
          address: '',
          birthdate: null
        },
        isLoading: false,
        hasError: false
      }
    },
    mounted() {
      // 사용자 정보를 불러오는 API 호출
      this.fetchUserInfo();
    },
    methods: {
      async fetchUserInfo() {
        this.isLoading = true;
        try {
          // API 호출을 통해 사용자 정보 가져오기
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/yourProfile/${this.userLongId}`);
          console.log(response)
          if (response.data && response.data.result) {
            this.userInfo = {
              nickname: response.data.result.nickname ,
              profileImage: response.data.result.profileImage,
              address: response.data.result.address,
              birthdate: response.data.result.birthday
            };
          }
        } catch (error) {
          console.error('사용자 정보를 가져오는 중 오류 발생:', error);
          this.hasError = true;
          
          // 오류 발생 시 기본 정보 사용(나중에 삭제하자)
          this.userInfo = {
            nickname: this.userName,
            profileImage: 'https://via.placeholder.com/150',
            address: '정보를 불러올 수 없습니다',
            birthdate: null
          };
        } finally {
          this.isLoading = false;
        }
      },
      formatBirthdate(date) {
        if (!date) return '정보 없음';
        // YYYY-MM-DD 형식으로 표시
        if (typeof date === 'string') {
          return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
        }
        return date;
      },
      startTextChat() {
        // 1:1 채팅 시작 로직
        console.log('1:1 채팅 시작:', this.userId);
        // this.$emit('start-text-chat', this.userId);
        //여기에다!! 채팅페이지로 라우팅
      },
      startVideoChat() {
        // 화상 채팅 시작 로직
        console.log('화상 채팅 시작:', this.loginId);
        //즉 화상채팅으로 라우팅할때 type이 healthdata라고 전달. 그러면 라우팅된 비주얼 챗에서 타입을 확인해서 이름으로 띄움.([post쪽에서는 다른 쿼리를 전달하게 해서 post쪽에서 라우팅되면 닉네임띄움])
        this.$router.push({ name: 'VisualChat', params: { loginId: this.loginId }, query: { parentType: this.parentType } });
      }
    }
  }
  </script>
  
  <style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
  
  .user-profile {
    position: relative;
    /* width: 400px; */
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    background-color: white;
    font-family: 'Noto Sans KR', sans-serif;
  }
  
  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f2f2f2;
  }
  
  .profile-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
  
  .report-btn {
    margin-top: 30px;
    background: none;
    border: none;
    color: #ff5252;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.2s;
  }
  
  .report-btn:hover {
    color: #ff0000;
  }
  
  .profile-content {
    display: flex;
    margin-bottom: 28px;
  }
  
  .profile-image-container {
    margin-right: 20px;
  }
  
  .profile-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #f8f8f8;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .profile-info h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 22px;
    font-weight: 700;
    color: #333;
  }
  
  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    color: #555;
  }
  
  .info-item i {
    margin-right: 10px;
    color: #3498db;
    width: 18px;
  }
  
  .action-buttons {
    display: flex;
    gap: 16px;
  }
  
  .action-buttons button {
    flex: 1;
    padding: 14px 0;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  }
  
  .chat-btn {
    background-color: #3498db;
    color: white;
  }
  
  .chat-btn:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
  
  .video-btn {
    background-color: #2ecc71;
    color: white;
  }
  
  .video-btn:hover {
    background-color: #27ae60;
    transform: translateY(-2px);
  }
  </style>
  
  
  