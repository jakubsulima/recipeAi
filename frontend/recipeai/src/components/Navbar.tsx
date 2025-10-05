import { useState } from "react";
import { DropDownButton } from "./DropDownButton";
import DropDownMenu from "./DropDownMenu";
import { useUser } from "../context/context";
import { useNavigate } from "react-router-dom";

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
      return [
        "Fridge",
        ...baseItems,
        "My Preferences",
        isAdmin ? "Admin" : null,
      ].filter(Boolean);
    } else {
      return [...baseItems, "Login"];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex bg-primary p-4 fixed top-0 left-0 w-full z-50 shadow-md">
      <nav className="container mx-auto">
        <ul className="flex w-full text-background justify-between items-center">
          {/* Spacer that appears when menu is open to push the X to the right */}
          {isOpen && <div className="sm:hidden"></div>}

          {/* --- Left Side: Logo --- */}
          <li
            className={`hover:text-accent transition-colors font-bold text-lg ${
              isOpen ? "hidden" : ""
            }`}
          >
            <a href="/">Recipe.ai</a>
          </li>

          {/* --- Right Side: Controls (Desktop) / Burger (Mobile) --- */}
          <div className="flex items-center space-x-3">
            {/* Desktop Nav Links */}
            <div className="flex items-center space-x-3 max-sm:hidden">
              {navItems.map((item, index) => (
                <li key={index} className="list-none">
                  <a
                    href={"/" + item}
                    className="px-4 py-2 rounded-full text-background hover:text-accent inline-block border-none"
                  >
                    {item}
                  </a>
                </li>
              ))}
              {user && (
                <li className="list-none">
                  <button
                    className="px-2 py-1 rounded-full hover:text-accent font-semibold cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              )}
            </div>

            {/* Mobile Burger Button */}
            <li className="sm:hidden text-xl pr-1 bg-primary">
              <DropDownButton
                onClick={toggleOpen}
                isOpen={isOpen}
                className=""
              />
            </li>
          </div>
        </ul>
        <div
          className={`
            w-full bg-primary rounded-md flex flex-col
            transition-all duration-700 ease-in-out overflow-y-auto
            ${
              isOpen
                ? "opacity-100 max-h-[50vh] translate-y-0"
                : "opacity-0 max-h-0 -translate-y-4 pointer-events-none overflow-hidden"
            }
          `}
        >
          <DropDownMenu
            className={`w-full h-full transition-all duration-700  ease-in-out flex flex-col pb-4 bg-primary ${
              isOpen ? "opacity-100" : "opacity-0"
            } `}
            dropdownItems={
              user
                ? ["Homepage", ...navItems, "Logout"].filter(
                    (item): item is string => !!item
                  )
                : ["Homepage", ...navItems]
            }
            handleLogout={handleLogout}
            onItemClick={() => setIsOpen(false)}
          />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
