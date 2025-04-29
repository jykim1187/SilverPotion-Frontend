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
    this.loginId = localStorage.getItem("loginId");
    this.token = localStorage.getItem("token");

    if (this.connected) {
      console.log("✅ Already connected");
      return Promise.resolve();
    }

    const socket = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/chat-service/connect?loginId=${this.loginId}`);
    this.stompClient = Stomp.over(socket);

    return new Promise((resolve, reject) => {
      this.stompClient.connect(
        {
          Authorization: `Bearer ${this.token}`,
          "X-User-LoginId": this.loginId,
        },
        () => {
          this.connected = true;
          console.log("✅ WebSocket connected");
          resolve();
        },
        (error) => {
          console.error("❌ WebSocket connection failed", error);
          reject(error);
        }
      );
    });
  }

  subscribe(destination, callback) {
    if (!this.connected) {
      console.warn("❌ WebSocket 연결 안됨 → 자동 연결 시도");
      return this.connect().then(() => this._subscribe(destination, callback));
    }
    return this._subscribe(destination, callback);
  }

  _subscribe(destination, callback) {
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
