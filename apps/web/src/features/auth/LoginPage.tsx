import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema } from "@appifylab/shared";
import AuthLayout from "../../components/auth/AuthLayout.tsx";
import Input from "../../components/ui/Input.tsx";
import Button from "../../components/ui/Button.tsx";
import { useLoginMutation } from "./authQuery.ts";

const handleGoogleLogin = () => {
  window.location.href = "/api/auth/google";
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: any = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setValidationErrors(fieldErrors);
      return;
    }

    loginMutation.mutate(parsed.data, {
      onSuccess: () => {
        navigate("/feed");
      },
      onError: (err: any) => {
        setApiError(err.message || "Invalid credentials. Please try again.");
      },
    });
  };

  return (
    <AuthLayout illustrationType="login">
      <p className="_social_login_content_para _mar_b8">Welcome back</p>
      <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>
      
      <Button 
        type="button" 
        variant="google"
        onClick={handleGoogleLogin}
      >
        <img src="/assets/images/google.svg" alt="Google" className="_google_img" /> 
        <span>Or sign-in with google</span>
      </Button>
      
      <div className="_social_login_content_bottom_txt _mar_b40">
        <span>Or</span>
      </div>
      
      {apiError && (
        <div className="alert alert-danger _mar_b20" role="alert">
          {apiError}
        </div>
      )}
      
      <form className="_social_login_form" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationErrors.email}
              disabled={loginMutation.isPending}
            />
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={validationErrors.password}
              disabled={loginMutation.isPending}
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
            <div className="form-check _social_login_form_check">
              <input 
                className="form-check-input _social_login_form_check_input" 
                type="checkbox" 
                id="rememberMeCheckbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loginMutation.isPending}
              />
              <label className="form-check-label _social_login_form_check_label" htmlFor="rememberMeCheckbox">
                Remember me
              </label>
            </div>
          </div>
          <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
            <div className="_social_login_form_left">
              <p className="_social_login_form_left_para">Forgot password?</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
            <div className="_social_login_form_btn _mar_t40 _mar_b60">
              <Button 
                type="submit" 
                fullWidth
                loading={loginMutation.isPending}
              >
                Login now
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_login_bottom_txt">
            <p className="_social_login_bottom_txt_para">
              Dont have an account? <Link to="/register">Create New Account</Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
