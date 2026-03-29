import React from "react";

interface CategorySwitcherProps {
  currentCategory: string | null;
  onPrevious: () => void;
  onNext: () => void;
}

const CategorySwitcher: React.FC<CategorySwitcherProps> = ({
  currentCategory,
  onPrevious,
  onNext,
}) => {
  if (!currentCategory) {
    return null;
  }

  return (
    <div className="flex mb-5">
      <div className="flex items-center justify-between w-full bg-background rounded-xl p-1.5 border border-primary/10 shadow-sm">
        <button
          onClick={onPrevious}
          className="flex items-center justify-center w-10 h-10 bg-transparent text-text/70 rounded-lg transition-all cursor-pointer border hover:bg-secondary hover:text-text hover:border-primary/20 hover:shadow-sm"
          aria-label="Previous category"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="px-4 py-2 flex-1 text-center">
          <h2 className="text-lg sm:text-xl font-bold whitespace-nowrap text-text tracking-wide">
            {currentCategory.replace(/_/g, " ").charAt(0).toUpperCase() +
              currentCategory.replace(/_/g, " ").slice(1).toLowerCase()}
          </h2>
        </div>

        <button
          onClick={onNext}
          className="flex items-center justify-center w-10 h-10 bg-transparent text-text/70 rounded-lg transition-all cursor-pointer border hover:bg-secondary hover:text-text hover:border-primary/20 hover:shadow-sm"
          aria-label="Next category"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CategorySwitcher;
