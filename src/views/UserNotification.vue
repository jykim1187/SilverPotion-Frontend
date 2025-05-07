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
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary">
                      <v-icon>mdi-bell-ring-outline</v-icon>
                    </v-avatar>
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
            createdAt: n.createdAt
          }));
        } catch (err) {
          console.error('❌ 알림 불러오기 실패:', err);
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
      goToNotification() {
        this.$router.push('/notification');
    },
    },
  };
  </script>
  
  <style scoped>
  .chat-list-item {
    cursor: default;
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
  