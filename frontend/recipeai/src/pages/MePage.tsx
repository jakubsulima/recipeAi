import { use, useEffect, useState } from "react";
import { useUser } from "../context/context";
import { useNavigate } from "react-router";

const MePage = () => {
  const navigate = useNavigate();
  const {
    user,
    loading: userLoading,
    getUserPreferences,
    updateUserPreferences,
  } = useUser();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        await getUserPreferences();
      } catch (error) {
        setError("Failed to fetch user preferences");
        console.error("Error fetching user preferences:", error);
      }
    };

    fetchUserPreferences();
  }, []);

  if (!userLoading && !user) {
    navigate("/login");
    return null;
  }
  if (userLoading) {
    return <div>Loading user data...</div>;
  }
  if (user && !userLoading) {
    return (
      <section className="p-4 w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>
        <div className="text-center mx-auto max-w-md p-4 border rounded-lg shadow-lg">
          <p className="text-lg">Email: {user.email}</p>
        </div>
        <article>
          <h2 className="text-xl font-bold mb-4">User Preferences</h2>
          <p className="text-lg">
            Diet: {user.preferences?.diet || "Not specified"}
          </p>
          <p className="text-lg">
            Disliked Ingredients:{" "}
            {user.preferences?.dislikedIngredients.length > 0
              ? user.preferences.dislikedIngredients.join(", ")
              : "None"}
          </p>
        </article>
      </section>
    );
  }
};

export default MePage;
