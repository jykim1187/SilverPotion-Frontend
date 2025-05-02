<template>
  <v-container>
    <!-- 검색창 추가 -->
    <div class="search-container">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="지역명을 검색하세요" 
        @input="handleSearch"
        class="search-input"
      />
      <div v-if="searchResults.length > 0" class="search-results">
        <div 
          v-for="(result, index) in searchResults" 
          :key="index" 
          class="search-result-item"
          @click="selectSearchResult(result)"
        >
          {{ result.name }}
        </div>
      </div>
    </div>
    
    <div id="map" ref="mapContainer" style="width: 100%; height: 500px; margin-top: 20px;"></div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import sidoJson from '@/assets/map/sido.json';
import sigJson from '@/assets/map/sig.json';

const mapContainer = ref(null);
const map = ref(null);
const customOverlay = ref(null);
const detailMode = ref(false);
const level = ref(0);
const polygons = ref([]);
const areas = ref([]);
const selectedPolygon = ref(null);

// 검색 관련 변수
const searchQuery = ref('');
const searchResults = ref([]);
const allRegions = ref([]);

onMounted(() => {
  // 카카오맵 API 로드
  loadKakaoMapScript();
  
  // 검색을 위한 모든 지역 데이터 준비
  prepareSearchData();
});

onUnmounted(() => {
  // 지도 인스턴스 정리
  removePolygon();
  map.value = null;
  customOverlay.value = null;
});

// 검색 데이터 준비
const prepareSearchData = () => {
  allRegions.value = [];
  
  // 시군구 데이터 처리
  sigJson.features.forEach(feature => {
    const code = feature.properties.SIG_CD;
    const name = feature.properties.SIG_KOR_NM;
    
    // 시도 코드 추출 (앞 2자리)
    const sidoCode = code.substring(0, 2);
    
    // 시도 데이터에서 해당 코드의 시도명 찾기
    const sido = sidoJson.features.find(feature => 
      feature.properties.CTPRVN_CD === sidoCode
    );
    
    let fullName = name;
    if (sido) {
      fullName = `${sido.properties.SIG_KOR_NM} ${name}`;
    }
    
    allRegions.value.push({
      code: code,
      name: fullName,
      originalName: name
    });
  });
};

// 검색 처리
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  const query = searchQuery.value.toLowerCase();
  searchResults.value = allRegions.value
    .filter(region => region.name.toLowerCase().includes(query))
    .slice(0, 10); // 최대 10개 결과만 표시
};

// 검색 결과 선택 처리
const selectSearchResult = (result) => {
  // 시군구 모드로 전환
  if (!detailMode.value) {
    detailMode.value = true;
    removePolygon();
    initPolygons(sigJson);
    
    // 줌 레벨 조정
    map.value.setLevel(10);
  }
  
  // 해당 지역 찾기
  const targetArea = areas.value.find(area => area.location === result.code);
  if (targetArea) {
    // 해당 지역의 폴리곤 찾기
    const targetIndex = areas.value.indexOf(targetArea);
    const targetPolygon = polygons.value[targetIndex];
    
    // 이전에 선택된 폴리곤이 있으면 스타일 초기화
    if (selectedPolygon.value) {
      selectedPolygon.value.setOptions({ fillColor: '#fff' });
    }
    
    // 현재 폴리곤 선택 상태로 변경
    targetPolygon.setOptions({ fillColor: '#09f' });
    selectedPolygon.value = targetPolygon;
    
    // 지역의 중심점 계산
    /* eslint-disable */
    const bounds = new window.kakao.maps.LatLngBounds();
    targetArea.path.forEach(point => {
      bounds.extend(point);
    });
    
    // 폴리곤의 중심점 계산
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    
    targetArea.path.forEach(point => {
      sumX += point.getLat();
      sumY += point.getLng();
      count++;
    });
    
    // 평균 좌표로 중심점 계산
    const centerLat = sumX / count;
    const centerLng = sumY / count;
    const centerPoint = new window.kakao.maps.LatLng(centerLat, centerLng);
    
    // 지도 중심 이동 및 확대
    map.value.setCenter(centerPoint);
    
    // 지역 크기에 맞게 확대 레벨 조정 (선택 사항)
    map.value.setBounds(bounds);
    
    // 오버레이 위치 및 내용 설정
    customOverlay.value.setContent('<div class="area">' + targetArea.name + '</div>');
    customOverlay.value.setPosition(centerPoint);
    customOverlay.value.setMap(map.value);
    /* eslint-enable */
    
    // 검색창 초기화
    searchQuery.value = '';
    searchResults.value = [];
    
    // 원본 GeoJSON에서 해당 지역의 CEN_POINT 정보 찾기
    const originalFeature = sigJson.features.find(feature => 
      feature.properties.SIG_CD === targetArea.location
    );
    
    const cenPoint = originalFeature?.properties?.CEN_POINT || '정보 없음';
    
    // 콘솔에 지역 정보 출력 (CEN_POINT 추가)
    console.log('지역 코드:', targetArea.location, '지역명:', targetArea.name, 'CEN_POINT:', cenPoint);
  }
};

const loadKakaoMapScript = () => {
  // 이미 로드된 경우 초기화
  if (window.kakao && window.kakao.maps) {
    initMap();
    return;
  }

  const script = document.createElement('script');
  script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=d71cbc8ba66037e7a51920d4429cfeb2&autoload=false';
  script.async = true;
  
  script.onload = () => {
    console.log("카카오 지도 API 로드 완료");
    /* eslint-disable */
    window.kakao.maps.load(() => {
      initMap();
    });
    /* eslint-enable */
  };
  
  script.onerror = (e) => {
    console.error("카카오 지도 API 로드 실패:", e);
  };
  
  document.head.appendChild(script);
};

