import React from "react";

export interface ModalHeaderProps {
  title: string;
  description?: string;
  gradient?: boolean;
  children?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  description,
  gradient = false,
  children,
}) => {
  const headerClasses = gradient
    ? "bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white"
    : "px-6 py-4 border-b border-gray-200 bg-gray-50";

  const titleClasses = gradient
    ? "text-lg font-bold"
    : "text-lg font-semibold text-gray-900";

  return (
    <div className={headerClasses}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={titleClasses}>{title}</h2>
          {description && (
            <p className={gradient ? "text-red-100 text-sm mt-1" : "text-gray-600 text-sm mt-1"}>
              {description}
            </p>
          )}
        </div>
        {children && <div className="ml-4">{children}</div>}
      </div>
    </div>
  );
};