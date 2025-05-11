import DropDownItem from "./DropDownItem";
interface Props {
  dropdownItems: string[];
  className: string;
  onItemClick?: (item: string) => void;
}

const DropDownMenu = ({ dropdownItems, className, onItemClick }: Props) => {
  const handleClick = (item: string) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      // Default behavior - navigate to the page
      window.location.href = `/${item}`;
    }
  };

  return (
    <div className={className}>
      {dropdownItems.map((item, index) => (
        <DropDownItem
          key={index}
          className="pt-1 cursor-pointer"
          onClick={() => handleClick(item)}
        >
          <p>{item}</p>
        </DropDownItem>
      ))}
    </div>
  );
};

export default DropDownMenu;
