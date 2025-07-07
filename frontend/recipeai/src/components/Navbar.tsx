import { useState } from "react";
import { DropDownButton } from "./DropDownButton";
import DropDownMenu from "./DropDownMenu";
import { useUser } from "../context/context";
import { useNavigate } from "react-router-dom";
import DropDownItem from "./DropDownItem";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, loading, isAdmin } = useUser();
  const navigate = useNavigate();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setUser(null);
    navigate("/");
  };

  const getNavItems = () => {
    const baseItems = ["Recipes"];

    if (loading) {
      return [...baseItems, "Login"];
    }

    if (user) {
      return [...baseItems, "Fridge", "Me", isAdmin ? "Admin" : ""];
    } else {
      return [...baseItems, "Login"];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex bg-[#FEE715] p-4 fixed top-0 left-0 w-full z-50">
      <nav className="container mx-auto">
        <ul className="flex space-x-4 text-black justify-between">
          <li className="hover:text-gray-400">
            <a href="/">Recipe.ai</a>
          </li>
          <div className="flex space-x-3 al max-sm:hidden">
            {navItems.map((item, index) => (
              <li key={index} className="hover:text-gray-400">
                <a href={"/" + item}>{item}</a>
              </li>
            ))}
            {user && (
              <li
                className="hover:text-gray-400 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            )}
          </div>
          <li className="sm:hidden">
            <DropDownButton onClick={toggleOpen} isOpen={isOpen} className="" />
          </li>
        </ul>
        <div
          className={`
            w-full bg-gray-800 shadow-lg rounded-md
            transition-all duration-700 ease-in-out
            ${
              isOpen
                ? "opacity-100 max-h-96 translate-y-0"
                : "opacity-0 max-h-0 -translate-y-4 pointer-events-none overflow-hidden"
            }
          `}
        >
          <DropDownMenu
            className={`w-full transition-all duration-700 ease-in-out ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            dropdownItems={user ? [...navItems, "Logout"] : navItems}
            handleLogout={handleLogout}
            onItemClick={() => setIsOpen(false)}
          />
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
              <DropDownItem to="/user-recipes" onClick={() => setIsOpen(false)}>
                My recipes
              </DropDownItem>
              <DropDownItem to="/fridge" onClick={() => setIsOpen(false)}>
                Fridge
              </DropDownItem>
              <DropDownItem to="/me" onClick={() => setIsOpen(false)}>
                My profile
              </DropDownItem>
              <DropDownItem to="/" onClick={handleLogout}>
                Logout
              </DropDownItem>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
