// frontend/src/components/common/KpiCard.jsx
import React from 'react';

const formatTitle = value => {
  if (typeof value !== 'string') {
    return value;
  }

  if (value.length === 0) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const KpiCard = ({
  title,
  value,
  subtitle,
  icon,
  gradient = 'from-blue-500 to-blue-600',
  className = '',
  iconClassName = '',
  titleClassName = 'text-sm text-white text-opacity-80',
  valueClassName = 'text-3xl font-bold mt-2',
  subtitleClassName = 'text-xs text-white text-opacity-80 mt-2'
}) => {
  const hasSubtitle = typeof subtitle === 'string' && subtitle.trim().length > 0;

  return (
    <div className={`bg-gradient-to-br ${gradient} text-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <p className={titleClassName}>{formatTitle(title)}</p>
          )}
          <p className={valueClassName}>{value}</p>
          {hasSubtitle && (
            <p className={subtitleClassName}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`bg-white bg-opacity-20 p-3 rounded-lg ${iconClassName}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
