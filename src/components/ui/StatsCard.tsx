import React from "react";
import { Card } from "./Card";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
}) => {
  return (
    <Card>
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${iconBg} p-3 rounded-lg`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span
                className={`ml-2 text-sm font-medium ${
                  trend.direction === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};