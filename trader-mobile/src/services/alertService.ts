import { Alert, type AlertButton } from 'react-native';

/**
 * Central place for user-visible dialogs. Prefer this over calling `Alert.alert` directly.
 */
export const alerts = {
  show(title: string, message?: string, buttons?: AlertButton[], options?: { cancelable?: boolean }) {
    Alert.alert(title, message, buttons, options);
  },

  info(title: string, message?: string) {
    Alert.alert(title, message ?? '', [{ text: 'OK' }]);
  },

  error(message: string, title = 'Something went wrong') {
    Alert.alert(title, message, [{ text: 'OK' }]);
  },

  success(message: string, title = 'Done') {
    Alert.alert(title, message, [{ text: 'OK' }]);
  },

  confirm(
    message: string,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      destructive?: boolean;
    }
  ): Promise<boolean> {
    const title = options?.title ?? 'Confirm';
    return new Promise((resolve) => {
      Alert.alert(title, message, [
        {
          text: options?.cancelText ?? 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: options?.confirmText ?? 'OK',
          style: options?.destructive ? 'destructive' : 'default',
          onPress: () => resolve(true),
        },
      ]);
    });
  },
};