const initMap = () => {
  if (!mapContainer.value) {
    console.error("지도 컨테이너를 찾을 수 없습니다.");
    return;
  }
  
  console.log("카카오 지도 초기화 시작");
  
  try {
    /* eslint-disable */
    const mapOption = {
      center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 중심좌표
      level: 11 // 지도의 확대 레벨
    };
    
    map.value = new window.kakao.maps.Map(mapContainer.value, mapOption);
    customOverlay.value = new window.kakao.maps.CustomOverlay({});
    
    // 줌 변경 이벤트 리스너 등록
    window.kakao.maps.event.addListener(map.value, 'zoom_changed', handleZoomChanged);
    
    // 초기 시도 데이터 로드
    initPolygons(sidoJson);
    /* eslint-enable */
    
    console.log("카카오 지도가 초기화되었습니다.");
  } catch (error) {
    console.error("카카오 지도 초기화 중 오류 발생:", error);
  }
};

const handleZoomChanged = () => {
  /* eslint-disable */
  level.value = map.value.getLevel();
  
  if (!detailMode.value && level.value <= 10) {
    // 시군구 데이터로 전환
    detailMode.value = true;
    removePolygon();
    initPolygons(sigJson);
  } else if (detailMode.value && level.value > 10) {
    // 시도 데이터로 전환
    detailMode.value = false;
    removePolygon();
    initPolygons(sidoJson);
  }
  /* eslint-enable */
};

const removePolygon = () => {
  /* eslint-disable */
  for (let i = 0; i < polygons.value.length; i++) {
    polygons.value[i].setMap(null);
  }
  areas.value = [];
  polygons.value = [];
  /* eslint-enable */
};

const initPolygons = (geojson) => {
  areas.value = [];
  
  const units = geojson.features;
  
  units.forEach((unit, index) => {
    const coordinates = unit.geometry.coordinates;
    const name = unit.properties.SIG_KOR_NM || unit.properties.CTP_KOR_NM;
    const cd_location = unit.properties.SIG_CD || unit.properties.CTPRVN_CD;
    
    // 시도명 가져오기 (시군구 데이터인 경우)
    let fullName = name;
    if (unit.properties.SIG_KOR_NM) {
      // 시군구 코드에서 시도 코드 추출 (앞 2자리)
      const sidoCode = cd_location.substring(0, 2);
      // 시도 데이터에서 해당 코드의 시도명 찾기
      const sido = sidoJson.features.find(feature => 
        feature.properties.CTPRVN_CD === sidoCode
      );
      if (sido) {
        fullName = `${sido.properties.SIG_KOR_NM} ${name}`;
      }
    }
    
    const area = {
      name: fullName, // 수정된 이름 사용
      path: [],
      location: cd_location
    };
    
    // 좌표 변환
    /* eslint-disable */
    if (coordinates && coordinates.length > 0 && coordinates[0].length > 0) {
      coordinates[0].forEach(coordinate => {
        area.path.push(new window.kakao.maps.LatLng(coordinate[1], coordinate[0]));
      });
    }
    
    areas.value[index] = area;
    /* eslint-enable */
  });
  
  // 지도에 영역데이터를 폴리곤으로 표시
  for (let i = 0; i < areas.value.length; i++) {
    displayArea(areas.value[i]);
  }
};

const displayArea = (area) => {
  /* eslint-disable */
  const polygon = new window.kakao.maps.Polygon({
    map: map.value,
    path: area.path,
    strokeWeight: 2,
    strokeColor: '#004c80',
    strokeOpacity: 0.8,
    fillColor: '#fff',
    fillOpacity: 0.7
  });
  
  polygons.value.push(polygon);
  
  // 클릭 이벤트만 등록
  window.kakao.maps.event.addListener(polygon, 'click', (mouseEvent) => {
    if (!detailMode.value) {
      map.value.setLevel(10);
      const latlng = mouseEvent.latLng;
      map.value.panTo(latlng);
    } else {
      // 이전에 선택된 폴리곤이 있으면 스타일 초기화
      if (selectedPolygon.value) {
        selectedPolygon.value.setOptions({ fillColor: '#fff' });
      }
      
      // 현재 폴리곤 선택 상태로 변경
      polygon.setOptions({ fillColor: '#09f' });
      selectedPolygon.value = polygon;
      
      // 오버레이 위치 및 내용 설정
      customOverlay.value.setContent('<div class="area">' + area.name + '</div>');
      customOverlay.value.setPosition(mouseEvent.latLng);
      customOverlay.value.setMap(map.value);
      
      // 원본 GeoJSON에서 해당 지역의 CEN_POINT 정보 찾기
      const originalFeature = sigJson.features.find(feature => 
        feature.properties.SIG_CD === area.location
      );
      
      const cenPoint = originalFeature?.properties?.CEN_POINT || '정보 없음';
      
      // 콘솔에 지역 정보 출력 (CEN_POINT 추가)
      console.log('지역 코드:', area.location, '지역명:', area.name, 'CEN_POINT:', cenPoint);
    }
  });
  /* eslint-enable */
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 500px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  position: relative;
}

.area {
  position: absolute;
  background: #fff;
  border: 1px solid #888;
  border-radius: 3px;
  font-size: 12px;
  padding: 5px;
  left: -30px;
  top: -30px;
  white-space: nowrap;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 10px;
  z-index: 10;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-results {
  position: absolute;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.search-result-item {
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.search-result-item:last-child {
  border-bottom: none;
}
</style>