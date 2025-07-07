import { Link } from "react-router-dom";

interface Props {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  className: string;
}

const DropDownItem = ({ to, children, onClick, className }: Props) => {
  return (
    <Link to={to} onClick={onClick} className={className}>
      {children}
    </Link>
  );
};

export default DropDownItem;
