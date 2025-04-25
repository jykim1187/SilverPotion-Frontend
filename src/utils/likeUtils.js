import axios from 'axios';

export const toggleLike = async (post, endpoint) => {
  // 현재 상태 저장 (롤백용)
  const prevState = {
    isLike: post.isLike,
    likeCount: post.likeCount
  };
  
  try {
    // UI 즉시 업데이트 (클릭 시 바로 효과가 보이도록)
    post.isLike = !post.isLike;
    
    // 좋아요 수 업데이트
    if (post.isLike) {
      post.likeCount += 1;
    } else {
      post.likeCount = Math.max(0, post.likeCount - 1);
    }
    
    // 로컬 스토리지에 상태 저장
    const storageKey = post.type === 'VOTE' ? `vote_like_state_${post.voteId}` : `like_state_${post.postId}`;
    const countKey = post.type === 'VOTE' ? `vote_like_count_${post.voteId}` : `like_count_${post.postId}`;
    
    localStorage.setItem(storageKey, post.isLike.toString());
    localStorage.setItem(countKey, post.likeCount.toString());
    
    // 서버에 좋아요 상태 변경 요청
    const loginId = localStorage.getItem('loginId');
    const response = await axios.post(
      endpoint,
      {},
      {
        headers: {
          'X-User-LoginId': loginId
        }
      }
    );
    
    // 서버 응답 처리
    if (response.data && response.data.result) {
      const result = response.data.result;
      
      // 서버에서 반환한 정확한 카운트로 업데이트
      if (typeof result.likeCount === 'number') {
        post.likeCount = result.likeCount;
        localStorage.setItem(countKey, post.likeCount.toString());
      }
      
      // 좋아요 버튼을 클릭했을 때의 동작에 따라 상태 설정
      if (post.isLike) {
        post.isLike = true;
        localStorage.setItem(storageKey, 'true');
      } else {
        post.isLike = false;
        localStorage.setItem(storageKey, 'false');
      }
    }
  } catch (error) {
    console.error('좋아요 처리 중 오류 발생:', error);
    
    // 오류 발생 시 이전 상태로 복원
    post.isLike = prevState.isLike;
    post.likeCount = prevState.likeCount;
    
    const storageKey = post.type === 'VOTE' ? `vote_like_state_${post.voteId}` : `like_state_${post.postId}`;
    const countKey = post.type === 'VOTE' ? `vote_like_count_${post.voteId}` : `like_count_${post.postId}`;
    
    localStorage.setItem(storageKey, post.isLike.toString());
    localStorage.setItem(countKey, post.likeCount.toString());
    
    throw error; // 에러를 다시 throw하여 컴포넌트에서 추가적인 에러 처리가 가능하도록 함
  }
}; 