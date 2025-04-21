import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

class WebSocketManager {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = {};
    this.token = localStorage.getItem("token");
    this.loginId = localStorage.getItem("loginId");
  }

  connect() {
    console.log("[DEBUG] connect() called");
    console.log("[DEBUG] current this.connected =", this.connected);
  
    this.loginId = localStorage.getItem("loginId");
    this.token = localStorage.getItem("token");
  
    if (this.connected) {
      console.log("✅ Already connected");
      return Promise.resolve(); // 연결되어 있으면 바로 resolve
    }
  
    const socket = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/chat-service/connect?loginId=${this.loginId}`);
    this.stompClient = Stomp.over(socket);
  
    this.stompClient.debug = function (str) {
      console.log('[STOMP DEBUG]', str);
    };
  
    return new Promise((resolve, reject) => {
      this.stompClient.connect(
        {
          Authorization: `Bearer ${this.token}`,
          "X-User-LoginId": this.loginId,
        },
        () => {
          this.connected = true;
          console.log("✅ WebSocket connected");
          resolve(); // ✅ 여기서 resolve 호출
        },
        (error) => {
          console.error("❌ WebSocket connection failed", error);
          reject(error);
        }
      );
    });
  }

  async subscribe(destination, callback) {
    if (!this.connected) {
        console.warn("❌ subscribe 호출 시 WebSocket 연결 안됨 → 자동 연결 시도");
        await this.connect();
        return this.subscribe(destination, callback); // 재귀 호출 (다시 시도)
      }
    
      if (this.subscriptions[destination]) {
        console.log(`🔁 Already subscribed to ${destination}`);
        return;
      }
    
      const sub = this.stompClient.subscribe(destination, (message) => {
        console.log("📨 Raw message received:", message);
        if (message.body) {
          try {
            const parsed = JSON.parse(message.body);
            callback(parsed);
          } catch (e) {
            console.error("❌ JSON 파싱 실패:", e, message.body);
          }
        }
      });
    
      this.subscriptions[destination] = sub;
      console.log(`✅ Successfully subscribed to ${destination}`);
    }
  async replaceSubscribe(destination, callback) {
    // 먼저 구독이 이미 되어 있다면 해제
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
      console.log(`🔁 replaceSubscribe: 이전 구독 제거 → ${destination}`);
    }

    // 다시 구독
    await this.subscribe(destination, callback);
  }
  unsubscribe(destination) {
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
      console.log(`🛑 Unsubscribed from ${destination}`);
    }
  }

  send(destination, body) {
    if (this.connected && this.stompClient) {
      this.stompClient.send(destination, JSON.stringify(body), {
        Authorization: `Bearer ${this.token}`,
        "X-User-LoginId": this.loginId,
      });
    }
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
      this.subscriptions = {};
      this.stompClient.disconnect();
      this.connected = false;
      console.log("🔌 WebSocket disconnected");
    }
  }
}

export default new WebSocketManager();
