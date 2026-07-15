import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
  isAuth?: boolean;
}

export default function Input({
  label,
  error,
  wrapperClassName = "",
  isAuth = true,
  className = "",
  id,
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  
  // Use Buddy Script form styling classes
  const formInputClass = isAuth ? "_social_login_form_input _mar_b14" : "form-group mb-3";
  const labelClass = isAuth ? "_social_login_label _mar_b8" : "form-label";
  const inputClass = isAuth ? "form-control _social_login_input" : "form-control";

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`${formInputClass} ${wrapperClassName}`}>
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={inputId}
          type={inputType}
          className={`${inputClass} ${error ? "is-invalid" : ""} ${className}`}
          style={{ paddingRight: isPassword ? "40px" : undefined }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="_password_toggle_btn"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

