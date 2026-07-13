import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  illustrationType: "login" | "register";
}

export default function AuthLayout({ children, illustrationType }: AuthLayoutProps) {
  const isLogin = illustrationType === "login";
  
  const wrapperClass = isLogin 
    ? "_social_login_wrapper _layout_main_wrapper" 
    : "_social_registration_wrapper _layout_main_wrapper";

  return (
    <section className={wrapperClass}>
      {/* Decorative background shapes */}
      <div className="_shape_one">
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        <img src="/assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>

      <div className={isLogin ? "_social_login_wrap" : "_social_registration_wrap"}>
        <div className="container">
          <div className="row align-items-center">
            {/* Left side illustration */}
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              {isLogin ? (
                <div className="_social_login_left">
                  <div className="_social_login_left_image">
                    <img src="/assets/images/login.png" alt="Buddy Script Login" className="_left_img" />
                  </div>
                </div>
              ) : (
                <div className="_social_registration_right">
                  <div className="_social_registration_right_image">
                    <img src="/assets/images/registration.png" alt="Buddy Script Register" />
                  </div>
                  <div className="_social_registration_right_image_dark">
                    <img src="/assets/images/registration1.png" alt="Buddy Script Register Dark" />
                  </div>
                </div>
              )}
            </div>

            {/* Right side form content */}
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className={isLogin ? "_social_login_content" : "_social_registration_content"}>
                <div className={`${isLogin ? "_social_login_left_logo" : "_social_registration_right_logo"} _mar_b28`}>
                  <img src="/assets/images/logo.svg" alt="Logo" className={isLogin ? "_left_logo" : "_right_logo"} />
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
