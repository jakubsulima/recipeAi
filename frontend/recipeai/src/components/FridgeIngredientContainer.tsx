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
    <>
      <h1>{name}</h1>
      {expirationDate === null ? "" : <p>Expiration Date: {expirationDate}</p>}
      <p>
        {amount} {unit}
      </p>
      <div className="flex justify-between items-center">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={remove}
        >
          Remove
        </button>
      </div>
    </>
  );
};

export default FridgeIngredientContainer;
