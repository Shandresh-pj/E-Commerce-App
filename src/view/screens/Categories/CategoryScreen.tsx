import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { THEME } from '../../assets/styles/theme'

const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 48) / 3

export const CATEGORIES = [
  {
    id: '1',
    name: 'Fruits & Vegetables',
    icon: '🥦',
    itemCount: 120,
    bgColor: '#E8F5E9',
    iconBg: '#A5D6A7',
    subCategories: ['Fresh Fruits', 'Fresh Vegetables', 'Herbs & Seasonings', 'Organic'],
  },
  {
    id: '2',
    name: 'Dairy & Breakfast',
    icon: '🥛',
    itemCount: 85,
    bgColor: '#E3F2FD',
    iconBg: '#90CAF9',
    subCategories: ['Milk', 'Curd & Buttermilk', 'Cheese', 'Eggs', 'Bread & Pav'],
  },
  {
    id: '3',
    name: 'Snacks & Munchies',
    icon: '🍿',
    itemCount: 200,
    bgColor: '#FFF8E1',
    iconBg: '#FFE082',
    subCategories: ['Chips & Crisps', 'Namkeen', 'Popcorn', 'Biscuits & Cookies', 'Energy Bars'],
  },
  {
    id: '4',
    name: 'Cold Drinks & Juices',
    icon: '🧃',
    itemCount: 95,
    bgColor: '#FCE4EC',
    iconBg: '#F48FB1',
    subCategories: ['Soft Drinks', 'Fruit Juices', 'Energy Drinks', 'Water', 'Health Drinks'],
  },
  {
    id: '5',
    name: 'Instant & Frozen',
    icon: '🍜',
    itemCount: 110,
    bgColor: '#EDE7F6',
    iconBg: '#CE93D8',
    subCategories: ['Instant Noodles', 'Frozen Snacks', 'Ready Meals', 'Pasta & Soups'],
  },
  {
    id: '6',
    name: 'Tea, Coffee & More',
    icon: '☕',
    itemCount: 68,
    bgColor: '#EFEBE9',
    iconBg: '#BCAAA4',
    subCategories: ['Tea', 'Coffee', 'Health Drinks', 'Milk Additives'],
  },
  {
    id: '7',
    name: 'Bakery & Biscuits',
    icon: '🍞',
    itemCount: 75,
    bgColor: '#FFF3E0',
    iconBg: '#FFCC80',
    subCategories: ['Bread', 'Biscuits', 'Cakes & Pastries', 'Rusk & Khari'],
  },
  {
    id: '8',
    name: 'Atta, Rice & Dal',
    icon: '🌾',
    itemCount: 130,
    bgColor: '#F9FBE7',
    iconBg: '#DCE775',
    subCategories: ['Atta & Flour', 'Rice', 'Dal & Pulses', 'Dry Fruits & Nuts'],
  },
  {
    id: '9',
    name: 'Masala & Dry Fruits',
    icon: '🌶️',
    itemCount: 160,
    bgColor: '#FBE9E7',
    iconBg: '#FFAB91',
    subCategories: ['Spices', 'Salt & Sugar', 'Oils & Ghee', 'Dry Fruits'],
  },
  {
    id: '10',
    name: 'Cleaning Essentials',
    icon: '🧹',
    itemCount: 88,
    bgColor: '#E0F7FA',
    iconBg: '#80DEEA',
    subCategories: ['Detergents', 'Dishwash', 'Floor Cleaners', 'Bathroom Cleaners'],
  },
  {
    id: '11',
    name: 'Personal Care',
    icon: '🧴',
    itemCount: 145,
    bgColor: '#F3E5F5',
    iconBg: '#CE93D8',
    subCategories: ['Skin Care', 'Hair Care', 'Oral Care', 'Body Wash', 'Deodorants'],
  },
  {
    id: '12',
    name: 'Baby Care',
    icon: '👶',
    itemCount: 72,
    bgColor: '#E8EAF6',
    iconBg: '#9FA8DA',
    subCategories: ['Diapers', 'Baby Food', 'Baby Skin Care', 'Feeding Accessories'],
  },
]

const CategoryCard = ({ item, onPress }: { item: typeof CATEGORIES[0]; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: item.bgColor }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
      <Text style={styles.icon}>{item.icon}</Text>
    </View>
    <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
    <Text style={styles.itemCount}>{item.itemCount} items</Text>
  </TouchableOpacity>
)

const CategoryScreen = () => {
  const navigation = useNavigation<any>()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? CATEGORIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : CATEGORIES

  const renderItem = useCallback(({ item }: { item: typeof CATEGORIES[0] }) => (
    <CategoryCard
      item={item}
      onPress={() => navigation.navigate('CategoryProducts', { category: item })}
    />
  ), [navigation])

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={THEME.COLOR.textDarkGrey}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={3}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyText}>No categories found</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLOR.border,
    backgroundColor: '#fff',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: THEME.COLOR.textBlack, fontFamily: THEME.FONTWEIGHT.Bold },
  headerTitle: {
    fontSize: 18,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textBlack,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.COLOR.bgHalfWhite,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: THEME.COLOR.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.COLOR.textBlack,
    fontFamily: THEME.FONTWEIGHT.Regular,
    padding: 0,
  },
  clearBtn: { fontSize: 14, color: THEME.COLOR.textDarkGrey, paddingLeft: 8 },
  grid: { padding: 12 },
  card: {
    width: CARD_WIDTH,
    margin: 6,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 26 },
  categoryName: {
    fontSize: 12,
    fontFamily: THEME.FONTWEIGHT.Bold,
    color: THEME.COLOR.textBlack,
    textAlign: 'center',
    lineHeight: 16,
  },
  itemCount: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: THEME.FONTWEIGHT.Regular,
    color: THEME.COLOR.textDarkGrey,
  },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: THEME.COLOR.textDarkGrey, fontFamily: THEME.FONTWEIGHT.Regular },
})

export default CategoryScreen
