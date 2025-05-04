import { useState } from "react";
import { AJAX } from "../lib/hooks";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

interface LoginProps {
  login: string;
  password: string;
}

const schema = yup.object({
  login: yup.string().required("Login is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginProps>({
    resolver: yupResolver(schema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginProps) => {
    setIsSubmitting(true);
    setError("");
    try {
      await AJAX("login", true, data);
      console.log("Login successful");
    } catch (error: any) {
      if (error.message.includes("404")) {
        console.error("Unknown user. Please check your login credentials.");
        setError("Invalid credentials");
      }
      console.error("Login error:", error);
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
            <label htmlFor="login">Login:</label>
            <input
              id="login"
              {...register("login")}
              className="border rounded p-2 w-full"
            />
            {errors.login && (
              <p className="text-red-500 text-sm mt-1">
                {errors.login.message}
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
