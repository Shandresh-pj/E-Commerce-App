import React, { useState, useRef, useCallback, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import { getData, postData, putData, patchData, deleteData } from '../../../shared/services/main-service';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#F5F6FA',
  surface: '#FFFFFF',
  header: '#1a1b2e',
  accent: '#7C6EF5',
  accentLight: 'rgba(124,110,245,0.1)',
  accentBorder: 'rgba(124,110,245,0.3)',
  text: '#1C1C2E',
  textMid: '#6B7280',
  textLight: '#9CA3AF',
  danger: '#EF4444',
  dangerLight: 'rgba(239,68,68,0.09)',
  border: '#E8EAED',
  inputBg: '#F8F9FB',
  shadow: '#1C1C2E',
  green: '#22C55E',
};

const { width, height } = Dimensions.get('window');

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const EditIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Polyline points="3 6 5 6 21 6" stroke={C.danger} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={C.danger} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10 11v6M14 11v6" stroke={C.danger} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke={C.danger} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MapPinIcon = ({ color = C.accent }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const HomeIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 22 9 12 15 12 15 22" stroke={C.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={C.textMid} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
type AddressType = 'Home' | 'Work' | 'Other';

interface Address {
  id: string;
  label: AddressType;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface FormState {
  label: AddressType;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const emptyForm = (): FormState => ({
  label: 'Home',
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
});

// ─── Form field ───────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  maxLength?: number;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, placeholder, keyboardType, maxLength }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fs.fieldWrap}>
      <Text style={fs.fieldLabel}>{label}</Text>
      <TextInput
        style={[fs.input, focused && fs.inputFocused]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? label}
        placeholderTextColor={C.textLight}
        keyboardType={keyboardType ?? 'default'}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

// ─── Address card ─────────────────────────────────────────────────────────────
interface CardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

const AddressCard: React.FC<CardProps> = ({ address, onEdit, onDelete, onSetDefault }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }).start();

  const typeColors: Record<AddressType, string> = {
    Home: '#7C6EF5',
    Work: '#3B82F6',
    Other: '#F59E0B',
  };

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      {/* Default badge top strip */}
      {address.isDefault && <View style={s.defaultStrip} />}

      <View style={s.cardTop}>
        {/* Label chip */}
        <View style={[s.labelChip, { backgroundColor: typeColors[address.label] + '1A', borderColor: typeColors[address.label] + '44' }]}>
          <View style={[s.labelDot, { backgroundColor: typeColors[address.label] }]} />
          <Text style={[s.labelText, { color: typeColors[address.label] }]}>{address.label}</Text>
        </View>

        {address.isDefault && (
          <View style={s.defaultBadge}>
            <CheckIcon />
            <Text style={s.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>

      <View style={s.cardBody}>
        <View style={s.pinIconWrap}>
          <MapPinIcon />
        </View>
        <View style={s.cardText}>
          <Text style={s.addressName}>{address.name}</Text>
          <Text style={s.addressPhone}>{address.phone}</Text>
          <Text style={s.addressLine} numberOfLines={2}>
            {address.line1}
            {address.line2 ? ', ' + address.line2 : ''}
          </Text>
          <Text style={s.addressLine}>
            {address.city}, {address.state} — {address.pincode}
          </Text>
        </View>
      </View>

      <View style={s.cardActions}>
        {!address.isDefault && (
          <TouchableOpacity style={s.actionBtnGhost} onPress={onSetDefault} activeOpacity={0.7}>
            <Text style={s.actionBtnGhostText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={s.actionIcon}
          onPress={onEdit}
          activeOpacity={0.7}
          onPressIn={pressIn}
          onPressOut={pressOut}
        >
          <EditIcon />
          <Text style={s.actionIconLabel}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionIcon, s.actionIconDanger]} onPress={onDelete} activeOpacity={0.7}>
          <TrashIcon />
          <Text style={s.actionIconLabelDanger}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
const AddressScreen = () => {
  const navigation = useNavigation<any>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getData('/address');
      const data: any[] = res?.data?.data || [];
      setAddresses(
        data.map(a => ({
          id: String(a.id),
          label: a.label as AddressType,
          name: a.name,
          phone: a.phone,
          line1: a.line1,
          line2: a.line2 || '',
          city: a.city,
          state: a.state,
          pincode: a.pincode,
          isDefault: !!a.isDefault,
        }))
      );
    } catch (e) {
      console.log('Address fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadAddresses(); }, [loadAddresses]));

  const openModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setForm({
        label: address.label,
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm());
    }
    setModalVisible(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, { toValue: height, duration: 260, useNativeDriver: true }).start(() =>
      setModalVisible(false)
    );
  };

  const setF = (key: keyof FormState) => (value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Full name is required.'); return false; }
    if (!form.phone.trim() || form.phone.length !== 10) { Alert.alert('Error', 'Enter a valid 10-digit phone number.'); return false; }
    if (!form.line1.trim()) { Alert.alert('Error', 'Address line 1 is required.'); return false; }
    if (!form.city.trim()) { Alert.alert('Error', 'City is required.'); return false; }
    if (!form.state.trim()) { Alert.alert('Error', 'State is required.'); return false; }
    if (!form.pincode.trim() || form.pincode.length < 6) { Alert.alert('Error', 'Enter a valid 6-digit pincode.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        label: form.label,
        name: form.name.trim(),
        phone: form.phone.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        isDefault: form.isDefault,
      };

      let res: any;
      if (editingId) {
        res = await putData(`/address/${editingId}`, payload);
      } else {
        res = await postData('/address', payload);
      }

      if (res?.data?.success) {
        await loadAddresses();
        closeModal();
      } else {
        Alert.alert('Error', res?.data?.message || 'Failed to save address.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res: any = await deleteData(`/address/${id}`, {});
          if (res?.data?.success) {
            setAddresses(prev => prev.filter(a => a.id !== id));
          } else {
            Alert.alert('Error', res?.data?.message || 'Failed to delete address.');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    const res: any = await patchData(`/address/${id}/default`, {});
    if (res?.data?.success) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    } else {
      Alert.alert('Error', res?.data?.message || 'Failed to update default address.');
    }
  };

  const ADDRESS_TYPES: AddressType[] = ['Home', 'Work', 'Other'];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={C.header} />
      <SafeAreaView edges={['top']} style={{ backgroundColor: C.header }} />
      <SafeAreaView edges={['left', 'right', 'bottom']} style={s.root}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Saved Addresses</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => openModal()} activeOpacity={0.8}>
            <PlusIcon />
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={s.emptyState}>
              <ActivityIndicator size="large" color={C.accent} />
            </View>
          ) : addresses.length === 0 ? (
            <View style={s.emptyState}>
              <MapPinIcon color={C.textLight} />
              <Text style={s.emptyTitle}>No addresses saved</Text>
              <Text style={s.emptySub}>Add a delivery address to get started</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => openModal()} activeOpacity={0.8}>
                <Text style={s.emptyBtnText}>+ Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map(addr => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => openModal(addr)}
                onDelete={() => handleDelete(addr.id)}
                onSetDefault={() => handleSetDefault(addr.id)}
              />
            ))
          )}
        </ScrollView>

        {/* Bottom CTA */}
        {addresses.length > 0 && (
          <View style={s.bottomBar}>
            <TouchableOpacity style={s.bottomBtn} onPress={() => openModal()} activeOpacity={0.85}>
              <Text style={s.bottomBtnText}>+ Add New Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* ── Add / Edit Modal ──────────────────────────────────────── */}
      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={closeModal}>
        <View style={s.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeModal} activeOpacity={1} />
          <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              {/* Handle */}
              <View style={s.sheetHandle} />

              {/* Title row */}
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>
                <TouchableOpacity onPress={closeModal} style={s.closeBtn} activeOpacity={0.7}>
                  <CloseIcon />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Address type selector */}
                <View style={fs.fieldWrap}>
                  <Text style={fs.fieldLabel}>Address Type</Text>
                  <View style={s.typeRow}>
                    {ADDRESS_TYPES.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[s.typeChip, form.label === t && s.typeChipActive]}
                        onPress={() => setF('label')(t)}
                        activeOpacity={0.7}
                      >
                        {t === 'Home' && <HomeIcon />}
                        {t === 'Work' && <MapPinIcon color={form.label === t ? '#fff' : C.textMid} />}
                        {t === 'Other' && <MapPinIcon color={form.label === t ? '#fff' : C.textMid} />}
                        <Text style={[s.typeChipText, form.label === t && s.typeChipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Field label="Full Name *" value={form.name} onChange={setF('name')} placeholder="Your full name" />
                <Field label="Phone Number *" value={form.phone} onChange={v => setF('phone')(v.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={10} />
                <Field label="Address Line 1 *" value={form.line1} onChange={setF('line1')} placeholder="House / Flat / Block No." />
                <Field label="Address Line 2" value={form.line2} onChange={setF('line2')} placeholder="Area, Colony, Street (optional)" />

                <View style={s.rowFields}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Field label="City *" value={form.city} onChange={setF('city')} placeholder="City" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Field label="Pincode *" value={form.pincode} onChange={setF('pincode')} placeholder="6-digit" keyboardType="numeric" maxLength={6} />
                  </View>
                </View>

                <Field label="State *" value={form.state} onChange={setF('state')} placeholder="State" />

                {/* Default toggle */}
                <TouchableOpacity style={s.defaultToggle} onPress={() => setF('isDefault')(!form.isDefault)} activeOpacity={0.7}>
                  <View style={[s.checkbox, form.isDefault && s.checkboxChecked]}>
                    {form.isDefault && <CheckIcon />}
                  </View>
                  <Text style={s.defaultToggleText}>Set as default delivery address</Text>
                </TouchableOpacity>

                {/* Save button */}
                <TouchableOpacity
                  style={[s.saveBtn, saving && s.saveBtnDisabled]}
                  onPress={handleSave}
                  activeOpacity={0.85}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.saveBtnText}>{editingId ? 'Update Address' : 'Save Address'}</Text>
                  )}
                </TouchableOpacity>

                <View style={{ height: 24 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    backgroundColor: C.header,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* List */
  scroll: { padding: 16, paddingBottom: 100 },

  /* Card */
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  defaultStrip: {
    height: 3,
    backgroundColor: C.accent,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 10,
    gap: 8,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  pinIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardText: { flex: 1 },
  addressName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: C.textMid,
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 13,
    color: C.textMid,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  actionBtnGhost: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.accentBorder,
  },
  actionBtnGhostText: {
    color: C.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  actionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.accentLight,
  },
  actionIconDanger: {
    backgroundColor: C.dangerLight,
  },
  actionIconLabel: {
    color: C.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  actionIconLabelDanger: {
    color: C.danger,
    fontSize: 12,
    fontWeight: '600',
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: C.textMid,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Bottom bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  bottomBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: height * 0.92,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Type selector */
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.inputBg,
  },
  typeChipActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMid,
  },
  typeChipTextActive: {
    color: '#fff',
  },

  /* Row fields */
  rowFields: {
    flexDirection: 'row',
  },

  /* Default toggle */
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  defaultToggleText: {
    fontSize: 13.5,
    color: C.text,
    fontWeight: '500',
  },

  /* Save button */
  saveBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ─── Form field styles ────────────────────────────────────────────────────────
const fs = StyleSheet.create({
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMid,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: C.accent,
    backgroundColor: C.surface,
  },
});

export default AddressScreen;
