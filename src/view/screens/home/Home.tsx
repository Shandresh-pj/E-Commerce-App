import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
} from 'react-native';
import { useTabBar } from '../../../shared/context/TabBarContext';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { THEME } from '../../assets/styles/theme';
import { getData, fetchMyProfile } from '../../../shared/services/main-service';
import { useFocusEffect, DrawerActions } from '@react-navigation/native';
import UserIcon from '../../assets/images/svg/user-bar.svg';
import ViewScoreIconSvg from '../../assets/images/svg/view-score.svg';
import MyNetworkIconSvg from '../../assets/images/svg/my-network.svg';
import LearnScoreIconSvg from '../../assets/images/svg/learn-score.svg';
import InviteIconSvg from '../../assets/images/svg/invite.svg';
import ProfileIconSvg from '../../assets/images/svg/Profile.svg';
import IncomePlanSvg from '../../assets/images/svg/IncomePlan.svg';
import SupportSvg from '../../assets/images/svg/Support.svg';
import ContestIconSvg from '../../assets/images/svg/Contest.svg';
import MyScoreIconSvg from '../../assets/images/svg/my-score.svg';
import CartIconSvg from '../../assets/images/svg/my-shop.svg';
import ClipboardTaskIcon from '../../assets/images/svg/Svg2/ClipboardTaskIcon';
import VideoUploadIcon from '../../assets/images/svg/Svg2/VideoUploadIcon';
const BellIcon = () => (
  <Svg height="22" width="22" viewBox="0 0 24 24">
    <Path
      d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V10c0-3.07-1.63-5.64-4.5-6.32V3a1.5 1.5 0 00-3 0v.68C7.64 4.36 6 6.92 6 10v6l-2 2v1h16v-1l-2-2z"
      fill="#fff"
    />
  </Svg>
);

const HomeTabIcon = ({ active }: { active?: boolean }) => (
  <Svg height="20" width="20" viewBox="0 0 24 24">
    <Path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={active ? '#E91E63' : '#2a2c40'}
    />
  </Svg>
);

const DashboardTabIcon = ({ active }: { active?: boolean }) => (
  <Svg height="20" width="20" viewBox="0 0 24 24">
    <Rect
      x="3"
      y="3"
      width="8"
      height="8"
      rx="1"
      fill={active ? '#E91E63' : '#2a2c40'}
    />
    <Rect
      x="13"
      y="3"
      width="8"
      height="8"
      rx="1"
      fill={active ? '#E91E63' : '#2a2c40'}
    />
    <Rect
      x="3"
      y="13"
      width="8"
      height="8"
      rx="1"
      fill={active ? '#E91E63' : '#2a2c40'}
    />
    <Rect
      x="13"
      y="13"
      width="8"
      height="8"
      rx="1"
      fill={active ? '#E91E63' : '#2a2c40'}
    />
  </Svg>
);

