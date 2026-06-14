import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Share,
  Platform,
  Linking,
  useWindowDimensions,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Invite from '../../assets/images/svg/invite.svg';
import styles from './InviteStyle';
import { fetchMyProfile } from '../../../shared/services/main-service';
import { ChevronLeftIcon } from '../../assets/images/svg/Svg2/ChevronLeftIcon';
import { THEME } from '../../assets/styles/theme';

/* ── Decorative blurred blob ── */
const Blob = ({
  color,
  size,
  top,
  left,
  right,
  bottom,
  opacity = 0.55,
}: {
  color: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}) => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity,
      top,
      left,
      right,
      bottom,
    }}
  />
);

/* ── Envelope / heart illustration (pure RN) ── */
const EnvelopeIllustration = () => (
  <View style={styles.envelopeWrap}>
    {/* Envelope body */}
    <View style={styles.envBody}>
      {/* Heart card sticking out */}
      <View style={styles.heartCard}>
        {/* Heart shape using two circles + rotated square trick */}
        <View style={styles.heartContainer}>
          <Invite width={50} />
        </View>
      </View>
      {/* Envelope flap */}
      <View style={styles.envFlap} />
      {/* Envelope bottom fold lines */}
      <View style={styles.envLeftFold} />
      <View style={styles.envRightFold} />
    </View>
  </View>
);

/* ── Share button ── */
const ShareBtn = ({
  label,
  bgColor,
  textColor = '#fff',
  icon,
  onPress,
  delay,
}: {
  label: string;
  bgColor: string;
  textColor?: string;
  icon: React.ReactNode;
  onPress: () => void;
  delay: number;
}) => {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        speed: 14,
        bounciness: 10,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.shareBtn}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ── Facebook F icon (pure RN) ── */
const FbIcon = () => (
  <View style={[styles.iconBox, { backgroundColor: '#3b5998' }]}>
    <Text style={styles.fbText}>f</Text>
  </View>
);

/* ── WhatsApp icon (pure RN) ── */
const WaIcon = () => (
  <View style={[styles.iconBox, { backgroundColor: '#25D366' }]}>
    <View style={styles.waCircle}>
      <Text style={styles.waText}>✆</Text>
    </View>
  </View>
);

/* ── SMS icon (pure RN) ── */
const SmsIcon = () => (
  <View style={[styles.iconBox, { backgroundColor: '#29A8E0' }]}>
    <Text style={styles.smsText}>SMS</Text>
  </View>
);

/* ── Screen ── */
function InviteScreen(props: any) {
  const { navigation } = props;
  const { width } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async (platform: string) => {
    const referralCode = customerData?.ReferralCode || 'N/A';
    const shareMessage = `Future Believe - Build your network using my Referral id: ${referralCode}\n\nDownload the app here: https://tinyurl.com/yyc9kd4m`;

    try {
      if (platform === 'whatsapp') {
        const nativeUrl = `whatsapp://send?text=${encodeURIComponent(
          shareMessage,
        )}`;
        try {
          await Linking.openURL(nativeUrl);
          return;
        } catch (err) {
          const webUrl = `https://wa.me/?text=${encodeURIComponent(
            shareMessage,
          )}`;
          await Linking.openURL(webUrl);
          return;
        }
      } else if (platform === 'sms') {
        const separator = Platform.OS === 'ios' ? '&' : '?';
        const url = `sms:${separator}body=${encodeURIComponent(shareMessage)}`;
        await Linking.openURL(url);
        return;
      } else if (platform === 'facebook') {
        // Facebook sharer URL. Note: FB doesn't allow pre-filling text messages via URL scheme.
        // It only allows sharing a URL.
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          'https://tinyurl.com/yyc9kd4m',
        )}`;
        await Linking.openURL(fbUrl);
        return;
      }

      // Fallback for Facebook and others
      await Share.share({
        message: shareMessage,
        title: 'Invite & Score',
      });
    } catch (e) {
      console.log('Share error, trying fallback:', e);
      try {
        await Share.share({
          message: shareMessage,
          title: 'Invite & Score',
        });
      } catch (finalError) {
        console.error('Sharing failed completely', finalError);
      }
    }
  };

  const [customerData, setCustomerData] = useState<any | []>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await fetchMyProfile();
      setCustomerData(profile);
    } catch (error) {
      console.log('Error in loadData:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" hidden={false} backgroundColor="#2a2c40" translucent />
      <SafeAreaView edges={["left", "right",]} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <ChevronLeftIcon />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Invite</Text>
          </View>
        </View>

        {/* Background blobs */}
        {/* <Blob color="#FF6B9D" size={90} top={60} left={-30} opacity={0.28} />
        <Blob color="#C084FC" size={120} top={20} right={-40} opacity={0.22} />
        <Blob color="#FBBF24" size={40} top={180} left={60} opacity={0.35} />
        <Blob color="#F472B6" size={28} top={500} left={30} opacity={0.55} />
        <Blob color="#F9A8D4" size={22} top={520} right={60} opacity={0.6} />
        <Blob color="#93C5FD" size={26} bottom={220} left={40} opacity={0.5} />
        <Blob
          color="#F9A8D4"
          size={80}
          bottom={140}
          left={width / 2 - 40}
          opacity={0.3}
        /> */}
        <ImageBackground
          source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{ resizeMode: "cover", alignSelf: "flex-end" }}
          style={styles.bakcgroundImage}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.content,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Illustration */}
              <EnvelopeIllustration />

              {/* Ref ID */}
              <Text style={styles.refId}>{customerData?.ReferralCode}</Text>

              {/* Description */}
              <Text style={styles.description}>
                Invite with your friends and get{'\n'}
                <Text style={styles.bonusText}>50 Bonus points</Text>
              </Text>

              {/* Share buttons */}
              <View style={styles.shareBtnRow}>
                <ShareBtn
                  label="Facebook"
                  bgColor="#3b5998"
                  icon={<FbIcon />}
                  onPress={() => handleShare('facebook')}
                  delay={200}
                />
                <ShareBtn
                  label="WhatsApp"
                  bgColor="#25D366"
                  icon={<WaIcon />}
                  onPress={() => handleShare('whatsapp')}
                  delay={320}
                />
                <ShareBtn
                  label="SMS"
                  bgColor="#29A8E0"
                  icon={<SmsIcon />}
                  onPress={() => handleShare('sms')}
                  delay={440}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

export default InviteScreen;
