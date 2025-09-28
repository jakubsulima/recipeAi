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
            `pt-4 cursor-pointer bg-primary border-none hover:bg-gray-200 text-center text-xl` +
            (item === "Logout" ? " font-bold" : "")
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
