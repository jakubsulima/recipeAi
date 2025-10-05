import { unitType } from "../context/fridgeContext";

interface Props {
  name: string;
  expirationDate: string;
  remove: () => void;
  unit: unitType;
  amount?: string;
}

const FridgeIngredientContainer = ({
  name,
  expirationDate,
  unit,
  amount,
  remove,
}: Props) => {
  return (
    <div className="flex w-full items-center justify-between border-b border-primary/20 py-4">
      <div className="flex flex-col">
        <h1 className="font-semibold text-text">{name}</h1>
        <div className="flex flex-row text-sm text-text/70">
          <p>
            {amount} {unit}
            {expirationDate && (
              <span className="ml-2 border-l border-primary/20 pl-2">
                {expirationDate}
              </span>
            )}
          </p>
        </div>
      </div>
      <button
        className="text-text/50 hover:text-accent text-2xl font-light transition-colors"
        onClick={remove}
        aria-label={`Remove ${name}`}
      >
        &times;
      </button>
    </div>
  );
};

export default FridgeIngredientContainer;
