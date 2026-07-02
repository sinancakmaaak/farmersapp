import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div className="page-header">
      <div className="page-title">
        <h1>{title}</h1>
        {description && (
          <p className="page-description">{description}</p>
        )}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}; 