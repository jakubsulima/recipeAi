import { useState } from "react";
import { apiClient } from "../lib/hooks";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/context";

const schema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[^\w]/, "Password must contain at least one special character")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

interface RegisterProps {
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterProps>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterProps) => {
    setIsSubmitting(true);
    setError("");
    try {
      const userData = await apiClient("register", true, data);
      localStorage.setItem("isLoggedIn", "true");
      setUser(userData);
      navigate("/");
    } catch (error: any) {
      setError(error.message || "Registration failed");
      console.error("Register error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center p-5 bg-secondary rounded-3xl shadow-md w-full max-w-md">
        {error && <div className="text-accent mb-4 text-center">{error}</div>}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          <div>
            <label htmlFor="email" className="w-full text-text block mb-1">
              Email
            </label>
            <input
              id="email"
              {...register("email")}
              className="rounded-2xl p-2 w-full shadow-md bg-background text-text border border-primary/20 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.email && (
              <p className="text-accent text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="text-text block mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className="rounded-2xl p-2 w-full shadow-md bg-background text-text border border-primary/20 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.password && (
              <p className="text-accent text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-text block mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword")}
              className="rounded-2xl p-2 w-full shadow-md bg-background text-text border border-primary/20 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {errors.confirmPassword && (
              <p className="text-accent text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${
              isSubmitting ? "bg-accent/50" : "bg-accent"
            } text-background px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors`}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
          <div className="text-center mt-2 flex-col gap-2 justify-center">
            <p className="text-text pb-2">Already have an account?</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-background hover:cursor-pointer bg-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
