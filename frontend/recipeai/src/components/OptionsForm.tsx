import { useEffect, useState } from "react";

interface OptionsFormProps {
  name: string;
  options: string[];
  currentOptions: string;
  onSaveOptions?: (options: string) => void;
  children?: React.ReactNode;
  classname?: string;
  onChange?: (value: string) => void;
  showSubmitButton?: boolean;
  buttonText?: string;
}

const OptionsForm = ({
  name,
  options,
  currentOptions,
  onSaveOptions,
  onChange,
  children,
  classname,
  showSubmitButton = false,
  buttonText = "Save",
}: OptionsFormProps) => {
  const [selectedOption, setSelectedOption] = useState(currentOptions);

  useEffect(() => {
    setSelectedOption(currentOptions);
  }, [currentOptions]);

  const handleSelectChange = (value: string) => {
    setSelectedOption(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveOptions) {
      onSaveOptions(selectedOption);
    }
  };

  return (
    <article className={classname}>
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        {name}
      </label>
      <form onSubmit={handleSubmit}>
        <select
          name={name}
          value={selectedOption}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option || "None"}
            </option>
          ))}
        </select>

        {children}

        {showSubmitButton && (
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {buttonText}
          </button>
        )}
      </form>
    </article>
  );
};

export default OptionsForm;
