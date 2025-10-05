import { useNavigate } from "react-router";
import DropDownItem from "./DropDownItem";
interface Props {
  dropdownItems: string[];
  className: string;
  handleLogout: () => void;
  onItemClick?: () => void;
}

const DropDownMenu = ({
  dropdownItems,
  className,
  handleLogout,
  onItemClick,
}: Props) => {
  const navigate = useNavigate();
  const handleClick = (item: string) => {
    if (item === "Logout") {
      handleLogout();
    } else {
      navigate("/" + item);
    }
    if (onItemClick) onItemClick();
  };

  return (
    <div className={className}>
      {dropdownItems.map((item, index) => (
        <DropDownItem
          to={item === "Logout" ? "#" : "/" + item}
          key={index}
          className={
            `mt-3 mx-4 px-4 py-2 cursor-pointer rounded-full bg-primary hover:bg-accent hover:text-primary text-center text-lg text-background transition-all duration-300` +
            (item === "Logout" ? " font-semibold" : "")
          }
          onClick={() => handleClick(item)}
        >
          {item}
        </DropDownItem>
      ))}
    </div>
  );
};

export default DropDownMenu;
