import React, { useState } from "react";
import type { PostDto, CommentDto } from "@appifylab/shared";
import { useUiStore } from "../../store/uiStore.ts";
import { 
  useLikePostMutation, 
  useLikeCommentMutation, 
  useCreateCommentMutation, 
  useCreateReplyMutation 
} from "../../features/feed/feedQuery.ts";

interface PostCardProps {
  post: PostDto;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { setActiveModal } = useUiStore();
  const likeMutation = useLikePostMutation(post.id);

  const handleLikeToggle = () => {
    likeMutation.mutate({ liked: !post.likedByMe });
  };

  const handleOpenLikesModal = () => {
    setActiveModal({
      type: "liked-users",
      targetType: "post",
      targetId: post.id
    });
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      {/* Post Header */}
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box d-flex align-items-center">
            <div className="_feed_inner_timeline_post_box_image me-2">
              <img 
                src={post.author.avatarUrl || "/assets/images/post_img.png"} 
                alt="Avatar" 
                className="_post_img rounded-circle"
                style={{ width: "42px", height: "42px", objectFit: "cover" }}
              />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title mb-0 fs-6 fw-bold">
                {post.author.firstName} {post.author.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para text-muted mb-0 fs-7">
                {new Date(post.createdAt).toLocaleDateString()} . <span className="badge bg-secondary-subtle text-secondary">{post.visibility}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Post Text */}
        <h4 className="_feed_inner_timeline_post_title mt-3 fs-6 fw-normal text-wrap">
          {post.text}
        </h4>
        
        {/* Post Image */}
        {post.imageUrl && (
          <div className="_feed_inner_timeline_image mt-3 overflow-hidden rounded border">
            <img src={post.imageUrl} alt="Post content" className="_time_img w-100 object-fit-cover" style={{ maxHeight: "400px" }} />
          </div>
        )}
      </div>

      {/* Post Reacts Info */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26 mt-3 d-flex justify-content-between align-items-center">
        <div 
          className="_feed_inner_timeline_total_reacts_image d-flex align-items-center cursor-pointer"
          onClick={handleOpenLikesModal}
        >
          <img src="/assets/images/react_img1.png" alt="Like" className="_react_img1" />
          <img src="/assets/images/react_img2.png" alt="Haha" className="_react_img" />
          <p className="_feed_inner_timeline_total_reacts_para mb-0 ms-1 fw-semibold fs-7">
            {post.likeCount} Likes
          </p>
        </div>
        <div 
          className="_feed_inner_timeline_total_reacts_txt d-flex gap-2 cursor-pointer"
          onClick={() => setShowComments(!showComments)}
        >
          <p className="_feed_inner_timeline_total_reacts_para1 mb-0 fs-7">
            <span>{post.commentCount}</span> Comments
          </p>
        </div>
      </div>

      {/* Post Action Buttons */}
      <div className="_feed_inner_timeline_reaction border-top border-bottom py-1 d-flex">
        <button 
          onClick={handleLikeToggle}
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction border-0 bg-transparent flex-fill py-2 ${post.likedByMe ? "_feed_reaction_active fw-bold" : ""}`}
        >
          <span className="_feed_inner_timeline_reaction_link d-flex align-items-center justify-content-center gap-1 fs-7">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
              <path fill={post.likedByMe ? "#FFCC4D" : "#CCC"} d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z"/>
              <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"/>
              <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"/>
              <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"/>
            </svg>
            Haha
          </span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="_feed_inner_timeline_reaction_comment _feed_reaction border-0 bg-transparent flex-fill py-2"
        >
          <span className="_feed_inner_timeline_reaction_link d-flex align-items-center justify-content-center gap-1 fs-7">
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
              <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"/>
              <path stroke="#000" stroke-linecap="round" stroke-linejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563"/>
            </svg>
            Comment
          </span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="_feed_inner_timeline_cooment_area px-3 mt-3">
          <CommentBox postId={post.id} />
          <div className="_timline_comment_main mt-2">
            {post.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Comment Box Component */
function CommentBox({ postId, parentId }: { postId: string; parentId?: string }) {
  const [text, setText] = useState("");
  const createCommentMutation = useCreateCommentMutation(postId);
  const createReplyMutation = useCreateReplyMutation(parentId || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (parentId) {
      createReplyMutation.mutate({ text }, {
        onSuccess: () => setText(""),
      });
    } else {
      createCommentMutation.mutate({ text }, {
        onSuccess: () => setText(""),
      });
    }
  };

  return (
    <div className="_feed_inner_comment_box w-100 mb-2">
      <form className="_feed_inner_comment_box_form d-flex align-items-center w-100 gap-2" onSubmit={handleSubmit}>
        <div className="_feed_inner_comment_box_content d-flex align-items-center flex-grow-1">
          <div className="_feed_inner_comment_box_content_image me-2 flex-shrink-0">
            <img 
              src="/assets/images/comment_img.png" 
              alt="Avatar" 
              className="_comment_img rounded-circle"
              style={{ width: "30px", height: "30px", objectFit: "cover" }}
            />
          </div>
          <div className="_feed_inner_comment_box_content_txt w-100">
            <textarea 
              className="form-control _comment_textarea py-1" 
              placeholder={parentId ? "Write a reply..." : "Write a comment..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ height: "36px", resize: "none" }}
            ></textarea>
          </div>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary btn-sm px-3"
          disabled={!text.trim() || createCommentMutation.isPending || createReplyMutation.isPending}
        >
          Send
        </button>
      </form>
    </div>
  );
}

/* Comment Item Component */
function CommentItem({ comment }: { comment: CommentDto }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { setActiveModal } = useUiStore();
  const likeMutation = useLikeCommentMutation(comment.id);

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
                <span className={`cursor-pointer ${comment.likedByMe ? "text-primary" : ""}`} onClick={handleLikeToggle}>
                  Like
                </span>
                {!comment.parentId && (
                  <span className="cursor-pointer" onClick={() => setShowReplyForm(!showReplyForm)}>
                    Reply
                  </span>
                )}
                <span className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div 
                className="_total_reactions d-flex align-items-center text-muted cursor-pointer fs-8"
                onClick={handleOpenLikesModal}
              >
                <span className="me-1">{comment.likeCount}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up text-primary"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply input form */}
      {showReplyForm && (
        <div className="ms-5 mt-2">
          <CommentBox postId="" parentId={comment.id} />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ms-5">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
