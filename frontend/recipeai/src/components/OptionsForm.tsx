import { useEffect, useState } from "react";

interface OptionsFormProps {
  name: string;
  options: string[];
  currentOptions: string;
  onSaveOptions?: (options: string) => void;
  children?: React.ReactNode;
  classname?: string;
}

const OptionsForm = ({
  name,
  options,
  currentOptions,
  onSaveOptions,
  children,
  classname,
}: OptionsFormProps) => {
  const [Options, setOptions] = useState(currentOptions);
  useEffect(() => {
    setOptions(currentOptions);
  }, [currentOptions]);

  return (
    <article className={classname}>
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        {name}
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSaveOptions(Options);
        }}
      >
        <select
          name={name}
          value={Options}
          onChange={(e) => setOptions(e.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {children}
      </form>
    </article>
  );
};

export default OptionsForm;
