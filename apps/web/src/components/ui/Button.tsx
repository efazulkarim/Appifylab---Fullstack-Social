import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "google";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  let baseClass = "";
  
  if (variant === "primary") {
    // Matches the ._btn1 and login button styles
    baseClass = "_social_login_form_btn_link _btn1";
  } else if (variant === "google") {
    // Matches the google login/register button styles
    baseClass = "_social_login_content_btn _mar_b40";
  } else {
    baseClass = "btn btn-secondary";
  }

  const widthClass = fullWidth ? "w-100" : "";
  const flexClass = "d-flex align-items-center justify-content-center";

  return (
    <button
      className={`${baseClass} ${widthClass} ${flexClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
      )}
      {children}
    </button>
  );
}
