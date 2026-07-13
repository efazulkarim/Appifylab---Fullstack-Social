import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "@appifylab/shared";
import AuthLayout from "../../components/auth/AuthLayout.tsx";
import Input from "../../components/ui/Input.tsx";
import Button from "../../components/ui/Button.tsx";
import { useRegisterMutation } from "./authQuery.ts";

const handleGoogleRegister = () => {
  window.location.href = "/api/auth/google";
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    repeatPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const registerMutation = useRegisterMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError(null);

    // Validation check on repeatPassword
    if (password !== repeatPassword) {
      setValidationErrors({
        repeatPassword: "Passwords do not match.",
      });
      return;
    }

    if (!agreeTerms) {
      setApiError("You must agree to the terms and conditions.");
      return;
    }

    const payload = { firstName, lastName, email, password };
    const parsed = registerSchema.safeParse(payload);
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

    registerMutation.mutate(parsed.data, {
      onSuccess: () => {
        navigate("/feed");
      },
      onError: (err: any) => {
        setApiError(err.message || "Failed to register. Email may already be in use.");
      },
    });
  };

  return (
    <AuthLayout illustrationType="register">
      <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
      <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
      
      <Button 
        type="button" 
        variant="google"
        onClick={handleGoogleRegister}
      >
        <img src="/assets/images/google.svg" alt="Google" className="_google_img" /> 
        <span>Register with google</span>
      </Button>
      
      <div className="_social_registration_content_bottom_txt _mar_b40">
        <span>Or</span>
      </div>

      {apiError && (
        <div className="alert alert-danger _mar_b20" role="alert">
          {apiError}
        </div>
      )}
      
      <form className="_social_registration_form" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
            <Input
              label="First Name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={validationErrors.firstName}
              disabled={registerMutation.isPending}
            />
          </div>
          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
            <Input
              label="Last Name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={validationErrors.lastName}
              disabled={registerMutation.isPending}
            />
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationErrors.email}
              disabled={registerMutation.isPending}
            />
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={validationErrors.password}
              disabled={registerMutation.isPending}
            />
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <Input
              label="Repeat Password"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              error={validationErrors.repeatPassword}
              disabled={registerMutation.isPending}
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
            <div className="form-check _social_registration_form_check">
              <input 
                className="form-check-input _social_registration_form_check_input" 
                type="checkbox" 
                id="agreeTermsCheckbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={registerMutation.isPending}
              />
              <label className="form-check-label _social_registration_form_check_label" htmlFor="agreeTermsCheckbox">
                I agree to terms & conditions
              </label>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
            <div className="_social_registration_form_btn _mar_t40 _mar_b60">
              <Button 
                type="submit" 
                fullWidth
                loading={registerMutation.isPending}
              >
                Register now
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_bottom_txt">
            <p className="_social_registration_bottom_txt_para">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
