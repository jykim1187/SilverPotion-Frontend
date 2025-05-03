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
    if (this.connected) {
      console.log("✅ 이미 연결됨");
      return Promise.resolve();
    }
    // 로그인 정보 확인
    this.loginId = localStorage.getItem("loginId");
    this.token = localStorage.getItem("token");

    if (!this.loginId || !this.token) {
      console.warn("❌ 로그인 정보가 없습니다. WebSocket 연결을 할 수 없습니다.");
      return Promise.reject(new Error("No loginId or token"));
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

  send(destination, message) {
    return this.connect().then(() => this._send(destination, message));
  }

  _send(destination, message) {
    console.log(`📤 Sending message to ${destination}:`, message);

    try {
      const stringifiedMessage = JSON.stringify(message);  // 직렬화
      this.stompClient.send(destination, stringifiedMessage);  // 직렬화된 메시지 전송
      console.log("Sending message:", stringifiedMessage);
    } catch (error) {
      console.error('❌ 메시지 직렬화 실패:', error);
    }
  }

  subscribe(destination, callback) {
    return this.connect().then(() => this._subscribe(destination, callback));
  }

  _subscribe(destination, callback) {
    // 연결 상태 체크 후 구독
    if (!this.connected) {
      console.warn("❌ WebSocket 연결이 되지 않았습니다. 연결을 시도합니다.");
      return this.connect().then(() => this._subscribe(destination, callback));
    }

    if (this.subscriptions[destination]) {
      console.log(`🔁 이미 ${destination}에 구독 중`);
      return;
    }
    try {
      const sub = this.stompClient.subscribe(destination, (message) => {
        console.log("📨 수신된 원시 메시지:", message);
        console.log("📨 수신된 원시 메시지:", message.body);
        if (message.body) {
          try {
            const parsed = JSON.parse(message.body);

            if (typeof callback !== 'function') {
              console.error(`❌ 구독 콜백이 함수가 아닙니다:`, callback);
              return;
            }
            console.log("📨 콜백 타입:", typeof callback, callback);
            callback(parsed);
          } catch (e) {
            console.error("❌ JSON 파싱 실패:", e, message.body);
          }
        }
      });

      this.subscriptions[destination] = sub;
      console.log(`✅ ${destination}에 성공적으로 구독됨`);
    } catch (err) {
      console.error(`❌ stompClient.subscribe 실패:`, err);
    }
  }

  replaceSubscribe(destination, callback) {
    if (typeof callback !== 'function') {
      console.error(`❌ replaceSubscribe: 콜백이 함수가 아님:`, callback);
      return;
    }
    // 기존에 해당 destination에 구독이 되어 있으면 해제
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
      console.log(`🔁 replaceSubscribe: 이전 구독 제거 → ${destination}`);
    }

    // 새로 구독
    this.subscribe(destination, callback);
  }

  unsubscribe(destination) {
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
      console.log(`🛑 Unsubscribed from ${destination}`);
    }
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      Object.values(this.subscriptions).forEach((sub) => sub.unsubscribe());
      this.subscriptions = {};
      this.stompClient.disconnect();
      this.connected = false;
      console.log("🔌 WebSocket disconnected");
    } else {
      console.log("❌ WebSocket is not connected or already disconnected");
    }
  }

  logout() {
    this.disconnect();
    localStorage.removeItem("loginId");
    localStorage.removeItem("token");
    console.log("✅ 로그아웃 및 WebSocket 연결 해제 완료");
  }
}

export default new WebSocketManager();
