<template>
  <div>
    <div class="video-chat">
    <!-- 내 화면을 보여줄 비디오 태그, autoplay는 비디오가 로드되자마자 자동 재생, muted는 내 비디오에서 내 목소리가 다시 나오는거 막는거(에코방지) -->
    <video ref="localVideo" autoplay playsinline muted></video>
    <!-- 상대방의 비디오스트림을 연결할 화면 -->
    <video ref="remoteVideo" autoplay playsinline></video>

    <!-- <button @click="startCall()">📞 화상통화 시작</button> -->
  </div>
  </div>
</template>

<script>
export default {
  name: 'VisualChat',

  data(){
      return{
        // 아래 보면 localStream은 내 카메라,마이크에서 얻은 MediaStream을 저장하는 변수
          localStream: null,
        // RTCPeerConnection 인스턴스를 저장할 변수
          peerConnection: null,
        // 시그널링 서버를 연결할 객체를 저장할 변수 
          signalingServer: null,
        // 상대방 로그인 아이디
          loginId: this.$route.params.loginId,
          // 내 로그인 아이디
          myId: localStorage.getItem('loginId')
      }
  },
  mounted: async function() { 
        await this.initLocalMedia();          // localStream 준비 완료 후
        await this.connectSignalingServer();  // signaling 준비 완료 후
        await this.startCall();               // 이제 safe하게 시작 가능
        // 이 코드는 비동기 작업을 수행하고, 모든 작업이 완료된 후에 실행됨. 즉 initLocalMedia(), connectSignalingServer(), startCall() 순으로 차례로 실행된다는 것
},

  methods: {
      async initLocalMedia(){
          try{
 // navigator.mediaDevices.getUserMedia()는 브라우저에서 카메라와 마이크 권한을 요청하고, MediaStream객체를 호출하는 함수
              this.localStream = await navigator.mediaDevices.getUserMedia({video: true, audio:true})
              // localVideo에 내 스트림을 연결하는 부분으로 내 화면을 내 비디오에 바로 띄우는 작업
              this.$refs.localVideo.srcObject = this.localStream
          }catch(error){
              console.log('카메라.마이크 접근 실패',error)
          }
      },
    //  -->startCall()함수는 RTCPeerConnection을 생성하고, 내 스트림을 상대에게 연결하고, SDP Offer와 ICE Candidate를 signaling 서버로 보내서 연결을 성립하는 함수
      async startCall(){
        try{
           // 0. RTCPeerConnection객체의 생성자에 들어갈 옵션객체 정의로, key가 iceServers고 value가 배열인 형태임
        // iceServers는 NAT뒤에 있는 클라이언트끼리 연결 할 수 있도록 STUN/TURN서버 정보를 넣어줌. 구글의 STUN서버 사용
        const configuration ={
          iceServers:[
            {urls: 'stun:stun.1.google.com.19302'}
          ]
        }

        // 1.RTCPeerConnection객체 생성
        this.peerConnection = new RTCPeerConnection(configuration)
        console.log("1피어커넥션객체생성")

        // 2. 내 MediaStream(내가 getUserMedia()로 가져온 객체로 비디오트랙과 오디오트랙이 담겨있음)을 피어커넥션 객체에 추가
        this.localStream.getTracks().forEach(
          track =>{
            this.peerConnection.addTrack(track,this.localStream)
          }
        )
        console.log("2내미디어스트림추가")

        // 3.상대방으로부터 미디어 트랙을 받으면 remoteVideo에 연결(peerConnection.ontrack은 상대방이 addTrack()으로 트랙을 전송했을때 브라우저가 자동으로 발생시키는 이벤트)
      //  event.streams는 MediaStream객체들의 배열
        this.peerConnection.ontrack = (event) =>{
          console.log('상대방 스트림 수신')
          this.$refs.remoteVideo.srcObject = event.streams[0]
        }

        // 4.ICE Candidate가 생성될 때마다 시그널링 서버로 보낸다(ice후보는 한번에 생성되는게 아니라 그때그때마다 찾아짐 찾아질때마다 상대방(여기선 this.loginId)에게 보내줘야함)
        // this.peerConnection.onicecandidate는 ICE후보가 생성될때마다 호출되는 이벤트 핸들러
        this.peerConnection.onicecandidate = (event) => {
          if(event.candidate){
            console.log('ICE후보11:', event.candidate)

            if(event.candidate && this.signalingServer.readyState === WebSocket.OPEN){

            this.signalingServer.send(JSON.stringify({
              type:'candidate',
              candidate: event.candidate,
              to:this.loginId,
              from:this.myId
            }))
            
          } else{
            console.log("시그널링 서버 연결 대기중")
          }

          }
        }
        // 5.SDP Offer생성후 전송(상대방은 이걸 받고 Answer을 만들어야 연결이 성립된다)
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)

        this.signalingServer.send(JSON.stringify(
          {
            type: 'offer',
            offer: offer,
            from: this.myId,
            to: this.loginId
         //여기서 to~는 반드시 있어야함 백엔드에서 이 메시지의 'to'키값을 찾아서 상대방 로그인아이디를 찾도록 로직처리했으므로
          }))

        }catch(error){
          console.error('startCall 오류:', error)
        }
      },
       //////// startCall()끝
      async connectSignalingServer(){
        // 1.시그널링 서버 연결(백엔드에서 맞춰놓은 쿼리파라미터 형식으로)
        this.signalingServer = new WebSocket(`ws://localhost:8080/chat-service/signal?userId=${this.myId}`) //WebSocketConfig에 설정한 url과 경로 맞추어야함

        //2. 연결이 열리면 실행
        this.signalingServer.onopen = () =>{
          console.log('시그널링 서버 연결 성공')
        }

        //3. 상대방이 보내온 메시지를 처리하는 부분
        this.signalingServer.onmessage = async(message) => {
          const data = JSON.parse(message.data)

          if(data.type === 'answer'){
            this.handleAnswer(data)
          } else if(data.type === 'candidate') {
            // 상대방이 알려준 후보군을 내 peerConnection에 등록
            const candidate = new RTCIceCandidate(data.candidate)
            await this.peerConnection.addIceCandidate(candidate)
          } else if(data.type === 'offer'){
           try{
            //   // this.startCall()은 내가 offer를 생성해서 보내는 거고 여기서는 상대방의 offer를 받아서 answer를 보내는 로직이 들어가야하는 것
            //  1.내 RTCpeerConnection객체 생성
              const configuration ={
                iceServers:[{urls : 'stun:stun.1.google.com.19302'}]
              };
              this.peerConnection = new RTCPeerConnection(configuration);
            // 2. 내 localStream을 트랙에 추가
              this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track,this.localStream);
              });
              // 3.상대방의 트랙 수신 처리
              this.peerConnection.ontrack = (event) => {
                console.log('상대방 스트림 수신!');
                this.$refs.remoteVideo.srcObject = event.streams[0]
              }
              // 4. ICE 후보 발견시 전송
              this.peerConnection.onicecandidate = (event) => {
                if(event.candidate){
                  this.signalingServer.send(JSON.stringify({
                    type: 'candidate',
                    candidate: event.candidate,
                    to: this.loginId,
                    from: this.myId
                  }));
                }
              };
              // 5.상대 offer 등록
              await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

              // 6.answer생성 및 전송
              const answer = await this.peerConnection.createAnswer();
              await this.peerConnection.setLocalDescription(answer);
              this. signalingServer.send(JSON.stringify({
                type: 'answer',
                answer: answer,
                // from: this.myId,
                to: this.loginId
              }));

              console.log('answer전송완료');
            } catch(error){
              console.log('offer처리 중 오류 발생', error)
            }
            }
        }
        //4. 연결 종료 또는 오류 핸들링도 추가 가능
        this.signalingServer.onerror = (error) => {
          console.error('시그널링 서버 오류:', error)
        }
      },
          //////
        async handleAnswer(data){
        try{
          console.log('받은 answer :',data.answer)
        // 상대방이 보낸 answer데이터를 RTCSessionDescription 객체로 변환
          const remoteDesc = new RTCSessionDescription(data.answer)
        // 이 answer를 peerConnection의 원격 설명으로 설정해서 연결 정보를 등록
          await this.peerConnection.setRemoteDescription(remoteDesc)
          console.log('상대방의 answer를 성공적으로 등록')
        }catch(error){
          console.error('answer등록 실패')
        }
      }
  
  }




}
</script>


