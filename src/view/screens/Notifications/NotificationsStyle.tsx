import { StyleSheet, Dimensions, Platform } from 'react-native';
import { THEME } from '../../assets/styles/theme';

const styles = StyleSheet.create({
  bakcgroundImage: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  container: { flex: 1, },
  header: {
    backgroundColor: '#2a2c40',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: THEME.COLOR.textWhite,
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
    marginLeft: 15,
  },
  backBtn: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  headerRight: { width: 45 },

  // Section Labels
  listContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    padding: 16,
    paddingLeft: 20,
    gap: 12,
    alignItems: 'flex-start',
  },

  // Icon
  iconWrapper: { paddingTop: 2 },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 18 },

  // Card Content
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  scorePillText: {
    color: THEME.COLOR.textWhite,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardBody: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 19,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTime: {
    fontSize: 11,
    color: THEME.COLOR.bgGrey,
    fontWeight: '500',
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: THEME.COLOR.btnGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 21,
  },
});

export default styles;
