import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  PermissionsAndroid,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import {
  getData,
  postData,
  putData,
  fetchMyProfile,
  deleteData,
} from '../../../shared/services/main-service'
import { MapView } from '../../elements/MapView'
import Geolocation from '@react-native-community/geolocation'
import { getAsyncData, setAsyncData } from '../../../shared/utils/storage'
import { getLiveCurrentLocation } from '../../../shared/utils/locationService'

const { width: W, height: H } = Dimensions.get('window')
const isSmallDevice = W < 360

type AddressType = 'Home' | 'Work' | 'Other'

interface Address {
  id: string
  label: AddressType
  name: string
  phone: string
  line1: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  receiverType: 'myself' | 'other'
  latitude?: number
  longitude?: number
}

interface FormState {
  label: AddressType
  name: string
  phone: string
  line1: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  receiverType: 'myself' | 'other'
  latitude?: number
  longitude?: number
}

const emptyForm = (): FormState => ({
  label: 'Home',
  name: '',
  phone: '',
  line1: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
  receiverType: 'myself',
  latitude: undefined,
  longitude: undefined,
})

const ADDRESS_TYPES: AddressType[] = ['Home', 'Work', 'Other']

/* -------------------------------------------------------------------------- */
/*                        CRISP VECTOR SVG ICONS                              */
/* -------------------------------------------------------------------------- */
const BackSvgIcon = ({ color = '#FFFFFF', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const SearchSvgIcon = ({ color = '#FBBF24', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Path
      d="M20 20L16 16"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Svg>
)

const HomeSvgIcon = ({ color = '#FBBF24', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.25L12 3L21 10.25V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.25Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const WorkSvgIcon = ({ color = '#FBBF24', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="2" />
    <Path
      d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)

const PinSvgIcon = ({ color = '#FBBF24', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C16 17.5 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17.5 12 21Z"
      stroke={color}
      strokeWidth="2"
    />
    <Circle cx="12" cy="9" r="2.5" fill={color} />
  </Svg>
)

const GpsTargetSvgIcon = ({ color = '#FBBF24', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="3" fill={color} />
    <Path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const CheckCircleSvgIcon = ({ color = '#FBBF24', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path d="M8 12L11 15L16 9" stroke="#0B1B36" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const EmptyRadioSvgIcon = ({ color = '#829AB8', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
  </Svg>
)

const UserSingleSvgIcon = ({ color = '#FBBF24', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4.5" stroke={color} strokeWidth="2" />
    <Path
      d="M4 20C4 16.13 7.58 13 12 13C16.42 13 20 16.13 20 20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)

const UserGroupSvgIcon = ({ color = '#FBBF24', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 16.7909 15.2091 15 13 15H11C8.79086 15 7 16.7909 7 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
  </Svg>
)

const CloseSvgIcon = ({ color = '#829AB8', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Svg>
)

const EditSvgIcon = ({ color = '#FBBF24', size = 15 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const TrashSvgIcon = ({ color = '#FF6B6B', size = 15 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H5H21M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

/* -------------------------------------------------------------------------- */
/*                       SAPPHIRE GLASS FIELD COMPONENT                       */
/* -------------------------------------------------------------------------- */
const GlassField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  maxLength,
  autoComplete,
  textContentType,
}: any) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={f.fieldWrap}>
      <Text style={f.fieldLabel}>{label}</Text>
      <View
        style={[
          f.inputContainer,
          isFocused ? f.inputContainerFocused : null,
        ]}
      >
        <TextInput
          style={f.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? label}
          placeholderTextColor="#829AB8"
          keyboardType={keyboardType ?? 'default'}
          maxLength={maxLength}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  )
}

/* -------------------------------------------------------------------------- */
/*                       SAVED ADDRESS CARD COMPONENT                         */
/* -------------------------------------------------------------------------- */
const SavedAddressCard = ({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  address: Address
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) => {
  const fullAddress = [address.line1, address.city, address.pincode]
    .filter(Boolean)
    .join(', ')

  return (
    <TouchableOpacity
      style={[s.savedCard, isSelected && s.savedCardActive]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      <View style={s.savedIconBox}>
        {address.label === 'Home' ? (
          <HomeSvgIcon color="#FBBF24" size={20} />
        ) : address.label === 'Work' ? (
          <WorkSvgIcon color="#FBBF24" size={20} />
        ) : (
          <PinSvgIcon color="#FBBF24" size={20} />
        )}
      </View>

      <View style={s.savedInfo}>
        <View style={s.savedHeaderRow}>
          <Text style={s.savedLabel}>
            {address.label}
            {address.name ? ` (${address.name})` : ''}
          </Text>
          {isSelected && (
            <View style={s.selectedBadge}>
              <Text style={s.selectedBadgeText}>✓ Selected</Text>
            </View>
          )}
        </View>
        <Text style={s.savedAddress} numberOfLines={2}>
          {fullAddress}
        </Text>
        {address.phone ? (
          <Text style={s.savedPhoneText}>📞 {address.phone}</Text>
        ) : null}
      </View>

      <View style={s.actionCol}>
        {isSelected ? (
          <CheckCircleSvgIcon color="#FBBF24" size={20} />
        ) : (
          <EmptyRadioSvgIcon color="#829AB8" size={20} />
        )}
        <TouchableOpacity
          style={s.miniActionBtn}
          onPress={(e) => {
            e.stopPropagation?.()
            onEdit()
          }}
          activeOpacity={0.75}
        >
          <EditSvgIcon color="#FBBF24" size={14} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.miniActionBtn}
          onPress={(e) => {
            e.stopPropagation?.()
            onDelete()
          }}
          activeOpacity={0.75}
        >
          <TrashSvgIcon color="#FF6B6B" size={14} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */
const AddressScreen = () => {
  const navigation = useNavigation<any>()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [_loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const modalVisibleRef = useRef(false)
  useEffect(() => {
    modalVisibleRef.current = modalVisible
  }, [modalVisible])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  // Selection mode: 'current' (GPS/pin on map) or 'saved' (saved address id)
  const [selectedType, setSelectedType] = useState<'current' | 'saved'>('current')
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)

  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [receiverType, setReceiverType] = useState<'myself' | 'other'>('myself')

  const watchIdRef = useRef<number | null>(null)
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 })
  const [mapCenter, setMapCenter] = useState({ latitude: 0, longitude: 0 })

  // GPS states
  const [isLocatingUser, setIsLocatingUser] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [gpsError, setGpsError] = useState(false)

  // Map animation states
  const [isMapMoving, setIsMapMoving] = useState(false)
  const pinTranslateY = useRef(new Animated.Value(-18)).current

  // Reverse geocoding states
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodedAddress, setGeocodedAddress] = useState<string>('')
  const [geocodedDetails, setGeocodedDetails] = useState<any>(null)
  const geocodeTimeoutRef = useRef<any>(null)

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const searchTimeoutRef = useRef<any>(null)

  const slideAnim = useRef(new Animated.Value(H)).current

  const saveCachedLocation = async (lat: number, lng: number) => {
    try {
      await setAsyncData('last_location_coords', { latitude: lat, longitude: lng } as any)
    } catch (e) {
      console.warn('Failed to save cached location:', e)
    }
  }

  const loadCachedLocation = useCallback(async () => {
    try {
      const cached = await getAsyncData('last_location_coords')
      if (cached && cached.latitude && cached.longitude) {
        setCoords({ latitude: cached.latitude, longitude: cached.longitude })
        setMapCenter({ latitude: cached.latitude, longitude: cached.longitude })
        return { latitude: cached.latitude, longitude: cached.longitude }
      }
    } catch (err) {
      console.warn('Error reading cached location:', err)
    }
    // Fallback: Bangalore default coords
    const fallback = { latitude: 12.9716, longitude: 77.5946 }
    setCoords(fallback)
    setMapCenter(fallback)
    return fallback
  }, [])

  // Reverse geocoding with robust fallbacks
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!lat || !lng || (lat === 0 && lng === 0)) return
    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FutureBelieveECommerceApp/1.0',
            'Accept-Language': 'en',
          },
        }
      )
      const data = await response.json()
      if (data && (data.address || data.display_name)) {
        const a = data.address || {}
        const houseNumber = a.house_number || a.building_number || ''
        const street =
          a.road ||
          a.street ||
          a.neighbourhood ||
          a.suburb ||
          a.residential ||
          a.amenity ||
          a.commercial ||
          a.building ||
          ''
        const line1 =
          houseNumber && street
            ? `${houseNumber}, ${street}`
            : street || (data.display_name ? data.display_name.split(',')[0] : 'Current Location')
        const city =
          a.city ||
          a.town ||
          a.village ||
          a.city_district ||
          a.state_district ||
          a.county ||
          a.municipality ||
          'City'
        const state = a.state || ''
        const pincode = a.postcode || ''
        const displayName = data.display_name || `${line1}, ${city}`

        setGeocodedAddress(displayName)
        setGeocodedDetails({
          line1,
          city,
          state,
          pincode,
          displayName,
        })
      } else {
        setGeocodedAddress('Selected Map Location')
        setGeocodedDetails({
          line1: 'Selected Map Location',
          city: 'City',
          state: '',
          pincode: '',
          displayName: 'Selected Map Location',
        })
      }
    } catch (error) {
      console.warn('Geocoding error:', error)
      setGeocodedAddress('Location pinpointed')
      setGeocodedDetails((prev: any) => prev || {
        line1: 'Current Location',
        city: 'City',
        state: '',
        pincode: '',
        displayName: 'Current Location',
      })
    } finally {
      setIsGeocoding(false)
    }
  }

  const debouncedReverseGeocode = (lat: number, lng: number) => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current)
    }
    setIsGeocoding(true)
    setGeocodedAddress('Locating...')
    geocodeTimeoutRef.current = setTimeout(() => {
      reverseGeocode(lat, lng)
    }, 600)
  }

  // Request Location Permission, Enable GPS, and fetch coordinates
  const fetchCurrentLocation = useCallback(async (autoSelect = true) => {
    setIsLocatingUser(true)
    setPermissionDenied(false)
    setGpsError(false)

    try {
      const result = await getLiveCurrentLocation()

      if (result.permissionDenied) {
        setPermissionDenied(true)
        setIsLocatingUser(false)
        await loadCachedLocation()
        return
      }

      if (!result.success || !result.coords) {
        setGpsError(true)
        setIsLocatingUser(false)
        await loadCachedLocation()
        return
      }

      const { latitude, longitude } = result.coords
      setCoords({ latitude, longitude })
      setMapCenter({ latitude, longitude })
      saveCachedLocation(latitude, longitude)
      setIsLocatingUser(false)
      setGpsError(false)
      setPermissionDenied(false)

      if (autoSelect) {
        setSelectedType('current')
      }
      reverseGeocode(latitude, longitude)

      // Watch GPS position in background
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude: wLat, longitude: wLng } = position.coords
          setCoords({ latitude: wLat, longitude: wLng })
          saveCachedLocation(wLat, wLng)
        },
        (error) => {
          console.warn('AddressScreen watch geolocation error:', error)
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 10000,
          fastestInterval: 5000,
        }
      )
      watchIdRef.current = watchId
    } catch (err) {
      console.warn('Error starting location watch in AddressScreen:', err)
      setGpsError(true)
      setIsLocatingUser(false)
      await loadCachedLocation()
    }
  }, [loadCachedLocation])

  // Select Current Location button action
  const handleSelectCurrentLocation = () => {
    setSelectedType('current')
    fetchCurrentLocation(true)
  }

  // Initialize
  useEffect(() => {
    const init = async () => {
      const initial = await loadCachedLocation()
      if (initial && initial.latitude !== 0) {
        reverseGeocode(initial.latitude, initial.longitude)
      }
      fetchCurrentLocation(false)
    }
    init()

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current)
      }
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current)
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [loadCachedLocation, fetchCurrentLocation])

  // Pin bounce animations
  const handleRegionChangeStart = useCallback(() => {
    if (modalVisibleRef.current) return
    setIsMapMoving(true)
    Animated.timing(pinTranslateY, {
      toValue: -32,
      duration: 150,
      useNativeDriver: true,
    }).start()
  }, [pinTranslateY])

  const handleRegionChangeComplete = useCallback(
    (lat: number, lng: number) => {
      if (modalVisibleRef.current) return
      setIsMapMoving(false)
      Animated.spring(pinTranslateY, {
        toValue: -18,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start()

      setMapCenter({ latitude: lat, longitude: lng })
      debouncedReverseGeocode(lat, lng)
    },
    [pinTranslateY]
  )

  // Search input handler
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    if (text.trim().length < 3) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            text
          )}&limit=6&addressdetails=1&countrycodes=in`,
          {
            headers: {
              'User-Agent': 'FutureBelieveECommerceApp/1.0',
            },
          }
        )
        const data = await response.json()
        setSearchResults(data || [])
      } catch (error) {
        console.warn('Location search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 600)
  }

  // Select search result
  const handleSelectSearchResult = (item: any) => {
    const lat = Number(item.lat)
    const lon = Number(item.lon)
    setMapCenter({ latitude: lat, longitude: lon })
    setSelectedType('current')
    setSearchModalVisible(false)
    reverseGeocode(lat, lon)
  }

  // Open modal to save current pinned location as a permanent address
  const handleSaveCurrentMapLocation = () => {
    setEditingId(null)
    const currentLat = mapCenter.latitude || coords.latitude
    const currentLng = mapCenter.longitude || coords.longitude
    setForm({
      label: 'Home',
      name: profileName,
      phone: profilePhone,
      line1: geocodedDetails?.line1 || (geocodedAddress ? geocodedAddress.split(',')[0] : 'Current Location'),
      city: geocodedDetails?.city || 'City',
      state: geocodedDetails?.state || '',
      pincode: geocodedDetails?.pincode || '',
      isDefault: addresses.length === 0,
      receiverType: 'myself',
      latitude: currentLat && currentLat !== 0 ? currentLat : undefined,
      longitude: currentLng && currentLng !== 0 ? currentLng : undefined,
    })
    setReceiverType('myself')

    setModalVisible(true)
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 11,
      useNativeDriver: true,
    }).start()
  }

  const loadAddresses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getData('/address')
      const data: any[] = res?.data?.data || []
      const mapped: Address[] = data.map((a) => ({
        id: String(a.id),
        label: a.label as AddressType,
        name: a.name || '',
        phone: a.phone || '',
        line1: a.line1,
        city: a.city,
        state: a.state || 'N/A',
        pincode: a.pincode,
        isDefault: !!a.isDefault,
        receiverType: (a.receiverType || a.receiver_type || 'myself') as 'myself' | 'other',
        latitude: a.latitude !== undefined && a.latitude !== null ? Number(a.latitude) : undefined,
        longitude: a.longitude !== undefined && a.longitude !== null ? Number(a.longitude) : undefined,
      }))
      setAddresses(mapped)
    } catch (e) {
      console.log('Address fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const prof = await fetchMyProfile()
      if (prof) {
        const name = prof.FirstName
          ? `${prof.FirstName}${prof.LastName ? ' ' + prof.LastName : ''}`
          : prof.name || ''
        setProfileName(name)
        setProfilePhone(prof.mobilenumber || prof.MobileNumber || prof.phone || prof.Phone || '')
      }
    } catch (e) {
      console.log('loadProfile error:', e)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadAddresses()
      loadProfile()
    }, [loadAddresses, loadProfile])
  )

  const openModal = (addr?: Address) => {
    if (addr) {
      setEditingId(addr.id)
      setForm({
        label: addr.label,
        name: addr.name,
        phone: addr.phone,
        line1: addr.line1,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: addr.isDefault,
        receiverType: addr.receiverType,
        latitude: addr.latitude,
        longitude: addr.longitude,
      })
      setReceiverType(addr.receiverType || 'myself')
    } else {
      setEditingId(null)
      const currentLat = mapCenter.latitude || coords.latitude
      const currentLng = mapCenter.longitude || coords.longitude
      setForm({
        ...emptyForm(),
        name: profileName,
        phone: profilePhone,
        line1: geocodedDetails?.line1 || '',
        city: geocodedDetails?.city || '',
        state: geocodedDetails?.state || '',
        pincode: geocodedDetails?.pincode || '',
        latitude: currentLat && currentLat !== 0 ? currentLat : undefined,
        longitude: currentLng && currentLng !== 0 ? currentLng : undefined,
      })
      setReceiverType('myself')
    }
    setModalVisible(true)
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 60,
      friction: 11,
      useNativeDriver: true,
    }).start()
  }

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: H,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false)
      setForm(emptyForm())
      setEditingId(null)
    })
  }

  const handleReceiverTypeChange = (type: 'myself' | 'other') => {
    setReceiverType(type)
    setForm((prev) => ({
      ...prev,
      receiverType: type,
      name: type === 'myself' ? profileName : '',
      phone: type === 'myself' ? profilePhone : '',
    }))
  }

  const handleInputChange = useCallback((key: keyof FormState, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }))
  }, [])

  const handleSave = async () => {
    if (!form.line1.trim() || !form.city.trim() || !form.pincode.trim()) {
      Alert.alert('Required Fields', 'Please fill in Address Line 1, City, and Pincode.')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        label: form.label,
        name: form.name,
        phone: form.phone,
        line1: form.line1,
        city: form.city,
        state: form.state || 'N/A',
        pincode: form.pincode,
        isDefault: form.isDefault,
        receiver_type: receiverType,
        latitude: form.latitude !== undefined && form.latitude !== null ? Number(form.latitude) : undefined,
        longitude: form.longitude !== undefined && form.longitude !== null ? Number(form.longitude) : undefined,
      }

      if (editingId) {
        await putData(`/address/${editingId}`, payload)
      } else {
        const res = await postData('/address', payload)
        const newId = res?.data?.data?.id || res?.data?.id
        if (newId) {
          setSelectedSavedId(String(newId))
          setSelectedType('saved')
        }
      }
      await loadAddresses()
      closeModal()
    } catch (e: any) {
      console.log('Save address error:', e)
      Alert.alert('Error', e?.response?.data?.message || 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteData(`/address/${id}`)
            if (selectedSavedId === id) {
              setSelectedSavedId(null)
              setSelectedType('current')
            }
            loadAddresses()
          } catch (e) {
            console.log('Delete address error:', e)
          }
        },
      },
    ])
  }

  // Confirm selection and return
  const handleConfirm = async () => {
    try {
      if (selectedType === 'current') {
        const currentAddrPayload = {
          isCurrentLocation: true,
          label: 'Current Location',
          name: profileName || 'Current Location',
          phone: profilePhone || '',
          line1: geocodedDetails?.line1 || (geocodedAddress ? geocodedAddress.split(',')[0] : 'Current Location'),
          city: geocodedDetails?.city || 'City',
          state: geocodedDetails?.state || '',
          pincode: geocodedDetails?.pincode || '',
          fullAddress: geocodedAddress || 'Current Location',
          latitude: mapCenter.latitude || coords.latitude,
          longitude: mapCenter.longitude || coords.longitude,
        }
        await setAsyncData('selected_delivery_address', currentAddrPayload)
        await setAsyncData('last_location_coords', {
          latitude: mapCenter.latitude || coords.latitude,
          longitude: mapCenter.longitude || coords.longitude,
        })
      } else {
        const chosen = addresses.find((a) => a.id === selectedSavedId) || addresses[0]
        if (chosen) {
          await setAsyncData('selected_delivery_address', {
            ...chosen,
            isCurrentLocation: false,
            fullAddress: [chosen.line1, chosen.city, chosen.pincode].filter(Boolean).join(', '),
            latitude: chosen.latitude,
            longitude: chosen.longitude,
          })
          if (chosen.latitude && chosen.longitude) {
            await setAsyncData('last_location_coords', {
              latitude: Number(chosen.latitude),
              longitude: Number(chosen.longitude),
            })
          }
        }
      }
    } catch (e) {
      console.warn('Error saving selected delivery address:', e)
    }
    navigation.goBack()
  }

  const isCurrentSelected = selectedType === 'current'
  const activeSavedAddress = selectedType === 'saved' ? addresses.find((a) => a.id === selectedSavedId) : null

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#071224" translucent={false} />

      {/* Map background */}
      <View style={s.mapBg}>
        {/* Leaflet Map */}
        <View style={StyleSheet.absoluteFill}>
          <MapView
            latitude={mapCenter.latitude}
            longitude={mapCenter.longitude}
            userLatitude={coords.latitude}
            userLongitude={coords.longitude}
            showRecenter={!modalVisible}
            recenterBottom={H * 0.52 + 16}
            showMapType={!modalVisible}
            mapTypeBottom={H * 0.52 + 66}
            onRegionChangeStart={modalVisible ? undefined : handleRegionChangeStart}
            onRegionChangeComplete={modalVisible ? undefined : handleRegionChangeComplete}
            onRecenter={() => fetchCurrentLocation(true)}
          />
        </View>

        {permissionDenied && (
          <View style={s.errorBanner}>
            <Text style={s.errorBannerText}>
              🔒 Location permission denied. Allow permission to auto-detect location.
            </Text>
            <TouchableOpacity style={s.errorBannerBtn} onPress={() => fetchCurrentLocation(true)}>
              <Text style={s.errorBannerBtnText}>Grant</Text>
            </TouchableOpacity>
          </View>
        )}

        {gpsError && (
          <View style={s.errorBanner}>
            <Text style={s.errorBannerText}>
              ⚠️ GPS signal unavailable. Pan map to select or check GPS.
            </Text>
            <TouchableOpacity style={s.errorBannerBtn} onPress={() => fetchCurrentLocation(true)}>
              <Text style={s.errorBannerBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLocatingUser && (
          <View style={s.mapLoader}>
            <ActivityIndicator size="large" color="#FBBF24" />
            <Text style={s.mapLoaderText}>Locating your position...</Text>
          </View>
        )}

        {/* Top Header */}
        <SafeAreaView edges={['top']} style={s.searchOverlay}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackSvgIcon color="#FFFFFF" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.searchBar}
            onPress={() => setSearchModalVisible(true)}
            activeOpacity={0.8}
          >
            <SearchSvgIcon color="#FBBF24" size={18} />
            <Text style={s.searchPlaceholder}>Search area, street, landmark...</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Center marker overlay */}
        <Animated.View
          style={[
            s.pinContainer,
            { transform: [{ translateY: pinTranslateY }] },
          ]}
          pointerEvents="none"
        >
          <View style={s.pinLabel}>
            <Text style={s.pinLabelText}>⚡ Delivery Location</Text>
          </View>
          <PinSvgIcon color="#FBBF24" size={32} />
        </Animated.View>
      </View>

      {/* Floating Bottom Sheet */}
      <View style={s.bottomSheet}>
        <View style={s.sheetHandle} />

        <ScrollView contentContainerStyle={s.sheetScroll} showsVerticalScrollIndicator={false}>
          {/* Quick GPS Action Bar */}
          <TouchableOpacity
            style={s.gpsQuickBtn}
            onPress={handleSelectCurrentLocation}
            activeOpacity={0.85}
          >
            <View style={s.gpsIconBox}>
              <GpsTargetSvgIcon color="#0B1B36" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.gpsQuickTitle}>Use My Current Location</Text>
              <Text style={s.gpsQuickSubtitle}>
                {isLocatingUser ? 'Fetching live GPS...' : 'Auto-detect delivery address via GPS'}
              </Text>
            </View>
            {isLocatingUser ? (
              <ActivityIndicator size="small" color="#FBBF24" />
            ) : isCurrentSelected ? (
              <CheckCircleSvgIcon color="#FBBF24" size={20} />
            ) : (
              <EmptyRadioSvgIcon color="#829AB8" size={20} />
            )}
          </TouchableOpacity>

          {/* Current Pin / Location Card */}
          <TouchableOpacity
            style={[s.currentPinCard, isCurrentSelected && s.currentPinCardActive]}
            onPress={() => setSelectedType('current')}
            activeOpacity={0.9}
          >
            <View style={s.currentPinLeft}>
              <View style={[s.locIconBox, isCurrentSelected && s.locIconBoxActive]}>
                <Text style={{ fontSize: 18 }}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.pinTitleRow}>
                  <Text style={s.currentPinTitle}>Pinned Delivery Location</Text>
                  {isCurrentSelected && (
                    <View style={s.selectedBadge}>
                      <Text style={s.selectedBadgeText}>✓ Delivering Here</Text>
                    </View>
                  )}
                </View>
                {isMapMoving ? (
                  <Text style={s.currentPinAddrText}>Moving map...</Text>
                ) : isGeocoding ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <ActivityIndicator size="small" color="#FBBF24" style={{ marginRight: 6 }} />
                    <Text style={[s.currentPinAddrText, { color: '#829AB8' }]}>Fetching address details...</Text>
                  </View>
                ) : geocodedAddress ? (
                  <Text style={s.currentPinAddrText} numberOfLines={2}>
                    {geocodedAddress}
                  </Text>
                ) : (
                  <Text style={[s.currentPinAddrText, { color: '#FF6B6B' }]}>
                    No address pinpointed. Pan map to select.
                  </Text>
                )}
              </View>
            </View>

            <View style={s.currentPinActions}>
              <TouchableOpacity
                style={s.saveAsAddressBtn}
                onPress={handleSaveCurrentMapLocation}
                activeOpacity={0.8}
              >
                <Text style={s.saveAsAddressBtnText}>+ Save to Address Book</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Active Selection Summary Card */}
          <View style={s.selectedSummaryCard}>
            <View style={s.selectedLeft}>
              <PinSvgIcon color="#FBBF24" size={20} />
              <View style={s.selectedInfo}>
                <Text style={s.selectedTitle}>
                  {isCurrentSelected
                    ? '📍 Delivering to Current / Pin Location'
                    : `🏠 Delivering to ${activeSavedAddress?.label || 'Saved Address'} ${activeSavedAddress?.name ? `(${activeSavedAddress.name})` : ''
                    }`}
                </Text>
                <Text style={s.selectedAddress} numberOfLines={2}>
                  {isCurrentSelected
                    ? geocodedAddress || 'Locating...'
                    : [activeSavedAddress?.line1, activeSavedAddress?.city, activeSavedAddress?.pincode]
                      .filter(Boolean)
                      .join(', ')}
                </Text>
              </View>
            </View>
            <View style={s.etaBadge}>
              <Text style={s.etaText}>⚡ 10 MIN</Text>
            </View>
          </View>

          {/* Confirm Delivery Button */}
          <TouchableOpacity
            style={s.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={s.confirmBtnText}>Confirm Delivery Location →</Text>
          </TouchableOpacity>

          {/* Saved Addresses Section */}
          {addresses.length > 0 && (
            <>
              <Text style={s.sectionTitle}>SAVED ADDRESSES</Text>
              {addresses.map((addr) => (
                <SavedAddressCard
                  key={addr.id}
                  address={addr}
                  isSelected={selectedType === 'saved' && selectedSavedId === addr.id}
                  onSelect={() => {
                    setSelectedType('saved')
                    setSelectedSavedId(addr.id)
                    if (addr.latitude && addr.longitude) {
                      setMapCenter({ latitude: addr.latitude, longitude: addr.longitude })
                    }
                  }}
                  onEdit={() => openModal(addr)}
                  onDelete={() => handleDeleteAddress(addr.id)}
                />
              ))}
            </>
          )}

          {/* Add New Address Button */}
          <TouchableOpacity
            style={s.addNewBtn}
            onPress={() => openModal()}
            activeOpacity={0.82}
          >
            <View style={s.addNewIcon}>
              <Text style={s.addNewPlus}>+</Text>
            </View>
            <Text style={s.addNewText}>Add a new address</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Add / Edit Address Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={s.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={s.modalHandle} />
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>
                  {editingId ? 'Edit Address' : 'Add New Address'}
                </Text>
                <TouchableOpacity onPress={closeModal} style={s.closeBtn} activeOpacity={0.8}>
                  <CloseSvgIcon color="#829AB8" size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {/* Address Type */}
                <View style={f.fieldWrap}>
                  <Text style={f.fieldLabel}>ADDRESS TYPE</Text>
                  <View style={s.typeRow}>
                    {ADDRESS_TYPES.map((t) => {
                      const isActive = form.label === t
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[s.typeChip, isActive && s.typeChipActive]}
                          onPress={() => handleInputChange('label', t)}
                          activeOpacity={0.8}
                        >
                          {t === 'Home' ? (
                            <HomeSvgIcon color={isActive ? '#0B1B36' : '#FBBF24'} size={16} />
                          ) : t === 'Work' ? (
                            <WorkSvgIcon color={isActive ? '#0B1B36' : '#FBBF24'} size={16} />
                          ) : (
                            <PinSvgIcon color={isActive ? '#0B1B36' : '#FBBF24'} size={16} />
                          )}
                          <Text style={[s.typeChipText, isActive && s.typeChipTextActive]}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>

                {/* Receiver Type */}
                <View style={f.fieldWrap}>
                  <Text style={f.fieldLabel}>RECEIVER</Text>
                  <View style={s.typeRow}>
                    <TouchableOpacity
                      style={[s.typeChip, receiverType === 'myself' && s.typeChipActive]}
                      onPress={() => handleReceiverTypeChange('myself')}
                      activeOpacity={0.8}
                    >
                      <UserSingleSvgIcon color={receiverType === 'myself' ? '#0B1B36' : '#FBBF24'} size={16} />
                      <Text style={[s.typeChipText, receiverType === 'myself' && s.typeChipTextActive]}>
                        Myself
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.typeChip, receiverType === 'other' && s.typeChipActive]}
                      onPress={() => handleReceiverTypeChange('other')}
                      activeOpacity={0.8}
                    >
                      <UserGroupSvgIcon color={receiverType === 'other' ? '#0B1B36' : '#FBBF24'} size={16} />
                      <Text style={[s.typeChipText, receiverType === 'other' && s.typeChipTextActive]}>
                        Someone else
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <GlassField
                  label="RECEIVER'S NAME *"
                  value={form.name}
                  onChange={(v: string) => handleInputChange('name', v)}
                  placeholder="Full name of receiver"
                  autoComplete="name"
                  textContentType="name"
                />

                <GlassField
                  label="RECEIVER'S PHONE NUMBER *"
                  value={form.phone}
                  onChange={(v: string) => handleInputChange('phone', v.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />

                <GlassField
                  label="ADDRESS LINE 1 *"
                  value={form.line1}
                  onChange={(v: string) => handleInputChange('line1', v)}
                  placeholder="House / Flat / Block / Street"
                  autoComplete="street-address"
                  textContentType="streetAddressLine1"
                />

                <View style={s.rowFields}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <GlassField
                      label="CITY *"
                      value={form.city}
                      onChange={(v: string) => handleInputChange('city', v)}
                      placeholder="City"
                      autoComplete="postal-address-locality"
                      textContentType="addressCity"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <GlassField
                      label="PINCODE *"
                      value={form.pincode}
                      onChange={(v: string) => handleInputChange('pincode', v)}
                      placeholder="6-digit"
                      keyboardType="numeric"
                      maxLength={6}
                      autoComplete="postal-code"
                      textContentType="postalCode"
                    />
                  </View>
                </View>

                {/* Default checkbox */}
                <TouchableOpacity
                  style={s.defaultToggle}
                  onPress={() => handleInputChange('isDefault', !form.isDefault)}
                  activeOpacity={0.8}
                >
                  <View style={[s.checkbox, form.isDefault && s.checkboxChecked]}>
                    {form.isDefault && <Text style={s.checkIcon}>✓</Text>}
                  </View>
                  <Text style={s.defaultToggleText}>Set as default delivery address</Text>
                </TouchableOpacity>

                {/* Save button */}
                <TouchableOpacity
                  style={[s.saveBtn, saving && s.saveBtnDisabled]}
                  onPress={handleSave}
                  activeOpacity={0.88}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#0B1B36" size="small" />
                  ) : (
                    <Text style={s.saveBtnText}>
                      {editingId ? 'Update Address' : 'Save Address'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>

      {/* Search autocomplete modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <SafeAreaView style={s.searchContainer}>
          <View style={s.searchHeader}>
            <TouchableOpacity
              style={s.searchBackBtn}
              onPress={() => setSearchModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={s.searchBackBtnText}>←</Text>
            </TouchableOpacity>
            <View style={s.searchInputWrapper}>
              <TextInput
                style={s.searchInput}
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                placeholder="Search area, street, landmark..."
                placeholderTextColor="#829AB8"
                autoFocus
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          {isSearching ? (
            <View style={s.searchLoaderWrapper}>
              <ActivityIndicator size="large" color="#FBBF24" />
              <Text style={s.searchLoaderText}>Searching places...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.searchResultsList}>
              {searchResults.map((item, index) => (
                <TouchableOpacity
                  key={item.place_id || index}
                  style={s.searchResultItem}
                  onPress={() => handleSelectSearchResult(item)}
                  activeOpacity={0.7}
                >
                  <View style={s.searchResultIcon}>
                    <Text style={{ fontSize: 16 }}>📍</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.resultName} numberOfLines={1}>
                      {item.display_name.split(',')[0]}
                    </Text>
                    <Text style={s.resultAddress} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : searchQuery.trim().length >= 3 ? (
            <View style={s.searchEmptyWrapper}>
              <Text style={s.searchEmptyText}>No locations found</Text>
            </View>
          ) : (
            <View style={s.searchEmptyWrapper}>
              <Text style={s.searchEmptyText}>Type at least 3 characters to search</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  )
}

/* -------------------------------------------------------------------------- */
/*                               STYLES                                       */
/* -------------------------------------------------------------------------- */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#071224' },

  mapBg: {
    flex: 1,
    backgroundColor: '#0A1A34',
  },

  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(11, 27, 54, 0.92)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  searchBar: {
    flex: 1,
    height: 46,
    backgroundColor: 'rgba(11, 27, 54, 0.92)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  searchPlaceholder: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13.5,
    color: '#829AB8',
  },

  pinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLabel: {
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 6,
  },
  pinLabelText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11.5,
    color: '#0B1B36',
  },

  bottomSheet: {
    backgroundColor: 'rgba(11, 27, 54, 0.98)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    maxHeight: H * 0.54,
    shadowColor: '#002B66',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FBBF24',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
    opacity: 0.8,
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  /* GPS QUICK BUTTON */
  gpsQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  gpsIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsQuickTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  gpsQuickSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#FBBF24',
  },

  /* PIN CARD */
  currentPinCard: {
    backgroundColor: '#162C50',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#264878',
    padding: 14,
    marginBottom: 12,
  },
  currentPinCardActive: {
    borderColor: '#FBBF24',
    backgroundColor: '#1A335E',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  currentPinLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  locIconBoxActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderColor: '#FBBF24',
  },
  pinTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  currentPinTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13.5,
    color: '#FBBF24',
  },
  selectedBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selectedBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#0B1B36',
  },
  currentPinAddrText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  currentPinActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  saveAsAddressBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveAsAddressBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#FBBF24',
  },

  /* SELECTED SUMMARY CARD */
  selectedSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2242',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FBBF24',
    padding: 14,
    marginBottom: 12,
  },
  selectedLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  selectedInfo: { flex: 1 },
  selectedTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  selectedAddress: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  etaBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  etaText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10.5,
    color: '#FBBF24',
  },

  /* CONFIRM BUTTON */
  confirmBtn: {
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  confirmBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#0B1B36',
  },

  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#829AB8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  /* SAVED CARD */
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162C50',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#264878',
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  savedCardActive: {
    borderColor: '#FBBF24',
    backgroundColor: '#1A335E',
  },
  savedIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedInfo: { flex: 1 },
  savedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  savedLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  savedAddress: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  savedPhoneText: {
    fontSize: 11,
    color: '#FBBF24',
    marginTop: 2,
    fontFamily: 'DMSans-Medium',
  },

  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#18345C',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    backgroundColor: '#162C50',
    padding: 12,
    marginTop: 4,
    gap: 12,
  },
  addNewIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewPlus: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#0B1B36',
  },
  addNewText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },

  /* MODAL STYLES */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 18, 36, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(10, 25, 55, 0.98)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 16 : 24,
    maxHeight: H * 0.9,
    shadowColor: '#002B66',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FBBF24',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalTitle: {
    flex: 1,
    fontSize: isSmallDevice ? 19 : 22,
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#162C50',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#264878',
    backgroundColor: '#162C50',
  },
  typeChipActive: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  typeChipText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: '#829AB8',
  },
  typeChipTextActive: {
    color: '#0B1B36',
  },

  rowFields: { flexDirection: 'row' },

  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    backgroundColor: '#162C50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
  },
  checkIcon: {
    fontSize: 12,
    color: '#0B1B36',
    fontFamily: 'DMSans-Bold',
  },
  defaultToggleText: {
    fontSize: 13.5,
    fontFamily: 'DMSans-Medium',
    color: '#E2E8F0',
  },

  saveBtn: {
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: {
    color: '#0B1B36',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    letterSpacing: 0.3,
  },

  errorBanner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 70 : 100,
    left: 16,
    right: 16,
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 15,
  },
  errorBannerText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11.5,
    color: '#FCA5A5',
    flex: 1,
    marginRight: 10,
  },
  errorBannerBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  errorBannerBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 18, 36, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  mapLoaderText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13.5,
    color: '#FBBF24',
    marginTop: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#071224',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  searchBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#162C50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchBackBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#FBBF24',
  },
  searchInputWrapper: {
    flex: 1,
    height: 44,
    backgroundColor: '#162C50',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#264878',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  searchInput: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14.5,
    color: '#FFFFFF',
    height: '100%',
  },
  searchLoaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  searchLoaderText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13.5,
    color: '#FBBF24',
  },
  searchResultsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#162C50',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#264878',
    padding: 14,
    marginBottom: 10,
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  resultAddress: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11.5,
    color: '#829AB8',
    lineHeight: 16,
  },
  searchEmptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  searchEmptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#829AB8',
    textAlign: 'center',
  },
})

const f = StyleSheet.create({
  fieldWrap: { marginBottom: 12 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: '#829AB8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputContainer: {
    backgroundColor: '#162C50',
    borderWidth: 1.5,
    borderColor: '#264878',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    borderColor: '#FBBF24',
    backgroundColor: '#1E3A68',
  },
  input: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
    height: '100%',
  },
})

export default AddressScreen
