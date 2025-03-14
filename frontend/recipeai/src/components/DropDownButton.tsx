interface Props {
  className: string;
  isOpen: boolean;
  onClick: () => void;
}

export const DropDownButton = ({ className, isOpen, onClick }: Props) => {
  return (
    <>
      <button className={className} onClick={onClick}>
        {isOpen ? "X" : "..."}
      </button>
    </>
  );
};
