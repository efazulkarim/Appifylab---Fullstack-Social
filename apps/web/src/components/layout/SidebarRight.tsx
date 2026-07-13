import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  useSidebarData, 
  useFollowUserMutation, 
  useIgnoreUserMutation 
} from "../../features/feed/feedQuery.ts";

export default function SidebarRight() {
  const { data: sidebarData, isLoading } = useSidebarData();
  const followMutation = useFollowUserMutation();
  const ignoreMutation = useIgnoreUserMutation();

  const [searchQuery, setSearchQuery] = useState("");

  const suggestions = sidebarData?.suggestions || [];
  const friends = sidebarData?.friends || [];

  const handleFollow = (userId: string) => {
    followMutation.mutate({ userId, follow: true });
  };

  const handleIgnore = (userId: string) => {
    ignoreMutation.mutate(userId);
  };

  const filteredFriends = friends.filter((friend) => {
    const fullName = `${friend.firstName} ${friend.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="_layout_right_sidebar_wrap">
      {/* You Might Like suggestions */}
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_right_inner_area_info_content _mar_b24 d-flex align-items-center justify-content-between">
            <h4 className="_right_inner_area_info_content_title _title5 mb-0">You Might Like</h4>
            <span className="_right_inner_area_info_content_txt">
              <Link className="_right_inner_area_info_content_txt_link text-decoration-none" to="/feed">See All</Link>
            </span>
          </div>
          <hr className="_underline" />

          {isLoading ? (
            <div className="p-3 text-center">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-muted text-center fs-7 py-2">No new suggestions</div>
          ) : (
            suggestions.slice(0, 2).map((suggested) => (
              <div key={suggested.id} className="_right_inner_area_info_ppl mb-3">
                <div className="_right_inner_area_info_box d-flex align-items-center mb-2">
                  <div className="_right_inner_area_info_box_image me-2">
                    <img 
                      src={suggested.avatarUrl || "/assets/images/Avatar.png"} 
                      alt="Avatar" 
                      className="_ppl_img rounded-circle" 
                      style={{ width: "38px", height: "38px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="_right_inner_area_info_box_txt">
                    <h4 className="_right_inner_area_info_box_title mb-0 fs-6 fw-semibold">
                      {suggested.firstName} {suggested.lastName}
                    </h4>
                    <p className="_right_inner_area_info_box_para text-muted mb-0 fs-7">{suggested.email}</p>
                  </div>
                </div>
                <div className="_right_info_btn_grp d-flex gap-2">
                  <button 
                    type="button" 
                    className="_right_info_btn_link btn btn-sm btn-outline-secondary w-50"
                    onClick={() => handleIgnore(suggested.id)}
                    disabled={ignoreMutation.isPending}
                  >
                    Ignore
                  </button>
                  <button 
                    type="button" 
                    className="_right_info_btn_link _right_info_btn_link_active btn btn-sm btn-primary w-50 text-white"
                    onClick={() => handleFollow(suggested.id)}
                    disabled={followMutation.isPending}
                  >
                    Follow
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Friends list */}
      <div className="_layout_right_sidebar_inner">
        <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_feed_top_fixed">
            <div className="_feed_right_inner_area_card_content _mar_b24 d-flex align-items-center justify-content-between">
              <h4 className="_feed_right_inner_area_card_content_title _title5 mb-0">Your Friends</h4>
              <span className="_feed_right_inner_area_card_content_txt">
                <Link className="_feed_right_inner_area_card_content_txt_link text-decoration-none" to="/feed">See All</Link>
              </span>
            </div>
            
            <form className="_feed_right_inner_area_card_form" onSubmit={(e) => e.preventDefault()}>
              <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="6" stroke="#666"></circle>
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"></path>
              </svg>
              <input 
                className="form-control me-2 _feed_right_inner_area_card_form_inpt" 
                type="search" 
                placeholder="input search text" 
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          <div className="_feed_bottom_fixed mt-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {isLoading ? (
              <div className="p-3 text-center">Loading friends...</div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-muted text-center fs-7 py-3">No friends found</div>
            ) : (
              filteredFriends.map((friend) => (
                <div key={friend.id} className="_feed_right_inner_area_card_ppl d-flex align-items-center justify-content-between mb-3 p-1">
                  <div className="_feed_right_inner_area_card_ppl_box d-flex align-items-center">
                    <div className="_feed_right_inner_area_card_ppl_image me-2">
                      <img 
                        src={friend.avatarUrl || "/assets/images/people2.png"} 
                        alt={friend.firstName} 
                        className="_box_ppl_img rounded-circle" 
                        style={{ width: "34px", height: "34px", objectFit: "cover" }}
                      />
                    </div>
                    <div className="_feed_right_inner_area_card_ppl_txt">
                      <h4 className="_feed_right_inner_area_card_ppl_title mb-0 fs-6 fw-semibold">
                        {friend.firstName} {friend.lastName}
                      </h4>
                      <p className="_feed_right_inner_area_card_ppl_para text-muted mb-0 fs-7">{friend.email}</p>
                    </div>
                  </div>
                  <div className="_feed_right_inner_area_card_ppl_side">
                    {/* Active green dot */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
                      <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
