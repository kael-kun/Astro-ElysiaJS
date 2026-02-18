export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: LoginUser;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface UseLoginFormReturn {
  formProps: {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  };
  fieldProps: {
    email: {
      id: string;
      name: string;
      type: string;
      label: string;
      placeholder: string;
      required: boolean;
      autoComplete: string;
      error?: string;
    };
    password: {
      id: string;
      name: string;
      type: string;
      label: string;
      placeholder: string;
      required: boolean;
      autoComplete: string;
      error?: string;
    };
  };
  buttonProps: {
    type: "submit";
    loading: boolean;
    fullWidth: boolean;
    size: "lg";
    variant: "gradient";
    children: React.ReactNode;
  };
  error: string | null;
}
