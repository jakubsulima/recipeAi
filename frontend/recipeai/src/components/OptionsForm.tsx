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
    <form onSubmit={handleSubmit} className={`flex flex-col gap-1 ${classname || ""}`}>
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          value={selectedOption}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full appearance-none px-3 py-2.5 pr-10 border border-primary/20 rounded-md bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent transition-shadow shadow-sm"
        >
          <option value="">{currentOptions ? "None" : "Select..."}</option>
          {options.map((option, index) => (
            <option key={option} value={option}>
              {optionsToDisplay[index]}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text/50">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {showSubmitButton && (
        <button
          type="submit"
          disabled={selectedOption === currentOptions}
          className="w-full mt-2 px-4 py-3 bg-accent text-text rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-accent hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {buttonText}
        </button>
      )}
    </form>
  );
};

export default OptionsForm;
