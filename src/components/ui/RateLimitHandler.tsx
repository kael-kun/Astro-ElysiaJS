import { useEffect } from "react";
import { useToastContext } from "src/providers/ToastProvider";

export const RateLimitHandler: React.FC = () => {
  const { warning } = useToastContext();

  useEffect(() => {
    const handleRateLimit = () => {
      warning("Too many requests. Please try again later.", {
        duration: 10000,
      });
    };

    window.addEventListener("rate-limit-exceeded", handleRateLimit);

    return () => {
      window.removeEventListener("rate-limit-exceeded", handleRateLimit);
    };
  }, [warning]);

  return null;
};
