<template>
    <v-container>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="text-center text-h5">
              회원목록
            </v-card-title>
            <v-card-text>
              <v-table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>이름</th>
                    <th>닉네임</th>
                    <th>채팅</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in userlist" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.nickName }}</td>
                    <td>
                      <v-btn color="primary" @click="startChat(user.id)">
                        채팅하기
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
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
        userlist: []
      };
    },
    async created() {
      try {
        const currentUserId = localStorage.getItem("userId");
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/list`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        console.log('API Response:', response.data);
        console.log('Current userId:', currentUserId);
        
        // 현재 로그인한 사용자를 제외한 목록 필터링
        const filteredUsers = response.data.result.filter(user => {
          console.log('User id:', user.id, 'Current userId:', currentUserId);
          return user.id.toString() !== currentUserId;
        });
        
        console.log('Filtered users:', filteredUsers);
        
        // 각 사용자의 읽지 않은 메시지 수 조회
        this.userlist = await Promise.all(filteredUsers.map(async user => {
          try {
            const unreadResponse = await axios.get(
              `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/${user.id}/unread-count`,
              {
                params: { userId: localStorage.getItem("userId") },
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "X-User-LoginId": localStorage.getItem("loginId")
                }
              }
            );
            console.log(`User ${user.id} unread count:`, unreadResponse.data);
            return { ...user, unreadCount: unreadResponse.data || 0 };
          } catch (error) {
            console.warn(`⚠️ 읽지 않은 메시지 수 조회 실패: ${user.id}`, error);
            return { ...user, unreadCount: 0 };
          }
        }));
      } catch (error) {
        console.error("❌ 회원 목록 불러오기 실패", error);
        alert("회원 목록을 불러오지 못했습니다.");
      }
    },
    methods: {
      async startChat(otherUserId) {
        try {
          const myId = localStorage.getItem("userId");
          const requestBody = {
            userIds: [myId, otherUserId],
            type: "SINGLE"
          };

          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room`,
            requestBody,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "X-User-LoginId": localStorage.getItem("loginId")
              }
            }
          );
          console.log(response);
          const roomId = response.data.id;
          console.log(roomId);
          this.$router.push(`/chat/${roomId}`);
          // 메시지 읽음 처리
          try {
            await axios.patch(
              `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/${roomId}/read`,
              null,
              {
                params: {
                  userId: myId,
                  messageId: 0 // 가장 최근 메시지 ID로 업데이트
                },
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "X-User-LoginId": localStorage.getItem("loginId")
                }
              }
            );
          } catch (error) {
            console.warn("⚠️ 메시지 읽음 처리 실패:", error);
          }

          
        } catch (error) {
          console.error("❌ 채팅방 생성/이동 실패", error);
          alert("채팅방 생성 중 오류가 발생했습니다.");
        }
      }
    }
  };
  </script>
  