import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col pt-16 bg-background min-h-screen">
      <ScrollRestoration />
      <Navbar></Navbar>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer></Footer>
    </div>
  );
};

export default Layout;
