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
    <section className="flex flex-col items-center">
      <h2 className="p-2 text-text">{title}</h2>
      <article className="flex flex-row bg-secondary justify-between rounded-3xl overflow-hidden">
        {options.map((button) => (
          <button
            key={button}
            className={`font-semibold w-full md:min-w-64 p-4 transition-colors ${
              selectedButton === button
                ? "bg-accent text-text"
                : "bg-secondary text-text hover:bg-secondary/80"
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
