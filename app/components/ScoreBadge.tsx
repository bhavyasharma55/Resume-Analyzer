import React from "react";

const ScoreBadge = ({ score }: { score: number }) => {
  const getBadgeConfig = () => {
    if (score > 70) return { label: 'Great', bg: '#dcfce7', color: '#166534', border: '#86efac' };
    if (score > 49) return { label: 'Good Start', bg: '#fef9c3', color: '#854d0e', border: '#fde047' };
    return { label: 'Needs Work', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
  };

  const { label, bg, color, border } = getBadgeConfig();

  return (
    <span style={{
      backgroundColor: bg,
      color: color,
      border: `1px solid ${border}`,
      borderRadius: '10px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    }}>
      <span style={{ fontSize: '8px' }}>●</span>
      {label}
    </span>
  );
};

export default ScoreBadge;