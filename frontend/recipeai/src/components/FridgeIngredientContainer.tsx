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
      <section className="flex flex-row w-full justify-between items-center">
        <article className="flex flex-col">
          <h1>{name}|</h1>
          <article className="flex flex-row">
            <p>
              {amount} {unit}
              {expirationDate && ` | ${expirationDate}`}
            </p>
          </article>
        </article>
        <button className=" text-black px-4 py-2 rounded" onClick={remove}>
          X
        </button>
      </section>
    </>
  );
};

export default FridgeIngredientContainer;
