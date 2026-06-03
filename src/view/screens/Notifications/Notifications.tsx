
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  ImageBackground,
} from 'react-native';
import styles, { } from './NotificationsStyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getData, postData } from '../../../shared/services/main-service';
import { ChevronLeftIcon } from '../../assets/images/svg/Svg2/ChevronLeftIcon';
import { THEME } from '../../assets/styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';


// ─── Icon Components (pure RN, no external deps) ─────────────────────────────
const ScoreIcon = () => (
  <View style={styles.iconWrapper}>
    <View style={[styles.iconBg, { backgroundColor: `${THEME.COLOR.bgPurple}18` }]}>
      <Text style={styles.iconEmoji}>⚡</Text>
    </View>
  </View>
);

const ReferralIcon = () => (
  <View style={styles.iconWrapper}>
    <View style={[styles.iconBg, { backgroundColor: `${THEME.COLOR.textSuccess}18` }]}>
      <Text style={styles.iconEmoji}>👥</Text>
    </View>
  </View>
);

const AchievementIcon = () => (
  <View style={styles.iconWrapper}>
    <View style={[styles.iconBg, { backgroundColor: `${THEME.COLOR.warning}28` }]}>
      <Text style={styles.iconEmoji}>🏆</Text>
    </View>
  </View>
);

const typeIcon = (type: string) => {
  if (type === 'referral') return <ReferralIcon />;
  if (type === 'achievement') return <AchievementIcon />;
  return <ScoreIcon />;
};

const scorePillColor = (type: string) => {
  if (type === 'referral') return THEME.COLOR.textSuccess;
  if (type === 'achievement') return THEME.COLOR.warning;
  return THEME.COLOR.bgPurple;
};

// ─── Swipeable Notification Card ─────────────────────────────────────────────
interface NotificationItem {
  Id: number;
  UserId: number;
  Message: string;
  Viewed: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}



const NotificationCard = ({
  item,
  onDelete
}: {
  item: NotificationItem;
  onDelete: (id: number) => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (!item.Viewed) {
      postData(`/Videos/Notifications/Read/${item.Id}`, {})
        .then(res => console.log(`Marked as read: ${item.Id}`, res))
        .catch(err => console.log(`Error marking read: ${item.Id}`, err));
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'ScoreHistory' }],
    });
  };

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 120, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => onDelete(item.Id));
  };

  const getIconType = () => {
    const lowerMsg = (item.Message || '').toLowerCase();
    if (lowerMsg.includes('refer')) return 'referral';
    if (lowerMsg.includes('point')) return 'score_daily';
    return 'achievement';
  };

  const getTitle = () => {
    const type = getIconType();
    if (type === 'referral') return 'Referral Bonus';
    if (type === 'achievement') return 'System Notification';
    return 'Score Earned!';
  };

  const getScore = () => {
    const match = (item.Message || '').match(/(\d+)\s+points?/i);
    return match ? parseInt(match[1], 10) : null;
  };

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    if (diff < 0) return 'Just now';
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const iconType = getIconType();
  const title = getTitle();
  const score = getScore();
  const timeStr = getTimeAgo(item.CreatedAt);

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.card} onPress={handlePress}>

        <View style={styles.cardInner}>
          {typeIcon(iconType)}

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {title}
              </Text>
              {score !== null && (
                <View style={[styles.scorePill, { backgroundColor: scorePillColor(iconType) }]}>
                  <Text style={styles.scorePillText}>+{score} pts</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardBody} numberOfLines={2}>
              {item.Message}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardTime}>{timeStr}</Text>
              {/* <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <View style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </View>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Header Component ─────────────────────────────────────────────────────────
const Header = () => {
  const navigation = useNavigation<any>();

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
      </View>
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyEmoji}>🔔</Text>
    <Text style={styles.emptyTitle}>No notifications yet</Text>
    <Text style={styles.emptyBody}>When you earn scores or get referral bonuses, they'll show up here.</Text>
  </View>
);



// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const route = useRoute<any>();
  const [Notification, setNotification] = useState<NotificationItem[]>(
    route.params?.notifications || []
  );

  useEffect(() => {
    if (route.params?.notifications) {
      setNotification(route.params.notifications);
    }
  }, [route.params?.notifications]);

  const handleDelete = (id: number) => {
    setNotification((prev) => prev.filter((n) => n.Id !== id));
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <NotificationCard
        item={item}
        onDelete={handleDelete}
      />
    );
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
        <Header />
        <ImageBackground
          source={require("../../assets/images/login-bg.jpg")}
          imageStyle={{ resizeMode: "cover", alignSelf: "flex-end" }}
          style={styles.bakcgroundImage}
        >
          {Notification?.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              data={Notification}
              keyExtractor={(item) => item.Id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}
