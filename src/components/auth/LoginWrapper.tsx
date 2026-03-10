import { AppProvider } from "src/providers";
import { LoginPage } from "./LoginPage";

export default function LoginWrapper() {
  return (
    <AppProvider>
      <LoginPage />
    </AppProvider>
  );
}
