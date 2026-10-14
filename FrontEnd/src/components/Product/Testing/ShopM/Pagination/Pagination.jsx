import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange, scrollToTop = true }) => {
  if (totalPages <= 1) return null;
  
  const handlePageChange = (page) => {
    onPageChange(page);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const generatePages = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisible) {
      const maxVisibleBefore = Math.floor(maxVisible / 2);
      startPage = Math.max(1, currentPage - maxVisibleBefore);
      endPage = startPage + maxVisible - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-item ${currentPage === 1 ? "disabled" : ""}`}
        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`pagination-item ${currentPage === 1 ? "active" : ""}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="pagination-ellipsis">
            <MoreHorizontal size={16} />
          </span>
        );
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-item ${currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="pagination-ellipsis">
            <MoreHorizontal size={16} />
          </span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          className={`pagination-item ${
            currentPage === totalPages ? "active" : ""
          }`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`pagination-item ${
          currentPage === totalPages ? "disabled" : ""
        }`}
        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    );

    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-content">{generatePages()}</div>
    </div>
  );
};

export default Pagination;