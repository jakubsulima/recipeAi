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
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-5 bg-secondary rounded shadow-md w-full">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="w-full">
              Email:
            </label>
            <input
              id="email"
              {...register("email")}
              className="rounded-xl p-2 w-full shadow-md bg-white"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className="rounded-xl p-2 w-full shadow-md bg-white"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword")}
              className="rounded-xl p-2 w-full shadow-md bg-white"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${
              isSubmitting ? "bg-blue-300" : "bg-primary"
            } text-black px-4 py-2 rounded-sm`}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
