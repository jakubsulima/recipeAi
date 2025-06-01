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
      <div>
        <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>
        <div className="text-center">
          <p className="text-lg">Email: {user.email}</p>
          <p className="text-lg">User ID: {user.id}</p>
        </div>
      </div>
    );
  }
};

export default MePage;
