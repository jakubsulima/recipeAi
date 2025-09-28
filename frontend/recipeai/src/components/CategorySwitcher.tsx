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
    <div className="flex mb-4">
      <div className="flex rounded-lg justify-between w-full">
        <button
          onClick={onPrevious}
          className="flex items-center justify-center w-10 h-10 bg-primary rounded-l-lg transition-colors cursor-pointer border-none"
          aria-label="Previous category"
        >
          &lt;
        </button>

        <div className="px-6 py-2 bg-white w-64 text-center">
          <h2 className="text-xl font-semibold whitespace-nowrap">
            {currentCategory.replace(/_/g, " ").charAt(0).toUpperCase() +
              currentCategory.replace(/_/g, " ").slice(1).toLowerCase()}
          </h2>
        </div>

        <button
          onClick={onNext}
          className="flex items-center justify-center w-10 h-10 bg-primary rounded-r-lg transition-colors cursor-pointer border-none"
          aria-label="Next category"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default CategorySwitcher;
