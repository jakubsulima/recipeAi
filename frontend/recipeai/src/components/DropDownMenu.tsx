import DropDownItem from "./DropDownItem";
interface Props {
  dropdownItems: string[];
  className: string;
}

const DropDownMenu = ({ dropdownItems, className }: Props) => {
  return (
    <div className={className}>
      {dropdownItems.map((item, index) => (
        <DropDownItem className="pt-1">
          <p>{item}</p>
        </DropDownItem>
      ))}
    </div>
  );
};

export default DropDownMenu;
