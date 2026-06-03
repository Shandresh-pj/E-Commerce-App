import { Alert } from 'react-native';

let isAlertVisible = false;

export const showSingleAlert = (title: string, message: string) => {
  if (isAlertVisible) {
    return;
  }
  
  isAlertVisible = true;
  
  Alert.alert(
    title,
    message,
    [
      {
        text: 'OK',
        onPress: () => {
          isAlertVisible = false;
        },
      },
    ],
    {
      cancelable: true,
      onDismiss: () => {
        isAlertVisible = false;
      },
    }
  );
};

const extractErrorMessage = (data: any): string | null => {
  if (!data) return null;

  // If there's a detailed validation error object, extract those specific messages
  if (data.error && typeof data.error === 'object' && !Array.isArray(data.error)) {
    const errorMessages: string[] = [];
    for (const key in data.error) {
           if (Array.isArray(data.error[key])) {
        errorMessages.push(...data.error[key]);
      } else if (typeof data.error[key] === 'string') {
        errorMessages.push(data.error[key]);
      }
    }
    if (errorMessages.length > 0) {
      return errorMessages.join('\n');
    }
  }

  // Fallback to string-based properties if specific field errors don't exist
  if (typeof data.error === 'string') return data.error;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.msg === 'string') return data.msg;

  return null;
};

export const handleApiError = (error: any, defaultMessage: string = 'An unexpected error occurred.') => {
  let title = 'Error';
  let message = defaultMessage;

  if (!error) {
    showSingleAlert(title, message);
    return;
  }

  if (error.response) {
    // The request was made and the server responded with a status code outside of the range of 2xx
    const status = error.response.status;
    const dataMessage = extractErrorMessage(error.response.data);
    
    if (status >= 400 && status < 500) {
      title = 'Request Failed';
      message = dataMessage || 'The information provided is incorrect. Please try again.';
      if (status === 401) {
        title = 'Authentication Failed';
        message = dataMessage || 'Invalid credentials. Please try again.';
      } else if (status === 403) {
        title = 'Access Denied';
        message = dataMessage || 'You do not have permission to perform this action.';
      } else if (status === 409) {
        title = 'Account Exists';
        message = dataMessage || 'An account with these details already exists.';
      } else if (status === 404) {
        title = 'Not Found';
        message = dataMessage || 'The requested resource could not be found.';
      }
    } else if (status >= 500) {
      title = 'Server Error';
      message = 'We are facing some technical issues on our end. Please try again later.';
    } else {
      message = dataMessage || defaultMessage;
    }
  } else if (error.request) {
    // The request was made but no response was received (network issue)
    title = 'Network Connection Issue';
    message = 'We could not connect to our servers. Please check your internet connection and try again.';
  } else {
    // Something happened in setting up the request that triggered an Error
    title = 'Unexpected Error';
    message = error.message || defaultMessage;
  }

  showSingleAlert(title, message);
};
