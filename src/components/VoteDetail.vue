<template>
  <v-container>
    <!-- 뒤로가기 헤더 -->
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="text-h6 ml-3">투표</span>
      <v-spacer></v-spacer>
    </div>

    <!-- 로딩 표시 -->
    <div v-if="loading" class="d-flex flex-column align-center my-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="mt-4">투표 정보를 불러오는 중...</div>
    </div>

    <!-- 게시물 상세 정보 -->
    <div v-else-if="voteDetail" class="post-detail mb-4">
      <!-- 프로필 정보와 날짜 -->
      <div class="d-flex align-center mb-2">
        <v-avatar size="40" class="mr-3">
          <v-img :src="voteDetail.profileImage || require('@/assets/default-profile.png')"></v-img>
        </v-avatar>
        <div>
          <div class="font-weight-bold">{{ voteDetail.nickname }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(voteDetail.createTime) }}
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="showReportDialog = true">
              <v-list-item-title>신고하기</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- 투표 내용 -->
      <div class="text-body-1 mb-4">{{ voteDetail.description }}</div>
      
      <!-- 투표 항목 -->
      <div class="vote-options mb-5">
        <div class="vote-title mb-3 px-2">
          <h2 class="text-h5 font-weight-bold">{{ voteDetail.description || '뭐먹지' }}</h2>
          <div class="text-caption text-medium-emphasis">
            {{ formatDate(voteDetail.createTime) }} 종료예정
          </div>
          <div class="d-flex justify-center my-2">
            <v-chip :color="voteDetail.multipleChoice ? 'purple' : 'primary'" size="small">
              {{ voteDetail.multipleChoice ? '복수 선택 가능' : '단일 선택만 가능' }}
            </v-chip>
          </div>
        </div>
        
        <!-- 복수 선택 UI -->
        <template v-if="voteDetail.multipleChoice">
          <div 
            v-for="(option, index) in voteDetail.voteOption" 
            :key="index" 
            class="vote-option mb-3"
            @click="toggleMultipleSelection(option)"
            :class="{'selected': selectedOptions.includes(option.id)}"
          >
            <div class="d-flex align-center">
              <div class="option-checkbox mr-3">
                <v-checkbox
                  v-model="selectedOptions"
                  :value="option.id"
                  :disabled="isVoteClosed || voteDetail.isParticipating === 'Y'"
                  hide-details
                  color="primary"
                  class="option-checkbox-style"
                  @click.stop
                ></v-checkbox>
              </div>
              <div class="option-content flex-grow-1">
                <div class="d-flex align-center mb-1">
                  <div class="font-weight-medium option-text">{{ option.optionText }}</div>
                  <v-spacer></v-spacer>
                  <div class="text-caption" v-if="voteDetail.isParticipating === 'Y' || isVoteClosed">
                    {{ getVotePercentage(option) }}%
                  </div>
                </div>
                <v-progress-linear
                  v-if="voteDetail.isParticipating === 'Y' || isVoteClosed"
                  :model-value="getVotePercentage(option)"
                  height="8"
                  color="primary"
                  rounded
                ></v-progress-linear>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 단일 선택 UI -->
        <template v-else>
          <v-radio-group v-model="selectedOption" :disabled="isVoteClosed || voteDetail.isParticipating === 'Y'">
            <div 
              v-for="(option, index) in voteDetail.voteOption" 
              :key="index" 
              class="vote-option mb-3"
              @click="toggleSingleSelection(option)"
              :class="{'selected': selectedOption === option.id}"
            >
              <div class="d-flex align-center">
                <div class="option-checkbox mr-3">
                  <v-radio
                    :value="option.id"
                    hide-details
                    color="primary"
                    class="option-radio-style"
                    @click.stop
                  ></v-radio>
                </div>
                <div class="option-content flex-grow-1">
                  <div class="d-flex align-center mb-1">
                    <div class="font-weight-medium option-text">{{ option.optionText }}</div>
                    <v-spacer></v-spacer>
                    <div class="text-caption" v-if="voteDetail.isParticipating === 'Y' || isVoteClosed">
                      {{ getVotePercentage(option) }}%
                    </div>
                  </div>
                  <v-progress-linear
                    v-if="voteDetail.isParticipating === 'Y' || isVoteClosed"
                    :model-value="getVotePercentage(option)"
                    height="8"
                    color="primary"
                    rounded
                  ></v-progress-linear>
                </div>
              </div>
            </div>
          </v-radio-group>
        </template>
        
        <div v-if="voteDetail.voteOption && voteDetail.voteOption.length === 0" class="text-center py-4">
          투표 항목이 없습니다.
        </div>
        
        <!-- 투표 버튼 -->
        <div class="d-flex justify-space-between mt-4" v-if="!isVoteClosed && voteDetail.isParticipating !== 'Y'">
          <v-btn
            color="grey-lighten-3"
            variant="elevated"
            class="flex-grow-1 mr-2"
            rounded="lg"
            @click="cancelSelection"
          >
            취소하기
          </v-btn>
          <v-btn
            color="primary"
            @click="submitVote"
            :disabled="!canSubmitVote"
            class="vote-submit-btn flex-grow-1"
            variant="elevated"
            rounded="lg"
          >
            투표하기
          </v-btn>
        </div>
        
        <div v-else-if="voteDetail.isParticipating === 'Y'" class="d-flex justify-space-between mt-4">
          <v-btn
            color="grey-lighten-3"
            variant="elevated"
            class="flex-grow-1 mr-2"
            rounded="lg"
            @click="reVote"
          >
            다시 투표하기
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            class="flex-grow-1"
            disabled
          >
            이미 투표하셨습니다
          </v-btn>
        </div>
        
        <!-- 투표 정보 -->
        <div class="vote-info d-flex justify-end mt-4" @click="showVoteUsersDialog">
          <div class="text-body-2 vote-info-text">
            <strong>{{ voteDetail.participantsCount || 0 }}명</strong> 참여
          </div>
        </div>
      </div>

      <!-- 구분선 -->
      <v-divider class="my-3"></v-divider>

      <!-- 좋아요, 댓글 버튼 -->
      <div class="d-flex">
        <v-btn
          variant="text"
          :prepend-icon="voteDetail.isLike === 'Y' ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
          :color="voteDetail.isLike === 'Y' ? 'red' : ''"
          @click="toggleLike"
          class="flex-grow-1"
        >
          <span>좋아요</span>
        </v-btn>
        <v-btn 
          variant="text" 
          prepend-icon="mdi-comment-outline"
          class="flex-grow-1"
        >
          <span>댓글 달기</span>
        </v-btn>
      </div>

      <!-- 좋아요 카운트 -->
      <div class="d-flex align-center py-2 px-3">
        <div class="like-avatars mr-2" v-if="voteDetail.voteLikeCount > 0">
          <div class="like-avatar-circle">
            <v-img src="@/assets/default-profile.png" width="20" height="20" class="rounded-circle"></v-img>
          </div>
        </div>
        <span class="text-body-2">
          <span v-if="voteDetail.voteLikeCount > 0" class="like-count" @click="showLikesDialog">
            <strong>{{ voteDetail.voteLikeCount }}명</strong>이 좋아합니다
          </span>
          <span v-else>
            제일 먼저 좋아요를 눌러주세요!
          </span>
        </span>
      </div>
    </div>

    <!-- 댓글 섹션 -->
    <div v-if="!loading">
      <!-- 댓글 개수 표시 -->
      <div class="text-caption text-medium-emphasis mb-3">댓글 {{ voteDetail.commentCount || 0 }}개</div>

      <!-- 댓글 목록 -->
      <div v-for="comment in commentList" :key="comment.commentId" class="mb-4">
        <div class="d-flex">
          <v-avatar size="40" class="mr-3">
            <v-img :src="comment.profileImage || require('@/assets/default-profile.png')"></v-img>
          </v-avatar>
          <div class="comment-container flex-grow-1">
            <div class="d-flex justify-space-between align-start">
              <div class="comment-bubble">
                <div v-if="editingComment !== comment.commentId" class="d-flex align-center">
                  <div class="comment-content">
                    <div class="font-weight-bold">{{ comment.nickName }}</div>
                    <div>{{ comment.content }}</div>
                    <div class="text-caption text-medium-emphasis mt-1">
                      {{ formatDate(comment.createdTime) }}
                      <span v-if="comment.isUpdate === 'Y'" class="ml-2">(수정됨)</span>
                    </div>
                  </div>
                </div>
                <v-textarea
                  v-else
                  v-model="editedCommentContent"
                  rows="2"
                  auto-grow
                  variant="outlined"
                  hide-details
                  density="compact"
                  class="mt-1"
                ></v-textarea>
                <div v-if="editingComment === comment.commentId" class="d-flex justify-end mt-1">
                  <v-btn 
                    variant="text" 
                    size="small" 
                    color="primary" 
                    @click="updateComment(comment.commentId)"
                    :disabled="!editedCommentContent.trim()"
                  >
                    저장
                  </v-btn>
                  <v-btn variant="text" size="small" @click="cancelEdit">취소</v-btn>
                </div>
              </div>
              <div v-if="comment.likeCount && comment.likeCount > 0" class="d-flex align-center comment-like-indicator ms-2" @click="showCommentLikesDialog(comment.commentId)">
                <v-icon color="red" size="small" class="mr-1">mdi-heart</v-icon>
                <span class="text-caption">{{ comment.likeCount }}</span>
              </div>
            </div>
            <div class="comment-actions d-flex align-center mt-1">
              <span 
                class="comment-action-btn"
                :class="{'comment-action-active': comment.isLike === 'Y'}"
                @click="toggleCommentLike(comment)"
              >
                <v-icon size="small" class="mr-1" :color="comment.isLike === 'Y' ? 'red' : 'grey'">
                  {{ comment.isLike === 'Y' ? 'mdi-heart' : 'mdi-heart-outline' }}
                </v-icon>
                좋아요
              </span>
              <span class="mx-2">·</span>
              <span class="comment-action-btn" @click="startReply(comment)">
                답글 달기
              </span>
              <span v-if="comment.replies && comment.replies.length > 0" class="mx-2">·</span>
              <span 
                v-if="comment.replies && comment.replies.length > 0" 
                class="comment-action-btn"
                @click="toggleReplies(comment.commentId)"
              >
                {{ expandedComments.has(comment.commentId) ? '답글 숨기기' : `답글 ${comment.replies.length}개 보기` }}
              </span>
            </div>
          </div>
          
          <!-- 댓글 메뉴 (인스타그램 스타일) -->
          <v-btn 
            icon="mdi-dots-vertical" 
            variant="text" 
            density="comfortable" 
            size="small"
            color="grey-darken-2"
            class="comment-menu-btn ms-2"
            @click="openCommentOptions(comment.commentId)"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </div>

        <!-- 대댓글 작성 -->
        <div v-if="replyingTo === comment.commentId" class="ml-12 mt-2">
          <v-textarea
            v-model="newReply"
            label="답글을 입력하세요"
            rows="2"
            auto-grow
            variant="outlined"
            hide-details
            density="compact"
          ></v-textarea>
          <div class="text-right mt-2">
            <v-btn color="primary" @click="submitReply" :disabled="!newReply.trim()">
              답글 작성
            </v-btn>
            <v-btn variant="text" @click="cancelReply">취소</v-btn>
          </div>
        </div>

        <!-- 대댓글 목록 -->
        <div v-if="comment.replies && comment.replies.length > 0 && expandedComments.has(comment.commentId)" class="ml-12 mt-2">
          <div 
            v-for="reply in getVisibleReplies(comment)" 
            :key="reply.commentId"
            class="d-flex mb-2"
          >
            <v-avatar size="32" class="mr-2">
              <v-img :src="reply.profileImage || require('@/assets/default-profile.png')"></v-img>
            </v-avatar>
            <div class="comment-container">
              <div class="d-flex justify-space-between align-start">
                <div class="comment-bubble">
                  <div v-if="editingComment !== reply.commentId" class="d-flex align-center">
                    <div class="comment-content">
                      <div class="font-weight-bold">{{ reply.nickName }}</div>
                      <div>{{ reply.content }}</div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        {{ formatDate(reply.createdTime) }}
                        <span v-if="reply.isUpdate === 'Y'" class="ml-2">(수정됨)</span>
                      </div>
                    </div>
                  </div>
                  <v-textarea
                    v-else
                    v-model="editedCommentContent"
                    rows="2"
                    auto-grow
                    variant="outlined"
                    hide-details
                    density="compact"
                    class="mt-1"
                  ></v-textarea>
                   <div v-if="editingComment === reply.commentId" class="d-flex justify-end mt-1">
                    <v-btn 
                      variant="text" 
                      size="small" 
                      color="primary" 
                      @click="updateComment(reply.commentId)"
                      :disabled="!editedCommentContent.trim()"
                    >
                      저장
                    </v-btn>
                    <v-btn variant="text" size="small" @click="cancelEdit">취소</v-btn>
                  </div>
                </div>
                <div v-if="reply.likeCount && reply.likeCount > 0" class="d-flex align-center comment-like-indicator ms-2" @click="showCommentLikesDialog(reply.commentId)">
                  <v-icon color="red" size="small" class="mr-1">mdi-heart</v-icon>
                  <span class="text-caption">{{ reply.likeCount }}</span>
                </div>
              </div>
              <div class="comment-actions d-flex align-center mt-1">
                <span 
                  class="comment-action-btn"
                  :class="{'comment-action-active': reply.isLike === 'Y'}"
                  @click="toggleCommentLike(reply)"
                >
                  <v-icon size="small" class="mr-1" :color="reply.isLike === 'Y' ? 'red' : 'grey'">
                    {{ reply.isLike === 'Y' ? 'mdi-heart' : 'mdi-heart-outline' }}
                  </v-icon>
                  좋아요
                </span>
              </div>
            </div>
            <v-spacer></v-spacer>
            <!-- 대댓글 메뉴 (인스타그램 스타일) -->
            <v-btn 
              icon="mdi-dots-vertical" 
              variant="text" 
              density="comfortable" 
              size="small"
              color="grey-darken-2"
              class="comment-menu-btn"
              @click="openCommentOptions(reply.commentId)"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </div>
          
          <!-- 더보기 버튼 -->
          <div v-if="hasMoreReplies(comment)" class="text-center mt-1">
            <v-btn
              variant="text"
              size="small"
              @click="showMoreReplies(comment)"
            >
              더보기
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 인스타그램 스타일 옵션 다이얼로그 -->
    <v-dialog v-model="optionsDialog" max-width="300" class="instagram-options-dialog">
      <v-card rounded="lg">
        <v-list density="compact">
          <template v-if="isCommentOwner(findCommentById(selectedCommentId)) || isVoteOwner()">
            <v-list-item @click="editSelectedComment" class="option-item">
              <v-list-item-title class="text-center py-3">
                <v-icon size="small" class="mr-2">mdi-pencil</v-icon>
                수정
              </v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="confirmDeleteSelected" color="error" class="option-item">
              <v-list-item-title class="text-center text-red py-3">
                <v-icon size="small" color="error" class="mr-2">mdi-delete</v-icon>
                삭제
              </v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
          </template>
          <v-list-item @click="reportComment" class="option-item">
            <v-list-item-title class="text-center py-3">
              <v-icon size="small" color="warning" class="mr-2">mdi-alert</v-icon>
              신고
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="optionsDialog = false" class="option-item">
            <v-list-item-title class="text-center py-3">취소</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <!-- 댓글 좋아요 목록 다이얼로그 -->
    <v-dialog v-model="commentLikesDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="text-h6">좋아요</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="commentLikesDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <v-list>
            <!-- 좋아요 데이터가 있을 경우 표시 -->
            <div v-if="commentLikes.length > 0">
              <v-list-item v-for="like in commentLikes" :key="like.id" class="py-2">
                <template v-slot:prepend>
                  <v-avatar size="40">
                    <v-img :src="like.profileImage || require('@/assets/default-profile.png')"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ like.nickName }}</v-list-item-title>
              </v-list-item>
              
              <!-- 더 불러오기 버튼 -->
              <div v-if="commentLikesPage < commentLikesTotalPages - 1" class="text-center py-2">
                <v-btn 
                  variant="text" 
                  color="primary" 
                  @click="loadMoreCommentLikes" 
                  :loading="commentLikesLoading"
                >
                  더 보기
                </v-btn>
              </div>
            </div>
            <!-- 좋아요 데이터가 없을 경우 -->
            <div v-else-if="commentLikesLoading" class="py-5 text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="text-body-1 text-medium-emphasis mt-2">좋아요 정보를 불러오는 중...</p>
            </div>
            <div v-else class="py-5 text-center">
              <p class="text-body-1 text-medium-emphasis">아직 좋아요가 없습니다</p>
            </div>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="300">
      <v-card>
        <v-card-title class="text-h6">댓글 삭제</v-card-title>
        <v-card-text>이 댓글을 정말 삭제하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="deleteComment">삭제</v-btn>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 댓글 작성 입력창 -->
    <div class="comment-input" v-if="voteDetail">
      <div class="comment-input-container">
        <v-textarea
          v-model="newComment"
          placeholder="댓글을 달아주세요..."
          rows="1"
          auto-grow
          variant="plain"
          hide-details
          density="comfortable"
        ></v-textarea>
        <v-btn 
          color="primary" 
          @click="submitComment" 
          :disabled="!newComment.trim()"
          class="ml-2"
        >
          전송
        </v-btn>
      </div>
    </div>

    <!-- 신고 다이얼로그 -->
    <v-dialog v-model="showReportDialog" max-width="400">
      <v-card>
        <v-card-title>신고</v-card-title>
        <v-card-text>
          <v-select
            v-model="reportSmallCategory"
            label="신고 사유 선택"
            :items="reportCategories"
            item-title="text"
            item-value="value"
            variant="outlined"
            required
            :rules="[v => !!v || '신고 사유를 선택해주세요']"
            class="mb-4"
          ></v-select>
          <v-textarea
            v-model="reportContent"
            label="상세 내용"
            hint="신고 사유에 대한 상세 내용을 작성해주세요."
            rows="4"
            variant="outlined"
            :rules="[v => !!v || '상세 내용을 입력해주세요']"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showReportDialog = false">취소</v-btn>
          <v-btn color="error" variant="text" @click="submitReport">신고</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 투표자 목록 다이얼로그 -->
    <v-dialog v-model="voteUsersDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center" style="background:#f5f5f7; border-bottom:1.5px solid #222; min-height:48px;">
          <span class="text-h6 font-weight-bold" style="font-size:18px;">항목별</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="voteUsersDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0" style="background:#fff;">
          <div v-for="option in voteDetail.voteOption" :key="option.id" class="px-4 py-3">
            <div class="d-flex align-center mb-2">
              <span class="font-weight-bold mr-2" style="font-size:17px; color:#888;">{{ option.optionText }}:</span>
              <span class="font-weight-bold" style="font-size:17px; color:#222;">{{ (voteUsers[option.id]?.length || 0) }}명</span>
            </div>
            <div v-if="voteUsers[option.id] && voteUsers[option.id].length > 0">
              <div v-for="user in voteUsers[option.id]" :key="user.userId" class="d-flex align-center mb-2 ml-2" @click="goToUserProfile(user.userId)">
                <v-avatar size="44" class="mr-3">
                  <v-img :src="user.profileImage" :alt="user.nickName" />
                </v-avatar>
                <span class="font-weight-bold" style="font-size:16px; color:#222;">{{ user.nickName }}</span>
              </div>
            </div>
            <div v-else class="ml-2" style="color:#bbb; font-size:16px; font-weight:500; padding:8px 0 8px 0;">투표자가 없습니다.</div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default {
  name: 'VoteDetail',
  data() {
    return {
      voteDetail: {
        voteId: null,
        writerId: null,
        voteLikeCount: 0,
        isLike: 'N',
        commentCount: 0,
        nickname: '',
        profileImage: '',
        voteOption: [],
        description: '',
        multipleChoice: false,
        createTime: null,
        closeTime: null,
        participantsCount: 0,
        isParticipating: 'N'
      },
      commentList: [],
      selectedOption: null,
      selectedOptions: [],
      hasUserVoted: false,
      newComment: '',
      newReply: '',
      replyingTo: null,
      loading: true,
      expandedComments: new Set(),
      visibleRepliesCount: {},
      editingComment: null,
      editedCommentContent: '',
      deleteDialog: false,
      commentToDelete: null,
      optionsDialog: false,
      selectedCommentId: null,
      likesDialog: false,
      likes: [],
      commentLikesDialog: false,
      commentLikes: [],
      currentCommentId: null,
      commentLikesPage: 0,
      commentLikesLoading: false,
      commentLikesTotalPages: 0,
      loginId: localStorage.getItem('loginId'),
      showReportDialog: false,
      reportSmallCategory: '',
      reportContent: '',
      reportCategories: [
        { text: '성적행위', value: 'SEXUAL_CONTENT' },
        { text: '혐오발언', value: 'HATE_SPEECH' },
        { text: '사기', value: 'FRAUD' },
        { text: '폭력', value: 'VIOLENCE' },
        { text: '불법', value: 'ILLEGAL_ACT' },
        { text: '따돌림', value: 'BULLYING' }
      ],
      voteUsersDialog: false,
      voteUsers: {},
      expandedOptions: new Set(),
    };
  },
  computed: {
    // 투표 제출 가능 여부
    canSubmitVote() {
      if (this.isVoteClosed || this.hasUserVoted) return false;
      
      if (this.voteDetail.multipleChoice) {
        return this.selectedOptions.length > 0;
      } else {
        return this.selectedOption !== null;
      }
    },
    // 투표 마감 여부
    isVoteClosed() {
      if (!this.voteDetail.closeTime) return false;
      const closeTime = new Date(this.voteDetail.closeTime);
      return closeTime < new Date();
    },
    // 작성자 여부
    isAuthor() {
      // 백엔드에서 투표 상세 조회 시 필요한 정보로 판단
      return false;
    }
  },
  created() {
    this.fetchVoteDetail();
    // 로컬 스토리지에서 투표 결과 복원
    const voteId = this.$route.params.voteId;
    const savedVoteData = localStorage.getItem(`vote_${voteId}`);
    if (savedVoteData) {
      const voteData = JSON.parse(savedVoteData);
      if (voteData.hasVoted) {
        this.voteDetail.voteOption = voteData.voteOptions;
        this.voteDetail.participantsCount = voteData.participantsCount;
        this.voteDetail.isParticipating = 'Y';
      }
    }
  },
  methods: {
    // 댓글 작성자 확인 (수정/삭제 권한)
    isCommentOwner(comment) {
      if (!comment || !comment.userId) {
        console.log('댓글 데이터가 없거나 userId가 없습니다:', comment);
        return false;
      }
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('로그인된 사용자가 없습니다');
        return false;
      }

      // 댓글의 userId와 로그인한 사용자의 ID를 비교
      const isOwner = comment.userId === parseInt(userId);
      console.log('댓글 소유자 확인:', {
        commentId: comment.commentId,
        commentUserId: comment.userId,
        currentUserId: userId,
        isOwner: isOwner
      });
      
      return isOwner;
    },

    // 투표 작성자 확인
    isVoteOwner() {
      const userId = localStorage.getItem('userId');
      if (!userId || !this.voteDetail || !this.voteDetail.writerId) {
        return false;
      }
      return this.voteDetail.writerId === parseInt(userId);
    },

    // 투표 상세 정보 가져오기
    async fetchVoteDetail() {
      try {
        this.loading = true;
        const loginId = localStorage.getItem('loginId');
        const voteId = this.$route.params.voteId;
        
        console.log('투표 상세 조회 요청 - voteId:', voteId);
        
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/detail/${voteId}`,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        console.log('API 응답 데이터:', response.data);
        
        const result = response.data.result || {};
        
        // 투표 옵션 데이터 처리
        let processedVoteOptions = [];
        if (result.voteOptions && Array.isArray(result.voteOptions)) {
          processedVoteOptions = result.voteOptions.map(option => ({
            id: option.optionId || 0,
            optionText: option.optionText || '',
            voteCount: option.voteCount || 0,
            voteRatio: option.voteRadio || 0
          }));
        }
        
        // 투표 상세 정보 설정
        this.voteDetail = {
          voteId: result.voteId || null,
          writerId: result.writerId || null,
          voteLikeCount: result.voteLikeCount || 0,
          isLike: result.isLike || 'N',
          commentCount: result.commentCount || 0,
          nickname: result.nickname || '알 수 없음',
          profileImage: result.profileImage || '',
          voteOption: processedVoteOptions,
          description: result.description || '',
          multipleChoice: result.multipleChoice || false,
          createTime: result.createTime || null,
          closeTime: result.closeTime || null,
          participantsCount: result.participantsCount || 0,
          isParticipating: result.hasVoted ? 'Y' : 'N'
        };

        // 투표 참여 여부 및 선택된 옵션 처리
        if (result.hasVoted && result.selectOption && Array.isArray(result.selectOption)) {
          this.hasUserVoted = true;
          
          // 사용자가 선택한 옵션 설정
          const selectedIds = result.selectOption.map(opt => opt.optionId);
          
          if (this.voteDetail.multipleChoice) {
            this.selectedOptions = selectedIds;
          } else if (selectedIds.length > 0) {
            this.selectedOption = selectedIds[0];
          }
        }

        // 댓글 데이터 설정
        this.commentList = result.commentList || [];
        
        console.log('처리된 투표 상세 데이터:', this.voteDetail);
        console.log('댓글 목록:', this.commentList);
      } catch (error) {
        console.error('투표 상세 정보를 가져오는데 실패했습니다:', error);
        alert('투표 상세 정보를 가져오는데 실패했습니다.');
      } finally {
        this.loading = false;
      }
    },

    // 좋아요 토글
    async toggleLike() {
      try {
        const loginId = localStorage.getItem('loginId');
        const voteId = this.$route.params.voteId;
        
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/like/${voteId}`,
          null,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        const result = response.data.result;
        this.voteDetail.isLike = result.liked ? 'Y' : 'N';
        this.voteDetail.voteLikeCount = result.likeCount;
      } catch (error) {
        console.error('좋아요 처리 중 오류가 발생했습니다:', error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
      }
    },
    
    // 댓글 작성
    async submitComment() {
      try {
        const loginId = localStorage.getItem('loginId');
        const voteId = this.$route.params.voteId;
        
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/create`,
          {
            postId: null, // postId is null for vote comments
            voteId: voteId,
            content: this.newComment
          },
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        this.newComment = '';
        // 새 댓글을 반영하기 위해 투표 상세 정보 새로고침
        this.fetchVoteDetail();
      } catch (error) {
        console.error('댓글 작성 중 오류가 발생했습니다:', error);
        alert('댓글 작성 중 오류가 발생했습니다.');
      }
    },
    
    // 대댓글 작성
    async submitReply() {
      try {
        const loginId = localStorage.getItem('loginId');
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/reply`,
          {
            parentId: this.replyingTo,
            content: this.newReply
          },
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        this.newReply = '';
        this.replyingTo = null;
        // 새 대댓글을 반영하기 위해 투표 상세 정보 새로고침
        this.fetchVoteDetail();
      } catch (error) {
        console.error('답글 작성 중 오류가 발생했습니다:', error);
        alert('답글 작성 중 오류가 발생했습니다.');
      }
    },

    startReply(comment) {
      this.replyingTo = comment.commentId;
    },

    cancelReply() {
      this.replyingTo = null;
      this.newReply = '';
    },

    // 댓글 좋아요 토글
    async toggleCommentLike(comment) {
      try {
        console.log('좋아요 요청 전 상태:', { 
          commentId: comment.commentId, 
          isLike: comment.isLike, 
          likeCount: comment.likeCount 
        });
        
        const loginId = localStorage.getItem('loginId');
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/comment/like/${comment.commentId}`,
          null,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        console.log('서버 응답:', response.data);
        const result = response.data.result;
        
        if (result) {
          // CommentLikeResDto 응답 형식에 맞게 처리
          // { count: Long, isLike: Boolean }
          comment.likeCount = result.count || 0;
          comment.isLike = result.isLike ? 'Y' : 'N';
        }
        
        console.log('좋아요 처리 후 상태:', { 
          commentId: comment.commentId, 
          isLike: comment.isLike, 
          likeCount: comment.likeCount 
        });
      } catch (error) {
        console.error('댓글 좋아요 처리 중 오류가 발생했습니다:', error);
        alert('댓글 좋아요 처리 중 오류가 발생했습니다.');
      }
    },
    
    // 날짜 형식 변환
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return format(date, 'M월 d일 a h:mm', { locale: ko });
      } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
      }
    },
    
    // 복수 선택 토글 (체크박스)
    toggleMultipleSelection(option) {
      // 마감되었거나 이미 참여한 경우 동작 안함
      if (this.isVoteClosed || this.voteDetail.isParticipating === 'Y') {
        return;
      }

      const index = this.selectedOptions.indexOf(option.id);
      if (index === -1) {
        // 선택되지 않은 경우 추가
        this.selectedOptions.push(option.id);
        console.log('복수 선택 옵션 추가:', option.id, '현재 선택:', this.selectedOptions);
      } else {
        // 이미 선택된 경우 제거
        this.selectedOptions.splice(index, 1);
        console.log('복수 선택 옵션 제거:', option.id, '현재 선택:', this.selectedOptions);
      }
    },
    
    // 단일 선택 (라디오 버튼)
    toggleSingleSelection(option) {
      // 마감되었거나 이미 참여한 경우 동작 안함
      if (this.isVoteClosed || this.voteDetail.isParticipating === 'Y') {
        return;
      }

      this.selectedOption = option.id;
      console.log('단일 선택 옵션:', option.id);
    },
    
    // 선택 취소 메소드
    cancelSelection() {
      if (this.voteDetail.multipleChoice) {
        this.selectedOptions = [];
        console.log('복수 선택 취소, 모든 선택 해제');
      } else {
        this.selectedOption = null;
        console.log('단일 선택 취소, 선택 해제');
      }
    },

    // 다시 투표하기
    async reVote() {
      try {
        const loginId = localStorage.getItem('loginId');
        const voteId = this.$route.params.voteId;
        
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/reset/${voteId}`,
          null,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        // 로컬 스토리지에서 투표 상태 삭제
        localStorage.removeItem(`vote_${voteId}`);
        
        // 투표 상태 초기화
        this.voteDetail.isParticipating = 'N';
        this.selectedOption = null;
        this.selectedOptions = [];
        this.hasUserVoted = false;
        
        // 투표 정보 새로고침
        await this.fetchVoteDetail();
        
        // 상태 업데이트를 강제로 트리거
        this.$nextTick(() => {
          this.voteDetail = { ...this.voteDetail };
        });
        
        alert('다시 투표할 수 있습니다.');
      } catch (error) {
        console.error('다시 투표하기 처리 중 오류가 발생했습니다:', error);
        alert('다시 투표하기 처리 중 오류가 발생했습니다.');
      }
    },

    async submitReport() {
      try {
        const loginId = localStorage.getItem('loginId');
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/report/create`,
          {
            referenceId: this.voteDetail.voteId,
            reportBigCategory: 'POST',
            reportSmallCategory: this.reportSmallCategory,
            content: this.reportContent,
            reportedId: this.voteDetail.writerId
          },
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        alert('신고가 접수되었습니다.');
        this.showReportDialog = false;
        this.reportSmallCategory = '';
        this.reportContent = '';
        this.$router.push('/silverpotion/gathering/home/1');
      } catch (error) {
        alert('신고 처리 중 오류가 발생했습니다.');
      }
    },

    // 투표자 목록 다이얼로그 표시
    async showVoteUsersDialog() {
      this.voteUsersDialog = true;
      this.voteUsers = {};
      this.expandedOptions.clear();
      
      try {
        const loginId = localStorage.getItem('loginId');
        const voteId = this.$route.params.voteId;
        
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/${voteId}/userList`,
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        console.log('투표자 목록 응답:', response.data);
        const result = response.data.result;
        
        if (result) {
          // 사용자 정보를 가져오기 위한 추가 API 호출
          const userPromises = Object.entries(result).map(async ([optionId, answers]) => {
            const userPromises = answers.map(async (answer) => {
              try {
                console.log('프로필 조회 요청 - userId:', answer.userId);
                
                const userResponse = await axios.get(
                  `${process.env.VUE_APP_API_BASE_URL}/user-service/silverpotion/user/profile/${answer.userId}`,
                  {
                    headers: {
                      'X-User-LoginId': loginId,
                      'Internal-Request': 'true'
                    }
                  }
                );
                
                console.log('프로필 조회 응답:', userResponse.data);
                
                if (!userResponse.data) {
                  console.warn('프로필 데이터가 없습니다:', userResponse.data);
                  return {
                    userId: answer.userId,
                    profileImage: require('@/assets/default-profile.png'),
                    nickName: '알 수 없음'
                  };
                }
                
                const profileData = userResponse.data;
                console.log('프로필 데이터:', profileData);
                
                // 프로필 이미지 URL이 상대 경로인 경우 절대 경로로 변환
                let profileImage = profileData.profileImage;
                if (profileImage && !profileImage.startsWith('http')) {
                  profileImage = `${process.env.VUE_APP_API_BASE_URL}${profileImage}`;
                }
                
                return {
                  userId: answer.userId,
                  profileImage: profileImage || require('@/assets/default-profile.png'),
                  nickName: profileData.nickname || '알 수 없음'
                };
              } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
                return {
                  userId: answer.userId,
                  profileImage: require('@/assets/default-profile.png'),
                  nickName: '알 수 없음'
                };
              }
            });
            const users = await Promise.all(userPromises);
            return [optionId, users.filter(user => user !== null)];
          });
          
          const userResults = await Promise.all(userPromises);
          this.voteUsers = Object.fromEntries(userResults);
          console.log('최종 투표자 목록:', this.voteUsers);
        }
      } catch (error) {
        console.error('투표자 목록 조회 중 오류가 발생했습니다:', error);
        alert('투표자 목록을 불러오는데 실패했습니다.');
      }
    },
    
    // 옵션 ID로 옵션 텍스트 가져오기
    getOptionText(optionId) {
      const option = this.voteDetail.voteOption.find(opt => opt.id === optionId);
      return option ? option.optionText : '알 수 없음';
    },
    
    // 옵션 ID로 옵션 이미지 가져오기 (필요한 경우)
    getOptionImage() {
      // 여기에 옵션별 이미지 로직 추가
      return require('@/assets/default-profile.png');
    },
    
    // 옵션별 투표자 목록 토글
    toggleOptionUsers(optionId) {
      if (this.expandedOptions.has(optionId)) {
        this.expandedOptions.delete(optionId);
      } else {
        this.expandedOptions.add(optionId);
      }
    },

    // 유저 프로필 페이지로 이동
    goToUserProfile(userId) {
      this.$router.push({
        path: `/silverpotion/user/profile/${userId}`,
        query: {
          loginId: localStorage.getItem('loginId')
        }
      });
    },

    async submitVote() {
      try {
        const loginId = localStorage.getItem('loginId');
        const voteId = this.$route.params.voteId;
        
        // 선택한 옵션들
        const selectedIds = this.voteDetail.multipleChoice 
          ? this.selectedOptions 
          : [this.selectedOption];
        
        console.log('투표 제출 - 선택된 옵션 ID:', selectedIds);
        
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/post-service/silverpotion/post/vote/option`,
          {
            voteId: voteId,
            optionIds: selectedIds
          },
          {
            headers: {
              'X-User-LoginId': loginId
            }
          }
        );
        
        console.log('투표 제출 응답:', response.data);
        
        // 투표 결과 업데이트
        const result = response.data.result;
        this.voteDetail.participantsCount = result.totalParticipants;
        this.voteDetail.isParticipating = 'Y';
        this.hasUserVoted = true;
        
        // 각 옵션의 투표 수 업데이트
        if (result.options && Array.isArray(result.options)) {
          result.options.forEach(option => {
            const existingOption = this.voteDetail.voteOption.find(o => o.id === option.optionId);
            if (existingOption) {
              existingOption.voteCount = option.voteCount || 0;
              // 투표 비율 계산
              const totalVotes = result.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
              existingOption.voteRatio = totalVotes === 0 ? 0 : Math.round((option.voteCount / totalVotes) * 100);
            }
          });
        }

        // 선택한 옵션 저장
        if (this.voteDetail.multipleChoice) {
          this.selectedOptions = selectedIds;
        } else {
          this.selectedOption = selectedIds[0];
        }
        
        // localStorage에 투표 상태 저장
        const voteData = {
          hasVoted: true,
          selectedOptions: selectedIds,
          voteOptions: this.voteDetail.voteOption,
          participantsCount: this.voteDetail.participantsCount
        };
        localStorage.setItem(`vote_${voteId}`, JSON.stringify(voteData));
        
        // 투표 결과 로그 출력
        console.log('업데이트된 투표 옵션:', this.voteDetail.voteOption);
        console.log('참여자 수:', this.voteDetail.participantsCount);
        
        alert('투표가 완료되었습니다.');
      } catch (error) {
        console.error('투표 제출에 실패했습니다:', error);
        alert('투표 제출에 실패했습니다.');
      }
    },

    // 각 투표 옵션의 백분율 계산
    getVotePercentage(option) {
      if (!option || !this.voteDetail) return 0;
      
      // 백엔드에서 계산된 비율이 있으면 사용
      if (typeof option.voteRatio === 'number') {
        return option.voteRatio;
      }
      
      // 백엔드에서 비율이 없는 경우에만 클라이언트에서 계산
      const voteCount = option.voteCount || 0;
      const totalVotes = this.voteDetail.voteOption.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
      
      if (totalVotes === 0) return 0;
      
      return Math.round((voteCount / totalVotes) * 100);
    }
  }
};
</script>

<style scoped>
.post-detail {
  background-color: white;
  border-radius: 8px;
}

.comment-container {
  position: relative;
  max-width: calc(100% - 60px);
}

.comment-name-time {
  margin-bottom: 4px;
}

.comment-bubble {
  background-color: #f0f2f5;
  border-radius: 16px;
  padding: 8px 12px;
  display: inline-block;
  max-width: calc(100% - 40px); /* 좋아요 아이콘을 위한 공간 확보 */
  word-break: break-word;
}

.comment-content {
  flex-grow: 1;
}

.comment-actions {
  font-size: 12px;
  margin-top: -4px; /* 좋아요 버튼의 수직 위치 조정 */
}

.comment-action-btn {
  color: #65676b;
  font-weight: 600;
  cursor: pointer;
}

.comment-action-btn:hover {
  text-decoration: underline;
}

.comment-action-active {
  color: #1877f2;
}

.comment-input {
  width: 767px;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #e0e0e0;
  z-index: 1;
}

.comment-input-container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 767px;
  padding: 8px 16px;
  margin: 0 auto;
}

/* Container의 반응형 너비에 맞추기 위한 미디어 쿼리 */
.comment-input-container {
  max-width: 767px;
}

@media (max-width: 959px) {
  .comment-input {
    width: 100%;
  }
  
  .comment-input-container {
    max-width: 100%;
  }
  
  .v-container {
    padding-bottom: 80px; /* 모바일에서 댓글 입력창 높이만큼 여백 추가 */
  }
}

.v-container {
  padding-bottom: 64px;
}

/* 투표 옵션 스타일 */
.vote-options {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.vote-title {
  text-align: center;
  margin-bottom: 20px;
}

.vote-option {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.vote-option:hover {
  background-color: #edf2fd;
}

.vote-option:active {
  background-color: #e3eaf9;
  transform: scale(0.99);
}

.vote-option.selected {
  background-color: #e3eaf9;
  border: 1px solid #1976d2;
}

.option-text {
  font-size: 16px;
  font-weight: 500;
}

.option-checkbox-style, .option-radio-style {
  transform: scale(1.2);
}

.vote-submit-btn {
  min-width: 120px;
  font-weight: 500;
}

.vote-info {
  padding: 8px 16px;
  margin-top: 12px;
  opacity: 0.7;
  font-size: 0.9rem;
}

/* 인스타그램 스타일 옵션 다이얼로그 */
:deep(.instagram-options-dialog .v-card) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.instagram-options-dialog .v-list-item) {
  min-height: 48px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.instagram-options-dialog .option-item:hover) {
  background-color: rgba(0, 0, 0, 0.05);
}

:deep(.instagram-options-dialog .option-item:active) {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 메뉴 버튼 스타일 */
.comment-menu-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  min-width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
}

.comment-menu-btn:hover {
  opacity: 1;
}

.comment-menu-btn .v-icon {
  font-size: 20px;
}

/* 좋아요 표시 스타일 */
.like-count {
  color: #262626;
  font-weight: 500;
  cursor: pointer;
}
.like-count:hover {
  text-decoration: underline;
}

.like-avatars {
  display: flex;
  align-items: center;
}

.like-avatar-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid white;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.2);
}

.comment-like-indicator {
  cursor: pointer;
  transition: transform 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.comment-like-indicator:hover {
  transform: scale(1.1);
}

/* 반응형 스타일 */
@media (min-width: 1264px) {
  .comment-input-container {
    max-width: 1185px;
  }
}

@media (min-width: 960px) and (max-width: 1263px) {
  .comment-input-container {
    max-width: 900px;
  }
}

.vote-info-text {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.vote-info-text:hover {
  opacity: 0.8;
}

.vote-info-text:active {
  opacity: 0.6;
}

.text-grey {
  color: #888 !important;
}
.text-grey-lighten-1 {
  color: #bbb !important;
}
</style> 