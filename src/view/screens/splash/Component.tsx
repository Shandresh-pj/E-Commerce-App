import React from 'react';
import WelcomeScreen from './WelcomeScreen';

export const SplashComponent: React.FC<{ navigation: any }> = ({ navigation }) => {
  return <WelcomeScreen navigation={navigation} />;
};

export default SplashComponent;
