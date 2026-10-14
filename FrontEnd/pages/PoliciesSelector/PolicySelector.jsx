import React from "react";
import { NavLink } from 'react-router-dom';
import "./Policies.css";

const policies = [
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/refund-policy", label: "Refund Policy" },
  { path: "/terms-of-use", label: "Terms of Use" },
  { path: "/seller-policy", label: "Seller Policy" },
  { path: "/buyer-policy", label: "Buyer Policy" },
  { path: "/privacy-policy-addendum", label: "Privacy Policy Addendum" },
];

const PolicySelector = () => {
  return (
    <nav className="policies-nav">
      {policies.map(({ path, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            isActive ? "policy-link active" : "policy-link"
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default PolicySelector;