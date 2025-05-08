<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">정모 만들기</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
                <!-- 정모 이미지 업로드 -->
                <div class="text-center mb-6">
                    <!-- 이미지 크롭 다이얼로그 -->
                    <v-dialog
                        v-model="showCropDialog"
                        max-width="800px"
                        persistent
                        :retain-focus="false"
                    >
                        <v-card>
                            <v-card-title class="text-h6">이미지 자르기</v-card-title>
                            <v-card-text>
                                <div class="crop-container">
                                    <div class="crop-wrapper" ref="cropWrapper">
                                        <div 
                                            class="image-container"
                                            :style="{
                                                transform: `scale(${imageScale}) translate(${imageTranslateX}px, ${imageTranslateY}px)`,
                                                transformOrigin: 'top left',
                                                position: 'absolute'
                                            }"
                                        >
                                            <img 
                                                ref="cropImage" 
                                                :src="originalImage" 
                                                alt="원본 이미지" 
                                                class="crop-original-image"
                                                @load="initCropArea"
                                                @mousedown="startImageDrag"
                                                @touchstart="startImageTouch"
                                                :style="{
                                                    cursor: isImageDragging ? 'grabbing' : 'grab',
                                                    maxWidth: 'none',
                                                    maxHeight: 'none'
                                                }"
                                            >
                                            <!-- 이미지 크기 조절 핸들 (4개 모서리) -->
                                            <div class="resize-handle image-resize-handle image-resize-handle-nw" @mousedown.stop="startImageResize('nw')" @touchstart.stop="startImageResizeTouch('nw')"></div>
                                            <div class="resize-handle image-resize-handle image-resize-handle-ne" @mousedown.stop="startImageResize('ne')" @touchstart.stop="startImageResizeTouch('ne')"></div>
                                            <div class="resize-handle image-resize-handle image-resize-handle-sw" @mousedown.stop="startImageResize('sw')" @touchstart.stop="startImageResizeTouch('sw')"></div>
                                            <div class="resize-handle image-resize-handle image-resize-handle-se" @mousedown.stop="startImageResize('se')" @touchstart.stop="startImageResizeTouch('se')"></div>
                                        </div>
                                        
                                        <div 
                                            ref="cropArea" 
                                            class="crop-area"
                                            @mousedown.stop="startDrag"
                                            @touchstart.stop="startTouch"
                                            :style="{
                                                width: cropAreaWidth + 'px',
                                                height: cropAreaHeight + 'px',
                                                left: cropAreaLeft + 'px',
                                                top: cropAreaTop + 'px'
                                            }"
                                        >
                                            <!-- 크롭 영역 크기 조절 핸들 -->
                                            <div class="resize-handle resize-handle-nw" @mousedown.stop="startResize('nw')" @touchstart.stop="startResizeTouch('nw')"></div>
                                            <div class="resize-handle resize-handle-ne" @mousedown.stop="startResize('ne')" @touchstart.stop="startResizeTouch('ne')"></div>
                                            <div class="resize-handle resize-handle-sw" @mousedown.stop="startResize('sw')" @touchstart.stop="startResizeTouch('sw')"></div>
                                            <div class="resize-handle resize-handle-se" @mousedown.stop="startResize('se')" @touchstart.stop="startResizeTouch('se')"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- 이미지 확대/축소 컨트롤 -->
                                <div class="zoom-controls">
                                    <v-btn icon size="small" @click="zoomOut" class="zoom-btn">
                                        <v-icon>mdi-minus</v-icon>
                                    </v-btn>
                                    <span class="zoom-text">{{ Math.round(imageScale * 100) }}%</span>
                                    <v-btn icon size="small" @click="zoomIn" class="zoom-btn">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </div>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="error" text @click="cancelCrop">취소</v-btn>
                                <v-btn color="primary" @click="confirmCrop">확인</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <div class="avatar-container">
                        <div class="image-preview-container mb-2 mx-auto" @click="triggerFileInput" style="cursor: pointer">
                            <v-img 
                                :src="previewImage || require('@/assets/default-gathering.png')" 
                                width="300"
                                height="300"
                                cover
                                alt="정모 이미지"
                                class="rounded"
                            ></v-img>
                            <div class="edit-overlay rounded">
                                <v-icon color="white">mdi-pencil</v-icon>
                            </div>
                        </div>
                    </div>
                    <div>
                        <v-file-input
                            ref="fileInput"
                            v-model="imageFile"
                            accept="image/*"
                            prepend-icon=""
                            variant="outlined"
                            density="compact"
                            hide-details
                            class="d-none"
                            @change="handleImageSelected"
                            :rules="imageRules"
                        ></v-file-input>
                    </div>
                </div>

                <!-- 정모명 입력 -->
                <div class="form-field">
                    <v-text-field
                        v-model="meeting.name"
                        label="정모명"
                        variant="outlined"
                        :rules="nameRules"
                        counter="50"
                        required
                        prepend-inner-icon="mdi-calendar-text"
                        density="comfortable"
                        bg-color="white"
                        class="mb-4"
                    ></v-text-field>
                </div>

                <!-- 날짜 선택 -->
                <div class="form-field">
                    <v-text-field
                        v-model="meeting.meetingDate"
                        label="날짜"
                        variant="outlined"
                        type="date"
                        :rules="dateRules"
                        :min="minDate"
                        required
                        prepend-inner-icon="mdi-calendar"
                        density="comfortable"
                        bg-color="white"
                        class="mb-4"
                    ></v-text-field>
                </div>

                <!-- 시간 선택 -->
                <div class="form-field">
                    <v-text-field
                        v-model="meeting.meetingTime"
                        label="시간"
                        variant="outlined"
                        type="time"
                        :rules="timeRules"
                        required
                        prepend-inner-icon="mdi-clock-outline"
                        density="comfortable"
                        bg-color="white"
                        class="mb-4"
                    ></v-text-field>
                </div>

                <!-- 장소 입력 -->
                <div class="form-field">
                    <v-text-field
                        v-model="meeting.place"
                        label="장소"
                        variant="outlined"
                        :rules="placeRules"
                        counter="100"
                        required
                        prepend-inner-icon="mdi-map-marker"
                        density="comfortable"
                        bg-color="white"
                        class="mb-4"
                        readonly
                        @click="openMapDialog"
                    ></v-text-field>
                </div>

                <!-- 비용 입력 -->
                <div class="form-field">
                    <v-text-field
                        v-model.number="meeting.cost"
                        label="비용"
                        variant="outlined"
                        type="number"
                        :rules="costRules"
                        min="0"
                        required
                        prepend-inner-icon="mdi-currency-krw"
                        density="comfortable"
                        bg-color="white"
                        class="mb-4"
                    ></v-text-field>
                </div>

                <!-- 최대 인원 입력 -->
                <div class="form-field">
                    <v-text-field
                        v-model.number="meeting.maxPeople"
                        label="최대 인원"
                        variant="outlined"
                        type="number"
                        :rules="maxPeopleRules"
                        min="1"
                        required
                        prepend-inner-icon="mdi-account-group"
                        density="comfortable"
                        bg-color="white"
                        class="mb-4"
                    ></v-text-field>
                </div>

                <!-- 카카오맵 검색 다이얼로그 -->
                <v-dialog
                    v-model="showMapDialog"
                    max-width="800px"
                    persistent
                    :retain-focus="false"
                >
                    <v-card>
                        <v-card-title class="text-h6">장소 검색</v-card-title>
                        <v-card-text>
                            <div class="search-container mb-3">
                                <v-text-field
                                    v-model="searchKeyword"
                                    label="장소 검색"
                                    variant="outlined"
                                    density="comfortable"
                                    bg-color="white"
                                    prepend-inner-icon="mdi-magnify"
                                    @keyup.enter="searchPlaces"
                                    class="search-input"
                                ></v-text-field>
                                <v-btn color="primary" variant="tonal" class="search-btn" @click="searchPlaces">검색</v-btn>
                            </div>
                            
                            <div class="map-container">
                                <div id="kakaoMap" style="width:100%; height:400px;"></div>
                            </div>
                            
                            <div class="search-results mt-3" v-if="searchResults.length > 0">
                                <v-list>
                                    <v-list-item
                                        v-for="(place, index) in searchResults"
                                        :key="index"
                                        @click="selectPlace(place)"
                                        :class="{ 'selected-place': selectedPlace && selectedPlace.id === place.id }"
                                    >
                                        <v-list-item-title>{{ place.place_name }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ place.address_name }}</v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </div>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" text @click="cancelMapSelection">취소</v-btn>
                            <v-btn color="primary" @click="confirmMapSelection" :disabled="!selectedPlace">확인</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- 생성 버튼 -->
                <div class="d-flex justify-end mt-6">
                    <v-btn
                        color="primary"
                        variant="tonal"
                        type="submit"
                        :loading="isSubmitting"
                        :disabled="!valid || isSubmitting"
                        block
                    >
                        정모 생성하기
                    </v-btn>
                </div>
            </v-form>
        </div>
    </v-container>
