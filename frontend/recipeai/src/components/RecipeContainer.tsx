import { useNavigate } from "react-router";

interface RecipeContainerProps {
  id: number;
  title: string;
  timeToPrepare: string;
}

const RecipeContainer = ({
  title,
  id,
  timeToPrepare,
}: RecipeContainerProps) => {
  const navigate = useNavigate();
  return (
    <>
      <div
        className="flex flex-row items-start justify-between hover:bg-gray-100 p-4 border-b cursor-pointer"
        onClick={() => {
          navigate(`/recipe/${id}`);
        }}
      >
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">ID: {id}</p>
        <p className="text-gray-500">Time to Prepare: {timeToPrepare}</p>
      </div>
    </>
  );
};

export default RecipeContainer;
