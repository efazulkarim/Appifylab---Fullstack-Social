

interface PostComposerImagePreviewProps {
  previewUrl: string;
  onRemove: () => void;
}

export default function PostComposerImagePreview({ previewUrl, onRemove }: PostComposerImagePreviewProps) {
  return (
    <div className="position-relative mt-3 mb-2 rounded border overflow-hidden" style={{ maxHeight: "250px" }}>
      <img 
        src={previewUrl} 
        alt="Upload preview" 
        className="w-100 object-fit-cover" 
        style={{ maxHeight: "250px" }}
      />
      <button 
        type="button" 
        className="btn btn-dark btn-sm position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center"
        onClick={onRemove}
        style={{ width: "30px", height: "30px", padding: 0 }}
      >
        &times;
      </button>
    </div>
  );
}
