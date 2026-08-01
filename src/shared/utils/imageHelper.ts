import Defaults from '../../config'

export const CATEGORY_FALLBACKS: Record<string, string> = {
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80',
  vegetable: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80',
  dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80',
  snack: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=80',
  munchie: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=80',
  drink: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
  beverage: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
  juice: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  egg: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80',
  grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80',
}

export const PRODUCT_FALLBACKS: Record<string, string> = {
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=80',
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  egg: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=500&auto=format&fit=crop&q=80',
  chip: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
  snack: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=80',
  coke: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
  drink: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
  paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
  cheese: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80',
  chocolate: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80',
  vegetable: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
}

export const getFallbackImage = (name: string = '', type: 'category' | 'product' = 'product'): string => {
  const lowerName = name.toLowerCase()
  const map = type === 'category' ? CATEGORY_FALLBACKS : PRODUCT_FALLBACKS

  for (const key of Object.keys(map)) {
    if (key !== 'default' && lowerName.includes(key)) {
      return map[key]
    }
  }
  return map.default
}

export const buildImageUrl = (img?: string, name?: string, type: 'category' | 'product' = 'product'): string => {
  if (!img || typeof img !== 'string' || img.trim() === '') {
    return getFallbackImage(name, type)
  }
  const cleaned = img.replace(/\\/g, '/').replace(/^\/+/, '')
  if (cleaned.startsWith('http')) {
    return cleaned
  }
  return `${Defaults.apis.baseUrl}/${cleaned}`
}

export const DEFAULT_CATEGORIES = [
  { id: 101, name: 'Fresh Fruits', image: CATEGORY_FALLBACKS.fruit, status: true },
  { id: 102, name: 'Vegetables', image: CATEGORY_FALLBACKS.vegetable, status: true },
  { id: 103, name: 'Milk & Dairy', image: CATEGORY_FALLBACKS.milk, status: true },
  { id: 104, name: 'Snacks & Munchies', image: CATEGORY_FALLBACKS.snack, status: true },
  { id: 105, name: 'Cold Drinks', image: CATEGORY_FALLBACKS.drink, status: true },
  { id: 106, name: 'Bakery & Bread', image: CATEGORY_FALLBACKS.bread, status: true },
]

export const DEFAULT_PRODUCTS = [
  {
    id: 201,
    name: 'Kashmir Red Apples',
    price: '199',
    mrp: '249',
    unit: '1 kg',
    image: PRODUCT_FALLBACKS.apple,
    status: 'active',
    category: 'Fresh Fruits',
    stock_in_hand: 50,
  },
  {
    id: 202,
    name: 'Farm Fresh Organic Milk',
    price: '34',
    mrp: '40',
    unit: '500 ml',
    image: PRODUCT_FALLBACKS.milk,
    status: 'active',
    category: 'Milk & Dairy',
    stock_in_hand: 100,
  },
  {
    id: 203,
    name: 'Whole Wheat Brown Bread',
    price: '45',
    mrp: '55',
    unit: '400 g',
    image: PRODUCT_FALLBACKS.bread,
    status: 'active',
    category: 'Bakery & Bread',
    stock_in_hand: 30,
  },
  {
    id: 204,
    name: 'Crispy Potato Wafers',
    price: '20',
    mrp: '25',
    unit: '100 g',
    image: PRODUCT_FALLBACKS.chip,
    status: 'active',
    category: 'Snacks & Munchies',
    stock_in_hand: 80,
  },
  {
    id: 205,
    name: 'Fresh Farm White Eggs',
    price: '72',
    mrp: '85',
    unit: '6 pcs',
    image: PRODUCT_FALLBACKS.egg,
    status: 'active',
    category: 'Milk & Dairy',
    stock_in_hand: 40,
  },
  {
    id: 206,
    name: 'Chilled Sparkling Cola',
    price: '40',
    mrp: '45',
    unit: '750 ml',
    image: PRODUCT_FALLBACKS.coke,
    status: 'active',
    category: 'Cold Drinks',
    stock_in_hand: 60,
  },
]
