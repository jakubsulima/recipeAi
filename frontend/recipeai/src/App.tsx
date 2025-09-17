import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import "./App.css";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import Recipes from "./pages/UserRecipes.tsx";
import { Fridge } from "./pages/Fridge";
import Login from "./pages/Login";
import RecipePage from "./pages/RecipePage";
import Register from "./pages/Register";
import MePage from "./pages/MePage";
import AdminPage from "./pages/AdminPage"; // Import the AdminPage component
import UserRecipes from "./pages/UserRecipes.tsx";
import { AuthProvider } from "./context/context"; // Add import for AuthProvider
import { FridgeProvider } from "./context/fridgeContext"; // Add import for FridgeProvider

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/Recipes" element={<Recipes />} />
        <Route path="/Fridge" element={<Fridge />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Me" element={<MePage />} />
        <Route path="/Recipe" element={<RecipePage />} />
        <Route path="/Recipe/:id" element={<RecipePage />} />
        <Route path="/myRecipes" element={<UserRecipes />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<div>Not Found</div>} />
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
