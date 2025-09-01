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
    <div className="flex justify-center mb-4">
      <div className="flex items-center bg-gray-200 rounded-lg">
        <button
          onClick={onPrevious}
          className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-l-lg transition-colors cursor-pointer"
          aria-label="Previous category"
        >
          &lt;
        </button>

        <div className="px-6 py-2 bg-white w-64 text-center">
          <h2 className="text-xl font-bold whitespace-nowrap">
            {currentCategory.replace(/_/g, " ")}
          </h2>
        </div>

        <button
          onClick={onNext}
          className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-r-lg transition-colors cursor-pointer"
          aria-label="Next category"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default CategorySwitcher;
