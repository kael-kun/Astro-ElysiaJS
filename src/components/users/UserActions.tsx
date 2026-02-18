import React from "react";
import { Button } from "../ui/Button";

export interface UserActionsProps {
  onAddUser: () => void;
}

export const UserActions: React.FC<UserActionsProps> = ({ onAddUser }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-end">
        <Button
          variant="gradient"
          onClick={onAddUser}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </Button>
      </div>
    </div>
  );
};
