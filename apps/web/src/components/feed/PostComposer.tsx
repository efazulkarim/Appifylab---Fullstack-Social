import React, { useRef, useState } from "react";
import { useUiStore } from "../../store/uiStore.ts";
import { useCreatePostMutation } from "../../features/feed/feedQuery.ts";
import { useAuthUser } from "../../features/auth/authQuery.ts";

export default function PostComposer() {
  const { data: userResponse } = useAuthUser();
  const currentUser = userResponse?.data;

  const createPostMutation = useCreatePostMutation();

  const { 
    composerDraft, 
    setComposerDraft, 
    optimisticUploadPreview, 
    setOptimisticUploadPreview 
  } = useUiStore();

  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComposerDraft(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setOptimisticUploadPreview(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (optimisticUploadPreview) {
      URL.revokeObjectURL(optimisticUploadPreview);
    }
    setOptimisticUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerDraft.trim() && !selectedFile) return;

    const formData = new FormData();
    formData.append("text", composerDraft);
    formData.append("visibility", visibility);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    createPostMutation.mutate(formData, {
      onSuccess: () => {
        setComposerDraft("");
        setSelectedFile(null);
        setOptimisticUploadPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box d-flex">
        <div className="_feed_inner_text_area_box_image me-3">
          <img 
            src={currentUser?.avatarUrl || "/assets/images/txt_img.png"} 
            alt="User avatar" 
            className="_txt_img rounded-circle" 
            style={{ width: "36px", height: "36px", objectFit: "cover" }}
          />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form w-100 position-relative">
          <textarea 
            className="form-control _textarea border-0 shadow-none ps-0 pt-3" 
            placeholder="Write something ..." 
            id="floatingTextarea"
            value={composerDraft}
            onChange={handleTextChange}
            disabled={createPostMutation.isPending}
            style={{ minHeight: "80px", resize: "none" }}
          ></textarea>
          {!composerDraft && (
            <label className="_feed_textarea_label ps-0 pt-3" htmlFor="floatingTextarea">
              Write something ...
            </label>
          )}
        </div>
      </div>

      {/* Optimistic Image Preview */}
      {optimisticUploadPreview && (
        <div className="position-relative mt-3 mb-2 rounded border overflow-hidden" style={{ maxHeight: "250px" }}>
          <img 
            src={optimisticUploadPreview} 
            alt="Upload preview" 
            className="w-100 object-fit-cover" 
            style={{ maxHeight: "250px" }}
          />
          <button 
            type="button" 
            className="btn btn-dark btn-sm position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center"
            onClick={handleRemoveImage}
            style={{ width: "30px", height: "30px", padding: 0 }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Composer Controls */}
      <div className="_feed_inner_text_area_bottom d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          {/* File Input and Photo Button */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="d-none" 
          />
          <div className="_feed_inner_text_area_bottom_photo _feed_common">
            <button 
              type="button" 
              className="_feed_inner_text_area_bottom_photo_link border-0 bg-transparent"
              onClick={() => fileInputRef.current?.click()}
              disabled={createPostMutation.isPending}
            > 
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img"> 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"/>
                </svg>
              </span>
              Photo
            </button>
          </div>

          {/* Visibility Selector */}
          <div className="d-flex align-items-center gap-1">
            <select 
              className="form-select form-select-sm border-0 bg-transparent text-secondary fw-semibold cursor-pointer"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              disabled={createPostMutation.isPending}
              style={{ width: "95px", outline: "none", fontSize: "14px" }}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
        </div>

        {/* Submit Post Button */}
        <div className="_feed_inner_text_area_btn">
          <button 
            type="button" 
            className="_feed_inner_text_area_btn_link border-0 d-flex align-items-center"
            onClick={handleSubmit}
            disabled={createPostMutation.isPending || (!composerDraft.trim() && !selectedFile)}
          >
            {createPostMutation.isPending ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
              </svg>
            )}
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}