</template>

<script>
import axios from 'axios';

export default{
    data(){
        return {
            valid: false,
            isSubmitting: false,
            imageFile: null,
            previewImage: null,
            originalImage: null,
            showCropDialog: false,
            showMapDialog: false,
            searchKeyword: '',
            searchResults: [],
            selectedPlace: null,
            kakaoMap: null,
            markers: [],
            meeting: {
                gatheringId: null,
                name: '',
                meetingDate: '',
                meetingTime: '',
                place: '',
                lat: '',
                lon: '',
                cost: '',
                maxPeople: ''
            },
            nameRules: [
                v => !!v || '정모 이름은 필수입니다',
                v => (v && v.length <= 50) || '정모 이름은 50자 이하여야 합니다'
            ],
            dateRules: [
                v => !!v || '날짜는 필수입니다'
            ],
            timeRules: [
                v => !!v || '시간은 필수입니다'
            ],
            placeRules: [
                v => !!v || '장소는 필수입니다'
            ],
            costRules: [
                v => !!v || '비용은 필수입니다',
                v => v >= 0 || '비용은 0 이상이어야 합니다'
            ],
            maxPeopleRules: [
                v => !!v || '최대 인원은 필수입니다',
                v => v > 0 || '최대 인원은 1명 이상이어야 합니다'
            ],
            imageRules: [
                v => !!v || '이미지는 필수입니다'
            ],
            
            // 크롭 영역 관련 데이터
            cropAreaWidth: 300,
            cropAreaHeight: 300,
            cropAreaLeft: 0,
            cropAreaTop: 0,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            initialLeft: 0,
            initialTop: 0,
            imageWidth: 0,
            imageHeight: 0,
            imageScale: 1, // 이미지 확대/축소 비율
            originalImageWidth: 0,
            originalImageHeight: 0,
            
            // 이미지 드래그 관련 데이터
            imageTranslateX: 0,
            imageTranslateY: 0,
            isImageDragging: false,
            imageDragStartX: 0,
            imageDragStartY: 0,
            initialImageTranslateX: 0,
            initialImageTranslateY: 0,
            
            // 크롭 영역 크기 조절 관련 데이터
            isResizing: false,
            resizeDirection: '',
            resizeStartX: 0,
            resizeStartY: 0,
            initialCropWidth: 0,
            initialCropHeight: 0,
            initialCropLeft: 0,
            initialCropTop: 0,
            cropSizeScale: 1, // 크롭 영역 크기 스케일
            baseCropWidth: 300, // 기본 크롭 영역 너비
            baseCropHeight: 300, // 기본 크롭 영역 높이
            
            // 이미지 크기 조절 관련 데이터
            isImageResizing: false,
            imageResizeDirection: '',
            imageResizeStartX: 0,
            imageResizeStartY: 0,
            initialImageScale: 1,
            infowindow: null, // 인포윈도우 객체 추가
        }
    },
    computed: {
        minDate() {
            // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    },
    created() {
        // URL에서 gatheringId 파라미터 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        this.meeting.gatheringId = urlParams.get('gatheringId');
    },
    mounted() {
        // 카카오맵 API 로드
        this.loadKakaoMapScript();
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        triggerFileInput() {
            // 파일 입력 초기화 후 클릭
            if (this.$refs.fileInput) {
                this.$refs.fileInput.$el.querySelector('input').value = '';
            }
            this.$refs.fileInput.$el.querySelector('input').click();
        },
        handleImageSelected() {
            if (!this.imageFile) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.originalImage = e.target.result;
                this.showCropDialog = true;
                this.$nextTick(() => {
                    this.initCropArea();
                });
            };
            reader.readAsDataURL(this.imageFile);
        },
        
        // 이미지 크롭 관련 메소드
        initCropArea() {
            // 이미지 로드 후 크롭 영역 초기화
            const img = this.$refs.cropImage;
            const wrapper = this.$refs.cropWrapper;
            
            // 원본 이미지 크기 저장
            this.originalImageWidth = img.naturalWidth;
            this.originalImageHeight = img.naturalHeight;
            
            // 이미지 초기 스케일 계산 (컨테이너에 맞게)
            const containerWidth = wrapper.offsetWidth;
            const containerHeight = 500; // 최대 높이
            
            // 이미지가 컨테이너에 맞도록 초기 스케일 계산
            const scaleX = containerWidth / this.originalImageWidth;
            const scaleY = containerHeight / this.originalImageHeight;
            this.imageScale = Math.min(scaleX, scaleY, 1); // 1보다 크지 않게
            
            // 현재 이미지 크기 계산 (스케일 적용)
            this.imageWidth = this.originalImageWidth * this.imageScale;
            this.imageHeight = this.originalImageHeight * this.imageScale;
            
            // 크롭 영역 초기화
            this.cropAreaWidth = this.baseCropWidth;
            this.cropAreaHeight = this.baseCropHeight;
            this.cropSizeScale = 1;
            
            // 크롭 영역을 이미지 중앙에 배치
            this.cropAreaLeft = (this.imageWidth - this.cropAreaWidth) / 2;
            this.cropAreaTop = (this.imageHeight - this.cropAreaHeight) / 2;
            
            // 이벤트 리스너 추가
            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.stopDrag);
            document.addEventListener('mousemove', this.onImageDrag);
            document.addEventListener('mouseup', this.stopImageDrag);
            document.addEventListener('touchmove', this.onTouch, { passive: false });
            document.addEventListener('touchend', this.stopTouch);
            document.addEventListener('touchmove', this.onImageTouch, { passive: false });
            document.addEventListener('touchend', this.stopImageTouch);
        },
        
        // 크롭 영역 드래그 시작
        startDrag(e) {
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.initialLeft = this.cropAreaLeft;
            this.initialTop = this.cropAreaTop;
            e.preventDefault();
        },
        
        // 크롭 영역 드래그 중
        onDrag(e) {
            if (!this.isDragging) return;
            
            // 드래그 거리 계산
            const dx = e.clientX - this.dragStartX;
            const dy = e.clientY - this.dragStartY;
            
            // 새 위치 계산
            let newLeft = this.initialLeft + dx;
            let newTop = this.initialTop + dy;
            
            // 위치 업데이트 (제한 없이 자유롭게 이동)
            this.cropAreaLeft = newLeft;
            this.cropAreaTop = newTop;
        },
        
        // 크롭 영역 드래그 종료
        stopDrag() {
            this.isDragging = false;
        },
        
        // 크롭 영역 터치 시작
        startTouch(e) {
            this.isDragging = true;
            this.dragStartX = e.touches[0].clientX;
            this.dragStartY = e.touches[0].clientY;
            this.initialLeft = this.cropAreaLeft;
            this.initialTop = this.cropAreaTop;
            e.preventDefault();
        },
        
        // 크롭 영역 터치 이동
        onTouch(e) {
            if (!this.isDragging) return;
            
            // 드래그 거리 계산
            const dx = e.touches[0].clientX - this.dragStartX;
            const dy = e.touches[0].clientY - this.dragStartY;
            
            // 새 위치 계산
            let newLeft = this.initialLeft + dx;
            let newTop = this.initialTop + dy;
            
            // 위치 업데이트 (제한 없이 자유롭게 이동)
            this.cropAreaLeft = newLeft;
            this.cropAreaTop = newTop;
            
            e.preventDefault();
        },
        
        // 크롭 영역 터치 종료
        stopTouch() {
            this.isDragging = false;
        },
        
        // 이미지 드래그 시작
        startImageDrag(e) {
            this.isImageDragging = true;
            this.imageDragStartX = e.clientX;
            this.imageDragStartY = e.clientY;
            this.initialImageTranslateX = this.imageTranslateX;
            this.initialImageTranslateY = this.imageTranslateY;
            e.preventDefault();
        },
        
        // 이미지 드래그 중
        onImageDrag(e) {
            if (!this.isImageDragging) return;
            
            // 드래그 거리 계산
            const dx = e.clientX - this.imageDragStartX;
            const dy = e.clientY - this.imageDragStartY;
            
            // 새 위치 계산
            this.imageTranslateX = this.initialImageTranslateX + dx / this.imageScale;
            this.imageTranslateY = this.initialImageTranslateY + dy / this.imageScale;
        },
        
        // 이미지 드래그 종료
        stopImageDrag() {
            this.isImageDragging = false;
        },
        
        // 이미지 터치 시작
        startImageTouch(e) {
            this.isImageDragging = true;
            this.imageDragStartX = e.touches[0].clientX;
            this.imageDragStartY = e.touches[0].clientY;
            this.initialImageTranslateX = this.imageTranslateX;
            this.initialImageTranslateY = this.imageTranslateY;
            e.preventDefault();
        },
        
        // 이미지 터치 이동
        onImageTouch(e) {
            if (!this.isImageDragging) return;
            
            // 드래그 거리 계산
            const dx = e.touches[0].clientX - this.imageDragStartX;
            const dy = e.touches[0].clientY - this.imageDragStartY;
            
            // 새 위치 계산
            this.imageTranslateX = this.initialImageTranslateX + dx / this.imageScale;
            this.imageTranslateY = this.initialImageTranslateY + dy / this.imageScale;
            
            e.preventDefault();
        },
        
        // 이미지 터치 종료
        stopImageTouch() {
            this.isImageDragging = false;
        },
        
        // 이미지 확대
        zoomIn() {
            // 10% 확대
            const newScale = Math.min(3, this.imageScale * 1.1);
            this.updateImageScale(newScale);
        },
        
        // 이미지 축소
        zoomOut() {
            // 10% 축소
            const newScale = Math.max(0.1, this.imageScale * 0.9);
            this.updateImageScale(newScale);
        },
        
        // 이미지 스케일 업데이트
        updateImageScale(newScale) {
            // 새 이미지 크기 계산
            const newWidth = this.originalImageWidth * newScale;
            const newHeight = this.originalImageHeight * newScale;
            
            // 이미지 중심점 계산
            const centerX = this.imageTranslateX + (this.imageWidth / 2);
            const centerY = this.imageTranslateY + (this.imageHeight / 2);
            
            // 새 위치 계산 (중심점 유지)
            const newTranslateX = centerX - (newWidth / 2);
            const newTranslateY = centerY - (newHeight / 2);
            
            // 값 업데이트
            this.imageScale = newScale;
            this.imageWidth = newWidth;
            this.imageHeight = newHeight;
            this.imageTranslateX = newTranslateX;
            this.imageTranslateY = newTranslateY;
        },
        
        // 크롭 영역 크기 조절 시작 (마우스)
        startResize(direction) {
            this.isResizing = true;
            this.resizeDirection = direction;
            this.resizeStartX = event.clientX;
            this.resizeStartY = event.clientY;
            this.initialCropWidth = this.cropAreaWidth;
            this.initialCropHeight = this.cropAreaHeight;
            this.initialCropLeft = this.cropAreaLeft;
            this.initialCropTop = this.cropAreaTop;
            
            document.addEventListener('mousemove', this.onResize);
            document.addEventListener('mouseup', this.stopResize);
            event.preventDefault();
        },
        
        // 크롭 영역 크기 조절 중 (마우스)
        onResize(e) {
            if (!this.isResizing) return;
            
            // 마우스 이동 거리 계산
            const dx = e.clientX - this.resizeStartX;
            
            // 비율 유지를 위한 계산
            let newWidth, newHeight, newLeft, newTop;
            
            // 방향에 따라 다르게 처리
            switch (this.resizeDirection) {
                case 'se': // 우측 하단
                    newWidth = this.initialCropWidth + dx;
                    newHeight = newWidth; // 1:1 비율 유지
                    newLeft = this.initialCropLeft;
                    newTop = this.initialCropTop;
                    break;
                case 'sw': // 좌측 하단
                    newWidth = this.initialCropWidth - dx;
                    newHeight = newWidth; // 1:1 비율 유지
                    newLeft = this.initialCropLeft + dx;
                    newTop = this.initialCropTop;
                    break;
                case 'ne': // 우측 상단
                    newWidth = this.initialCropWidth + dx;
                    newHeight = newWidth; // 1:1 비율 유지
                    newLeft = this.initialCropLeft;
                    newTop = this.initialCropTop - (newWidth - this.initialCropWidth);
                    break;
                case 'nw': // 좌측 상단
                    newWidth = this.initialCropWidth - dx;
                    newHeight = newWidth; // 1:1 비율 유지
                    newLeft = this.initialCropLeft + dx;
                    newTop = this.initialCropTop + (this.initialCropWidth - newWidth);
                    break;
            }
            
            // 최소 크기 제한
            if (newWidth < 100) {
                newWidth = 100;
                newHeight = 100;
                
                // 위치 조정
                switch (this.resizeDirection) {
                    case 'sw':
                        newLeft = this.initialCropLeft + (this.initialCropWidth - 100);
                        break;
                    case 'ne':
                        newTop = this.initialCropTop - (100 - this.initialCropWidth);
                        break;
                    case 'nw':
                        newLeft = this.initialCropLeft + (this.initialCropWidth - 100);
                        newTop = this.initialCropTop + (this.initialCropWidth - 100);
                        break;
                }
            }
            
            // 최대 크기 제한
            if (newWidth > 600) {
                newWidth = 600;
                newHeight = 600;
                
                // 위치 조정
                switch (this.resizeDirection) {
                    case 'sw':
                        newLeft = this.initialCropLeft - (600 - this.initialCropWidth);
                        break;
                    case 'ne':
                        newTop = this.initialCropTop - (600 - this.initialCropWidth);
                        break;
                    case 'nw':
                        newLeft = this.initialCropLeft - (600 - this.initialCropWidth);
                        newTop = this.initialCropTop - (600 - this.initialCropWidth);
                        break;
                }
            }
            
            // 크롭 영역 업데이트
            this.cropAreaWidth = newWidth;
            this.cropAreaHeight = newHeight;
            this.cropAreaLeft = newLeft;
            this.cropAreaTop = newTop;
            
            // 크롭 크기 스케일 업데이트
            this.cropSizeScale = newWidth / this.baseCropWidth;
        },
        
        // 크롭 영역 크기 조절 종료 (마우스)
        stopResize() {
            this.isResizing = false;
            document.removeEventListener('mousemove', this.onResize);
            document.removeEventListener('mouseup', this.stopResize);
        },
        
        // 크롭 영역 크기 조절 시작 (터치)
        startResizeTouch(direction) {
            this.isResizing = true;
            this.resizeDirection = direction;
            this.resizeStartX = event.touches[0].clientX;
            this.resizeStartY = event.touches[0].clientY;
            this.initialCropWidth = this.cropAreaWidth;
            this.initialCropHeight = this.cropAreaHeight;
            this.initialCropLeft = this.cropAreaLeft;
            this.initialCropTop = this.cropAreaTop;
            
            document.addEventListener('touchmove', this.onResizeTouch, { passive: false });
            document.addEventListener('touchend', this.stopResizeTouch);
            event.preventDefault();
        },
        
        // 크롭 영역 크기 조절 중 (터치)
        onResizeTouch(e) {
            if (!this.isResizing) return;
            
            // 터치 이동 거리 계산
            const dx = e.touches[0].clientX - this.resizeStartX;
            
            // 비율 유지를 위한 계산
            let newWidth, newHeight, newLeft, newTop;
            
            // 방향에 따라 다르게 처리
            switch (this.resizeDirection) {
                case 'se': // 우측 하단
                    newWidth = this.initialCropWidth + dx;
                    newHeight = newWidth; // 1:1 비율 유지
                    newLeft = this.initialCropLeft;
                    newTop = this.initialCropTop;
                    break;
                case 'sw': // 좌측 하단
                    newWidth = this.initialCropWidth - dx;
                    newHeight = newWidth; // 1:1 비율 유지
                    newLeft = this.initialCropLeft + dx;
                    newTop = this.initialCropTop;
                    break;
                case 'ne': // 우측 상단
                    newWidth = this.initialCropWidth + dx;
                    newHeight = newWidth; // 1:1 비율 유지
                    newLeft = this.initialCropLeft;
                    newTop = this.initialCropTop - (newWidth - this.initialCropWidth);
                    break;
                case 'nw': // 좌측 상단
                    newWidth = this.initialCropWidth - dx;
                    newHeight = newWidth; // 1:1 비율 유지
                    newLeft = this.initialCropLeft + dx;
                    newTop = this.initialCropTop + (this.initialCropWidth - newWidth);
                    break;
            }
            
            // 최소 크기 제한
            if (newWidth < 100) {
                newWidth = 100;
                newHeight = 100;
                
                // 위치 조정
                switch (this.resizeDirection) {
                    case 'sw':
                        newLeft = this.initialCropLeft + (this.initialCropWidth - 100);
                        break;
                    case 'ne':
                        newTop = this.initialCropTop - (100 - this.initialCropWidth);
                        break;
                    case 'nw':
                        newLeft = this.initialCropLeft + (this.initialCropWidth - 100);
                        newTop = this.initialCropTop + (this.initialCropWidth - 100);
                        break;
                }
            }
            
            // 최대 크기 제한
            if (newWidth > 600) {
                newWidth = 600;
                newHeight = 600;
                
                // 위치 조정
                switch (this.resizeDirection) {
                    case 'sw':
                        newLeft = this.initialCropLeft - (600 - this.initialCropWidth);
                        break;
                    case 'ne':
                        newTop = this.initialCropTop - (600 - this.initialCropWidth);
                        break;
                    case 'nw':
                        newLeft = this.initialCropLeft - (600 - this.initialCropWidth);
                        newTop = this.initialCropTop - (600 - this.initialCropWidth);
                        break;
                }
            }
            
            // 크롭 영역 업데이트
            this.cropAreaWidth = newWidth;
            this.cropAreaHeight = newHeight;
            this.cropAreaLeft = newLeft;
            this.cropAreaTop = newTop;
            
            // 크롭 크기 스케일 업데이트
            this.cropSizeScale = newWidth / this.baseCropWidth;
            
            e.preventDefault();
        },
        
        // 크롭 영역 크기 조절 종료 (터치)
        stopResizeTouch() {
            this.isResizing = false;
            document.removeEventListener('touchmove', this.onResizeTouch);
            document.removeEventListener('touchend', this.stopResizeTouch);
        },
        
        // 슬라이더로 크롭 영역 크기 변경
        onCropSizeChange() {
            const newWidth = this.baseCropWidth * this.cropSizeScale;
            const newHeight = this.baseCropHeight * this.cropSizeScale;
            
            // 크기 변경 시 중앙 기준으로 확대/축소
            const widthDiff = newWidth - this.cropAreaWidth;
            const heightDiff = newHeight - this.cropAreaHeight;
            
            this.cropAreaLeft -= widthDiff / 2;
            this.cropAreaTop -= heightDiff / 2;
            this.cropAreaWidth = newWidth;
            this.cropAreaHeight = newHeight;
        },
        
        // 크롭 영역 크기 증가
        increaseCropSize() {
            if (this.cropSizeScale < 2) {
                this.cropSizeScale += 0.1;
                this.onCropSizeChange();
            }
        },
        
        // 크롭 영역 크기 감소
        decreaseCropSize() {
            if (this.cropSizeScale > 0.3) {
                this.cropSizeScale -= 0.1;
                this.onCropSizeChange();
            }
        },
        
        // 이미지 크기 조절 시작
        startImageResize(direction) {
            this.isImageResizing = true;
            this.imageResizeDirection = direction;
            this.imageResizeStartX = event.clientX;
            this.imageResizeStartY = event.clientY;
            this.initialImageScale = this.imageScale;
            
            document.addEventListener('mousemove', this.onImageResize);
            document.addEventListener('mouseup', this.stopImageResize);
            event.preventDefault();
        },
        
        // 이미지 크기 조절 중
        onImageResize(e) {
            if (!this.isImageResizing) return;
            
            // 마우스 이동 거리 계산
            const dx = e.clientX - this.imageResizeStartX;
            const dy = e.clientY - this.imageResizeStartY;
            
            // 이미지 스케일 계산
            let newScale = this.initialImageScale;
            
            // 방향에 따라 다르게 처리
            switch (this.imageResizeDirection) {
                case 'se': // 우측 하단 - 오른쪽/아래로 드래그하면 확대
                    newScale = this.initialImageScale * (1 + (dx + dy) / 400);
                    break;
                case 'sw': // 좌측 하단 - 왼쪽으로 드래그하면 축소, 아래로 드래그하면 확대
                    newScale = this.initialImageScale * (1 + (-dx + dy) / 400);
                    break;
                case 'ne': // 우측 상단 - 오른쪽으로 드래그하면 확대, 위로 드래그하면 축소
                    newScale = this.initialImageScale * (1 + (dx - dy) / 400);
                    break;
                case 'nw': // 좌측 상단 - 왼쪽/위로 드래그하면 축소
                    newScale = this.initialImageScale * (1 + (-dx - dy) / 400);
                    break;
            }
            
            // 최소/최대 스케일 제한
            newScale = Math.max(0.1, Math.min(3, newScale));
            
            // 이미지 스케일 업데이트
            this.imageScale = newScale;
            
            // 이미지 크기 업데이트
            this.imageWidth = this.originalImageWidth * this.imageScale;
            this.imageHeight = this.originalImageHeight * this.imageScale;
        },
        
        // 이미지 크기 조절 종료
        stopImageResize() {
            this.isImageResizing = false;
            document.removeEventListener('mousemove', this.onImageResize);
            document.removeEventListener('mouseup', this.stopImageResize);
        },
        
        // 이미지 크기 조절 시작 (터치)
        startImageResizeTouch(direction) {
            this.isImageResizing = true;
            this.imageResizeDirection = direction;
            this.imageResizeStartX = event.touches[0].clientX;
            this.imageResizeStartY = event.touches[0].clientY;
            this.initialImageScale = this.imageScale;
            
            document.addEventListener('touchmove', this.onImageResizeTouch, { passive: false });
            document.addEventListener('touchend', this.stopImageResizeTouch);
            event.preventDefault();
        },
        
        // 이미지 크기 조절 중 (터치)
        onImageResizeTouch(e) {
            if (!this.isImageResizing) return;
            
            // 터치 이동 거리 계산
            const dx = e.touches[0].clientX - this.imageResizeStartX;
            const dy = e.touches[0].clientY - this.imageResizeStartY;
            
            // 이미지 스케일 계산
            let newScale = this.initialImageScale;
            
            // 방향에 따라 다르게 처리
            switch (this.imageResizeDirection) {
                case 'se': // 우측 하단 - 오른쪽/아래로 드래그하면 확대
                    newScale = this.initialImageScale * (1 + (dx + dy) / 400);
                    break;
                case 'sw': // 좌측 하단 - 왼쪽으로 드래그하면 축소, 아래로 드래그하면 확대
                    newScale = this.initialImageScale * (1 + (-dx + dy) / 400);
                    break;
                case 'ne': // 우측 상단 - 오른쪽으로 드래그하면 확대, 위로 드래그하면 축소
                    newScale = this.initialImageScale * (1 + (dx - dy) / 400);
                    break;
                case 'nw': // 좌측 상단 - 왼쪽/위로 드래그하면 축소
                    newScale = this.initialImageScale * (1 + (-dx - dy) / 400);
                    break;
            }
            
            // 최소/최대 스케일 제한
            newScale = Math.max(0.1, Math.min(3, newScale));
            
            // 이미지 스케일 업데이트
            this.imageScale = newScale;
            
            // 이미지 크기 업데이트
            this.imageWidth = this.originalImageWidth * this.imageScale;
            this.imageHeight = this.originalImageHeight * this.imageScale;
            
            e.preventDefault();
        },
        
        // 이미지 크기 조절 종료 (터치)
        stopImageResizeTouch() {
            this.isImageResizing = false;
            document.removeEventListener('touchmove', this.onImageResizeTouch);
            document.removeEventListener('touchend', this.stopImageResizeTouch);
        },
        
        // 이벤트 리스너 제거
        removeEventListeners() {
            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.stopDrag);
            document.removeEventListener('mousemove', this.onImageDrag);
            document.removeEventListener('mouseup', this.stopImageDrag);
            document.removeEventListener('touchmove', this.onTouch);
            document.removeEventListener('touchend', this.stopTouch);
            document.removeEventListener('touchmove', this.onImageTouch);
            document.removeEventListener('touchend', this.stopImageTouch);
            document.removeEventListener('mousemove', this.onResize);
            document.removeEventListener('mouseup', this.stopResize);
            document.removeEventListener('touchmove', this.onResizeTouch);
            document.removeEventListener('touchend', this.stopResizeTouch);
            document.removeEventListener('mousemove', this.onImageResize);
            document.removeEventListener('mouseup', this.stopImageResize);
            document.removeEventListener('touchmove', this.onImageResizeTouch);
            document.removeEventListener('touchend', this.stopImageResizeTouch);
        },
        
        // 크롭 취소
        cancelCrop() {
            this.showCropDialog = false;
            this.imageFile = null;
            this.originalImage = null;
            this.removeEventListeners();
        },
        
        // 크롭 확인
        confirmCrop() {
            // 캔버스 생성
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 캔버스 크기 설정 (최종 이미지 크기)
            canvas.width = 300;
            canvas.height = 300;
            
            // 이미지 객체 생성
            const img = this.$refs.cropImage;
            
            // 크롭 영역 계산
            const cropX = (this.cropAreaLeft - this.imageTranslateX * this.imageScale) / this.imageScale;
            const cropY = (this.cropAreaTop - this.imageTranslateY * this.imageScale) / this.imageScale;
            const cropWidth = this.cropAreaWidth / this.imageScale;
            const cropHeight = this.cropAreaHeight / this.imageScale;
            
            // 이미지 그리기
            ctx.drawImage(
                img,
                cropX, cropY, cropWidth, cropHeight,
                0, 0, canvas.width, canvas.height
            );
            
            // 캔버스를 Blob으로 변환
            canvas.toBlob((blob) => {
                // 파일 객체 생성
                const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                
                // 미리보기 이미지 설정
                this.previewImage = URL.createObjectURL(blob);
                
                // 파일 입력 업데이트
                this.imageFile = croppedFile;
                
                // 다이얼로그 닫기
                this.showCropDialog = false;
                
                // 이벤트 리스너 제거
                this.removeEventListeners();
            }, 'image/jpeg', 0.95);
        },
        
        // 카카오맵 스크립트 로드
        loadKakaoMapScript() {
            const script = document.createElement('script');
            /* 여기에 카카오맵 API 키를 넣으세요 */
            script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=d71cbc8ba66037e7a51920d4429cfeb2&libraries=services&autoload=false";
            script.onload = () => {
                // 스크립트 로드 완료 후 카카오맵 초기화
                window.kakao.maps.load(() => {
                    console.log('카카오맵 API 로드 완료');
                });
            };
            document.head.appendChild(script);
        },
        
        // 맵 다이얼로그 열기
        openMapDialog() {
            this.showMapDialog = true;
            this.$nextTick(() => {
                // 다이얼로그가 열린 후 맵 초기화
                setTimeout(() => {
                    if (!window.kakao || !window.kakao.maps) {
                        console.error('카카오맵 API가 로드되지 않았습니다.');
                        return;
                    }
                    
                    const container = document.getElementById('kakaoMap');
                    const options = {
                        center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청
                        level: 3
                    };
                    this.kakaoMap = new window.kakao.maps.Map(container, options);
                    
                    // 장소 검색 객체 생성
                    if (window.kakao.maps.services) {
                        this.places = new window.kakao.maps.services.Places();
                    } else {
                        console.error('카카오맵 services 라이브러리가 로드되지 않았습니다.');
                    }
                }, 300); // 시간을 좀 더 늘려 API가 완전히 로드될 시간을 확보
            });
        },
        
        // 장소 검색
        searchPlaces() {
            if (!this.searchKeyword.trim()) return;
            
            // 기존 마커 제거
            this.removeAllMarkers();
            
            // 인포윈도우가 열려있으면 닫기
            if (this.infowindow) {
                this.infowindow.close();
            }
            
            // 카카오 로컬 API를 사용하여 키워드 검색
            const apiUrl = 'https://dapi.kakao.com/v2/local/search/keyword.json';
            const params = new URLSearchParams({
                query: this.searchKeyword,
                x: this.kakaoMap ? this.kakaoMap.getCenter().getLng() : '',
                y: this.kakaoMap ? this.kakaoMap.getCenter().getLat() : '',
                radius: 20000, // 20km 반경 내 검색
                size: 15 // 최대 15개 결과
            });
            
            fetch(`${apiUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'KakaoAK 8ad14ad97f82f0975fa434096a7c8052' // REST API 키 입력
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('검색 요청 실패');
                }
                return response.json();
            })
            .then(data => {
                if (data.documents && data.documents.length > 0) {
                    this.searchResults = data.documents;
                    
                    // 인포윈도우 생성 (한 번만 생성)
                    if (!this.infowindow) {
                        this.infowindow = new window.kakao.maps.InfoWindow({
                            zIndex: 3,
                            removable: true
                        });
                    }
                    
                    // 검색 결과 표시
                    const bounds = new window.kakao.maps.LatLngBounds();
                    
                    for (let i = 0; i < data.documents.length; i++) {
                        const place = data.documents[i];
                        const placePosition = new window.kakao.maps.LatLng(place.y, place.x);
                        
                        // 마커 생성 (선택된 장소인 경우 다른 이미지 사용)
                        const isSelected = this.selectedPlace && place.id === this.selectedPlace.id;
                        const markerImage = isSelected ? 
                            new window.kakao.maps.MarkerImage(
                                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                                new window.kakao.maps.Size(24, 35)
                            ) : null;
                        
                        const marker = new window.kakao.maps.Marker({
                            map: this.kakaoMap,
                            position: placePosition,
                            image: markerImage,
                            zIndex: isSelected ? 2 : 1 // 선택된 마커는 더 높은 z-index
                        });
                        
                        this.markers.push(marker);
                        bounds.extend(placePosition);
                        
                        // 마커 클릭 이벤트 등록
                        window.kakao.maps.event.addListener(marker, 'click', () => {
                            // 선택된 장소 정보 저장
                            this.selectedPlace = place;
                            this.meeting.place = place.place_name;
                            this.meeting.lat = place.y;
                            this.meeting.lon = place.x;
                            
                            // 인포윈도우 내용 설정
                            const content = `
                                <div style="padding:10px; width:200px; text-align:center; font-size:14px;">
                                    <strong>${place.place_name}</strong>
                                    <p style="margin-top:5px; font-size:12px; color:#666;">${place.address_name}</p>
                                </div>
                            `;
                            
                            // 인포윈도우 표시
                            this.infowindow.setContent(content);
                            this.infowindow.open(this.kakaoMap, marker);
                            
                            // 모든 마커 업데이트
                            this.updateMarkers();
                            
                            // 선택된 장소로 지도 중심 이동
                            this.kakaoMap.setCenter(placePosition);
                            
                            // 검색 결과 리스트에서 해당 항목 강조
                            this.highlightSelectedPlace();
                        });
                    }
                    
                    // 검색된 장소 위치를 기준으로 지도 범위 재설정
                    this.kakaoMap.setBounds(bounds);
                } else {
                    alert('검색 결과가 존재하지 않습니다.');
                    this.searchResults = [];
                }
            })
            .catch(error => {
                console.error('장소 검색 오류:', error);
                alert('검색 중 오류가 발생했습니다.');
            });
        },
        
        // 마커 모두 제거
        removeAllMarkers() {
            // 인포윈도우가 열려있으면 닫기
            if (this.infowindow) {
                this.infowindow.close();
            }
            
            for (let i = 0; i < this.markers.length; i++) {
                this.markers[i].setMap(null);
            }
            this.markers = [];
        },
        
        // 마커 업데이트 (선택된 장소 강조)
        updateMarkers() {
            // 기존 마커 제거
            this.removeAllMarkers();
            
            // 검색 결과에 대해 마커 다시 생성
            if (this.searchResults && this.searchResults.length > 0) {
                this.searchResults.forEach(place => {
                    const placePosition = new window.kakao.maps.LatLng(place.y, place.x);
                    
                    // 선택된 장소인 경우 다른 이미지 사용
                    const isSelected = this.selectedPlace && place.id === this.selectedPlace.id;
                    const markerImage = isSelected ? 
                        new window.kakao.maps.MarkerImage(
                            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                            new window.kakao.maps.Size(24, 35)
                        ) : null;
                    
                    const marker = new window.kakao.maps.Marker({
                        map: this.kakaoMap,
                        position: placePosition,
                        image: markerImage,
                        zIndex: isSelected ? 2 : 1 // 선택된 마커는 더 높은 z-index
                    });
                    
                    this.markers.push(marker);
                    
                    // 마커 클릭 이벤트 등록
                    window.kakao.maps.event.addListener(marker, 'click', () => {
                        this.selectedPlace = place;
                        this.meeting.place = place.place_name;
                        this.meeting.lat = place.y;
                        this.meeting.lon = place.x;
                        
                        // 인포윈도우 내용 설정
                        const content = `
                            <div style="padding:10px; width:200px; text-align:center; font-size:14px;">
                                <strong>${place.place_name}</strong>
                                <p style="margin-top:5px; font-size:12px; color:#666;">${place.address_name}</p>
                            </div>
                        `;
                        
                        // 인포윈도우 표시
                        this.infowindow.setContent(content);
                        this.infowindow.open(this.kakaoMap, marker);
                        
                        this.updateMarkers();
                        this.kakaoMap.setCenter(placePosition);
                        this.highlightSelectedPlace();
                    });
                    
                    // 선택된 마커에 인포윈도우 표시
                    if (isSelected && this.infowindow) {
                        const content = `
                            <div style="padding:10px; width:200px; text-align:center; font-size:14px;">
                                <strong>${place.place_name}</strong>
                                <p style="margin-top:5px; font-size:12px; color:#666;">${place.address_name}</p>
                            </div>
                        `;
                        
                        this.infowindow.setContent(content);
                        this.infowindow.open(this.kakaoMap, marker);
                    }
                });
            }
        },
        
        // 검색 결과 리스트에서 선택된 장소 강조
        highlightSelectedPlace() {
            this.$nextTick(() => {
                const listItems = document.querySelectorAll('.search-result-item');
                listItems.forEach(item => {
                    item.classList.remove('selected-place');
                });
                
                if (this.selectedPlace) {
                    const selectedItem = Array.from(listItems).find(item => 
                        item.getAttribute('data-id') === this.selectedPlace.id
                    );
                    if (selectedItem) {
                        selectedItem.classList.add('selected-place');
                        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            });
        },
        
        // 장소 선택
        selectPlace(place) {
            this.selectedPlace = place;
            
            // 기존 마커 제거
            this.removeAllMarkers();
            
            // 선택한 장소에 마커 표시
            const marker = new window.kakao.maps.Marker({
                map: this.kakaoMap,
                position: new window.kakao.maps.LatLng(place.y, place.x),
                image: new window.kakao.maps.MarkerImage(
                    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                    new window.kakao.maps.Size(24, 35)
                )
            });
            
            this.markers.push(marker);
            
            // 선택한 장소로 지도 중심 이동
            this.kakaoMap.setCenter(new window.kakao.maps.LatLng(place.y, place.x));
        },
        
        // 맵 선택 취소
        cancelMapSelection() {
            this.showMapDialog = false;
            this.searchKeyword = '';
            this.searchResults = [];
            this.selectedPlace = null;
            this.removeAllMarkers();
        },
        
        // 맵 선택 확인
        confirmMapSelection() {
            if (this.selectedPlace) {
                this.meeting.place = this.selectedPlace.place_name;
                this.meeting.lat = this.selectedPlace.y;
                this.meeting.lon = this.selectedPlace.x;
                this.showMapDialog = false;
            } else {
                alert('장소를 검색하여 선택해주세요.');
            }
        },
        
        async submitForm() {
            if (!this.$refs.form.validate()) return;
            
            this.isSubmitting = true;
            try {
                const formData = new FormData();
                
                // 텍스트 데이터 추가
                formData.append('gatheringId', this.meeting.gatheringId);
                formData.append('name', this.meeting.name);
                formData.append('meetingDate', this.meeting.meetingDate);
                formData.append('meetingTime', this.meeting.meetingTime);
                formData.append('place', this.meeting.place);
                formData.append('lat', this.meeting.lat);
                formData.append('lon', this.meeting.lon);
                formData.append('cost', this.meeting.cost);
                formData.append('maxPeople', this.meeting.maxPeople);
                
                // 이미지 파일 추가
                formData.append('imageFile', this.imageFile);
                
                // API 요청 보내기
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/create`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                // 성공 시 처리
                if (response.status === 200 || response.status === 201) {
                    alert('정모가 성공적으로 생성되었습니다.');
                    this.$router.go(-1); // 이전 페이지로 이동
                }
            } catch (error) {
                console.error('정모 생성 중 오류 발생:', error);
                alert('정모 생성에 실패했습니다. 다시 시도해주세요.');
            } finally {
                this.isSubmitting = false;
            }
        }
    },
    beforeUnmount() {
        // 컴포넌트가 제거되기 전에 이벤트 리스너 제거
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
        document.removeEventListener('mousemove', this.onImageDrag);
        document.removeEventListener('mouseup', this.stopImageDrag);
        document.removeEventListener('touchmove', this.onTouch);
        document.removeEventListener('touchend', this.stopTouch);
        document.removeEventListener('touchmove', this.onImageTouch);
        document.removeEventListener('touchend', this.stopImageTouch);
        document.removeEventListener('mousemove', this.onResize);
        document.removeEventListener('mouseup', this.stopResize);
        document.removeEventListener('touchmove', this.onResizeTouch);
        document.removeEventListener('touchend', this.stopResizeTouch);
        document.removeEventListener('mousemove', this.onImageResize);
        document.removeEventListener('mouseup', this.stopImageResize);
        document.removeEventListener('touchmove', this.onImageResizeTouch);
        document.removeEventListener('touchend', this.stopImageResizeTouch);
        
        // 맵 관련 리소스 정리
        this.removeAllMarkers();
    }
}
</script>

