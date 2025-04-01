import { useState } from "react";
import { AJAX } from "../lib/hooks";

interface RegisterProps {
  login: string;
  password: string;
  firstName: string;
  lastName: string;
}

const Register = () => {
  const [registerData, setRegisterData] = useState<RegisterProps>({
    login: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await AJAX("register", true, registerData);
      console.log("Registration successful");
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-5 bg-gray-100 border rounded shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              value={registerData.firstName}
              onChange={(e) =>
                setRegisterData({ ...registerData, firstName: e.target.value })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={registerData.lastName}
              onChange={(e) =>
                setRegisterData({ ...registerData, lastName: e.target.value })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="login">Login:</label>
            <input
              type="text"
              id="login"
              value={registerData.login}
              onChange={(e) =>
                setRegisterData({ ...registerData, login: e.target.value })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
