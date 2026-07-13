import Navbar from "../../components/layout/Navbar.tsx";
import SidebarLeft from "../../components/layout/SidebarLeft.tsx";
import SidebarRight from "../../components/layout/SidebarRight.tsx";
import ThemeSwitcher from "../../components/layout/ThemeSwitcher.tsx";
import StorySlider from "../../components/feed/StorySlider.tsx";
import PostComposer from "../../components/feed/PostComposer.tsx";
import PostCard from "../../components/feed/PostCard.tsx";
import LikedUsersModal from "../../components/feed/LikedUsersModal.tsx";
import { useFeedInfinite } from "./feedQuery.ts";

export default function FeedPage() {
  const { 
    data, 
    isLoading, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage, 
    isError 
  } = useFeedInfinite();

  const posts = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="_layout _layout_main_wrapper">
      {/* Floating Theme Switcher */}
      <ThemeSwitcher />

      <div className="_main_layout">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Feed Container */}
        <div className="container _custom_container mt-4">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Column Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <SidebarLeft />
              </div>

              {/* Middle Column Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    {/* Story Slider */}
                    <StorySlider />

                    {/* Post Composer */}
                    <PostComposer />

                    {/* Posts list */}
                    <div className="posts-list-container">
                      {isLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
                            <span className="visually-hidden">Loading posts...</span>
                          </div>
                        </div>
                      ) : isError ? (
                        <div className="alert alert-danger text-center my-3" role="alert">
                          Failed to load feed. Please try again.
                        </div>
                      ) : posts.length === 0 ? (
                        <div className="alert alert-info text-center my-3" role="alert">
                          No posts yet. Be the first to share something!
                        </div>
                      ) : (
                        posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))
                      )}

                      {/* Infinite Scroll Load More Button */}
                      {hasNextPage && (
                        <div className="text-center mt-3 mb-5">
                          <button 
                            onClick={() => fetchNextPage()} 
                            disabled={isFetchingNextPage}
                            className="btn btn-outline-primary px-4 py-2"
                          >
                            {isFetchingNextPage ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Loading...
                              </>
                            ) : "Load More Posts"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <SidebarRight />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <LikedUsersModal />
    </div>
  );
}
