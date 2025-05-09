<template>
    <v-container>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="text-center text-h5">
              알림 목록
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(notification, index) in notifications"
                  :key="index"
                  class="chat-list-item"
                  @click="goTo(notification.route)"
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary">
                      <v-icon>mdi-bell-ring-outline</v-icon>
                    </v-avatar>
                  </template>
                  <!-- 삭제 버튼 -->
                  <template v-slot:append>
                    <v-icon
                      small
                      class="ml-2 text-grey"
                      @click.stop="removeNotification(index)"
                    >
                      mdi-close
                    </v-icon>
                  </template>
                  <v-list-item-title class="d-flex justify-space-between">
                    <span class="font-weight-bold">{{ notification.title }}</span>
                    <span class="text-caption text-medium-emphasis">
                      {{ formatTime(notification.createdAt) }}
                    </span>
                  </v-list-item-title>
  
                  <v-list-item-subtitle class="text-truncate">
                    {{ notification.message }}
                  </v-list-item-subtitle>
                  <!-- 조건부 보호자 요청시 수락 거절 버튼 -->
                  <template v-if="notification.type === 'CARE_REQUEST'">
                    <v-list-item-action class="mt-2">
                      <v-btn small color="success" @click.stop="acceptCare(notification.referenceId)">수락</v-btn>
                      <v-btn small color="error" @click.stop="rejectCare(notification.referenceId)">거절</v-btn>
                    </v-list-item-action>
                  </template>
                </v-list-item>
              </v-list>
  
              <div v-if="notifications.length === 0" class="text-center text-grey">
                알림이 없습니다.
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        notifications: [],
      };
    },
    async created() {
      await this.fetchNotifications();
    },
    methods: {
      async fetchNotifications() {
        const loginId = localStorage.getItem("loginId");
        try {
          const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chat-service/notifications/list`, {
            headers: { "X-User-LoginId": loginId }
          });
          this.notifications = res.data.map(n => ({
            title: n.title || '알림',
            message: n.content,
            createdAt: n.createdAt,
            type: n.type,
            referenceId: n.referenceId,
            route: this.resolveRoute(n.type, n.referenceId)
          }));
        } catch (err) {
          console.error('❌ 알림 불러오기 실패:', err);
        }
      },
      resolveRoute(type, referenceId) {
        switch (type) {
          case "GATHERING_JOIN_REQUEST":// 모임 참여 요청
            return `/silverpotion/gathering/home/${referenceId}`;
          case "GATHERING_DISBAND":// 모임 해체
            return null;
          case "GATHERING_LEADER":// 모임 리더 변경
            return null;
          case "GATHERING_BANNED":// 모임 차단
            return null;
          case "GATHERING_DEACTIVATED":// 모임 탈퇴 또는 해체
            return null;
          case "GATHERING_JOINED":// 모임 참여 
            return `/silverpotion/gathering/home/${referenceId}`;
          case "CARE_REQUEST": // 보호자 요청
            return null;
          case "POST_LIKE": // 좋아요시 알림
            return `/silverpotion/gathering/board/${referenceId}`;
          case "POST_COMMENT": // 댓글시 알림
            return `/silverpotion/gathering/board/${referenceId}`;
          case "NOTICE_UPDATED": // 공지글 알림
            return `/silverpotion/gathering/board/${referenceId}`;
          default:
            return null;
        }
      },
      formatTime(datetime) {
        if (!datetime) return '';
        const date = new Date(datetime);
        const now = new Date();
        const diff = now - date;
        if (diff < 86400000) {
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes()
            .toString()
            .padStart(2, '0')}`;
        }
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
      },
      goTo(route) {
        if (route) {
          this.$router.push(route);
        }
      },
      async acceptCare(referenceId) {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/carelink/accept/${referenceId}`);
          alert("보호 요청을 수락했습니다.");
          this.fetchNotifications();
        } catch (err) {
          console.error("❌ 수락 실패:", err);
          alert("수락에 실패했습니다.");
        }
      },

      async rejectCare(referenceId) {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/carelink/reject/${referenceId}`);
          alert("보호 요청을 거절했습니다.");
          this.fetchNotifications();
        } catch (err) {
          console.error("❌ 거절 실패:", err);
          alert("거절에 실패했습니다.");
        }
      },
      removeNotification(index) {
        this.notifications.splice(index, 1);
      },
    },
  };
  </script>
  
  <style scoped>
  .chat-list-item {
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .chat-list-item:hover {
    background-color: #f5f5f5;
  }
  .v-list-item-title {
    font-size: 1rem;
  }
  .v-list-item-subtitle {
    font-size: 0.875rem;
    color: #666;
  }
  </style>
  