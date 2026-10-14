import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import "./Breadcrumb.css";

const Breadcrumb = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb-nav">
      <div className="breadcrumb-container">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link">
              <Home size={16} className="breadcrumb-icon" />
              <span className="breadcrumb-text">Home</span>
            </Link>
          </li>

          {items.map((item, index) => (
            <React.Fragment key={index}>
              <li className="breadcrumb-separator">
                <ChevronRight size={16} />
              </li>
              <li className="breadcrumb-item">
                {item.href && index !== items.length - 1 ? (
                  <Link to={item.href} className="breadcrumb-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-current">{item.label}</span>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;