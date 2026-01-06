import React from "react";
import "./BadgeItem.css";

export default function BadgeItem({ imageUrl, badgeName }) {
  return (
    <div className="badge-card">
      <img src={imageUrl} alt={badgeName} className="badge-image" />
      <p className="badge-title">{badgeName}</p>
    </div>
  );
}
