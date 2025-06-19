import { useUser } from "../context/context";
import { useNavigate } from "react-router";

const MePage = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

  if (!userLoading && !user) {
    navigate("/login");
    return null;
  }
  if (userLoading) {
    return <div>Loading user data...</div>;
  }
  if (user && !userLoading) {
    return (
      <div className="p-4 w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>
        <div className="text-center mx-auto max-w-md p-4 border rounded-lg shadow-lg">
          <p className="text-lg">Email: {user.email}</p>
        </div>
      </div>
    );
  }
};

export default MePage;
