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
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/list`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        console.log(response)
        console.log("✅ 회원 목록 불러오기 성공:", response.data.result);
        this.userlist = response.data.result;

        const enhanceduserlist = await Promise.all(this.userlist.map(async user => {
              try {
                const roomRes = await axios.post(
                  `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/private/create?otherUserId=${user.id}`,
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      "X-User-LoginId": localStorage.getItem("loginId")
                    }
                  }
                );
                const roomId = roomRes.data;

                const unreadRes = await axios.get(
                  `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/${roomId}/unread-count`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      "X-User-LoginId": localStorage.getItem("loginId")
                    }
                  }
                );

                return { ...user, unreadCount: unreadRes.data };
              } catch (e) {
                console.warn(`⚠️ unread 조회 실패: ${user.id}`, e);
                return { ...user, unreadCount: 0 }; // 실패 시 0으로 fallback
              }
            }));

            this.userlist = enhanceduserlist;
            console.log("✅ 유저 + 안 읽은 메시지 수 세팅 완료", this.userlist);
      } catch (error) {
        console.error("❌ 회원 목록 불러오기 실패", error);
        alert("회원 목록을 불러오지 못했습니다.");
      }
    },
    methods: {
      async startChat(otherUserId) {
        try {
          console.log(`💬 채팅 요청 시작: 대상 사용자 ID = ${otherUserId}`);
  
          const response = await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/chat-service/chat/room/private/create?otherUserId=${otherUserId}`,
            {}, // 빈 body
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "X-User-LoginId": localStorage.getItem("loginId")
                }           
            }
          );
  
          const roomId = response.data;
          console.log(`✅ 채팅방 생성 또는 조회 성공! roomId = ${roomId}`);
          this.$router.push(`/chat/${roomId}`);
        } catch (error) {
          console.error("❌ 채팅방 생성/이동 실패", error);
          alert("채팅방 생성 중 오류가 발생했습니다.");
        }
      }
    }
  };
  </script>
  