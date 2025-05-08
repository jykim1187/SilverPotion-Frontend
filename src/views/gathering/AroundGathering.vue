<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="primary">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-white">주변 정모</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="error" class="d-flex justify-center align-center flex-column" style="height: 400px;">
                <v-icon color="error" size="large" class="mb-4">mdi-alert-circle</v-icon>
                <p class="text-center">{{ error }}</p>
                <v-btn color="primary" @click="getCurrentLocation" class="mt-4">다시 시도</v-btn>
            </div>
            <div v-else>
                <div ref="mapContainer" id="map" class="map-container"></div>
                
                <div v-if="nearbyMeetings.length === 0" class="text-center mt-4">
                    <p>주변 2km 내에 정모가 없습니다.</p>
                </div>
                <div v-else class="mt-4">
                    <h3 class="text-h6 mb-3">주변 정모 목록</h3>
                    <v-card 
                        v-for="meeting in nearbyMeetings" 
                        :key="meeting.meetingId"
                        class="mb-3"
                        :class="{'selected-meeting': selectedMeetingId === meeting.meetingId}"
                        elevation="1"
                        @click="goToMeetingDetail(meeting.gatheringId)"
                        style="cursor: pointer;"
                    >
                        <v-card-text>
                            <div class="d-flex align-center">
                                <v-avatar size="60" rounded>
                                    <v-img :src="meeting.imageUrl || require('@/assets/default-gathering.png')" cover></v-img>
                                </v-avatar>
                                <div class="ml-2">
                                    <div class="d-flex align-center">
                                        <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                                        {{ formatDateTime(meeting.meetingDate, meeting.meetingTime) }}
                                    </div>
                                    <div class="font-weight-medium">{{ meeting.name }}</div>
                                    <div class="d-flex align-center mt-1">
                                        <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                                        <span class="text-body-2">{{ meeting.place }}</span>
                                    </div>
                                    <div class="d-flex align-center mt-1">
                                        <!-- 인원 정보 -->
                                        <div class="d-flex align-center">
                                            <v-icon size="small" class="mr-1">mdi-account-multiple</v-icon>
                                            <span class="text-body-2">{{ meeting.attendees ? meeting.attendees.length : 0 }}/{{ meeting.maxPeople }}명</span>
                                        </div>
                                        
                                        <!-- 구분선 -->
                                        <v-divider vertical class="mx-2" style="height: 16px;"></v-divider>
                                        
                                        <!-- 비용 정보 -->
                                        <div class="d-flex align-center">
                                            <v-icon size="small" class="mr-1">mdi-currency-krw</v-icon>
                                            <span class="text-body-2">{{ meeting.cost > 0 ? `${meeting.cost}원` : '회비없음' }}</span>
                                        </div>
                                    </div>
                                </div>
                                <v-spacer></v-spacer>
                                <div class="text-right">
                                    <div class="text-primary font-weight-medium">{{ calculateDistance(meeting.lat, meeting.lon) }}km</div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>
            </div>
        </div>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            loading: true,
            error: null,
            currentLocation: null,
            kakaoMap: null,
            markers: [],
            nearbyMeetings: [],
            searchRadius: 2, // 5km 반경
            selectedMeetingId: null, // 선택된 정모 ID 추가
            mapInitialized: false, // 맵 초기화 상태 추적
            infowindow: null // 이제 CustomOverlay 참조를 저장
        };
    },
    mounted() {
        this.getCurrentLocation();
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        
        // 현재 위치 가져오기
        getCurrentLocation() {
            this.loading = true;
            this.error = null;
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        this.currentLocation = {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        };
                        // DOM이 렌더링될 시간을 주기 위해 약간의 지연 추가
                        this.$nextTick(() => {
                            this.initMap();
                            this.fetchNearbyMeetings();
                        });
                    },
                    error => {
                        console.error('위치 정보를 가져오는데 실패했습니다:', error);
                        this.loading = false;
                        
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                this.error = '위치 정보 접근 권한이 거부되었습니다. 설정에서 위치 접근을 허용해주세요.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                this.error = '위치 정보를 사용할 수 없습니다.';
                                break;
                            case error.TIMEOUT:
                                this.error = '위치 정보 요청 시간이 초과되었습니다.';
                                break;
                            default:
                                this.error = '알 수 없는 오류가 발생했습니다.';
                                break;
                        }
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                console.error('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
                this.loading = false;
                this.error = '이 브라우저에서는 위치 정보를 지원하지 않습니다.';
            }
        },
        
        // 카카오맵 초기화
        initMap() {
            if (!window.kakao || !window.kakao.maps) {
                const script = document.createElement('script');
                script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=d71cbc8ba66037e7a51920d4429cfeb2&autoload=false';
                script.onload = () => {
                    window.kakao.maps.load(() => {
                        this.createMap();
                    });
                };
                document.head.appendChild(script);
            } else {
                this.createMap();
            }
        },
        
        // 맵 생성
        createMap() {
            if (this.mapInitialized) {
                console.log('맵이 이미 초기화되었습니다.');
                return; // 이미 초기화된 경우 중복 실행 방지
            }
            
            // 맵 컨테이너가 DOM에 존재하는지 확인
            const container = this.$refs.mapContainer;
            
            if (!container) {
                console.error('맵 컨테이너를 찾을 수 없습니다.');
                // 맵 컨테이너가 아직 렌더링되지 않았을 수 있으므로 지연 후 재시도
                setTimeout(() => {
                    this.createMap();
                }, 300);
                return;
            }
            
            // 컨테이너 크기 확인
            if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                console.error('맵 컨테이너의 크기가 0입니다.');
                // 약간의 지연 후 다시 시도
                setTimeout(() => this.createMap(), 300);
                return;
            }
            
            // 카카오맵 API가 완전히 로드되었는지 확인
            if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
                console.error('카카오맵 API가 완전히 로드되지 않았습니다.');
                setTimeout(() => this.createMap(), 300);
                return;
            }
            
            try {
                const options = {
                    center: new window.kakao.maps.LatLng(this.currentLocation.lat, this.currentLocation.lon),
                    level: 6 // 지도 확대 레벨
                };
                
                this.kakaoMap = new window.kakao.maps.Map(container, options);
                console.log('카카오맵 생성 완료:', this.kakaoMap);
                this.mapInitialized = true; // 맵 초기화 완료 표시
                
                // 현재 위치 마커 이미지 설정
                const imageSrc = require('@/assets/minilogo.png');
                
                // 현재 위치 마커 추가 (CustomOverlay 사용)
                new window.kakao.maps.CustomOverlay({
                    position: new window.kakao.maps.LatLng(this.currentLocation.lat, this.currentLocation.lon),
                    map: this.kakaoMap,
                    content: `<div style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; display: flex; justify-content: center; align-items: center;">
                                <img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover;">
                              </div>`,
                    zIndex: 3
                });
                
                // 커스텀 오버레이 내용
                const content = `
                    <div style="position:relative; bottom:60px; padding:5px 10px; background:#fff; border-radius:6px; border:1px solid #ccc; box-shadow:0px 1px 2px #888; font-size:12px; font-weight:bold; text-align:center; min-width:80px;">
                        <span>현재 위치</span>
                        <div style="position:absolute; left:50%; bottom:-8px; margin-left:-8px; width:16px; height:8px; background:url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png') no-repeat;"></div>
                    </div>
                `;
                
                // 커스텀 오버레이 생성 (변수 선언 없이 바로 사용)
                new window.kakao.maps.CustomOverlay({
                    map: this.kakaoMap,
                    position: new window.kakao.maps.LatLng(this.currentLocation.lat, this.currentLocation.lon),
                    content: content,
                    yAnchor: 0 // 오버레이의 y축 위치
                });
                
                // 반경 원 그리기
                const circle = new window.kakao.maps.Circle({
                    center: new window.kakao.maps.LatLng(this.currentLocation.lat, this.currentLocation.lon),
                    radius: this.searchRadius * 1000, // m 단위
                    strokeWeight: 2,
                    strokeColor: '#75B8FA',
                    strokeOpacity: 0.8,
                    strokeStyle: 'dashed',
                    fillColor: '#CFE7FF',
                    fillOpacity: 0.3
                });
                circle.setMap(this.kakaoMap);
                
                // 맵 생성 후 정모 마커 추가 시도
                if (this.nearbyMeetings && this.nearbyMeetings.length > 0) {
                    console.log('맵 생성 후 마커 추가 시도');
                    setTimeout(() => {
                        this.addMeetingMarkers();
                    }, 500);
                }
            } catch (error) {
                console.error('카카오맵 생성 중 오류 발생:', error);
                this.loading = false;
                this.error = '지도를 로드하는데 실패했습니다. 다시 시도해주세요.';
            }
        },
        
        // 주변 정모 가져오기
        async fetchNearbyMeetings() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/nearby`, {
                    params: {
                        lat: this.currentLocation.lat,
                        lon: this.currentLocation.lon,
                        radius: this.searchRadius
                    }
                });
                
                this.nearbyMeetings = response.data;
                console.log('주변 정모:', this.nearbyMeetings); // 데이터 확인용 로그
                
                // 데이터를 받아온 후 마커 추가
                // 지연 시간을 늘려 맵이 완전히 초기화된 후 마커를 추가
                setTimeout(() => {
                    console.log('타임아웃 후 kakaoMap 상태:', this.kakaoMap);
                    console.log('맵 초기화 상태:', this.mapInitialized);
                    
                    if (this.kakaoMap && this.nearbyMeetings.length > 0) {
                        this.addMeetingMarkers();
                    }
                }, 2000); // 2초 지연
                
                this.loading = false;
            } catch (error) {
                console.error('주변 정모를 가져오는데 실패했습니다:', error);
                this.error = '주변 정모를 가져오는데 실패했습니다. 다시 시도해주세요.';
                this.loading = false;
            }
        },
        
        // 정모 마커 추가
        addMeetingMarkers() {
            console.log('마커 추가 시작, 정모 수:', this.nearbyMeetings.length);
            console.log('kakaoMap 상태:', this.kakaoMap);
            console.log('맵 초기화 상태:', this.mapInitialized);
            
            // 카카오맵이 초기화되었는지 확인
            if (!this.kakaoMap) {
                console.error('카카오맵이 초기화되지 않았습니다.');
                return;
            }
            
            // 기존 마커 제거
            this.removeAllMarkers();
            
            try {
                // 실제 정모 마커 추가
                this.nearbyMeetings.forEach((meeting, index) => {
                    if (!meeting.lat || !meeting.lon) {
                        console.error(`정모 ${index + 1}에 위치 정보가 없습니다:`, meeting);
                        return;
                    }
                    
                    // 위도, 경도를 숫자로 변환
                    const lat = parseFloat(meeting.lat);
                    const lon = parseFloat(meeting.lon);
                    
                    if (isNaN(lat) || isNaN(lon)) {
                        console.error(`정모 ${index + 1}의 위치 정보가 유효하지 않습니다:`, meeting);
                        return;
                    }
                    
                    console.log(`마커 생성 - 정모 ${index + 1}, 위도: ${lat}, 경도: ${lon}`);
                    
                    // 마커 생성 전 kakaoMap 상태 확인
                    if (!this.kakaoMap) {
                        console.error(`정모 ${index + 1} 마커 생성 실패: kakaoMap이 null입니다`);
                        return;
                    }
                    
                    // 정모 이미지 URL (기본 이미지 대체)
                    const imageUrl = meeting.imageUrl || require('@/assets/default-gathering.png');
                    
                    // 각 마커에 고유 ID 추가
                    const markerId = `meeting-marker-${meeting.meetingId}`;
                    
                    // 커스텀 오버레이 내용 (동그란 이미지 마커)
                    const content = `
                        <div id="${markerId}" style="width: 50px; height: 50px; border-radius: 50%; overflow: hidden; display: flex; justify-content: center; align-items: center; border: 3px solid #3F51B5; background: white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); cursor: pointer;">
                            <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    `;
                    
                    // 커스텀 오버레이 생성
                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        position: new window.kakao.maps.LatLng(lat, lon),
                        content: content,
                        map: this.kakaoMap,
                        zIndex: 2
                    });
                    
                    // 마커 객체 대신 커스텀 오버레이를 저장
                    this.markers.push(customOverlay);
                    
                    // 클릭 이벤트 추가 (setTimeout으로 DOM 요소가 렌더링된 후 이벤트 추가)
                    setTimeout(() => {
                        const markerElement = document.getElementById(markerId);
                        if (markerElement) {
                            markerElement.addEventListener('click', () => {
                                console.log(`정모 ${index + 1} 마커 클릭됨, ID: ${meeting.meetingId}`);
                                
                                // 선택된 정모 ID 업데이트
                                this.selectedMeetingId = meeting.meetingId;
                                
                                // 인포윈도우 표시
                                this.showInfoWindow(meeting, lat, lon);
                                
                                // 약간의 지연 후 스크롤 실행 (DOM 업데이트 시간 확보)
                                setTimeout(() => {
                                    // 선택된 정모 카드 찾기 - 정확한 선택자 사용
                                    const meetingCards = document.querySelectorAll('.v-card');
                                    let selectedCard = null;
                                    
                                    // 모든 카드를 순회하며 해당 정모 ID를 가진 카드 찾기
                                    meetingCards.forEach(card => {
                                        // 카드 클릭 이벤트에서 정모 ID 확인
                                        const clickEvent = card.onclick?.toString();
                                        if (clickEvent && clickEvent.includes(`${meeting.meetingId}`)) {
                                            selectedCard = card;
                                        }
                                    });
                                    
                                    console.log('선택된 정모 카드:', selectedCard);
                                    
                                    if (selectedCard) {
                                        // 부드러운 스크롤로 해당 카드로 이동
                                        selectedCard.scrollIntoView({ 
                                            behavior: 'smooth', 
                                            block: 'center' 
                                        });
                                        
                                        // 시각적 피드백을 위해 카드 강조 효과 추가
                                        selectedCard.classList.add('highlight-card');
                                        setTimeout(() => {
                                            selectedCard.classList.remove('highlight-card');
                                        }, 1500);
                                    } else {
                                        console.error('선택된 정모 카드를 찾을 수 없습니다.');
                                    }
                                }, 100);
                            });
                        } else {
                            console.error(`마커 요소를 찾을 수 없습니다: ${markerId}`);
                        }
                    }, 300);
                    
                    console.log(`정모 ${index + 1} 마커 생성 성공`);
                });
                
                console.log(`총 ${this.markers.length}개의 마커가 생성되었습니다.`);
            } catch (error) {
                console.error('마커 생성 중 오류 발생:', error);
            }
        },
        
        // 인포윈도우 표시
        showInfoWindow(meeting, lat, lon) {
            // 기존 인포윈도우 닫기
            if (this.infowindow) {
                this.infowindow.setMap(null);
            }
            
            // 인포윈도우 내용
            const content = `
                <div style="padding: 10px; width: 220px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); background: white; position: relative; z-index: 10;">
                    <div style="position: absolute; top: 5px; right: 5px; cursor: pointer; font-size: 16px; color: #888;" class="info-close-btn">×</div>
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px; padding-right: 20px;">${meeting.name}</div>
                    <div style="font-size: 12px; margin-bottom: 5px;">
                        <span style="color: #666;">장소:</span> ${meeting.place}
                    </div>
                    <div style="font-size: 12px; margin-bottom: 5px;">
                        <span style="color: #666;">일시:</span> ${this.formatDateTime(meeting.meetingDate, meeting.meetingTime)}
                    </div>
                    <div style="font-size: 12px; margin-bottom: 5px;">
                        <span style="color: #666;">인원:</span> ${meeting.attendees ? meeting.attendees.length : 0}/${meeting.maxPeople}명
                    </div>
                    <div style="text-align: right; margin-top: 8px;">
                        <button onclick="window.vueInstance.goToMeetingDetail('${meeting.gatheringId}')" 
                                style="background: #3F51B5; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            상세보기
                        </button>
                    </div>
                </div>
            `;
            
            // 커스텀 오버레이로 인포윈도우 생성 (z-index 높게 설정)
            this.infowindow = new window.kakao.maps.CustomOverlay({
                position: new window.kakao.maps.LatLng(lat, lon),
                content: content,
                map: this.kakaoMap,
                zIndex: 10, // 높은 z-index 설정
                yAnchor: 1.2 // 마커 위에 표시
            });
            
            // 전역 Vue 인스턴스 참조 설정 (인포윈도우 내 버튼 클릭 이벤트용)
            window.vueInstance = this;
            
            // 닫기 버튼 이벤트 추가
            setTimeout(() => {
                const closeBtn = document.querySelector('.info-close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        if (this.infowindow) {
                            this.infowindow.setMap(null);
                        }
                    });
                }
            }, 100);
        },
        
        // 모든 마커 제거
        removeAllMarkers() {
            this.markers.forEach(marker => {
                marker.setMap(null);
            });
            this.markers = [];
        },
        
        // 정모 상세 페이지로 이동
        goToMeetingDetail(gatheringId) {
            this.$router.push(`/silverpotion/gathering/home/${gatheringId}`);
        },
        
        // 거리 계산 (Haversine 공식)
        calculateDistance(lat2, lon2) {
            const R = 6371; // 지구 반지름 (km)
            const dLat = this.deg2rad(lat2 - this.currentLocation.lat);
            const dLon = this.deg2rad(lon2 - this.currentLocation.lon);
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.deg2rad(this.currentLocation.lat)) * Math.cos(this.deg2rad(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c; // 킬로미터 단위 거리
            
            return distance.toFixed(1); // 소수점 첫째 자리까지 표시
        },
        
        deg2rad(deg) {
            return deg * (Math.PI/180);
        },
        
        // 날짜 및 시간 포맷팅
        formatDateTime(dateString, timeValue) {
            if (!dateString) return '';
            
            const date = new Date(dateString);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            let timeStr = '';
            
            // timeValue가 배열인 경우 ([시간, 분] 형식)
            if (Array.isArray(timeValue)) {
                const [hours, minutes] = timeValue;
                timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
            // timeValue가 문자열인 경우 (HH:MM:SS 형식)
            else if (typeof timeValue === 'string') {
                timeStr = timeValue.substring(0, 5); // HH:MM 형식으로 변환
            }
            
            return `${month}/${day} ${timeStr}`;
        }
    }
};
</script>

<style scoped>
.fixed-header {
    position: fixed;
    top: 56px; /* 기존 헤더 컴포넌트 높이에 맞게 조정 */
    left: 0;
    right: 0;
    z-index: 999;
    max-width: 768px; /* 앱 컨테이너 크기에 맞게 조정 */
    margin: 0 auto;
    width: 100%;
}

.content-wrapper {
    margin-top: 110px; /* 헤더 높이 + 기존 헤더 컴포넌트 높이에 맞게 조정 */
    padding: 0 16px;
}

.map-container {
    width: 100%;
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
}

.selected-meeting {
    background-color: #E3F2FD !important; /* 하늘색 배경 */
    border-left: 4px solid #2196F3; /* 왼쪽 테두리 강조 */
    transition: background-color 0.3s ease; /* 부드러운 전환 효과 */
}

.meeting-marker {
    transition: transform 0.2s ease;
}

.meeting-marker:hover {
    transform: scale(1.1);
}
</style>