import { useEffect, useRef } from "react";
import { useUiStore } from "../../store/uiStore.ts";
import { usePostLikes, useCommentLikes } from "../../features/feed/feedQuery.ts";

export default function LikedUsersModal() {
  const { activeModal, setActiveModal } = useUiStore();

  const isLikedUsersModal = activeModal?.type === "liked-users";
  const targetType = activeModal?.type === "liked-users" ? activeModal.targetType : null;
  const targetId = activeModal?.type === "liked-users" ? activeModal.targetId : null;

  const isPost = targetType === "post";
  const isCommentOrReply = targetType === "comment" || targetType === "reply";

  const { data: postLikes, isLoading: loadingPostLikes } = usePostLikes(
    targetId || "",
    isLikedUsersModal && isPost
  );

  const { data: commentLikes, isLoading: loadingCommentLikes } = useCommentLikes(
    targetId || "",
    isLikedUsersModal && isCommentOrReply
  );

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isLikedUsersModal) {
      dialogRef.current?.showModal();
    }
  }, [isLikedUsersModal]);

  if (!isLikedUsersModal) return null;

  const likes = isPost ? postLikes : commentLikes;
  const isLoading = isPost ? loadingPostLikes : loadingCommentLikes;

  return (
    <dialog 
      ref={dialogRef}
      onClose={() => setActiveModal(null)}
      className="modal fade show d-block" 
      style={{ 
        backgroundColor: "rgba(0, 0, 0, 0.5)", 
        zIndex: 1050,
        border: "none",
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        margin: 0,
        padding: 0
      }}
      aria-labelledby="liked-users-title"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content dark:bg-zinc-900 dark:text-white border-0 shadow">
          <div className="modal-header d-flex justify-content-between align-items-center border-bottom-0 pb-0">
            <h5 id="liked-users-title" className="modal-title fw-bold">Liked By</h5>
            <button 
              type="button" 
              className="btn-close dark:btn-close-white" 
              aria-label="Close"
              onClick={() => setActiveModal(null)}
            ></button>
          </div>
          <div className="modal-body" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {isLoading ? (
              <div className="d-flex justify-content-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : !likes || likes.length === 0 ? (
              <div className="text-center text-muted py-4">No likes yet.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {likes.map((user) => (
                  <div key={user.id} className="d-flex align-items-center justify-content-between p-1">
                    <div className="d-flex align-items-center">
                      <img 
                        src={user.avatarUrl || "/assets/images/people1.png"} 
                        alt={user.firstName}
                        className="rounded-circle me-3"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="mb-0 fw-semibold">{user.firstName} {user.lastName}</h6>
                        <span className="text-muted fs-7">{user.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

