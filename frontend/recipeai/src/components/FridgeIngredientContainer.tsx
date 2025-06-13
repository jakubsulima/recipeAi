interface Props {
  name: string;
  expirationDate: string;
  remove: () => void;
}

const FridgeIngredientContainer = ({ name, expirationDate, remove }: Props) => {
  return (
    <>
      <h1>{name}</h1>
      <p>Expiration Date: {expirationDate}</p>
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
