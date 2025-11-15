import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="app-header__title">
        <h1>Merchant Support Voice Bot</h1>
        <p>Ask about orders, refunds, and products.</p>
      </div>
    </header>
  );
};
