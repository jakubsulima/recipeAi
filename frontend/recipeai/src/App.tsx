import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import Recipes from "./pages/UserRecipes.tsx";
import { Fridge } from "./pages/Fridge";
import Login from "./pages/Login";
import RecipePage from "./pages/RecipePage";
import Register from "./pages/Register";
import MePage from "./pages/UserPreferencesPage.tsx";
import AdminPage from "./pages/AdminPage"; // Import the AdminPage component
import UserRecipes from "./pages/UserRecipes.tsx";
import ShoppingList from "./pages/ShoppingList";
import { AuthProvider } from "./context/context"; // Add import for AuthProvider
import { FridgeProvider } from "./context/fridgeContext"; // Add import for FridgeProvider
import { GuestRoute, ProtectedRoute } from "./components/RouteGuards";
import ErrorPage from "./pages/ErrorPage";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
      <Route index element={<HomePage />} />
      <Route path="/Recipes" element={<Recipes />} />
      <Route
        path="/Fridge"
        element={
          <ProtectedRoute>
            <Fridge />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route path="/Login" element={<Navigate to="/login" replace />} />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/My Preferences"
        element={
          <ProtectedRoute>
            <MePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ShoppingList"
        element={
          <ProtectedRoute>
            <ShoppingList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Recipe"
        element={
          <ProtectedRoute>
            <RecipePage />
          </ProtectedRoute>
        }
      />
      <Route path="/Recipe/:id" element={<RecipePage />} />
      <Route
        path="/myRecipes"
        element={
          <ProtectedRoute>
            <UserRecipes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="/Homepage" element={<Navigate to="/" replace />} />
      <Route
        path="*"
        element={
          <ErrorPage
            title="Page not found"
            subtitle="The page you requested does not exist."
          />
        }
      />
      </Route>
    )
  );
  return (
    <AuthProvider>
    <FridgeProvider>
    <RouterProvider router={router} />
    </FridgeProvider>
    </AuthProvider>
  );
}

export default App;
