import { useState } from "react";
import type { CommentDto } from "@appifylab/shared";
import { useUiStore } from "../../store/uiStore.ts";
import { useLikeCommentMutation } from "../../features/feed/feedQuery.ts";
import CommentBox from "./CommentBox.tsx";

interface CommentItemProps {
  comment: CommentDto;
  postId: string;
}

export default function CommentItem({ comment, postId }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { setActiveModal } = useUiStore();
  const likeMutation = useLikeCommentMutation(comment.id, postId);

  const handleLikeToggle = () => {
    likeMutation.mutate({ liked: !comment.likedByMe });
  };

  const handleOpenLikesModal = () => {
    setActiveModal({
      type: "liked-users",
      targetType: "comment",
      targetId: comment.id
    });
  };

  return (
    <div className="_comment_main d-flex flex-column mt-3">
      <div className="d-flex align-items-start">
        <div className="_comment_image me-2">
          <img 
            src={comment.author.avatarUrl || "/assets/images/txt_img.png"} 
            alt="Avatar" 
            className="_comment_img1 rounded-circle"
            style={{ width: "32px", height: "32px", objectFit: "cover" }}
          />
        </div>
        <div className="_comment_area flex-grow-1 bg-light dark:bg-zinc-800 p-2 rounded">
          <div className="_comment_details">
            <div className="_comment_details_top d-flex justify-content-between align-items-center mb-1">
              <div className="_comment_name">
                <h5 className="_comment_name_title mb-0 fs-7 fw-bold">
                  {comment.author.firstName} {comment.author.lastName}
                </h5>
              </div>
            </div>
            <div className="_comment_status mb-2">
              <p className="_comment_status_text mb-0 fs-7 text-wrap">
                {comment.text}
              </p>
            </div>
            
            <div className="d-flex align-items-center justify-content-between fs-8">
              <div className="d-flex gap-3 text-secondary fw-semibold">
                <button 
                  type="button"
                  className={`border-0 bg-transparent p-0 cursor-pointer text-secondary fw-semibold ${comment.likedByMe ? "text-primary" : ""}`}
                  onClick={handleLikeToggle}
                  style={{ fontSize: "inherit" }}
                >
                  Like
                </button>
                {!comment.parentId && (
                  <button 
                    type="button"
                    className="border-0 bg-transparent p-0 cursor-pointer text-secondary fw-semibold"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    style={{ fontSize: "inherit" }}
                  >
                    Reply
                  </button>
                )}
                <span className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              
              <button 
                type="button"
                className="_total_reactions d-flex align-items-center text-muted cursor-pointer fs-8 border-0 bg-transparent p-0"
                onClick={handleOpenLikesModal}
              >
                <span className="me-1">{comment.likeCount}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up text-primary"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reply input form */}
      {showReplyForm && (
        <div className="ms-5 mt-2">
          <CommentBox postId={postId} parentId={comment.id} />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ms-5">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}
