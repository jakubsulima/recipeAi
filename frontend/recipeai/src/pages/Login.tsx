import { useState, useEffect, useRef, useCallback } from "react";
import { apiClient } from "../lib/hooks";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useUser } from "../context/context";
import { useNavigate } from "react-router";

interface LoginProps {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading, setUser } = useUser();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Redirect already-logged-in users
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleAuthSuccess = useCallback(
    (userData: { email: string; id: number; role: string }) => {
      localStorage.setItem("isLoggedIn", "true");
      setUser(userData as any);
      navigate("/");
    },
    [setUser, navigate]
  );

  // Google OAuth callback
  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setIsSubmitting(true);
      setError("");
      try {
        const userData = await apiClient("oauth/google", true, {
          idToken: response.credential,
        });
        handleAuthSuccess(userData);
      } catch (err: any) {
        setError(err.message || "Google sign-in failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleAuthSuccess]
  );

  // Initialize Google Sign-In button
  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
          callback: handleGoogleCallback,
        });
        const mobile = window.innerWidth < 768;
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size:  "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: mobile ? 300 : 380,
        });
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      const timeout = setTimeout(() => clearInterval(interval), 5000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [handleGoogleCallback]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginProps>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginProps) => {
    setIsSubmitting(true);
    setError("");
    try {
      const userData = await apiClient("login", true, data);
      handleAuthSuccess(userData);
    } catch (error: any) {
      setError(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text">Welcome back</h1>
          <p className="text-text/50 mt-2">
            Sign in to your Recipe.ai account
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-secondary rounded-2xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm text-center">
              {error}
            </div>
          )}

          {/* Google Sign-In (rendered by Google SDK) */}
          <div
            ref={googleBtnRef}
            className="w-full flex justify-center [&_iframe]:!rounded-lg mb-6"
          />

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-primary/10" />
            <span className="text-text/40 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-primary/10" />
          </div>

          {/* Email/Password Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <label
                htmlFor="email"
                className="text-text text-sm font-medium block mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="rounded-lg p-2.5 w-full bg-background text-text border border-primary/15 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-text text-sm font-medium block mb-1.5"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register("password")}
                className="rounded-lg p-2.5 w-full bg-background text-text border border-primary/15 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent text-primary font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-text/50 text-sm mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-accent font-semibold hover:underline cursor-pointer"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
