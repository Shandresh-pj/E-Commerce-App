import { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

const useInAppUpdate = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    try {
      const inAppUpdates = new SpInAppUpdates(false);
      inAppUpdates
        .checkNeedsUpdate()
        .then((result) => {
          if (result.shouldUpdate) {
            const updateOptions: StartUpdateOptions = {
              updateType: IAUUpdateKind.IMMEDIATE,
            };
            inAppUpdates.startUpdate(updateOptions);
          }
        })
        .catch((err) => {
          console.warn('In-app update check failed:', err);
        });
    } catch {
      // Native module unavailable — sideloaded build, skip silently
    }
  }, []);
};

export default useInAppUpdate;
