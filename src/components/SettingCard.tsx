import React from "react";

interface SettingCardProps {
  icon: React.ReactElement;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  icon,
  title,
  description,
  children,
}) => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-start gap-4">
      <div className="text-blue-500 dark:text-blue-400 mt-1">{icon}</div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  </div>
);
