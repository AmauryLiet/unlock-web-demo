import React from "react";

interface Props {
  children: React.ReactNode;
}

export default ({ children }: Props) => {
  return (
    <div className="card-list" style={{ display: "flex", flexWrap: "wrap" }}>
      {children}
      <style jsx>{`
        .card-list > :global(*) {
          margin: 5px;
        }
      `}</style>
    </div>
  );
};
