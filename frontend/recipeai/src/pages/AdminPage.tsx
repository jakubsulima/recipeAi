import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/context";
import { apiClient, deleteClient } from "../lib/hooks";
import AdminRecipesPanel from "../components/AdminRecipesPanel";
import FoodLoadingScreen from "../components/FoodLoadingScreen";
import ErrorAlert from "../components/ErrorAlert";
import PaginationControls from "../components/PaginationControls";

interface User {
  id: number;
  email: string;
  role: string;
}

const AdminPage: React.FC = () => {
  const PAGE_SIZE = 20;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const authContext = useContext(AuthContext);

  const fetchUsers = async (pageNum: number = currentPage) => {
    setLoading(true);
    try {
      const data = await apiClient(`admin/users?page=${pageNum}&size=${PAGE_SIZE}`);
      setUsers(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 1);
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
    if (authContext?.user?.role === "ADMIN") {
      fetchUsers(currentPage);
    }
  }, [authContext?.user?.role, currentPage]);

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteClient(`admin/users/delete/${userId}`);
        if (users.length === 1 && currentPage > 0) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchUsers(currentPage);
        }
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
    return <FoodLoadingScreen title="Loading users..." subtitle="Preparing admin dashboard" />;
  if (authContext?.loading)
    return <FoodLoadingScreen title="Loading..." subtitle="Checking admin access" />;
  if (!authContext || authContext.user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto p-4 bg-background min-h-screen text-accent">
        Access Denied. You must be an admin to view this page.
      </div>
    );
  }

  return (
    <div className="mobile-page-enter container mx-auto p-4 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-text">Admin Dashboard</h1>
      <ErrorAlert message={error} className="mb-6" onAutoHide={() => setError(null)} />

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
                        className="mobile-soft-press bg-accent hover:bg-accent/80 text-background font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Recipe Management Panel */}
      <AdminRecipesPanel />
    </div>
  );
};

export default AdminPage;
