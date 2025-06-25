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
          key={index}
          className="pt-2 cursor-pointer bg-[#FEE715] border-none hover:bg-gray-200"
          onClick={() => handleClick(item)}
        >
          <p className="text-center">{item}</p>
        </DropDownItem>
      ))}
    </div>
  );
};

export default DropDownMenu;
