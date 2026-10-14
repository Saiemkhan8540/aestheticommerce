import React from "react";
import "./RatingBreakdown.css";

const RatingBreakdown = ({ data, totalReviews }) => {
  return (
    <div className="RatingBreakdown-breakdown-card">
      <h3 className="RatingBreakdown-title">Rating Breakdown</h3>
      <div className="RatingBreakdown-rows">
        {data.map((item) => (
          <div key={item.stars} className="RatingBreakdown-row">
            <div className="RatingBreakdown-star-label">
              <span>{item.stars}</span>
              <svg className="RatingBreakdown-star" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="RatingBreakdown-bar">
              <div className="RatingBreakdown-bar-fill" style={{ width: `${item.percentage}%` }} />
            </div>
            <div className="RatingBreakdown-counts">
              <span>{item.count}</span>
              <span className="RatingBreakdown-muted">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="RatingBreakdown-stats">
        <div className="RatingBreakdown-stat">
          <div className="RatingBreakdown-stat-num">
            {totalReviews ? Math.round(((data[0].count + data[1].count) / totalReviews) * 100) : 0}%
          </div>
          <div className="RatingBreakdown-stat-label">Positive Reviews</div>
        </div>
        <div className="RatingBreakdown-stat">
          <div className="RatingBreakdown-stat-num">{totalReviews}</div>
          <div className="RatingBreakdown-stat-label">Total Reviews</div>
        </div>
        <div className="RatingBreakdown-stat">
          <div className="RatingBreakdown-stat-num">
            {totalReviews
              ? (data.reduce((acc, item) => acc + item.stars * item.count, 0) / totalReviews).toFixed(1)
              : "0.0"}
          </div>
          <div className="RatingBreakdown-stat-label">Average Rating</div>
        </div>
      </div>
    </div>
  );
};

export default RatingBreakdown;

