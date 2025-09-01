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
  label?: string;
}

const OptionsForm = ({
  name,
  options,
  currentOptions,
  onSaveOptions,
  onChange,
  classname,
  showSubmitButton = false,
  buttonText = "Save",
  label,
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
    if (onSaveOptions && selectedOption) {
      onSaveOptions(selectedOption);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${classname}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={selectedOption}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">{currentOptions ? "None" : "Select a diet..."}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {showSubmitButton && (
        <button
          type="submit"
          disabled={selectedOption === currentOptions}
          className="w-full px-4 py-2 bg-main text-black rounded-md focus:outline-none focus:ring-2 focus:ring-main bg-primary"
        >
          {buttonText}
        </button>
      )}
    </form>
  );
};

export default OptionsForm;
