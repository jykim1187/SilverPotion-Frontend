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
                  class="notification-item"
                  @click="goTo(notification.route, notification, index)"
                >
                  <template v-slot:prepend>
                    <v-avatar color="#4FC3F7" size="40">
                      <v-icon color="white">mdi-bell-ring-outline</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="d-flex justify-space-between align-center mb-2">
                    <span class="notification-title">{{ notification.title }}</span>
                    <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                  </v-list-item-title>

                  <v-list-item-subtitle class="notification-message">
                    {{ notification.message }}
                  </v-list-item-subtitle>

                  <!-- 조건부 보호자 요청시 수락 거절 버튼 -->
                  <template v-if="notification.type === 'CARE_REQUEST'">
                    <v-list-item-action class="mt-3">
                      <v-btn 
                        color="#4FC3F7" 
                        variant="tonal" 
                        class="action-btn mr-2" 
                        @click.stop="acceptCare(notification.referenceId)"
                      >
                        수락
                      </v-btn>
                      <v-btn 
                        color="error" 
                        variant="tonal" 
                        class="action-btn" 
                        @click.stop="rejectCare(notification.referenceId)"
                      >
                        거절
                      </v-btn>
                    </v-list-item-action>
                  </template>

                  <!-- 삭제 버튼 -->
                  <template v-slot:append>
                    <v-btn
                      icon
                      variant="text"
                      color="grey"
                      size="small"
                      @click.stop="removeNotification(index)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <div v-if="notifications.length === 0" class="empty-container">
                <v-icon size="x-large" color="grey-lighten-1">mdi-bell-off-outline</v-icon>
                <p class="mt-3 text-grey-darken-1">알림이 없습니다.</p>
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
        notification: null,
        index: null,
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
            id: n.id,
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
          case "JOINED":// 모임 참여 
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
      async goTo(route, notification, index) {
        if (route) {
          try {
            // 알림 읽음 처리
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat-service/notifications/${notification.id}/read`);

            // 리스트에서 제거
            this.notifications.splice(index, 1);

            // 라우트 이동
            this.$router.push(route);
          } catch (err) {
            console.error("❌ 알림 처리 실패:", err);
            alert("알림 처리 중 문제가 발생했습니다.");
          }
        }
      },
      async removeNotification(index) {
        const notification = this.notifications[index];
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat-service/notifications/${notification.id}/read`);
          this.notifications.splice(index, 1);
        } catch (err) {
          console.error("❌ 읽음 처리 실패:", err);
        }
      },
      async acceptCare(referenceId) {
          try {
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/carelink/accept/${referenceId}`);
            await this.markNotificationAsReadByRef(referenceId);
          alert("보호 요청을 수락했습니다.");
          this.fetchNotifications();
          this.$router.push('/silverpotion/healthdatapage');
        } catch (err) {
          console.error("❌ 수락 실패:", err);
          alert("수락에 실패했습니다.");
        }
      },

      async rejectCare(referenceId) {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/carelink/reject/${referenceId}`);
          await this.markNotificationAsReadByRef(referenceId);
          alert("보호 요청을 거절했습니다.");
          this.fetchNotifications();
        } catch (err) {
          console.error("❌ 거절 실패:", err);
          alert("거절에 실패했습니다.");
        }
      },
      async markNotificationAsReadByRef(referenceId) {
        const index = this.notifications.findIndex(n => n.referenceId === referenceId && n.type === 'CARE_REQUEST');
        if (index !== -1) {
          try {
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat-service/notifications/${this.notifications[index].id}/read`);
            this.notifications.splice(index, 1);
          } catch (e) {
            console.error('❌ 보호자 알림 읽음 처리 실패:', e);
          }
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .notification-item {
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 16px !important;
    border-bottom: 1px solid #f0f0f0;
  }

  .notification-item:hover {
    background-color: #f8f9fa;
  }

  .notification-title {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
    color: #333 !important;
  }

  .notification-time {
    font-size: 0.9rem !important;
    color: #666 !important;
  }

  .notification-message {
    font-size: 1.1rem !important;
    color: #666 !important;
    line-height: 1.4 !important;
    margin-top: 4px !important;
  }

  .action-btn {
    font-size: 1rem !important;
    font-weight: 500 !important;
    padding: 8px 16px !important;
    border-radius: 8px !important;
    text-transform: none !important;
    letter-spacing: 0.5px !important;
  }

  /* 카드 스타일 수정 */
  :deep(.v-card) {
    border-radius: 16px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }

  :deep(.v-card-title) {
    font-size: 1.5rem !important;
    font-weight: 600 !important;
    color: #333 !important;
    padding: 24px !important;
    border-bottom: 2px solid #4FC3F7 !important;
  }

  .empty-container {
    padding: 48px 0;
    text-align: center;
  }

  .empty-container p {
    font-size: 1.1rem;
    color: #666;
  }

  /* 반응형 스타일 */
  @media (max-width: 600px) {
    .notification-title {
      font-size: 1.1rem !important;
    }
    
    .notification-message {
      font-size: 1rem !important;
    }
    
    .action-btn {
      font-size: 0.95rem !important;
      padding: 6px 12px !important;
    }
  }
  </style>
  