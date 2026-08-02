import React, { useState, useRef, useCallback } from 'react'
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
const GlassField = ({ label, value, onChange, placeholder, keyboardType, maxLength }: any) => {
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
  onSelect,
  onEdit,
  onDelete,
}: {
  address: Address
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) => {
  const fullAddress = [address.line1, address.city, address.pincode]
    .filter(Boolean)
    .join(', ')

  return (
    <View style={s.savedCard}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        onPress={onSelect}
        activeOpacity={0.8}
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
          <Text style={s.savedLabel}>
            {address.label}
            {address.name ? ` (${address.name})` : ''}
          </Text>
          <Text style={s.savedAddress} numberOfLines={2}>
            {fullAddress}
          </Text>
          {address.phone ? (
            <Text style={s.savedPhoneText}>📞 {address.phone}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={s.actionCol}>
        <TouchableOpacity style={s.miniActionBtn} onPress={onEdit} activeOpacity={0.75}>
          <EditSvgIcon color="#FBBF24" size={15} />
        </TouchableOpacity>
        <TouchableOpacity style={s.miniActionBtn} onPress={onDelete} activeOpacity={0.75}>
          <TrashSvgIcon color="#FF6B6B" size={15} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */
const AddressScreen = () => {
  const navigation = useNavigation<any>()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [receiverType, setReceiverType] = useState<'myself' | 'other'>('myself')

  const slideAnim = useRef(new Animated.Value(H)).current

  const loadAddresses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getData('/address')
      const data: any[] = res?.data?.data || []
      const mapped = data.map(a => ({
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
      }))
      setAddresses(mapped)
      const defaultAddr = mapped.find(a => a.isDefault) || mapped[0] || null
      if (defaultAddr && !selectedAddress) setSelectedAddress(defaultAddr)
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
        setProfilePhone(prof.phone || prof.Phone || '')
      }
    } catch (e) {
      console.log('loadProfile error:', e)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadAddresses()
      loadProfile()
    }, [loadAddresses, loadProfile]),
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
      })
      setReceiverType(addr.receiverType || 'myself')
    } else {
      setEditingId(null)
      setForm({
        ...emptyForm(),
        name: profileName,
        phone: profilePhone,
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
    setForm(prev => ({
      ...prev,
      receiverType: type,
      name: type === 'myself' ? profileName : '',
      phone: type === 'myself' ? profilePhone : '',
    }))
  }

  const setF = (key: keyof FormState) => (val: any) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    if (!form.line1.trim() || !form.city.trim() || !form.pincode.trim()) {
      Alert.alert('Required Fields', 'Please fill in Address Line 1, City, and Pincode.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        label: form.label,
        name: form.name,
        phone: form.phone,
        line1: form.line1,
        city: form.city,
        state: form.state || 'N/A',
        pincode: form.pincode,
        isDefault: form.isDefault,
        receiver_type: receiverType,
      }

      if (editingId) {
        await putData(`/address/${editingId}`, payload)
      } else {
        await postData('/address', payload)
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
            if (selectedAddress?.id === id) setSelectedAddress(null)
            loadAddresses()
          } catch (e) {
            console.log('Delete address error:', e)
          }
        },
      },
    ])
  }

  const handleConfirm = () => {
    if (!selectedAddress && addresses.length > 0) {
      setSelectedAddress(addresses[0])
    }
    navigation.goBack()
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#071224" translucent={false} />

      {/* SAPPHIRE MAP BACKGROUND */}
      <View style={s.mapBg}>
        <SafeAreaView edges={['top']} style={s.searchOverlay}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackSvgIcon color="#FFFFFF" size={18} />
          </TouchableOpacity>

          <View style={s.searchBar}>
            <SearchSvgIcon color="#FBBF24" size={18} />
            <Text style={s.searchPlaceholder}>Search area, street, landmark...</Text>
          </View>
        </SafeAreaView>

        {/* Map Grid Elements */}
        <View style={s.gridContainer}>
          <View style={s.roadH} />
          <View style={s.roadV} />
          <View style={s.building1} />
          <View style={s.building2} />

          <View style={s.pinContainer}>
            <View style={s.pinLabel}>
              <Text style={s.pinLabelText}>⚡ Delivery Location</Text>
            </View>
            <PinSvgIcon color="#FBBF24" size={32} />
          </View>
        </View>
      </View>

      {/* FLOATING SAPPHIRE SHEET */}
      <View style={s.bottomSheet}>
        <View style={s.sheetHandle} />

        <ScrollView contentContainerStyle={s.sheetScroll} showsVerticalScrollIndicator={false}>
          {/* Selected Address Display */}
          {selectedAddress ? (
            <View style={s.selectedCard}>
              <View style={s.selectedLeft}>
                <PinSvgIcon color="#FBBF24" size={20} />
                <View style={s.selectedInfo}>
                  <Text style={s.selectedTitle}>
                    {selectedAddress.label} {selectedAddress.name ? `• ${selectedAddress.name}` : ''}
                  </Text>
                  <Text style={s.selectedAddress} numberOfLines={2}>
                    {[selectedAddress.line1, selectedAddress.city, selectedAddress.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                </View>
              </View>
              <View style={s.etaBadge}>
                <Text style={s.etaText}>⚡ 8 MIN</Text>
              </View>
            </View>
          ) : null}

          {/* Confirm Button */}
          <TouchableOpacity
            style={s.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={s.confirmBtnText}>Confirm & continue →</Text>
          </TouchableOpacity>

          {/* Saved Addresses List */}
          {addresses.length > 0 && (
            <>
              <Text style={s.sectionTitle}>SAVED ADDRESSES</Text>
              {addresses.map(addr => (
                <SavedAddressCard
                  key={addr.id}
                  address={addr}
                  onSelect={() => setSelectedAddress(addr)}
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

      {/* ULTRA-MODERN ADD / EDIT ADDRESS MODAL SHEET */}
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
                {/* Address Type Selector */}
                <View style={f.fieldWrap}>
                  <Text style={f.fieldLabel}>ADDRESS TYPE</Text>
                  <View style={s.typeRow}>
                    {ADDRESS_TYPES.map(t => {
                      const isActive = form.label === t
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[s.typeChip, isActive && s.typeChipActive]}
                          onPress={() => setF('label')(t)}
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

                {/* Receiver Type Selector */}
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
                  onChange={setF('name')}
                  placeholder="Full name of receiver"
                />

                <GlassField
                  label="RECEIVER'S PHONE NUMBER *"
                  value={form.phone}
                  onChange={(v: string) => setF('phone')(v.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <GlassField
                  label="ADDRESS LINE 1 *"
                  value={form.line1}
                  onChange={setF('line1')}
                  placeholder="House / Flat / Block"
                />

                <View style={s.rowFields}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <GlassField
                      label="CITY *"
                      value={form.city}
                      onChange={setF('city')}
                      placeholder="City"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <GlassField
                      label="PINCODE *"
                      value={form.pincode}
                      onChange={setF('pincode')}
                      placeholder="6-digit"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                </View>

                {/* Default Toggle Checkbox */}
                <TouchableOpacity
                  style={s.defaultToggle}
                  onPress={() => setF('isDefault')(!form.isDefault)}
                  activeOpacity={0.8}
                >
                  <View style={[s.checkbox, form.isDefault && s.checkboxChecked]}>
                    {form.isDefault && <Text style={s.checkIcon}>✓</Text>}
                  </View>
                  <Text style={s.defaultToggleText}>Set as default delivery address</Text>
                </TouchableOpacity>

                {/* Save CTA Button */}
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

  gridContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  roadH: { position: 'absolute', top: '40%', left: 0, right: 0, height: 16, backgroundColor: '#102446' },
  roadV: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 16, backgroundColor: '#102446' },
  building1: { position: 'absolute', top: '20%', left: '20%', width: 70, height: 60, backgroundColor: '#0A1830', borderRadius: 8 },
  building2: { position: 'absolute', bottom: '30%', right: '20%', width: 80, height: 70, backgroundColor: '#0A1830', borderRadius: 8 },

  pinContainer: {
    position: 'absolute',
    top: '35%',
    alignItems: 'center',
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
    backgroundColor: 'rgba(11, 27, 54, 0.96)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    maxHeight: H * 0.58,
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

  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162C50',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FBBF24',
    padding: 14,
    marginBottom: 14,
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
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  selectedAddress: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  etaBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  etaText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#FBBF24',
  },

  confirmBtn: {
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  confirmBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15.5,
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

  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162C50',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#264878',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  savedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedInfo: { flex: 1 },
  savedLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  savedAddress: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  savedPhoneText: {
    fontSize: 11,
    color: '#FBBF24',
    marginTop: 2,
    fontFamily: 'DMSans-Medium',
  },

  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    backgroundColor: '#162C50',
    padding: 14,
    marginTop: 4,
    gap: 12,
  },
  addNewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBBF24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewPlus: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#0B1B36',
  },
  addNewText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
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

  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  miniActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#18345C',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
    height: '100%',
  },
})

export default AddressScreen
