import { useEffect, useState } from "react";

interface OptionsFormProps {
  name: string;
  options: string[];
  displayOptions?: string[]; // New prop for display text
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
  displayOptions, // Use the new prop
  currentOptions,
  onSaveOptions,
  onChange,
  classname,
  showSubmitButton = false,
  buttonText = "Save",
  label,
}: OptionsFormProps) => {
  const [selectedOption, setSelectedOption] = useState(currentOptions);
  const optionsToDisplay = displayOptions || options; // Fallback to original options if no displayOptions are provided

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
      <label className="text-sm font-medium text-text">{label}</label>
      <select
        name={name}
        value={selectedOption}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="w-full px-3 py-2 border border-primary/20 rounded-md bg-secondary text-text focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="">{currentOptions ? "None" : "Select a diet..."}</option>
        {options.map((option, index) => (
          <option key={option} value={option}>
            {optionsToDisplay[index]}
          </option>
        ))}
      </select>

      {showSubmitButton && (
        <button
          type="submit"
          disabled={selectedOption === currentOptions}
          className="w-full px-4 py-2 bg-accent text-text rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-accent hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      )}
    </form>
  );
};

export default OptionsForm;
