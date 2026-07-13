import { Link } from "react-router-dom";
import { useSidebarData, useFollowUserMutation } from "../../features/feed/feedQuery.ts";

export default function SidebarLeft() {
  const { data: sidebarData, isLoading } = useSidebarData();
  const followMutation = useFollowUserMutation();

  const suggestions = sidebarData?.suggestions || [];
  const events = sidebarData?.events || [];

  const handleConnect = (userId: string) => {
    followMutation.mutate({ userId, follow: true });
  };

  const getEventDateInfo = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    return { day, month };
  };

  return (
    <div className="_layout_left_sidebar_wrap">
      {/* Explore section */}
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
          <ul className="_left_inner_area_explore_list list-unstyled ps-0">
            <li className="_left_inner_area_explore_item _explore_item mb-3">
              <Link to="/feed" className="_left_inner_area_explore_link d-flex align-items-center text-decoration-none">
                <svg className="me-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path fill="#666" d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21zm-1.233 4.65l.104.01c.188.028.443.113.668.203 1.026.398 3.033 1.746 3.8 2.563l.223.239.08.092a1.16 1.16 0 01.025 1.405c-.04.053-.086.105-.19.215l-.269.28c-.812.794-2.57 1.971-3.569 2.391-.277.117-.675.25-.865.253a1.167 1.167 0 01-1.07-.629c-.053-.104-.12-.353-.171-.586l-.051-.262c-.093-.57-.143-1.437-.142-2.347l.001-.288c.01-.858.063-1.64.157-2.147.037-.207.12-.563.167-.678.104-.25.291-.45.523-.575a1.15 1.15 0 01.58-.14zm.14 1.467l-.027.126-.034.198c-.07.483-.112 1.233-.111 2.036l.001.279c.009.737.053 1.414.123 1.841l.048.235.192-.07c.883-.372 2.636-1.56 3.23-2.2l.08-.087-.212-.218c-.711-.682-2.38-1.79-3.167-2.095l-.124-.045z" />
                </svg>
                Learning
              </Link> 
              <span className="_left_inner_area_explore_link_txt">New</span>
            </li>
            <li className="_left_inner_area_explore_item mb-3">
              <Link to="/feed" className="_left_inner_area_explore_link d-flex align-items-center text-decoration-none">
                <svg className="me-2" xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path fill="#666" d="M14.96 2c3.101 0 5.159 2.417 5.159 5.893v8.214c0 3.476-2.058 5.893-5.16 5.893H6.989c-3.101 0-5.159-2.417-5.159-5.893V7.893C1.83 4.42 3.892 2 6.988 2h7.972zm0 1.395H6.988c-2.37 0-3.883 1.774-3.883 4.498v8.214c0 2.727 1.507 4.498 3.883 4.498h7.972c2.375 0 3.883-1.77 3.883-4.498V7.893c0-2.727-1.508-4.498-3.883-4.498zM7.036 9.63c.323 0 .59.263.633.604l.005.094v6.382c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-6.382c0-.385.286-.697.638-.697zm3.97-3.053c.323 0 .59.262.632.603l.006.095v9.435c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094V7.274c0-.386.286-.698.638-.698zm3.905 6.426c.323 0 .59.262.632.603l.006.094v3.01c0 .385-.285.697-.638.697-.323 0-.59-.262-.632-.603l-.006-.094v-3.01c0-.385.286-.697.638-.697z" />
                </svg>
                Insights
              </Link>
            </li>
            <li className="_left_inner_area_explore_item mb-3">
              <Link to="/feed" className="_left_inner_area_explore_link d-flex align-items-center text-decoration-none">
                <svg className="me-2" xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path fill="#666" d="M9.032 14.456l.297.002c4.404.041 6.907 1.03 6.907 3.678 0 2.586-2.383 3.573-6.615 3.654l-.589.005c-4.588 0-7.203-.972-7.203-3.68 0-2.704 2.604-3.659 7.203-3.659zm0 1.5l-.308.002c-3.645.038-5.523.764-5.523 2.157 0 1.44 1.99 2.18 5.831 2.18 3.847 0 5.832-.728 5.832-2.159 0-1.44-1.99-2.18-5.832-2.18zm8.53-8.037c.347 0 .634.282.679.648l.006.102v1.255h1.185c.38 0 .686.336.686.75 0 .38-.258.694-.593.743l-.093.007h-1.185v1.255c0 .414-.307.75-.686.75-.347 0-.634-.282-.68-.648l-.005-.102-.001-1.255h-1.183c-.379 0-.686-.336-.686-.75 0-.38.258-.694.593-.743l.093-.007h1.183V8.669c0-.414.308-.75.686-.75zM9.031 2c2.698 0 4.864 2.369 4.864 5.319 0 2.95-2.166 5.318-4.864 5.318-2.697 0-4.863-2.369-4.863-5.318C4.17 4.368 6.335 2 9.032 2zm0 1.5c-1.94 0-3.491 1.697-3.491 3.819 0 2.12 1.552 3.818 3.491 3.818 1.94 0 3.492-1.697 3.492-3.818 0-2.122-1.551-3.818-3.492-3.818z" />
                </svg>
                Find friends
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Suggested People */}
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_suggest_content _mar_b24 d-flex align-items-center justify-content-between">
            <h4 className="_left_inner_area_suggest_content_title _title5 mb-0">Suggested People</h4>
            <span className="_left_inner_area_suggest_content_txt">
              <Link className="_left_inner_area_suggest_content_txt_link text-decoration-none" to="/feed">See All</Link>
            </span>
          </div>

          {isLoading ? (
            <div className="p-3 text-center">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="pb-3 text-muted text-center fs-7">No suggestions available</div>
          ) : (
            suggestions.slice(0, 3).map((suggested) => (
              <div key={suggested.id} className="_left_inner_area_suggest_info d-flex align-items-center justify-content-between mb-3">
                <div className="_left_inner_area_suggest_info_box d-flex align-items-center">
                  <div className="_left_inner_area_suggest_info_image me-2">
                    <img 
                      src={suggested.avatarUrl || "/assets/images/people1.png"} 
                      alt={suggested.firstName} 
                      className="_info_img rounded-circle" 
                      style={{ width: "38px", height: "38px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="_left_inner_area_suggest_info_txt">
                    <h4 className="_left_inner_area_suggest_info_title mb-0 fs-6 fw-semibold">
                      {suggested.firstName} {suggested.lastName}
                    </h4>
                    <p className="_left_inner_area_suggest_info_para text-muted mb-0 fs-7">{suggested.email}</p>
                  </div>
                </div>
                <div className="_left_inner_area_suggest_info_link"> 
                  <button 
                    type="button" 
                    className="_info_link border-0 bg-transparent text-primary p-0 fw-semibold fs-7"
                    onClick={() => handleConnect(suggested.id)}
                    disabled={followMutation.isPending}
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Events section */}
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_event_content d-flex align-items-center justify-content-between mb-3">
            <h4 className="_left_inner_event_title _title5 mb-0">Events</h4>
            <Link to="/feed" className="_left_inner_event_link text-decoration-none">See all</Link>
          </div>

          {isLoading ? (
            <div className="p-3 text-center">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="pb-3 text-muted text-center fs-7">No upcoming events</div>
          ) : (
            events.map((event) => {
              const { day, month } = getEventDateInfo(event.startsAt);
              return (
                <div key={event.id} className="_left_inner_event_card mb-3 p-2 bg-light dark:bg-zinc-900 rounded">
                  <div className="_left_inner_event_card_content d-flex align-items-center">
                    <div className="_left_inner_card_date me-3 d-flex flex-column align-items-center justify-content-center p-2 bg-white rounded shadow-sm text-center" style={{ minWidth: "50px" }}>
                      <p className="_left_inner_card_date_para mb-0 fw-bold text-primary">{day}</p>
                      <p className="_left_inner_card_date_para1 mb-0 fs-7 text-uppercase text-muted">{month}</p>
                    </div>
                    <div className="_left_inner_card_txt">
                      <h4 className="_left_inner_event_card_title mb-1 fs-6 fw-semibold">{event.title}</h4>
                      {event.description && <p className="text-muted fs-7 mb-0">{event.description}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
