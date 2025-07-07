import { Link } from "react-router-dom";

interface Props {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const DropDownItem = ({ to, children, onClick }: Props) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
};

export default DropDownItem;
