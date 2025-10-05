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
    <div className="flex justify-center items-center space-x-4 mt-8">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 0}
        className="flex items-center justify-center w-10 h-10 bg-accent rounded-l-lg transition-colors cursor-pointer border-none hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-background font-bold">{"<"}</span>
      </button>
      <span className="text-lg font-medium text-text">
        Page {currentPage + 1} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage + 1 >= totalPages}
        className="flex items-center justify-center w-10 h-10 bg-accent rounded-r-lg transition-colors cursor-pointer border-none hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-background font-bold">{">"}</span>
      </button>
    </div>
  );
};

export default PaginationControls;
