interface Props {
  className: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const DropDownItem = ({ className, children, onClick }: Props) => {
  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
};

export default DropDownItem;
