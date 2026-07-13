import React from "react";

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
  ...props
}: InputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  
  // Use Buddy Script form styling classes
  const formInputClass = isAuth ? "_social_login_form_input _mar_b14" : "form-group mb-3";
  const labelClass = isAuth ? "_social_login_label _mar_b8" : "form-label";
  const inputClass = isAuth ? "form-control _social_login_input" : "form-control";

  return (
    <div className={`${formInputClass} ${wrapperClassName}`}>
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <input
        id={inputId}
        className={`${inputClass} ${error ? "is-invalid" : ""} ${className}`}
        {...props}
      />
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
