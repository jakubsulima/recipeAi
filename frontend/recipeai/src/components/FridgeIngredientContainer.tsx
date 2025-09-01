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
    <div className="flex w-full items-center justify-between border-b border-primary py-4">
      <div className="flex flex-col">
        <h1 className="font-semibold text-gray-800">{name}</h1>
        <div className="flex flex-row text-sm text-gray-500">
          <p>
            {amount} {unit}
            {expirationDate && (
              <span className="ml-2 border-l border-gray-300 pl-2">
                {expirationDate}
              </span>
            )}
          </p>
        </div>
      </div>
      <button
        className="text-gray-400 hover:text-red-500 text-2xl font-light transition-colors"
        onClick={remove}
        aria-label={`Remove ${name}`}
      >
        &times;
      </button>
    </div>
  );
};

export default FridgeIngredientContainer;