const NetworkTabIcon = ({ active }: { active?: boolean }) => (
  <Svg height="20" width="20" viewBox="0 0 24 24">
    <Path
      d="M3.5 18.5l6-6 4 4L22 6.92"
      stroke={active ? '#E91E63' : '#2a2c40'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// ─── Types ─────────────────────────────────────────────────────────────────────
interface TaskRow {
  label: string;
  today: number | string;
  total: number | string;
}

interface UserInfo {
  name: string;
  referCode: string;
  availablePoints: number;
}

interface DownlineItem {
  Level: number;
  EarnedPoints: number;
}

interface NetworkItem {
  id: string;
  name: string;
  refId: string;
  isTop: boolean;
}

// ─── Dashboard Sub-Components ──────────────────────────────────────────────────
const LevelCard = ({ item, index }: { item: DownlineItem; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: 300 + index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay: 300 + index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const hasScore = item.EarnedPoints > 0;
  const { width } = Dimensions.get('window');
  const CARD_W = (width - 32 - 12) / 2;

  return (
    <Animated.View
      style={[
        dashStyles.levelCard,
        hasScore && dashStyles.levelCardActive,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          width: CARD_W,
        },
      ]}
    >
      <View
        style={[
          dashStyles.levelCardBar,
          hasScore && dashStyles.levelCardBarActive,
        ]}
      />
      <View style={dashStyles.levelCardContent}>
        <View style={dashStyles.levelBadge}>
          <Text style={dashStyles.levelBadgeText}>LVL</Text>
          <Text
            style={[
              dashStyles.levelBadgeNumber,
              hasScore && dashStyles.levelBadgeNumberActive,
            ]}
          >
            {item.Level}
          </Text>
        </View>
        <Text
          style={[
            dashStyles.levelScore,
            hasScore && dashStyles.levelScoreActive,
          ]}
        >
          {item.EarnedPoints}
        </Text>
        <Text style={dashStyles.levelScoreLabel}>
          {hasScore ? 'points' : 'no activity'}
        </Text>
      </View>
      {hasScore && <View style={dashStyles.activeDot} />}
    </Animated.View>
  );
};

const ScoreRing = ({ totalScore }: { totalScore: number }) => {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        dashStyles.scoreRingWrapper,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={dashStyles.scoreRingOuter}>
        <View style={dashStyles.scoreRingMiddle}>
          <View style={dashStyles.scoreRingInner}>
            <Text style={dashStyles.scoreLabel}>Total Score</Text>
            <Text style={dashStyles.scoreEarned}>Earned</Text>
            <View style={dashStyles.scoreDivider} />
            <Text style={dashStyles.scoreValue}>
              {totalScore ? totalScore.toLocaleString() : 0}
            </Text>
            <Text style={dashStyles.scoreUnit}>pts</Text>
          </View>
        </View>
      </View>
      <View style={[dashStyles.ringDot, dashStyles.ringDotTop]} />
      <View style={[dashStyles.ringDot, dashStyles.ringDotLeft]} />
      <View style={[dashStyles.ringDot, dashStyles.ringDotRight]} />
    </Animated.View>
  );
};

// ─── Dashboard Tab Content ─────────────────────────────────────────────────────
const DashboardContent = ({ activeTab }: { activeTab: string }) => {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [networkDownline, setNetworkDownline] = useState<DownlineItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const { showTabBar, hideTabBar } = useTabBar();
  const scrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > scrollY.current && currentScrollY > 50) {
      hideTabBar();
    } else if (currentScrollY < scrollY.current) {
      showTabBar();
    }
    scrollY.current = currentScrollY;
  };

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchDownline = useCallback(async () => {
    try {
      const response = await getData('/Network/Downline');
      if (response && response.data) {
        setNetworkDownline(response.data.data || []);
        setTotalPoints(response.data.TotalPoints || 0);
      }
    } catch (error) {
      console.log('DashboardContent error', error);
    }
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab === 'DASHBOARD') {
      fetchDownline();
    }
  }, [activeTab, fetchDownline]);

  // Fetch when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'DASHBOARD') {
        fetchDownline();
      }
    }, [activeTab, fetchDownline])
  );

  const totalLevels = networkDownline.length;

  return (
    <ScrollView
      style={dashStyles.scroll}
      contentContainerStyle={dashStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {/* Score Ring */}
      <View style={dashStyles.scoreSection}>
        <ScoreRing totalScore={totalPoints} />
        <Text style={dashStyles.scoreSectionCaption}>
          Your cumulative network earnings
        </Text>
      </View>

      {/* Level pill */}
      <View style={dashStyles.levelPillRow}>
        <View style={dashStyles.levelPill}>
          <Text style={dashStyles.levelPillLabel}>LEVEL</Text>
          <Text style={dashStyles.levelPillValue}>
            {totalLevels ? totalLevels : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Section Header */}
      <Animated.View
        style={[dashStyles.sectionHeader, { opacity: headerAnim }]}
      >
        <Text style={dashStyles.sectionTitle}>Level Breakdown</Text>
        <View style={dashStyles.sectionLine} />
        <Text style={dashStyles.sectionSubtitle}>Points earned per level</Text>
      </Animated.View>

      {/* Level Grid */}
      <View style={dashStyles.grid}>
        {networkDownline.map((item, index) => (
          <LevelCard key={item.Level} item={item} index={index} />
        ))}
      </View>
    </ScrollView>
  );
};

