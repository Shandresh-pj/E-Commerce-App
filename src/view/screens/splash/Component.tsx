import * as React from 'react';
import { View, Text, StatusBar, ImageBackground, } from 'react-native';
import { initalStateAsync } from '../../../shared/redux/reducers/auth';
import { getAsyncData } from '../../../shared/utils/storage';
import styles from '../../assets/styles/styles';
import SpalshLogo from '../../assets/images/svg/spalah_logo.svg';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface Props {
  splashLaunched: Function;
  isLoggedIn: boolean;
  navigation: any;
  dispatch: any;
}
interface State { }

function Splash(props: any) {
  const { splashLaunched, isLoggedIn, navigation, dispatch } = props;

  React.useEffect(() => {
    getInitialData();
  }, []);


  const getInitialData = async () => {
    await dispatch(initalStateAsync);
    const user = await getAsyncData('user');
    splashLaunched();
    if (user && Object.keys(user).length > 0) {
      navigation.popTo('Home');
    } else {
      navigation.popTo('Login');
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        hidden={false}
        backgroundColor='#2a2c40'
        translucent
      />
      <SafeAreaView edges={['left', 'right',]} style={styles.container}>
        <ImageBackground source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{
            resizeMode: "cover",
            alignSelf: "flex-end"
          }}
          style={styles.bakcgroundImage}
        >
          <View style={styles.splahScreen}>
            <Animatable.View
              animation="pulse"
              easing="ease-out"
              iterationCount="infinite"
            >
              <SpalshLogo />
            </Animatable.View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

export default Splash;
