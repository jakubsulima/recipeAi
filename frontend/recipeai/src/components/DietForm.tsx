import { useEffect, useState } from "react";

interface DietFormProps {
  dietOptions: string[];
  currentDiet: string;
  onSaveDiet: (diet: string) => void;
}

const DietForm = ({ dietOptions, currentDiet, onSaveDiet }: DietFormProps) => {
  const [diet, setDiet] = useState(currentDiet);

  useEffect(() => {
    setDiet(currentDiet);
  }, [currentDiet]);

  return (
    <article>
      <h2>Select Your Diet</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSaveDiet(diet);
        }}
      >
        <select
          name="diet"
          value={diet}
          onChange={(e) => setDiet(e.target.value)}
        >
          {dietOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button type="submit">Save Diet</button>
      </form>
    </article>
  );
};

export default DietForm;
