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
      <h2>{title}</h2>
      <article className="flex flex-row">
        {options.map((button) => (
          <button
            key={button}
            className={`font-semibold py-2 px-4 rounded mb-2 mr-2 ${
              selectedButton === button
                ? "bg-secondary"
                : "bg-gray-200 hover:bg-gray-300"
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
