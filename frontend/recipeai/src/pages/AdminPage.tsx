import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/context";
import { apiClient } from "../lib/hooks";
import AdminRecipesPanel from "../components/AdminRecipesPanel";

interface User {
  id: number;
  email: string;
  role: string;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiClient("admin/users");
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [authContext]);

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await apiClient(`admin/users/delete/${userId}`, true);
        if (!response.ok) {
          const errorData = await response.json.catch(() => ({
            message: `Failed to delete user: ${response.statusText}`,
          }));
          throw new Error(
            errorData.message || `Failed to delete user: ${response.statusText}`
          );
        }
        fetchUsers();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while deleting user"
        );
        console.error(err);
      }
    }
  };

  if (loading)
    return (
      <div className="container mx-auto p-4 bg-background min-h-screen text-text">
        Loading users...
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto p-4 bg-background min-h-screen text-accent">
        Error: {error}
      </div>
    );
  if (!authContext || authContext.user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto p-4 bg-background min-h-screen text-accent">
        Access Denied. You must be an admin to view this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-text">Admin Dashboard</h1>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-text">
          User Management
        </h2>
        {users.length === 0 && !loading && !error ? (
          <p className="text-text/70">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-secondary shadow-md rounded-lg">
              <thead className="bg-primary/10 text-text">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-text">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-accent hover:bg-accent/80 text-background font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={user.email === authContext.user?.email} // Prevent admin from deleting themselves
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recipe Management Panel */}
      <AdminRecipesPanel />
    </div>
  );
};

export default AdminPage;
