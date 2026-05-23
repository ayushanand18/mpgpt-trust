import { toast } from "sonner";

export interface ApiError {
  Error: {
    Message: string;
  };
  Data: unknown | null;
}

/**
 * Parses and displays an API error consistently.
 */
export function handleApiError(error: unknown, defaultMessage: string = "An unexpected error occurred") {
  console.error("API Error:", error);

  let message = defaultMessage;

  // Direct extraction for the expected { Error: { Message: ... } } structure
  if (
    typeof error === "object" &&
    error !== null &&
    "Error" in error &&
    typeof (error as ApiError).Error === "object" &&
    (error as ApiError).Error !== null &&
    "Message" in (error as ApiError).Error &&
    typeof (error as ApiError).Error.Message === "string"
  ) {
    message = (error as ApiError).Error.Message;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  toast.error("Error", {
    description: message,
  });
}
