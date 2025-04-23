<template>
    <v-container>
        <v-card flat class="primary fixed-header" color="#E8F1FD">
            <v-card-text class="d-flex align-center pa-2">
                <v-btn icon @click="handleBackButton" class="mr-2" flat>
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <h1 class="text-h5 font-weight-bold my-2 text-center flex-grow-1 text-primary">정모 수정</h1>
            </v-card-text>
        </v-card>

        <div class="content-wrapper">
            <div v-if="isLoading" class="text-center my-8">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">정모 정보를 불러오는 중...</p>
            </div>
            
            <div v-else-if="error" class="text-center my-8">
                <v-alert type="error">{{ error }}</v-alert>
                <v-btn color="primary" class="mt-4" @click="fetchMeetingData">다시 시도</v-btn>
            </div>
            
            <v-form v-else ref="form" v-model="isFormValid" @submit.prevent="updateMeeting">
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
                                            <div class="resize-handle image-resize-handle image-resize-handle-nw" @mousedown.stop="e => startImageResize('nw', e)" @touchstart.stop="e => startImageResizeTouch('nw', e)"></div>
                                            <div class="resize-handle image-resize-handle image-resize-handle-ne" @mousedown.stop="e => startImageResize('ne', e)" @touchstart.stop="e => startImageResizeTouch('ne', e)"></div>
                                            <div class="resize-handle image-resize-handle image-resize-handle-sw" @mousedown.stop="e => startImageResize('sw', e)" @touchstart.stop="e => startImageResizeTouch('sw', e)"></div>
                                            <div class="resize-handle image-resize-handle image-resize-handle-se" @mousedown.stop="e => startImageResize('se', e)" @touchstart.stop="e => startImageResizeTouch('se', e)"></div>
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
                                            <div class="resize-handle resize-handle-nw" @mousedown.stop="e => startResize('nw', e)" @touchstart.stop="e => startResizeTouch('nw', e)"></div>
                                            <div class="resize-handle resize-handle-ne" @mousedown.stop="e => startResize('ne', e)" @touchstart.stop="e => startResizeTouch('ne', e)"></div>
                                            <div class="resize-handle resize-handle-sw" @mousedown.stop="e => startResize('sw', e)" @touchstart.stop="e => startResizeTouch('sw', e)"></div>
                                            <div class="resize-handle resize-handle-se" @mousedown.stop="e => startResize('se', e)" @touchstart.stop="e => startResizeTouch('se', e)"></div>
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
                                :src="previewImage || (meetingData.imageUrl || require('@/assets/default-gathering.png'))" 
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
                        ></v-file-input>
                    </div>
                </div>

                <!-- 정모명 입력 -->
                <div class="form-field">
                    <v-text-field
                        v-model="meetingData.name"
                        label="정모명"
                        variant="outlined"
                        :rules="[v => !!v || '정모명을 입력해주세요', v => v.length <= 30 || '정모명은 30자 이내로 입력해주세요']"
                        counter="30"
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
                        v-model="meetingData.meetingDate"
                        label="날짜"
                        variant="outlined"
                        type="date"
                        :rules="[v => !!v || '날짜를 선택해주세요']"
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
                        v-model="meetingData.meetingTime"
                        label="시간"
                        variant="outlined"
                        type="time"
                        :rules="[v => !!v || '시간을 선택해주세요']"
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
                        v-model="meetingData.place"
                        label="장소"
                        variant="outlined"
                        :rules="[v => !!v || '장소를 입력해주세요', v => v.length <= 100 || '장소는 100자 이내로 입력해주세요']"
                        counter="100"
                        required
                        prepend-inner-icon="mdi-map-marker"
                        density="comfortable"
                        bg-color="white"
                        class="mb-4"
                    ></v-text-field>
                </div>

                <!-- 비용 입력 -->
                <div class="form-field">
                    <v-text-field
                        v-model.number="meetingData.cost"
                        label="비용"
                        variant="outlined"
                        type="number"
                        :rules="[
                            v => v !== null && v !== undefined && v !== '' || '비용을 입력해주세요',
                            v => v >= 0 || '비용은 0원 이상이어야 합니다'
                        ]"
                        min="0"
                        required
                        prepend-inner-icon="mdi-currency-krw"
                        density="comfortable"
                        bg-color="white"
                        class="mb-4"
                    ></v-text-field>
                </div>

                <!-- 수정 버튼 -->
                <div class="d-flex justify-end mt-6">
                    <v-btn
                        color="primary"
                        variant="tonal"
                        type="submit"
                        :loading="isSubmitting"
                        :disabled="!isFormValid || isSubmitting"
                        size="large"
                        class="px-6"
                    >
                        수정하기
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
            meetingId: null,
            gatheringId: null,
            meetingData: {
                name: '',
                meetingDate: '',
                meetingTime: '',
                place: '',
                cost: 0,
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
            imageScale: 1,
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
            cropSizeScale: 1,
            baseCropWidth: 300,
            baseCropHeight: 300,
            
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
        async fetchMeetingData() {
            this.isLoading = true;
            this.error = null;
            
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/${this.meetingId}`);
                
                if (response.data.result) {
                    const meetingData = response.data.result;
                    
                    // 가져온 데이터로 폼 초기화
                    this.meetingData = {
                        name: meetingData.name,
                        meetingDate: meetingData.meetingDate,
                        meetingTime: meetingData.meetingTime,
                        place: meetingData.place,
                        cost: meetingData.cost,
                        imageUrl: meetingData.imageUrl
                    };
                    
                    // 모임 ID 저장
                    this.gatheringId = meetingData.gatheringId;
                } else {
                    throw new Error('정모 정보를 불러오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('정모 정보를 불러오는데 실패했습니다:', error);
                this.error = '정모 정보를 불러오는데 실패했습니다. 다시 시도해주세요.';
            } finally {
                this.isLoading = false;
            }
        },
        async updateMeeting() {
            if (!this.$refs.form.validate()) return;
            
            this.isSubmitting = true;
            try {
                // FormData 객체 생성
                const formData = new FormData();
                formData.append('name', this.meetingData.name);
                formData.append('meetingDate', this.meetingData.meetingDate);
                formData.append('meetingTime', this.meetingData.meetingTime);
                formData.append('place', this.meetingData.place);
                formData.append('cost', this.meetingData.cost);
                
                // 이미지 파일이 있는 경우에만 추가
                if (this.imageFile) {
                    formData.append('imageFile', this.imageFile);
                }
                
                // 정모 수정 API 호출
                const response = await axios.patch(
                    `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/meeting/update/${this.meetingId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                
                // 성공 시 모임 상세 페이지로 이동
                if (response.data.status_code === 200) {
                    alert('정모 정보가 수정되었습니다.');
                    this.$router.push(`/silverpotion/gathering/home/${this.gatheringId}`);
                }
            } catch (error) {
                console.error('정모 수정 실패:', error);
                alert('정모 수정에 실패했습니다. 다시 시도해주세요.');
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
        startDrag(event) {
            this.isDragging = true;
            this.dragStartX = event.clientX || (event.touches && event.touches[0].clientX);
            this.dragStartY = event.clientY || (event.touches && event.touches[0].clientY);
            this.initialLeft = this.cropAreaLeft;
            this.initialTop = this.cropAreaTop;
            
            // 이벤트 리스너 추가
            document.addEventListener('mousemove', this.onDrag);
            document.addEventListener('mouseup', this.stopDrag);
            
            event.preventDefault();
        },
        onDrag(event) {
            if (!this.isDragging) return;
            
            // 드래그 거리 계산
            const clientX = event.clientX || (event.touches && event.touches[0].clientX);
            const clientY = event.clientY || (event.touches && event.touches[0].clientY);
            
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
        startTouch(event) {
            this.isDragging = true;
            this.dragStartX = event.touches[0].clientX;
            this.dragStartY = event.touches[0].clientY;
            this.initialLeft = this.cropAreaLeft;
            this.initialTop = this.cropAreaTop;
            
            document.addEventListener('touchmove', this.onTouch, { passive: false });
            document.addEventListener('touchend', this.stopTouch);
            event.preventDefault();
        },
        onTouch(event) {
            if (!this.isDragging) return;
            
            const dx = event.touches[0].clientX - this.dragStartX;
            const dy = event.touches[0].clientY - this.dragStartY;
            
            this.cropAreaLeft = this.initialLeft + dx;
            this.cropAreaTop = this.initialTop + dy;
            
            event.preventDefault();
        },
        stopTouch() {
            this.isDragging = false;
            document.removeEventListener('touchmove', this.onTouch);
            document.removeEventListener('touchend', this.stopTouch);
        },
        startImageDrag(event) {
            this.isImageDragging = true;
            this.imageDragStartX = event.clientX || (event.touches && event.touches[0].clientX);
            this.imageDragStartY = event.clientY || (event.touches && event.touches[0].clientY);
            this.initialImageTranslateX = this.imageTranslateX;
            this.initialImageTranslateY = this.imageTranslateY;
            
            document.addEventListener('mousemove', this.onImageDrag);
            document.addEventListener('mouseup', this.stopImageDrag);
            event.preventDefault();
        },
        onImageDrag(event) {
            if (!this.isImageDragging) return;
            
            const clientX = event.clientX || (event.touches && event.touches[0].clientX);
            const clientY = event.clientY || (event.touches && event.touches[0].clientY);
            
            const dx = clientX - this.imageDragStartX;
            const dy = clientY - this.imageDragStartY;
            
            this.imageTranslateX = this.initialImageTranslateX + dx;
            this.imageTranslateY = this.initialImageTranslateY + dy;
        },
        stopImageDrag() {
            this.isImageDragging = false;
            document.removeEventListener('mousemove', this.onImageDrag);
            document.removeEventListener('mouseup', this.stopImageDrag);
        },
        startImageTouch(event) {
            this.isImageDragging = true;
            this.imageDragStartX = event.touches[0].clientX;
            this.imageDragStartY = event.touches[0].clientY;
            this.initialImageTranslateX = this.imageTranslateX;
            this.initialImageTranslateY = this.imageTranslateY;
            
            document.addEventListener('touchmove', this.onImageTouch, { passive: false });
            document.addEventListener('touchend', this.stopImageTouch);
            event.preventDefault();
        },
        onImageTouch(event) {
            if (!this.isImageDragging) return;
            
            const dx = event.touches[0].clientX - this.imageDragStartX;
            const dy = event.touches[0].clientY - this.imageDragStartY;
            
            this.imageTranslateX = this.initialImageTranslateX + dx;
            this.imageTranslateY = this.initialImageTranslateY + dy;
            
            event.preventDefault();
        },
        stopImageTouch() {
            this.isImageDragging = false;
            document.removeEventListener('touchmove', this.onImageTouch);
            document.removeEventListener('touchend', this.stopImageTouch);
        },
        zoomIn() {
            const newScale = Math.min(3, this.imageScale * 1.1);
            this.updateImageScale(newScale);
        },
        zoomOut() {
            const newScale = Math.max(0.1, this.imageScale * 0.9);
            this.updateImageScale(newScale);
        },
        updateImageScale(newScale) {
            this.imageScale = newScale;
            this.imageWidth = this.originalImageWidth * newScale;
            this.imageHeight = this.originalImageHeight * newScale;
        },
        cancelCrop() {
            this.showCropDialog = false;
            this.imageFile = null;
            this.removeEventListeners();
        },
        confirmCrop() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 캔버스 크기 설정 (크롭 영역 크기)
            canvas.width = this.cropAreaWidth;
            canvas.height = this.cropAreaHeight;
            
            // 이미지 그리기
            const img = this.$refs.cropImage;
            
            // 크롭 영역에 맞게 이미지 그리기
            ctx.drawImage(
                img,
                (this.cropAreaLeft - this.imageTranslateX * this.imageScale) / this.imageScale,
                (this.cropAreaTop - this.imageTranslateY * this.imageScale) / this.imageScale,
                this.cropAreaWidth / this.imageScale,
                this.cropAreaHeight / this.imageScale,
                0, 0, this.cropAreaWidth, this.cropAreaHeight
            );
            
            // 캔버스를 이미지로 변환
            canvas.toBlob((blob) => {
                // 새 파일 생성
                const croppedFile = new File([blob], this.imageFile.name, {
                    type: this.imageFile.type,
                    lastModified: Date.now()
                });
                
                // 이미지 파일 업데이트
                this.imageFile = croppedFile;
                
                // 미리보기 이미지 업데이트
                this.previewImage = URL.createObjectURL(croppedFile);
                
                // 다이얼로그 닫기
                this.showCropDialog = false;
                
                // 이벤트 리스너 제거
                this.removeEventListeners();
            }, this.imageFile.type);
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
        },
        startResize(direction, event) {
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
        startResizeTouch(direction, event) {
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
        startImageResizeTouch(direction, event) {
            this.isImageResizing = true;
            this.imageResizeDirection = direction;
            this.imageResizeStartX = event.touches[0].clientX;
            this.imageResizeStartY = event.touches[0].clientY;
            this.initialImageScale = this.imageScale;
            
            document.addEventListener('touchmove', this.onImageResizeTouch, { passive: false });
            document.addEventListener('touchend', this.stopImageResizeTouch);
            event.preventDefault();
        },
        startImageResize(direction, event) {
            this.isImageResizing = true;
            this.imageResizeDirection = direction;
            this.imageResizeStartX = event.clientX;
            this.imageResizeStartY = event.clientY;
            this.initialImageScale = this.imageScale;
            
            document.addEventListener('mousemove', this.onImageResize);
            document.addEventListener('mouseup', this.stopImageResize);
            event.preventDefault();
        },
        onResize(event) {
            if (!this.isResizing) return;
            
            const dx = event.clientX - this.resizeStartX;
            const dy = event.clientY - this.resizeStartY;
            
            this.handleResize(dx, dy);
        },
        onResizeTouch(event) {
            if (!this.isResizing) return;
            
            const dx = event.touches[0].clientX - this.resizeStartX;
            const dy = event.touches[0].clientY - this.resizeStartY;
            
            this.handleResize(dx, dy);
            event.preventDefault();
        },
        handleResize(dx, dy) {
            // 1:1 비율을 유지하기 위해 더 큰 변화량을 사용
            const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
            const signX = dx >= 0 ? 1 : -1;
            const signY = dy >= 0 ? 1 : -1;
            
            let deltaNW, deltaWidth, deltaSW, delta;
            
            // 방향에 따라 크기 조절 처리 (1:1 비율 유지)
            switch (this.resizeDirection) {
                case 'nw':
                    deltaNW = Math.min(this.initialCropWidth, this.initialCropHeight);
                    deltaNW = Math.min(maxDelta, deltaNW - 50); // 최소 50px 유지
                    
                    this.cropAreaLeft = this.initialCropLeft + (deltaNW * signX);
                    this.cropAreaTop = this.initialCropTop + (deltaNW * signY);
                    this.cropAreaWidth = this.initialCropWidth - (deltaNW * signX);
                    this.cropAreaHeight = this.cropAreaWidth; // 1:1 비율 유지
                    break;
                    
                case 'ne':
                    deltaWidth = Math.min(maxDelta, this.initialCropWidth - 50);
                    
                    this.cropAreaTop = this.initialCropTop + (deltaWidth * signY);
                    this.cropAreaWidth = this.initialCropWidth + (deltaWidth * signX);
                    this.cropAreaHeight = this.cropAreaWidth; // 1:1 비율 유지
                    break;
                    
                case 'sw':
                    deltaSW = Math.min(maxDelta, this.initialCropWidth - 50);
                    
                    this.cropAreaLeft = this.initialCropLeft + (deltaSW * signX);
                    this.cropAreaWidth = this.initialCropWidth - (deltaSW * signX);
                    this.cropAreaHeight = this.cropAreaWidth; // 1:1 비율 유지
                    break;
                    
                case 'se':
                    // SE 방향은 가장 간단하게 처리 가능
                    delta = Math.max(dx, dy); // 더 큰 변화량 사용
                    this.cropAreaWidth = this.initialCropWidth + delta;
                    this.cropAreaHeight = this.cropAreaWidth; // 1:1 비율 유지
                    break;
            }
            
            // 최소 크기 제한
            if (this.cropAreaWidth < 100) {
                this.cropAreaWidth = 100;
                this.cropAreaHeight = 100;
            }
            
            // 최대 크기 제한 (이미지 크기를 넘지 않도록)
            const maxSize = Math.min(this.imageWidth, this.imageHeight);
            if (this.cropAreaWidth > maxSize) {
                this.cropAreaWidth = maxSize;
                this.cropAreaHeight = maxSize;
            }
        },
        stopResize() {
            this.isResizing = false;
            document.removeEventListener('mousemove', this.onResize);
            document.removeEventListener('mouseup', this.stopResize);
        },
        stopResizeTouch() {
            this.isResizing = false;
            document.removeEventListener('touchmove', this.onResizeTouch);
            document.removeEventListener('touchend', this.stopResizeTouch);
        },
        onImageResize(event) {
            if (!this.isImageResizing) return;
            
            const dx = event.clientX - this.imageResizeStartX;
            const dy = event.clientY - this.imageResizeStartY;
            
            this.handleImageResize(dx, dy);
        },
        onImageResizeTouch(event) {
            if (!this.isImageResizing) return;
            
            const dx = event.touches[0].clientX - this.imageResizeStartX;
            const dy = event.touches[0].clientY - this.imageResizeStartY;
            
            this.handleImageResize(dx, dy);
            event.preventDefault();
        },
        handleImageResize(dx, dy) {
            // 이미지 크기 조절 처리
            const distance = Math.sqrt(dx * dx + dy * dy);
            const direction = dx + dy > 0 ? 1 : -1;
            
            // 방향에 따라 확대/축소
            const scaleFactor = 1 + (direction * distance * 0.01);
            const newScale = this.initialImageScale * scaleFactor;
            
            // 스케일 제한 (0.1 ~ 3)
            this.imageScale = Math.max(0.1, Math.min(3, newScale));
            
            // 이미지 크기 업데이트
            this.imageWidth = this.originalImageWidth * this.imageScale;
            this.imageHeight = this.originalImageHeight * this.imageScale;
        },
        stopImageResize() {
            this.isImageResizing = false;
            document.removeEventListener('mousemove', this.onImageResize);
            document.removeEventListener('mouseup', this.stopImageResize);
        },
        stopImageResizeTouch() {
            this.isImageResizing = false;
            document.removeEventListener('touchmove', this.onImageResizeTouch);
            document.removeEventListener('touchend', this.stopImageResizeTouch);
        }
    },
    mounted() {
        // URL 파라미터에서 정모 ID 가져오기
        this.meetingId = this.$route.params.meetingId;
        
        if (this.meetingId) {
            // 정모 정보 불러오기
            this.fetchMeetingData();
        } else {
            // 정모 ID가 없는 경우 이전 페이지로 이동
            this.$router.go(-1);
        }
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

.form-field {
    margin-bottom: 16px;
}

.image-preview-container {
    position: relative;
    width: 300px;
    height: 300px;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
}

.resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 50%;
}

.resize-handle-nw {
    top: -5px;
    left: -5px;
    cursor: nw-resize;
}

.resize-handle-ne {
    top: -5px;
    right: -5px;
    cursor: ne-resize;
}

.resize-handle-sw {
    bottom: -5px;
    left: -5px;
    cursor: sw-resize;
}

.resize-handle-se {
    bottom: -5px;
    right: -5px;
    cursor: se-resize;
}

.image-resize-handle {
    position: absolute;
    width: 24px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 2px solid #fff;
    border-radius: 50%;
    z-index: 10;
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
</style>