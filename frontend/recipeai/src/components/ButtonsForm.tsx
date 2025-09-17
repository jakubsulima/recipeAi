interface ButtonsFormProps {
  options: string[];
  onButtonClick: (button: string) => void;
  selectedButton: string | null;
  title: string;
}
const ButtonsForm = ({
  options,
  onButtonClick,
  selectedButton,
  title,
}: ButtonsFormProps) => {
  return (
    <section className="flex flex-col items-center ">
      <h2 className="p-2">{title}</h2>
      <article className="flex flex-row bg-secondary justify-between rounded-md overflow-hidden">
        {options.map((button) => (
          <button
            key={button}
            className={`font-semibold w-full md:min-w-64 md:rounded p-4 ${
              selectedButton === button
                ? "bg-primary"
                : "bg-secondary hover:bg-primary"
            }`}
            onClick={() => onButtonClick(button)}
          >
            {button}
          </button>
        ))}
      </article>
    </section>
  );
};

export default ButtonsForm;
