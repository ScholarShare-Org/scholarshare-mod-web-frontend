import { AxiosError } from 'axios';

/**
 * Parses an error object (specifically AxiosError) and returns a user-friendly message.
 * 
 * @param error - The error object to parse.
 * @returns A friendly string message.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFriendlyErrorMessage = (error: any): string => {
    if (!error) {
        return "An unexpected error occurred.";
    }

    // Network Errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return "Unable to connect to the server. Please check your internet connection.";
    }

    // Axios Responses
    if (error.isAxiosError && error.response) {
        const status = error.response.status;

        switch (status) {
            case 400:
                // Try to extract a specific validation message if available, otherwise generic
                return error.response.data?.message || "Please check the form details and try again.";
            case 401:
            case 403:
                return "You do not have permission to perform this action.";
            case 404:
                return "The requested resource could not be found.";
            case 422:
                // 422 Unprocessable Entity - often used for validation errors
                return error.response.data?.message || "Please check the form details for errors.";
            case 500:
                return "Something went wrong on our end. Please try again later.";
            default:
                if (status > 500) {
                    return "Something went wrong on our end. Please try again later.";
                }
                // Fallback for other client-side errors
                return "An unexpected error occurred. Please try again.";
        }
    }

    // Generic fallback for non-Axios errors
    return error.message || "An unexpected error occurred.";
};
