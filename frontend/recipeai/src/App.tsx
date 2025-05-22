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
import Recipe from "./pages/Recipe";
import Register from "./pages/Register";
import { AuthProvider } from "./context/context";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/Recipes" element={<Recipes />} />
        <Route path="/Fridge" element={<Fridge />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Recipe" element={<Recipe />} />
        <Route path="/Recipe/:id" element={<Recipe />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Route>
    )
  );
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
