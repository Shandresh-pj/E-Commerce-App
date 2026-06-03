import React, { createContext, useContext, useRef } from 'react';
import { Animated } from 'react-native';

interface TabBarContextType {
  translateY: Animated.Value;
  showTabBar: () => void;
  hideTabBar: () => void;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const TabBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current;

  const showTabBar = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const hideTabBar = () => {
    Animated.spring(translateY, {
      toValue: 200, // Large enough to hide the tab bar
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <TabBarContext.Provider value={{ translateY, showTabBar, hideTabBar }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (context === undefined) {
    return {
      translateY: new Animated.Value(0),
      showTabBar: () => {},
      hideTabBar: () => {},
    };
  }
  return context;
};
