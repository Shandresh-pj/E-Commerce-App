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
import {
  getData,
  postData,
  putData,
  fetchMyProfile,
  deleteData,
} from '../../../shared/services/main-service'

const { width: W, height: H } = Dimensions.get('window')

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

const GlassField = ({ label, value, onChange, placeholder, keyboardType, maxLength }: any) => (
  <View style={f.fieldWrap}>
    <Text style={f.fieldLabel}>{label}</Text>
    <TextInput
      style={f.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder ?? label}
      placeholderTextColor="#9a9a9a"
      keyboardType={keyboardType ?? 'default'}
      maxLength={maxLength}
    />
  </View>
)

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
  const typeEmoji: Record<AddressType, string> = {
    Home: '🏠',
    Work: '💼',
    Other: '📍',
  }
  const typeBg: Record<AddressType, string> = {
    Home: '#FFF4D6',
    Work: '#EBE4FF',
    Other: '#E0F0FF',
  }

  const fullAddress = [address.line1, address.city, address.pincode]
    .filter(Boolean)
    .join(', ')

  return (
    <View style={s.savedCard}>
      <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={onSelect} activeOpacity={0.75}>
        <View style={[s.savedIconBox, { backgroundColor: typeBg[address.label] }]}>
          <Text style={s.savedEmoji}>{typeEmoji[address.label]}</Text>
        </View>
        <View style={s.savedInfo}>
          <Text style={s.savedLabel}>
            {address.label}
            {address.name ? ` (${address.name})` : ''}
          </Text>
          <Text style={s.savedAddress} numberOfLines={2}>{fullAddress}</Text>
          {address.phone ? (
            <Text style={{ fontSize: 11, color: '#757575', marginTop: 2, fontFamily: 'DMSans-Medium' }}>
              📞 {address.phone}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={s.actionCol}>
        <TouchableOpacity style={s.miniActionBtn} onPress={onEdit} activeOpacity={0.7}>
          <Text style={s.miniActionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.miniActionBtn} onPress={onDelete} activeOpacity={0.7}>
          <Text style={[s.miniActionText, { color: '#E53935' }]}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

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
  const sheetSlide = useRef(new Animated.Value(0)).current

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

  const handleReceiverTypeChange = (type: 'myself' | 'other') => {
    setReceiverType(type)
    setForm(prev => ({
      ...prev,
      receiverType: type,
      name: type === 'myself' ? profileName : '',
      phone: type === 'myself' ? profilePhone : '',
    }))
  }

  const openModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id)
      setForm({
        label: address.label,
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        city: address.city,
        state: address.state || 'N/A',
        pincode: address.pincode,
        isDefault: address.isDefault,
        receiverType: address.receiverType || 'myself',
      })
      const isMyself = (address.receiverType || 'myself') === 'myself'
      setReceiverType(isMyself ? 'myself' : 'other')
    } else {
      setEditingId(null)
      setForm({
        ...emptyForm(),
        name: profileName,
        phone: profilePhone,
        receiverType: 'myself',
      })
      setReceiverType('myself')
    }

    setModalVisible(true)
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start()
  }

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: H,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setModalVisible(false))
  }

  const setF = (key: keyof FormState) => (value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    if (!form.name.trim()) { Alert.alert('Error', "Receiver's name is required."); return false }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length !== 10) { Alert.alert('Error', 'Enter a valid 10-digit receiver phone.'); return false }
    if (!form.line1.trim()) { Alert.alert('Error', 'Address line 1 is required.'); return false }
    if (!form.city.trim()) { Alert.alert('Error', 'City is required.'); return false }
    if (!form.pincode.trim() || form.pincode.length < 6) { Alert.alert('Error', 'Enter a valid 6-digit pincode.'); return false }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        label: form.label,
        name: form.name.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        city: form.city.trim(),
        state: form.state.trim() || 'N/A',
        pincode: form.pincode.trim(),
        isDefault: form.isDefault,
        receiver_type: form.receiverType,
      }

      let res: any
      if (editingId) {
        res = await putData(`/address/${editingId}`, payload)
      } else {
        res = await postData('/address', payload)
      }

      if (res?.data?.success) {
        await loadAddresses()
        closeModal()
      } else {
        Alert.alert('Error', res?.data?.message || 'Failed to save address.')
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteData(`/address/${id}`)
              if (res?.data?.success) {
                await loadAddresses()
              } else {
                Alert.alert('Error', res?.data?.message || 'Failed to delete address.')
              }
            } catch (err) {
              console.log('deleteAddress error:', err)
              Alert.alert('Error', 'Something went wrong.')
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  const handleConfirm = () => {
    navigation.goBack()
  }

  const ADDRESS_TYPES: AddressType[] = ['Home', 'Work', 'Other']

  const displayAddress = selectedAddress
    ? [selectedAddress.line1, selectedAddress.city, selectedAddress.pincode].filter(Boolean).join(', ')
    : 'Select a delivery address'

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEE8" />

      {/* Map Background */}
      <View style={s.mapBg}>
        <SafeAreaView edges={['top']} style={s.searchOverlay}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={s.searchBar}>
            <Text style={s.searchIcon}>🔎</Text>
            <Text style={s.searchPlaceholder}>Search area, street, landmark...</Text>
          </View>
        </SafeAreaView>

        {/* Map grid */}
        <View style={s.gridContainer}>
          <View style={[s.gridLineH, { top: '25%' }]} />
          <View style={[s.gridLineH, { top: '50%' }]} />
          <View style={[s.gridLineH, { top: '75%' }]} />
          <View style={[s.gridLineV, { left: '25%' }]} />
          <View style={[s.gridLineV, { left: '50%' }]} />
          <View style={[s.gridLineV, { left: '75%' }]} />
          <View style={s.greenPatch1} />
          <View style={s.roadH} />
          <View style={s.roadV} />
        </View>

        {/* Pin marker */}
        <View style={s.pinContainer}>
          <View style={s.pinLabel}>
            <Text style={s.pinLabelText}>Your order arrives here</Text>
          </View>
          <Text style={s.pinMarker}>📍</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={s.bottomSheet}>
        <View style={s.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetScroll}>
          {/* Selected Address */}
          <View style={s.selectedCard}>
            <View style={s.selectedLeft}>
              <Text style={s.selectedPin}>📍</Text>
              <View style={s.selectedInfo}>
                <Text style={s.selectedTitle}>Set delivery to this pin</Text>
                <Text style={s.selectedAddress} numberOfLines={2}>{displayAddress}</Text>
              </View>
            </View>
            <View style={s.etaBadge}>
              <Text style={s.etaText}>8 MIN</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={s.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={s.confirmBtnText}>Confirm & continue →</Text>
          </TouchableOpacity>

          {/* Saved Addresses */}
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

          {/* Add New Address */}
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

      {/* Add/Edit Address Modal */}
      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={closeModal}>
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
                <TouchableOpacity onPress={closeModal} style={s.closeBtn}>
                  <Text style={s.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={f.fieldWrap}>
                  <Text style={f.fieldLabel}>Address Type</Text>
                  <View style={s.typeRow}>
                    {ADDRESS_TYPES.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[s.typeChip, form.label === t && s.typeChipActive]}
                        onPress={() => setF('label')(t)}
                      >
                        <Text style={{ fontSize: 14 }}>
                          {t === 'Home' ? '🏠' : t === 'Work' ? '💼' : '📍'}
                        </Text>
                        <Text
                          style={[s.typeChipText, form.label === t && s.typeChipTextActive]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={f.fieldWrap}>
                  <Text style={f.fieldLabel}>Receiver</Text>
                  <View style={s.typeRow}>
                    <TouchableOpacity
                      style={[s.typeChip, receiverType === 'myself' && s.typeChipActive]}
                      onPress={() => handleReceiverTypeChange('myself')}
                    >
                      <Text style={{ fontSize: 14 }}>👤</Text>
                      <Text style={[s.typeChipText, receiverType === 'myself' && s.typeChipTextActive]}>
                        Myself
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.typeChip, receiverType === 'other' && s.typeChipActive]}
                      onPress={() => handleReceiverTypeChange('other')}
                    >
                      <Text style={{ fontSize: 14 }}>👥</Text>
                      <Text style={[s.typeChipText, receiverType === 'other' && s.typeChipTextActive]}>
                        Someone else
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <GlassField
                  label="Receiver's Name *"
                  value={form.name}
                  onChange={setF('name')}
                  placeholder="Full name of receiver"
                />
                <GlassField
                  label="Receiver's Phone Number *"
                  value={form.phone}
                  onChange={(v: string) => setF('phone')(v.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <GlassField label="Address Line 1 *" value={form.line1} onChange={setF('line1')} placeholder="House / Flat / Block" />
                <View style={s.rowFields}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <GlassField label="City *" value={form.city} onChange={setF('city')} placeholder="City" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <GlassField label="Pincode *" value={form.pincode} onChange={setF('pincode')} placeholder="6-digit" keyboardType="numeric" maxLength={6} />
                  </View>
                </View>

                <TouchableOpacity
                  style={s.defaultToggle}
                  onPress={() => setF('isDefault')(!form.isDefault)}
                >
                  <View style={[s.checkbox, form.isDefault && s.checkboxChecked]}>
                    {form.isDefault && <Text style={s.checkIcon}>✓</Text>}
                  </View>
                  <Text style={s.defaultToggleText}>Set as default delivery address</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.saveBtn, saving && s.saveBtnDisabled]}
                  onPress={handleSave}
                  activeOpacity={0.85}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.saveBtnText}>
                      {editingId ? 'Update Address' : 'Save Address'}
                    </Text>
                  )}
                </TouchableOpacity>
                <View style={{ height: 24 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECEEE8' },

  mapBg: {
    flex: 1,
    backgroundColor: '#ECEEE8',
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
    paddingTop: 8,
    gap: 10,
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backArrow: { fontSize: 18, color: '#141414' },
  searchBar: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { fontSize: 14 },
  searchPlaceholder: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#9a9a9a',
  },

  gridContainer: { ...StyleSheet.absoluteFillObject },
  gridLineH: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(200,200,195,0.4)',
  },
  gridLineV: {
    position: 'absolute', top: 0, bottom: 0, width: 1,
    backgroundColor: 'rgba(200,200,195,0.4)',
  },
  greenPatch1: {
    position: 'absolute', top: '20%', left: '30%', width: 90, height: 70,
    backgroundColor: 'rgba(200,220,190,0.5)', borderRadius: 4,
    transform: [{ rotate: '-5deg' }],
  },
  roadH: {
    position: 'absolute', top: '45%', left: 0, right: 0, height: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  roadV: {
    position: 'absolute', left: '50%', top: 0, bottom: 0, width: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  pinContainer: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  pinLabel: {
    backgroundColor: '#141414',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 6,
  },
  pinLabelText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  pinMarker: {
    fontSize: 32,
  },

  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: H * 0.55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E4E4E2', alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCE8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFE000',
    borderStyle: 'dashed',
    padding: 14,
    marginBottom: 14,
  },
  selectedLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  selectedPin: { fontSize: 18, marginTop: 2 },
  selectedInfo: { flex: 1 },
  selectedTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#141414',
    marginBottom: 4,
  },
  selectedAddress: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#8a8a8a',
    lineHeight: 17,
  },
  etaBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0C831F',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  etaText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#0C831F',
  },

  confirmBtn: {
    backgroundColor: '#141414',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  confirmBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#9a9a9a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  savedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedEmoji: { fontSize: 20 },
  savedInfo: { flex: 1 },
  savedLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#141414',
    marginBottom: 3,
  },
  savedAddress: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#8a8a8a',
    lineHeight: 17,
  },

  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E4E4E2',
    borderStyle: 'dashed',
    padding: 14,
    marginTop: 4,
    gap: 12,
  },
  addNewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNewPlus: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#141414',
  },
  addNewText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#141414',
  },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: H * 0.92,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E4E4E2', alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  modalTitle: { flex: 1, fontSize: 18, fontFamily: 'DMSans-Bold', color: '#141414' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F4F5F0', alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, color: '#9a9a9a' },

  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E4E4E2', backgroundColor: '#F8F9FB',
  },
  typeChipActive: { backgroundColor: '#141414', borderColor: '#141414' },
  typeChipText: { fontSize: 13, fontFamily: 'DMSans-Bold', color: '#9a9a9a' },
  typeChipTextActive: { color: '#fff' },

  rowFields: { flexDirection: 'row' },

  defaultToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 4, marginBottom: 20, paddingHorizontal: 2,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#E4E4E2',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#0C831F', borderColor: '#0C831F' },
  checkIcon: { fontSize: 12, color: '#fff', fontFamily: 'DMSans-Bold' },
  defaultToggleText: { fontSize: 13.5, fontFamily: 'DMSans-Medium', color: '#141414' },

  saveBtn: {
    backgroundColor: '#0C831F', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0C831F', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans-Bold' },

  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  miniActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  miniActionText: {
    fontSize: 13,
  },
})

const f = StyleSheet.create({
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12, fontFamily: 'DMSans-Bold', color: '#9a9a9a',
    letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FB', borderWidth: 1.5, borderColor: '#E4E4E2',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: 'DMSans-Regular', color: '#141414',
  },
})

export default AddressScreen
