import { useSidebarData } from "../../features/feed/feedQuery.ts";
import { useAuthUser } from "../../features/auth/authQuery.ts";

export default function StorySlider() {
  const { data: userResponse } = useAuthUser();
  const { data: sidebarData } = useSidebarData();

  const currentUser = userResponse?.data;
  const stories = sidebarData?.stories || [];

  return (
    <div className="_feed_inner_ppl_card _mar_b16">
      <div className="_feed_inner_story_arrow">
        <button type="button" className="_feed_inner_story_arrow_btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
            <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
          </svg>
        </button>
      </div>
      <div className="row flex-nowrap overflow-auto g-2 scrollbar-none pb-1">
        {/* Your Story Card */}
        <div className="col-4 col-md-3 flex-shrink-0" style={{ maxWidth: "120px" }}>
          <div className="_feed_inner_profile_story _b_radious6 w-100 position-relative" style={{ height: "150px" }}>
            <div className="_feed_inner_profile_story_image h-100">
              <img 
                src={currentUser?.avatarUrl || "/assets/images/card_ppl1.png"} 
                alt="Your story" 
                className="_profile_story_img w-100 h-100 object-fit-cover rounded" 
              />
              <div className="_feed_inner_story_txt">
                <div className="_feed_inner_story_btn">
                  <button className="_feed_inner_story_btn_link p-0 d-flex align-items-center justify-content-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                      <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                    </svg>
                  </button>
                </div>
                <p className="_feed_inner_story_para mb-0 fs-8 text-center text-white">Your Story</p>
              </div>
            </div>
          </div>
        </div>

        {/* Public Stories */}
        {stories.map((story) => (
          <div key={story.id} className="col-4 col-md-3 flex-shrink-0" style={{ maxWidth: "120px" }}>
            <div className="_feed_inner_public_story _b_radious6 w-100 position-relative" style={{ height: "150px" }}>
              <div className="_feed_inner_public_story_image h-100">
                <img 
                  src="/assets/images/recommend_mini.png" // placeholder for story image content
                  alt="Story" 
                  className="_public_story_img w-100 h-100 object-fit-cover rounded" 
                />
                <div className="_feed_inner_pulic_story_txt">
                  <p className="_feed_inner_pulic_story_para mb-0 fs-8 text-white text-truncate" style={{ maxWidth: "90px" }}>
                    {story.author.firstName}
                  </p>
                </div>
                <div className="_feed_inner_public_mini">
                  <img 
                    src={story.author.avatarUrl || "/assets/images/mini_pic.png"} 
                    alt="Author avatar" 
                    className="_public_mini_img rounded-circle object-fit-cover" 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