<style scoped>
.fixed-header {
    position: sticky;
    top: 0;
    z-index: 10;
}

.content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 16px;
    background-color: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-container {
    padding: 16px;
}

.form-content {
    padding: 16px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-field {
    margin-bottom: 16px;
    transition: all 0.3s ease;
}

.form-field:hover {
    transform: translateY(-2px);
}

:deep(.v-field) {
    border-radius: 8px !important;
}

:deep(.v-slider .v-slider-thumb) {
    background-color: var(--v-theme-primary);
}

:deep(.v-slider .v-slider-track__fill) {
    background-color: var(--v-theme-primary);
}

.image-preview-container {
    position: relative;
    width: 300px;
    height: 300px;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mx-auto {
    margin-left: auto;
    margin-right: auto;
}

.edit-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.image-preview-container:hover .edit-overlay {
    opacity: 1;
}

/* 크롭 관련 스타일 */
.crop-container {
    position: relative;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.crop-wrapper {
    position: relative;
    width: 100%;
    height: 500px;
    overflow: hidden;
    background-color: #f0f0f0;
}

.image-container {
    position: absolute;
    top: 0;
    left: 0;
}

.crop-original-image {
    display: block;
}

.crop-area {
    position: absolute;
    border: 2px dashed #fff;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    cursor: move;
    z-index: 10;
}

.resize-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: #fff;
    border: 2px solid #2196F3;
    border-radius: 50%;
    z-index: 15;
}

.resize-handle-nw {
    top: -10px;
    left: -10px;
    cursor: nw-resize;
}

.resize-handle-ne {
    top: -10px;
    right: -10px;
    cursor: ne-resize;
}

.resize-handle-sw {
    bottom: -10px;
    left: -10px;
    cursor: sw-resize;
}

.resize-handle-se {
    bottom: -10px;
    right: -10px;
    cursor: se-resize;
}

.image-resize-handle {
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 2px solid #4CAF50;
    border-radius: 50%;
    z-index: 20;
}

.image-resize-handle-nw {
    top: -12px;
    left: -12px;
    cursor: nw-resize;
}

.image-resize-handle-ne {
    top: -12px;
    right: -12px;
    cursor: ne-resize;
}

.image-resize-handle-sw {
    bottom: -12px;
    left: -12px;
    cursor: sw-resize;
}

.image-resize-handle-se {
    bottom: -12px;
    right: -12px;
    cursor: se-resize;
}

/* 확대/축소 컨트롤 */
.zoom-controls {
    position: absolute;
    bottom: 20px;
    left: 16px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    padding: 4px 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 20;
}

.zoom-btn {
    margin: 0 4px;
}

.zoom-text {
    font-size: 14px;
    margin: 0 8px;
    min-width: 50px;
    text-align: center;
}

/* 카카오맵 관련 스타일 */
.search-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.search-input {
    flex: 1;
}

.search-btn {
    height: 40px; /* 높이 줄임 */
    margin-top: -25px; /* 위로 살짝 올림 */
}

.map-container {
    width: 100%;
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-results {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}

.selected-place {
    background-color: rgba(33, 150, 243, 0.1);
}
</style>