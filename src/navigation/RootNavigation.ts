import * as React from 'react';
import { NavigationContainerRef } from '@react-navigation/native';

// A small navigation helper so non-component code can navigate
export const navigationRef: React.RefObject<NavigationContainerRef<any> | null> = React.createRef();

export function navigate(name: string, params?: any) {
  navigationRef.current?.navigate(name as any, params);
}

export function reset(name: string) {
  navigationRef.current?.reset({ index: 0, routes: [{ name }] } as any);
}

export default {
  navigationRef,
  navigate,
  reset,
};