// ─── MyNetwork Tab Content ─────────────────────────────────────────────────────
const NetworkCard = ({ item, index }: { item: NetworkItem; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isTop = item.isTop;

  return (
    <Animated.View
      style={[
        netStyles.cardWrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[netStyles.card, isTop && netStyles.cardHighlighted]}>
        <View style={[netStyles.badge, isTop && netStyles.badgeHighlighted]}>
          <Text style={netStyles.badgeNumber}>{item.id}</Text>
        </View>
        <View style={netStyles.cardInfo}>
          <Text
            style={[netStyles.cardName, isTop && netStyles.cardNameHighlighted]}
          >
            {item.name}
          </Text>
          {/* <View style={netStyles.refRow}>
            <View style={netStyles.refDot} />
            <Text style={netStyles.refId}>Ref ID: {item.refId}</Text>
          </View> */}
        </View>
        <View style={netStyles.chainIcon}>
          <View style={netStyles.chainNodeOuter}>
            <View style={netStyles.chainNodeInner} />
          </View>
          <View style={netStyles.chainLine} />
          <View style={[netStyles.chainNodeOuter, netStyles.chainNodeBottom]}>
            <View style={netStyles.chainNodeInner} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const MyNetworkContent = ({ activeTab }: { activeTab: string }) => {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [networkList, setNetworkList] = useState<NetworkItem[]>([]);
  const { showTabBar, hideTabBar } = useTabBar();
  const scrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > scrollY.current && currentScrollY > 50) {
      hideTabBar();
    } else if (currentScrollY < scrollY.current) {
      showTabBar();
    }
    scrollY.current = currentScrollY;
  };

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchNetwork = useCallback(async () => {
    try {
      const response = await getData('/Network/Upline');
      console.log('logDownline', response);

      if (response.status) {
        const mapped = response.data?.data?.map((item: any, index: number) => {
          // Construct full name from FirstName and LastName with fallbacks
          const fullName = item.FirstName
            ? `${item.FirstName}${item.LastName ? ' ' + item.LastName : ''}`
            : item.Name ?? item.FullName ?? item.UserName ?? 'Unknown';

          return {
            id: String(response.data?.data?.length - index),
            name: fullName,
            refId:
              item.ReferralCode ??
              item.ReferralId ??
              item.RefId ??
              item.ReferenceId ??
              '',
            isTop: index === 0,
          };
        });
        setNetworkList(mapped ?? []);
      }
    } catch (error) {
      console.log('MyNetworkContent error', error);
    }
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab === 'MY NETWORK') {
      fetchNetwork();
    }
  }, [activeTab, fetchNetwork]);

  // Fetch when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'MY NETWORK') {
        fetchNetwork();
      }
    }, [activeTab, fetchNetwork])
  );

  return (
    <View style={netStyles.container}>
      <FlatList
        ListHeaderComponent={
          <Animated.View
            style={[
              netStyles.header2,
              {
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={netStyles.headerEyebrow}>NETWORK CHAIN</Text>
            <Text style={netStyles.headerTitle2}>
              Your Upliner Lineage
            </Text>
            <View style={netStyles.headerDivider} />
            <Text style={netStyles.headerSubtitle}>
              Showing your last 6 upliners in the network
            </Text>
          </Animated.View>
        }
        data={networkList}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <NetworkCard item={item} index={index} />
        )}
        contentContainerStyle={netStyles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};

let isReturningFromNotifications = false;

// ─── Main Component ────────────────────────────────────────────────────────────
function Home(props: any) {
  const { navigation } = props;
  const { width: windowWidth } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'HOME' | 'DASHBOARD' | 'MY NETWORK'
  >('HOME');
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    referCode: '',
    availablePoints: 0,
  });
  const [taskData, setTaskData] = useState<TaskRow[]>([]);

  const { showTabBar, hideTabBar } = useTabBar();
  const scrollY = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  const notifBadgeStyle: any = {
    position: 'absolute',
    top: -15,
    right: -15,
    backgroundColor: '#dd4f4f',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.COLOR.bgPurple,
  };

  const notifTextStyle: any = {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY > scrollY.current && currentScrollY > 50) {
      hideTabBar();
    } else if (currentScrollY < scrollY.current) {
      showTabBar();
    }
    scrollY.current = currentScrollY;
  };

  const handleTabPress = (tab: 'HOME' | 'DASHBOARD' | 'MY NETWORK') => {
    setActiveTab(tab);
    const index = tab === 'HOME' ? 0 : tab === 'DASHBOARD' ? 1 : 2;
    scrollRef.current?.scrollTo({ x: index * windowWidth, animated: true });
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / windowWidth);
    const tabs: ('HOME' | 'DASHBOARD' | 'MY NETWORK')[] = [
      'HOME',
      'DASHBOARD',
      'MY NETWORK',
    ];
    if (tabs[index] !== activeTab) {
      setActiveTab(tabs[index]);
    }
  };

  const cardWidth = (windowWidth - 48) / 2;

  // ── Grid menu items ──────────────────────────────────────────────────────────
  const menuItems = [
    {
      id: '1',
      title: 'View & Score',
      icon: <ViewScoreIconSvg width={60} height={60} />,
      link: 'Ads',
      bg: '#f5f5f5',
    },
        {
      id: '2',
      title: 'Learn & Score',
      icon: <LearnScoreIconSvg width={60} height={60} />,
      link: 'LearnEarn',
      bg: '#f5f5f5',
    },
    {
      id: '3',
      title: 'Compete & Score',
      icon: <ContestIconSvg width={60} height={60} />,
      link: 'Compete',
      bg: '#f5f5f5',
    },
     {
      id: '4',
      title: 'ParTake & Score',
      icon: <VideoUploadIcon size={45} color="#E91E63" />,
      link: 'ParTake',
      bg: '#f5f5f5',
    },
    {
      id: '5',
      title: 'My Services',
      icon: <CartIconSvg width={60} height={60} />,
      link: 'ServicesList',
      bg: '#f5f5f5',
    },
    {
      id: '6',
      title: 'Shop & Score',
      icon: <MyScoreIconSvg width={60} height={60} />,
      link: 'ProductList',
      bg: '#f5f5f5',
    },
     {
      id: '7',
      title: 'My Survey',
      icon: <ClipboardTaskIcon size={45} color="#E91E63" />,
      link: 'MySurvey',
      bg: '#f5f5f5',
    },
    {
      id: '8',
      title: 'My Network',
      icon: <MyNetworkIconSvg width={60} height={60} />,
      link: 'MyNetwork',
      bg: '#f5f5f5',
    },
    {
      id: '9',
      title: 'Invite & Score',
      icon: <InviteIconSvg width={60} height={60} />,
      link: 'Invite',
      bg: '#f5f5f5',
    },
    {
      id: '10',
      title: 'My Profile',
      icon: <ProfileIconSvg width={60} height={60} />,
      link: 'Profile',
      bg: '#f5f5f5',
    },
    {
      id: '11',
      title: 'My Scores',
      icon: <IncomePlanSvg width={60} height={60} />,
      link: 'ScoreHistory',
      bg: '#f5f5f5',
    },
    {
      id: '12',
      title: 'Support',
      icon: <SupportSvg width={60} height={60} />,
      link: 'ContactUs',
      bg: '#f5f5f5',
    },
  
   
  ];

  // ── Fetch notifications ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getData(`/Videos/Notifications/All`);
      console.log("API NOTIFICATION RESPONSE",response);
      if (response?.status) {
        const list = response?.data?.data || [];
        setNotificationsList(list);
        setNotificationCount(list.length);
      }
    } catch (error) {
      console.log('Notification fetch error', error);
    }
  }, []);

  // ── Fetch home data (tasks + user) ───────────────────────────────────────────
  const fetchHomeData = useCallback(async () => {
    try {
      // Fetch current user profile from API for accurate data
      const profileData = await fetchMyProfile();

      let fullName = '';
      let refCode = '';
      if (profileData) {
        fullName = profileData.FirstName
          ? `${profileData.FirstName}${profileData.LastName ? ' ' + profileData.LastName : ''
          }`
          : '';
        refCode = profileData.ReferralCode || '';
        setUserInfo(prev => ({ ...prev, name: fullName, referCode: refCode }));
      }

      const response = await getData(`/Videos/Points/Summary`);
      console.log("API RESPONSE",response);
      console.log(JSON.stringify(response, null, 2));
      
      if (response?.data?.data) {
        const d = response.data.data;
        const availablePoints = d.AvailablePoints ?? 0;
        setUserInfo(prev => ({ ...prev, availablePoints }));
        
        const summary: Array<{ Task: string; Today: number; Total: number }> =
          d.Summary || [];

        const formattedTasks = summary
          .filter(
            item =>
              item.Task &&
              item.Task !== 'Shop & Score' &&
              !item.Task.toLowerCase().includes('joining')
          )
          .map(item => ({
            label: item.Task,
            today: item.Today ?? 0,
            total: item.Total ?? 0,
          }));

        setTaskData(formattedTasks);
      }
    } catch (error) {
      console.log('Home data error', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab === 'HOME') {
      fetchHomeData();
    }
  }, [activeTab, fetchHomeData]);

  // Fetch when screen gains focus (always update points/summary and notifications)
  useFocusEffect(
    useCallback(() => {
      if (isReturningFromNotifications) {
        isReturningFromNotifications = false;
      } else {
        fetchNotifications();
      }
      fetchHomeData();
    }, [fetchHomeData, fetchNotifications])
  );

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor='#2a2c40'
        translucent
      />
      <SafeAreaView edges={['left', 'right']} style={hstyles.container}>
        {/* ── App Header ── */}
        <View style={hstyles.header}>
          <TouchableOpacity
            style={hstyles.backBtn}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <UserIcon />
          </TouchableOpacity>

          <Text style={[hstyles.topBarTitle]}>FUTURE BELIEVE</Text>

          <TouchableOpacity
            style={[
              hstyles.menuTopBtn,
              {
                paddingHorizontal: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
            onPress={() => {
              isReturningFromNotifications = true;
              navigation.navigate('Notifications' as any, { notifications: notificationsList });
            }}
          >
            <View>
              <BellIcon />
              <View style={notifBadgeStyle}>
                <Text style={notifTextStyle}>{notificationCount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Horizontal Tab Bar ── */}
        <View style={styles.tabBar}>
          {(['HOME', 'DASHBOARD', 'MY NETWORK'] as const).map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => handleTabPress(tab)}
                activeOpacity={0.8}
              > 
                <View style={styles.tabIcon}>
                  {tab === 'HOME' && <HomeTabIcon active={isActive} />}
                  {tab === 'DASHBOARD' && (
                    <DashboardTabIcon active={isActive} />
                  )}
                  {tab === 'MY NETWORK' && <NetworkTabIcon active={isActive} />}
                </View>
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Tab Content ── */}
        <ImageBackground
          source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{ resizeMode: "cover", }}
          style={styles.bakcgroundImage}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScrollEndDrag={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            style={styles.horizontalScroll}
            contentContainerStyle={{ width: windowWidth * 3 }}
          >

            {/* HOME Tab */}
            <View style={{ width: windowWidth }}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color='#fff' />
                </View>
              ) : (
                <ScrollView
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  {/* ── User Card ── */}
                  <View style={styles.userCard}>
                    <Text style={styles.userCardName}>
                      {userInfo.name || 'User'}
                    </Text>
                    <Text style={styles.userCardRefer}>
                      Refer ID:{userInfo.referCode || 'N/A'}
                    </Text>
                  </View>

                  {/* ── Task Table ── */}
                  <View style={styles.taskTableContainer}>
                    {/* <Text style={styles.taskTableTitle}>todaytaskListing</Text> */}
                    <View style={styles.taskHeaderRow}>
                      <Text style={[styles.taskHeaderCell, { flex: 2 }]}>
                        Tasks
                      </Text>
                      <Text
                        style={[
                          styles.taskHeaderCell,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        Today
                      </Text>
                      <Text
                        style={[
                          styles.taskHeaderCell,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        Total
                      </Text>
                    </View>
                    {taskData.map((row, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.taskDataRow,
                          idx % 2 === 0 && styles.taskDataRowAlt,
                        ]}
                      >
                        <Text style={[styles.taskDataCell, { flex: 2 }]}>
                          {row.label}
                        </Text>
                        <Text
                          style={[
                            styles.taskDataCell,
                            { flex: 1, textAlign: 'center' },
                          ]}
                        >
                          {row.today}
                        </Text>
                        <Text
                          style={[
                            styles.taskDataCell,
                            { flex: 1, textAlign: 'center' },
                          ]}
                        >
                          {row.total}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* ── Menu Grid ── */}
                  <View style={styles.gridContainer}>
                    {menuItems.map((item, idx) => {
                      const isLastAndOdd =
                        menuItems.length % 2 !== 0 &&
                        idx === menuItems.length - 1;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.gridCard,
                            { width: cardWidth, backgroundColor: item.bg },
                            isLastAndOdd && { alignSelf: 'flex-start' },
                          ]}
                          onPress={() => navigation.navigate(item.link as never)}
                          activeOpacity={0.85}
                        >
                          <View style={styles.gridIconArea}>{item.icon}</View>
                          <View style={styles.gridLabelArea}>
                            <Text style={styles.gridLabel}>{item.title}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* DASHBOARD Tab */}
            <View style={{ width: windowWidth }}>
              <DashboardContent activeTab={activeTab} />
            </View>

            {/* MY NETWORK Tab */}
            <View style={{ width: windowWidth }}>
              <MyNetworkContent activeTab={activeTab} />
            </View>

          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

// ─── Home Styles ───────────────────────────────────────────────────────────────
const hstyles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
  },
  header: {
    paddingVertical: 15,
    elevation: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2c40',
    paddingHorizontal: 15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  menuTopBtn: {
    backgroundColor: THEME.COLOR.bgHalfWhite,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    fontFamily: THEME.FONTWEIGHT.Medium,
    borderRadius: 100,
    marginLeft: 8,
    height: 45,
    width: 45,
    paddingHorizontal: 15,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.COLOR.bgHalfWhite,
  },

  // ── App Header ──────────────────────────────────────────────────────────────
  header: {
    paddingVertical: 15,
    elevation: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2c40',
    paddingHorizontal: 15,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconBox: {
    marginRight: 6,
  },
  logoTextFuture: {
    fontSize: 18,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textWhite,
    letterSpacing: 1,
  },
  logoTextBelieve: {
    fontSize: 18,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#E91E63',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E91E63',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A0A2E',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },

  // ── Horizontal Tab Bar ──────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ebebeb',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#E91E63',
  },
  tabIcon: {
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: THEME.FONTWEIGHT.Medium,
    color: '#2a2c40',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#E91E63',
    fontFamily: THEME.FONTWEIGHT.Bold,
  },

  // ── Loading ──────────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent'
    //backgroundColor: THEME.COLOR.bgHalfWhite,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  horizontalScroll: {
    flex: 1,
  },
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  // ── Announcement Bar ─────────────────────────────────────────────────────────
  announcementBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  announcementText: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: '#424242',
  },

  // ── User Card ────────────────────────────────────────────────────────────────
  userCard: {
    margin: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  userCardName: {
    fontSize: 16,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#2a2c40',
  },
  userCardRefer: {
    fontSize: 14,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#2a2c40',
  },

  // ── Task Table ───────────────────────────────────────────────────────────────
  taskTableContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  taskTableTitle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: '#757575',
    backgroundColor: '#fff',
  },
  taskHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  taskHeaderCell: {
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: '#fff',
  },
  taskDataRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.bgHalfWhite,
  },
  taskDataRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  taskDataCell: {
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: '#424242',
  },

  // ── Menu Grid ────────────────────────────────────────────────────────────────
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  gridCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    minHeight: 140,
  },
  gridIconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 100,
  },
  gridLabelArea: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 13,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textBlack,
    textAlign: 'center',
  },
});

