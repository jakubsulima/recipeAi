import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col pt-16 bg-background min-h-screen relative overflow-hidden">
      <ScrollRestoration />
      <Navbar></Navbar>
      <main key={location.pathname} className="flex-1 animate-fadeIn">
        <Outlet />
      </main>
      <Footer></Footer>
    </div>
  );
};

export default Layout;
