import emitter from '@/event-bus'

let eventSource = null

export function useSse() {
  const connectSse = (loginId) => {
    if (!loginId || eventSource) return;

    console.log('🛰 SSE 연결 시도... loginId =', loginId);

    const url = `${process.env.VUE_APP_API_BASE_URL}/chat-service/sse/subscribe?loginId=${loginId}`;
    eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener('connect', (e) => {
      console.log('✅ SSE 연결 성공:', e.data);
    });

    eventSource.addEventListener('notification', (e) => {
      const data = JSON.parse(e.data);
      console.log('📩 [알림 수신]:', data);
      emitter.emit('newNotification', data);
    });

    eventSource.addEventListener('chat-message', (e) => {
      const data = JSON.parse(e.data);
      console.log('💬 [채팅 수신]:', data);
      emitter.emit('newMessageReceived', {
        senderNickName: data.senderNickName,
        roomId: data.roomId,
        message: data
      });
    });

    eventSource.onerror = (err) => {
      console.warn('⚠️ SSE 오류:', err)
      eventSource?.close()
      eventSource = null
      setTimeout(() => connectSse(loginId), 5000) // 재연결 시도
    }
  }

  const disconnectSse = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
      console.log('🛑 SSE 연결 종료');
    }
  }

  return {
    connectSse,
    disconnectSse
  }
}