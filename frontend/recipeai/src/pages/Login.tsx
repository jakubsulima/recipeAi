import { useState } from "react";
import { AJAX } from "../lib/hooks";
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
  const { setUser } = useUser();
  const navigate = useNavigate();

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
      const userData = await AJAX("login", true, data);
      localStorage.setItem("isLoggedIn", "true");
      setUser(userData);
      console.log("login successful");
      navigate("/");
    } catch (error: any) {
      setError(error.message || "login failed");
      console.error("login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-5 bg-gray-100 border rounded shadow-md">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email">email:</label>
            <input
              id="email"
              {...register("email")}
              className="border rounded p-2 w-full"
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
              className="border rounded p-2 w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${
              isSubmitting ? "bg-blue-300" : "bg-blue-500"
            } text-white px-4 py-2 rounded`}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-2">
            <a href="/register" className="text-blue-500 hover:underline">
              Don't have an account? Register
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
