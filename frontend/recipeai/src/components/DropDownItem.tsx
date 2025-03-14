interface Props {
  className: string;
  children: React.ReactNode;
}

const DropDownItem = ({ className, children }: Props) => {
  return <div className={className}>{children}</div>;
};

export default DropDownItem;
