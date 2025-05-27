import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import "./App.css";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import Recipes from "./pages/UserRecipes";
import { Fridge } from "./pages/Fridge";
import Login from "./pages/Login";
import RecipePage from "./pages/RecipePage";
import Register from "./pages/Register";
import { AuthProvider } from "./context/context";
import { FridgeProvider } from "./context/fridgeContext";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/Recipes" element={<Recipes />} />
        <Route path="/Fridge" element={<Fridge />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Recipe" element={<RecipePage />} />
        <Route path="/Recipe/:id" element={<RecipePage />} />
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
