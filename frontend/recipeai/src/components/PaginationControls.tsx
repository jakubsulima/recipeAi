import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null; // Don't render controls if there's only one page
  }

  const handlePrevious = () => {
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center gap-3 mt-8">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 0}
        className="flex items-center justify-center px-4 py-2 bg-secondary rounded-full transition-all duration-300 hover:bg-accent hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-secondary group"
        aria-label="Previous page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="ml-1 font-medium text-sm">Prev</span>
      </button>

      <div className="px-4 py-2 bg-secondary rounded-full">
        <span className="text-sm font-semibold text-text">
          Page {currentPage + 1} of {totalPages}
        </span>
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage + 1 >= totalPages}
        className="flex items-center justify-center px-4 py-2 bg-secondary rounded-full transition-all duration-300 hover:bg-accent hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-secondary group"
        aria-label="Next page"
      >
        <span className="mr-1 font-medium text-sm">Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

export default PaginationControls;
