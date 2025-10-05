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
        className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 rounded-2xl bg-secondary hover:bg-secondary/80 hover:shadow-lg cursor-pointer transition-all duration-300 border border-primary/10 hover:border-accent/30"
        onClick={() => {
          navigate(`/recipe/${id}`);
        }}
      >
        <div className="flex-1 mb-3 sm:mb-0">
          <h2 className="text-xl font-semibold text-text group-hover:text-accent transition-colors leading-tight">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-text/70 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{timeToPrepare}</span>
        </div>
      </div>
    </>
  );
};

export default RecipeContainer;
