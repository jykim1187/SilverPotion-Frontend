<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">모임 수정</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <div v-if="isLoading" class="text-center my-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">모임 정보를 불러오는 중...</p>
            </div>
            
            <div v-else-if="error" class="text-center my-8">
                <v-alert type="error">{{ error }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchGatheringData">다시 시도</v-btn>
            </div>
            
            <div class="form-container">
                <h2 class="text-h6 font-weight-medium mb-4 d-flex align-center">
                    <v-icon color="primary" class="mr-2">mdi-pencil-box-outline</v-icon>
                    모임 정보 수정
                </h2>
                
                <v-form ref="form" v-model="isFormValid" @submit.prevent="updateGathering" class="form-content">
                    
                    <!-- 모임 이미지 업로드 -->
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

                        <div class="avatar-container position-relative">
                            <div class="image-preview-container mb-2 mx-auto" @click="triggerFileInput" style="cursor: pointer">
                                <v-img 
                                    :src="previewImage || (gatheringData.imageUrl || require('@/assets/default-gathering.png'))" 
                                    width="300"
                                    height="158"
                                    cover
                                    alt="모임 이미지"
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
                            ></v-file-input>
                        </div>
                    </div>

                    
                    <!-- 모임명 입력 -->
                    <div class="form-field">
                        <v-text-field
                            v-model="gatheringData.gatheringName"
                            label="모임명"
                            variant="outlined"
                            :rules="[v => !!v || '모임명을 입력해주세요', v => v.length <= 30 || '모임명은 30자 이내로 입력해주세요']"
                            counter="30"
                            required
                            prepend-inner-icon="mdi-account-group"
                            density="comfortable"
                            bg-color="white"
                            class="mb-4"
                        ></v-text-field>
                    </div>
                    
                    <!-- 모임 소개 입력 -->
                    <div class="form-field">
                        <v-textarea
                            v-model="gatheringData.introduce"
                            label="모임 소개"
                            variant="outlined"
                            :rules="[v => !!v || '모임 소개를 입력해주세요', v => v.length <= 500 || '모임 소개는 500자 이내로 입력해주세요']"
                            counter="500"
                            auto-grow
                            rows="4"
                            required
                            prepend-inner-icon="mdi-information-outline"
                            density="comfortable"
                            bg-color="white"
                            class="mb-4"
                        ></v-textarea>
                    </div>
                    
                    <!-- 정원 입력 -->
                    <div class="form-field">
                        <label class="text-subtitle-2 font-weight-medium d-flex align-center mb-2">
                            <v-icon size="small" color="primary" class="mr-1">mdi-account-multiple</v-icon>
                            정원
                        </label>
                        <v-slider
                            v-model="gatheringData.maxPeople"
                            min="2"
                            max="100"
                            step="1"
                            thumb-label
                            class="mb-6"
                            color="primary"
                            track-color="grey-lighten-3"
                        >
                            <template v-slot:append>
                                <v-text-field
                                    v-model.number="gatheringData.maxPeople"
                                    type="number"
                                    style="width: 70px"
                                    density="compact"
                                    variant="outlined"
                                    min="2"
                                    max="100"
                                    hide-details
                                    @input="validateMaxPeople"
                                    bg-color="white"
                                ></v-text-field>
                            </template>
                        </v-slider>
                    </div>
                    
                    <!-- 수정 버튼 -->
                    <div class="d-flex justify-end mt-6">
                        <v-btn
                            color="primary"
                            variant="tonal"
                            type="submit"
                            :loading="isSubmitting"
                            :disabled="!isFormValid || isSubmitting"
                        >
                            수정하기
                        </v-btn>
                    </div>
                </v-form>
            </div>
        </div>
    </v-container>
</template>

<script>
import axios from 'axios';

export default{
    data(){
        return {
            gatheringId: null,
            gatheringData: {
                gatheringName: '',
                introduce: '',
                maxPeople: 10,
                imageUrl: null
            },
            imageFile: null,
            previewImage: null,
            originalImage: null,
            showCropDialog: false,
            isFormValid: false,
            isSubmitting: false,
            isLoading: true,
            error: null,
            
            // 크롭 영역 관련 데이터
            cropAreaWidth: 300,
            cropAreaHeight: 158, // 1.9:1 비율로 변경
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
            baseCropHeight: 158, // 기본 크롭 영역 높이 (1.9:1 비율)
            
            // 이미지 크기 조절 관련 데이터
            isImageResizing: false,
            imageResizeDirection: '',
            imageResizeStartX: 0,
            imageResizeStartY: 0,
            initialImageScale: 1,
        }
    },
    methods: {
        handleBackButton() {
            this.$router.go(-1);
        },
        triggerFileInput() {
            this.$refs.fileInput.$el.querySelector('input').click();
        },
        validateMaxPeople() {
            // 숫자 범위 검증 (2~100)
            const value = parseInt(this.gatheringData.maxPeople);
            if (isNaN(value) || value < 2) {
                this.gatheringData.maxPeople = 2;
            } else if (value > 100) {
                this.gatheringData.maxPeople = 100;
            }
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
        async fetchGatheringData() {
            this.isLoading = true;
            this.error = null;
            
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/${this.gatheringId}`);
                
                if (response.data.result) {
                    const gatheringData = response.data.result;
                    
                    // 가져온 데이터로 폼 초기화
                    this.gatheringData = {
                        gatheringName: gatheringData.gatheringName,
                        introduce: gatheringData.introduce,
                        maxPeople: gatheringData.maxPeople,
                        imageUrl: gatheringData.imageUrl
                    };
                } else {
                    throw new Error('모임 정보를 불러오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('모임 정보를 불러오는데 실패했습니다:', error);
                this.error = '모임 정보를 불러오는데 실패했습니다. 다시 시도해주세요.';
            } finally {
                this.isLoading = false;
            }
        },
        async updateGathering() {
            if (!this.$refs.form.validate()) return;
            
            this.isSubmitting = true;
            try {
                // FormData 객체 생성
                const formData = new FormData();
                formData.append('gatheringName', this.gatheringData.gatheringName);
                formData.append('introduce', this.gatheringData.introduce);
                formData.append('maxPeople', this.gatheringData.maxPeople);
                
                // 이미지 파일이 있는 경우에만 추가
                if (this.imageFile) {
                    formData.append('imageFile', this.imageFile);
                }
                
                // 모임 수정 API 호출
                const response = await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/gathering/update/${this.gatheringId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                // 성공 시 모임 상세 페이지로 이동
                if (response.data.status_code === 200) {
                    alert('모임 정보가 수정되었습니다.');
                    this.$router.push(`/silverpotion/gathering/home/${this.gatheringId}`);
                }
            } catch (error) {
                console.error('모임 수정 실패:', error);
                alert('모임 수정에 실패했습니다. 다시 시도해주세요.');
            } finally {
                this.isSubmitting = false;
            }
        },
        initCropArea() {
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
            
            // 크롭 영역 초기화 (1.9:1 비율)
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
        startImageDrag(e) {
            this.isImageDragging = true;
            this.imageDragStartX = e.clientX;
            this.imageDragStartY = e.clientY;
            this.initialImageTranslateX = this.imageTranslateX;
            this.initialImageTranslateY = this.imageTranslateY;
            e.preventDefault();
        },
        onImageDrag(e) {
            if (!this.isImageDragging) return;
            
            // 드래그 거리 계산
            const dx = e.clientX - this.imageDragStartX;
            const dy = e.clientY - this.imageDragStartY;
            
            // 새 위치 계산
            this.imageTranslateX = this.initialImageTranslateX + dx / this.imageScale;
            this.imageTranslateY = this.initialImageTranslateY + dy / this.imageScale;
        },
        stopImageDrag() {
            this.isImageDragging = false;
        },
        startImageTouch(e) {
            this.isImageDragging = true;
            this.imageDragStartX = e.touches[0].clientX;
            this.imageDragStartY = e.touches[0].clientY;
            this.initialImageTranslateX = this.imageTranslateX;
            this.initialImageTranslateY = this.imageTranslateY;
            e.preventDefault();
        },
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
        stopTouch() {
            this.isDragging = false;
        },
        zoomOut() {
            // 10% 축소
            const newScale = Math.max(0.1, this.imageScale * 0.9);
            this.updateImageScale(newScale);
        },
        zoomIn() {
            // 10% 확대
            const newScale = Math.min(3, this.imageScale * 1.1);
            this.updateImageScale(newScale);
        },
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
        onResize(e) {
            if (!this.isResizing) return;
            
            // 마우스 이동 거리 계산
            const dx = e.clientX - this.resizeStartX;
            
            // 비율 유지를 위한 계산 (1.9:1)
            let newWidth, newHeight, newLeft, newTop;
            
            // 방향에 따라 다르게 처리
            switch (this.resizeDirection) {
                case 'se': // 우측 하단
                    newWidth = this.initialCropWidth + dx;
                    newHeight = newWidth / 1.9; // 1.9:1 비율 유지
                    newLeft = this.initialCropLeft;
                    newTop = this.initialCropTop;
                    break;
                case 'sw': // 좌측 하단
                    newWidth = this.initialCropWidth - dx;
                    newHeight = newWidth / 1.9; // 1.9:1 비율 유지
                    newLeft = this.initialCropLeft + dx;
                    newTop = this.initialCropTop;
                    break;
                case 'ne': // 우측 상단
                    newWidth = this.initialCropWidth + dx;
                    newHeight = newWidth / 1.9; // 1.9:1 비율 유지
                    newLeft = this.initialCropLeft;
                    newTop = this.initialCropTop - (newHeight - this.initialCropHeight);
                    break;
                case 'nw': // 좌측 상단
                    newWidth = this.initialCropWidth - dx;
                    newHeight = newWidth / 1.9; // 1.9:1 비율 유지
                    newLeft = this.initialCropLeft + dx;
                    newTop = this.initialCropTop + (this.initialCropHeight - newHeight);
                    break;
            }
            
            // 최소 크기 제한
            if (newWidth < 100) {
                newWidth = 100;
                newHeight = newWidth / 1.9;
                
                // 위치 조정
                switch (this.resizeDirection) {
                    case 'sw':
                        newLeft = this.initialCropLeft + (this.initialCropWidth - 100);
                        break;
                    case 'ne':
                        newTop = this.initialCropTop - (newHeight - this.initialCropHeight);
                        break;
                    case 'nw':
                        newLeft = this.initialCropLeft + (this.initialCropWidth - 100);
                        newTop = this.initialCropTop + (this.initialCropHeight - newHeight);
                        break;
                }
            }
            
            // 최대 크기 제한
            if (newWidth > 600) {
                newWidth = 600;
                newHeight = newWidth / 1.9;
                
                // 위치 조정
                switch (this.resizeDirection) {
                    case 'sw':
                        newLeft = this.initialCropLeft - (600 - this.initialCropWidth);
                        break;
                    case 'ne':
                        newTop = this.initialCropTop - (newHeight - this.initialCropHeight);
                        break;
                    case 'nw':
                        newLeft = this.initialCropLeft - (600 - this.initialCropWidth);
                        newTop = this.initialCropTop - (newHeight - this.initialCropHeight);
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
        stopResize() {
            this.isResizing = false;
            document.removeEventListener('mousemove', this.onResize);
            document.removeEventListener('mouseup', this.stopResize);
        },
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
        onResizeTouch(e) {
            if (!this.isResizing) return;
            
            // 터치 이동 거리 계산
            const dx = e.touches[0].clientX - this.resizeStartX;
            
            // 비율 유지를 위한 계산 (1.9:1)
            let newWidth, newHeight, newLeft, newTop;
            
            // 방향에 따라 다르게 처리
            switch (this.resizeDirection) {
                case 'se': // 우측 하단
                    newWidth = this.initialCropWidth + dx;
                    newHeight = newWidth / 1.9; // 1.9:1 비율 유지
                    newLeft = this.initialCropLeft;
                    newTop = this.initialCropTop;
                    break;
                case 'sw': // 좌측 하단
                    newWidth = this.initialCropWidth - dx;
                    newHeight = newWidth / 1.9; // 1.9:1 비율 유지
                    newLeft = this.initialCropLeft + dx;
                    newTop = this.initialCropTop;
                    break;
                case 'ne': // 우측 상단
                    newWidth = this.initialCropWidth + dx;
                    newHeight = newWidth / 1.9; // 1.9:1 비율 유지
                    newLeft = this.initialCropLeft;
                    newTop = this.initialCropTop - (newHeight - this.initialCropHeight);
                    break;
                case 'nw': // 좌측 상단
                    newWidth = this.initialCropWidth - dx;
                    newHeight = newWidth / 1.9; // 1.9:1 비율 유지
                    newLeft = this.initialCropLeft + dx;
                    newTop = this.initialCropTop + (this.initialCropHeight - newHeight);
                    break;
            }
            
            // 최소 크기 제한
            if (newWidth < 100) {
                newWidth = 100;
                newHeight = newWidth / 1.9;
                
                // 위치 조정
                switch (this.resizeDirection) {
                    case 'sw':
                        newLeft = this.initialCropLeft + (this.initialCropWidth - 100);
                        break;
                    case 'ne':
                        newTop = this.initialCropTop - (newHeight - this.initialCropHeight);
                        break;
                    case 'nw':
                        newLeft = this.initialCropLeft + (this.initialCropWidth - 100);
                        newTop = this.initialCropTop + (this.initialCropHeight - newHeight);
                        break;
                }
            }
            
            // 최대 크기 제한
            if (newWidth > 600) {
                newWidth = 600;
                newHeight = newWidth / 1.9;
                
                // 위치 조정
                switch (this.resizeDirection) {
                    case 'sw':
                        newLeft = this.initialCropLeft - (600 - this.initialCropWidth);
                        break;
                    case 'ne':
                        newTop = this.initialCropTop - (newHeight - this.initialCropHeight);
                        break;
                    case 'nw':
                        newLeft = this.initialCropLeft - (600 - this.initialCropWidth);
                        newTop = this.initialCropTop - (newHeight - this.initialCropHeight);
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
        stopResizeTouch() {
            this.isResizing = false;
            document.removeEventListener('touchmove', this.onResizeTouch);
            document.removeEventListener('touchend', this.stopResizeTouch);
        },
        onImageResize(e) {
            if (!this.isImageResizing) return;
            
            // 마우스 이동 거리 계산
            const dx = e.clientX - this.imageResizeStartX;
            
            // 이미지 스케일 계산 (이동 거리에 따라 조정)
            let newScale = this.initialImageScale * (1 + dx * 0.005);
            
            // 최소/최대 스케일 제한
            newScale = Math.max(0.1, Math.min(3, newScale));
            
            // 이미지 스케일 업데이트
            this.updateImageScale(newScale);
        },
        stopImageResize() {
            this.isImageResizing = false;
            document.removeEventListener('mousemove', this.onImageResize);
            document.removeEventListener('mouseup', this.stopImageResize);
        },
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
        onImageResizeTouch(e) {
            if (!this.isImageResizing) return;
            
            // 터치 이동 거리 계산
            const dx = e.touches[0].clientX - this.imageResizeStartX;
            
            // 이미지 스케일 계산 (이동 거리에 따라 조정)
            let newScale = this.initialImageScale * (1 + dx * 0.005);
            
            // 최소/최대 스케일 제한
            newScale = Math.max(0.1, Math.min(3, newScale));
            
            // 이미지 스케일 업데이트
            this.updateImageScale(newScale);
            
            e.preventDefault();
        },
        stopImageResizeTouch() {
            this.isImageResizing = false;
            document.removeEventListener('touchmove', this.onImageResizeTouch);
            document.removeEventListener('touchend', this.stopImageResizeTouch);
        },
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
        cancelCrop() {
            this.showCropDialog = false;
            this.imageFile = null;
            this.originalImage = null;
            this.removeEventListeners();
        },
        confirmCrop() {
            // 캔버스 생성
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 캔버스 크기 설정 (최종 이미지 크기, 1.9:1 비율)
            canvas.width = 300;
            canvas.height = 158;
            
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
        // 크롭 영역 드래그 관련 메소드
        startDrag(e) {
            this.isDragging = true;
            this.dragStartX = e.clientX || e.touches[0].clientX;
            this.dragStartY = e.clientY || e.touches[0].clientY;
            this.initialLeft = this.cropAreaLeft;
            this.initialTop = this.cropAreaTop;
            
            // 이벤트 리스너 추가
            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.stopDrag);
            
            e.preventDefault();
        },
        onDrag(e) {
            if (!this.isDragging) return;
            
            // 드래그 거리 계산
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            const dx = clientX - this.dragStartX;
            const dy = clientY - this.dragStartY;
            
            // 새 위치 계산
            let newLeft = this.initialLeft + dx;
            let newTop = this.initialTop + dy;
            
            // 위치 업데이트 (제한 없이 자유롭게 이동)
            this.cropAreaLeft = newLeft;
            this.cropAreaTop = newTop;
        },
        stopDrag() {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.onDrag);
            document.removeEventListener('mouseup', this.stopDrag);
        },
        // 크롭 영역 터치 관련 메소드
        startTouch(e) {
            this.isDragging = true;
            this.dragStartX = e.touches[0].clientX;
            this.dragStartY = e.touches[0].clientY;
            this.initialLeft = this.cropAreaLeft;
            this.initialTop = this.cropAreaTop;
            
            // 이벤트 리스너 추가
            document.addEventListener('touchmove', this.onTouch, { passive: false });
            document.addEventListener('touchend', this.stopTouch);
            
            e.preventDefault();
        },
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
    },
    mounted() {
        // URL 파라미터에서 모임 ID 가져오기
        this.gatheringId = this.$route.params.gatheringId;
        
        if (this.gatheringId) {
            // 모임 정보 불러오기
            this.fetchGatheringData();
        } else {
            // 모임 ID가 없는 경우 이전 페이지로 이동
            this.$router.go(-1);
        }
    },
    beforeUnmount() {
        // 컴포넌트가 제거되기 전에 이벤트 리스너 제거
        this.removeEventListeners();
    }
}
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

.avatar-container {
    display: inline-block;
}

.position-relative {
    position: relative;
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
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.3s;
}

.avatar-container:hover .edit-overlay {
    opacity: 1;
}

.d-none {
    display: none;
}

.form-container {
    background-color: #f8fafd;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-content {
    padding: 8px;
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
    height: 158px; /* 1.9:1 비율로 변경 */
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mx-auto {
    margin-left: auto;
    margin-right: auto;
}

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
</style>