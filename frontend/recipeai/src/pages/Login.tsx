import { useEffect, useState } from "react";
import { AJAX } from "../lib/hooks";
import { useNavigate } from "react-router";

interface LoginProps {
  login: string;
  password: string;
}

const Login = () => {
  const [loginData, setLoginData] = useState<LoginProps>({
    login: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      AJAX("login", true, {
        login: loginData.login,
        password: loginData.password,
      });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center align-center p-5 bg-gray-100 border rounded shadow-md">
        <div className="justify-center align-center">
          <form>
            <div>
              <label htmlFor="login">Login:</label>
              <input
                type="text"
                id="login"
                value={loginData.login}
                onChange={(e) =>
                  setLoginData({ ...loginData, login: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />
            </div>
            <div className="flex h-full align-center justify-center border-2 border-gray-300 rounded">
              <button type="submit" onClick={handleSubmit}>
                Login
              </button>
            </div>
            <button>
              <a href="/register">Register</a>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
