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
        className="flex flex-row items-start justify-between hover:bg-secondary p-4 border-b border-primary/20 cursor-pointer bg-background transition-colors"
        onClick={() => {
          navigate(`/recipe/${id}`);
        }}
      >
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        <p className="text-accent">Time to Prepare: {timeToPrepare}</p>
      </div>
    </>
  );
};

export default RecipeContainer;