// ─── Dashboard Inline Styles ───────────────────────────────────────────────────
const DEEP_BG = '#3D1A52';
const RING_OUTER = THEME.COLOR.bgPurple;
const RING_MID = '#ebebeb';

const dashStyles = StyleSheet.create({
  scroll: { flex: 1, },
  scrollContent: { paddingBottom: 48 },
  scoreSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
  scoreRingWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  scoreRingOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: RING_OUTER,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.COLOR.bgPurple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  scoreRingMiddle: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: RING_MID,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingInner: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.COLOR.bgPurple,
    letterSpacing: 0.3,
  },
  scoreEarned: {
    fontSize: 11,
    color: THEME.COLOR.textDarkGrey,
    marginBottom: 4,
  },
  scoreDivider: {
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: THEME.COLOR.bgPurple,
    marginBottom: 4,
    opacity: 0.35,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: '900',
    color: THEME.COLOR.textBlack,
    lineHeight: 34,
    letterSpacing: -1,
  },
  scoreUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.COLOR.textDarkGrey,
    letterSpacing: 1,
  },
  ringDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  ringDotTop: { top: 2 },
  ringDotLeft: { left: 2 },
  ringDotRight: { right: 2 },
  scoreSectionCaption: {
    marginTop: 14,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  levelPillRow: { alignItems: 'center', marginVertical: 10 },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.COLOR.bgPurple,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  levelPillLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.65)',
  },
  levelPillValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 22,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sectionSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },

  levelCard: {
    minHeight: 130,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  levelCardActive: {
    backgroundColor: 'rgba(97,44,126,0.45)',
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: THEME.COLOR.bgPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  levelCardBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)' },
  levelCardBarActive: { backgroundColor: THEME.COLOR.warning },
  levelCardContent: {
    padding: 16,
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'space-between',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 12,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.4)',
  },
  levelBadgeNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 30,
  },
  levelBadgeNumberActive: { color: '#fff' },
  levelScore: {
    fontSize: 32,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 36,
    letterSpacing: -1,
  },
  levelScoreActive: { color: THEME.COLOR.warning },
  levelScoreLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  activeDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.COLOR.textSuccess,
    elevation: 4,
  },
});

