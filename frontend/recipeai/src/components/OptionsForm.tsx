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
    <form onSubmit={handleSubmit} className={`flex flex-col gap-2 ${classname || ""}`}>
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
          className="w-full appearance-none rounded-lg border border-primary/20 bg-background px-3 py-2.5 pr-10 text-text shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-accent"
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
          className="mt-2 w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-text shadow-sm transition-colors hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {buttonText}
        </button>
      )}
    </form>
  );
};

export default OptionsForm;