// ─── MyNetwork Inline Styles ───────────────────────────────────────────────────
const netStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparnt',
    overflow: 'hidden',
  },
  bgAccentTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(97, 44, 126, 0.05)',
  },
  bgAccentBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(252, 206, 3, 0.05)',
  },
  header2: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  headerEyebrow: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#fff',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  headerTitle2: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerDivider: {
    width: 40,
    height: 3,
    backgroundColor: THEME.COLOR.warning,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 13,
    color: THEME.COLOR.textDarkGrey,
    lineHeight: 20,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  cardWrapper: { marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  cardHighlighted: {
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderColor: THEME.COLOR.bgPurple,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeHighlighted: {
    backgroundColor: THEME.COLOR.btnGrey,
    borderColor: THEME.COLOR.bgPurple,
  },
  badgeNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.COLOR.bgPurple,
    lineHeight: 26,
  },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.COLOR.textBlack,
    marginBottom: 5,
    letterSpacing: 0.1,
  },
  cardNameHighlighted: { color: THEME.COLOR.bgPurple },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  refDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.COLOR.textSuccess,
  },
  refId: { fontSize: 12, color: THEME.COLOR.textDarkGrey, letterSpacing: 0.5 },
  chainIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    marginLeft: 10,
  },
  chainNodeOuter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: THEME.COLOR.textDarkGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainNodeBottom: { borderColor: THEME.COLOR.bgPurple },
  chainNodeInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.COLOR.bgPurple,
  },
  chainLine: {
    width: 1.5,
    height: 12,
    backgroundColor: THEME.COLOR.textDarkGrey,
  },

});

export default Home;
