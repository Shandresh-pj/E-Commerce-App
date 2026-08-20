import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    PermissionsAndroid,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../elements/AppHeader';
import { MapView, RoutePoint } from '../../elements/MapView';
import { BackgroundLocationDisclosureModal } from '../../elements/BackgroundLocationDisclosureModal';
import { THEME } from '../../assets/styles/theme';
import { getData } from '../../../shared/services/main-service';
import Svg, { Path } from 'react-native-svg';
import Geolocation from '@react-native-community/geolocation';

// Reload icon
const ReloadIcon = ({ color = '#000000', size = 14, style }: { color?: string; size?: number; style?: any }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Path
            d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.73"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const MapScreen = () => {
    const watchIdRef = useRef<number | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [stats, setStats] = useState({
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        speed: 0,
        altitude: 0,
        provider: 'n/a',
    });
    const [showBgLocationDisclosure, setShowBgLocationDisclosure] = useState(false);
    const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const hasFetchedTodayData = useRef(false);

    // Records state
    const [recordCount, setRecordCount] = useState<string>('10');
    const [isFetchingN, setIsFetchingN] = useState(false);
    const [fetchNError, setFetchNError] = useState<string | null>(null);
    const [lastFetchedCount, setLastFetchedCount] = useState<number | null>(null);

    const fetchRoutePoints = useCallback(async (lat?: number, lng?: number) => {
        const queryLat = lat ?? stats.latitude;
        const queryLng = lng ?? stats.longitude;
        if (queryLat === 0 && queryLng === 0) {
            return;
        }
        try {
            setIsLoadingRoute(true);
            const url = `/EmployeeDailyRoutePoint/All?latitude=${queryLat}&longitude=${queryLng}`;

            const res: any = await getData(url);
            console.log('Data', res);

            let data = res?.data?.data?.data || res?.data?.data || res?.data || [];
            if (!Array.isArray(data)) {
                console.warn('API returned non-array payload:', data);
                data = [];
            }

            const mappedPoints: RoutePoint[] = data.map((item: any) => {
                const itemLat = item.Latitude ?? item.latitude ?? item.Lat ?? item.lat ?? 0;
                const itemLng = item.Longitude ?? item.longitude ?? item.Lng ?? item.lng ?? 0;
                const accuracy = item.Accuracy ?? item.accuracy ?? 0;
                const recordedAt = item.CreatedOn ?? item.createdOn ?? item.RecordedAt ?? item.recordedAt ?? item.Time ?? item.time;
                return {
                    latitude: Number(itemLat),
                    longitude: Number(itemLng),
                    accuracy: Number(accuracy),
                    recordedAt: recordedAt ? String(recordedAt) : undefined,
                };
            }).filter((p: RoutePoint) => p.latitude !== 0 && p.longitude !== 0)
              .filter((p: RoutePoint) => {
                  if (!p.recordedAt) return false;
                  
                  // Filter by today
                  const getLocalDateString = () => {
                      const d = new Date();
                      const year = d.getFullYear();
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                  };
                  const todayStr = getLocalDateString();
                  return p.recordedAt.includes(todayStr);
              });

            setRoutePoints(mappedPoints);
        } catch (error) {
            console.error('Error fetching route points:', error);
        } finally {
            setIsLoadingRoute(false);
        }
    }, [stats.latitude, stats.longitude]);

    const fetchLastNRecords = async () => {
        // Validation
        const trimmed = recordCount.trim();
        const parsed = parseInt(trimmed, 10);

        if (!trimmed || isNaN(parsed)) {
            setFetchNError('Please enter a valid number.');
            return;
        }
        if (parsed < 1) {
            setFetchNError('Number must be at least 1.');
            return;
        }
        if (parsed > 10000) {
            setFetchNError('Number cannot exceed 10 000.');
            return;
        }
        setFetchNError(null);

        // API call
        try {
            setIsFetchingN(true);

            const queryLat = stats.latitude;
            const queryLng = stats.longitude;
            const url = `/EmployeeDailyRoutePoint/All?latitude=${queryLat}&longitude=${queryLng}`;
            const res: any = await getData(url);
            console.log('res', res);

            // Parse response data
            let data: any =
                res?.data?.data?.data ??                   res?.data?.data ??                          res?.data ??                                [];

            // Handle response error
            const httpStatus = res?.status ?? res?.data?.StatusCode ?? res?.data?.statusCode;
            if (httpStatus && httpStatus >= 400) {
                const msg = res?.data?.Message ?? res?.data?.message ?? `Server error (${httpStatus})`;
                setFetchNError(msg);
                return;
            }

            if (!Array.isArray(data)) {
                console.warn('[fetchLastN] non-array payload — data was:', data);
                const inner: any = data?.records ?? data?.items ?? data?.Results ?? data?.results ?? null;
                data = Array.isArray(inner) ? inner : [];
            }

            console.log('[fetchLastN] total records from API:', data.length);

            const allPoints = data
                .map((item: any) => {
                    const itemLat = item.Latitude ?? item.latitude ?? item.Lat ?? item.lat ?? 0;
                    const itemLng = item.Longitude ?? item.longitude ?? item.Lng ?? item.lng ?? 0;
                    const accuracy = item.Accuracy ?? item.accuracy ?? 0;
                    const recordedAt =
                        item.CreatedOn ?? item.createdOn ??
                        item.RecordedAt ?? item.recordedAt ??
                        item.Time ?? item.time;
                    const id = item.Id ?? item.id ?? item.ID ?? null;
                    return {
                        id: id !== null ? Number(id) : null,
                        latitude: Number(itemLat),
                        longitude: Number(itemLng),
                        accuracy: Number(accuracy),
                        recordedAt: recordedAt ? String(recordedAt) : undefined,
                    };
                })
                .filter((p: any) => p.latitude !== 0 && p.longitude !== 0);

            // Sort by ID descending
            const sorted = [...allPoints].sort((a: any, b: any) => {
                if (a.id !== null && b.id !== null) {
                    return b.id - a.id;
                }
                const tA = a.recordedAt ? new Date(a.recordedAt).getTime() : 0;
                const tB = b.recordedAt ? new Date(b.recordedAt).getTime() : 0;
                return tB - tA;
            });

            const lastN = sorted.slice(0, parsed);
            const sliced = [...lastN].reverse();

            if (sliced.length === 0) {
                setFetchNError(
                    data.length === 0
                        ? 'No location records exist yet.'
                        : `Found ${data.length} total records but all had zero coordinates.`
                );
            } else {
                setLastFetchedCount(sliced.length);
                setRoutePoints(sliced);
                setFetchNError(null);
            }
        } catch (error: any) {
            console.error('[fetchLastN] error:', error);
            setFetchNError(error?.message || 'Failed to fetch records. Check your connection.');
        } finally {
            setIsFetchingN(false);
        }
    };

    const calculateRouteDuration = (points: RoutePoint[]) => {
        if (points.length < 2) return '—';
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        if (!firstPoint.recordedAt || !lastPoint.recordedAt) return '—';
        try {
            const start = new Date(firstPoint.recordedAt);
            const end = new Date(lastPoint.recordedAt);
            const diffMs = Math.abs(end.getTime() - start.getTime());
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.floor((diffMs % 3600000) / 60000);
            if (diffHrs > 0) {
                return `${diffHrs}h ${diffMins}m`;
            }
            return `${diffMins}m`;
        } catch {
            return '—';
        }
    };

    // Fetch GPS coordinates
    useEffect(() => {
        const fetchInitialLocation = async () => {
            try {
                Geolocation.getCurrentPosition(
                    position => {
                        const { latitude, longitude, accuracy, speed, altitude } = position.coords;
                        setStats({
                            latitude,
                            longitude,
                            accuracy: accuracy ?? 0,
                            speed: speed ?? 0,
                            altitude: altitude ?? 0,
                            provider: 'geolocation',
                        });
                    },
                    error => {
                        console.warn('getCurrentPosition error:', error);
                        // Fallback coordinates
                        setStats({
                            latitude: 12.9716,
                            longitude: 77.5946,
                            accuracy: 8.5,
                            speed: 0,
                            altitude: 920,
                            provider: 'fallback',
                        });
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            } catch (error) {
                console.warn('Error fetching initial location on mount:', error);
            }
        };
        fetchInitialLocation();

        return () => {
            if (watchIdRef.current !== null) {
                Geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Fetch route points
    useEffect(() => {
        if (!hasFetchedTodayData.current && stats.latitude !== 0 && stats.longitude !== 0) {
            hasFetchedTodayData.current = true;
            fetchRoutePoints(stats.latitude, stats.longitude);
        }
    }, [stats.latitude, stats.longitude, fetchRoutePoints]);

    const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTrackingInterval = useCallback(() => {
        if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isTracking) {
            trackingIntervalRef.current = setInterval(() => {
                fetchRoutePoints();
            }, 10000);
        } else {
            clearTrackingInterval();
        }
        return () => clearTrackingInterval();
    }, [isTracking, fetchRoutePoints, clearTrackingInterval]);

    // Pause polling on blur
    useFocusEffect(
        useCallback(() => {
            return () => {
                clearTrackingInterval();
            };
        }, [clearTrackingInterval])
    );

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setIsTracking(watchIdRef.current !== null);
    };

    const executeStartTracking = async () => {
        try {
            if (watchIdRef.current !== null) {
                Geolocation.clearWatch(watchIdRef.current);
            }
            const watchId = Geolocation.watchPosition(
                position => {
                    const { latitude, longitude, accuracy, speed, altitude } = position.coords;
                    setStats({
                        latitude,
                        longitude,
                        accuracy: accuracy ?? 0,
                        speed: speed ?? 0,
                        altitude: altitude ?? 0,
                        provider: 'geolocation',
                    });
                },
                error => {
                    console.warn('watchPosition error:', error);
                },
                {
                    enableHighAccuracy: true,
                    distanceFilter: 2,
                    interval: 5000,
                    fastestInterval: 2000,
                }
            );
            watchIdRef.current = watchId;
            setIsTracking(true);
        } catch (e: any) {
            console.error('executeStartTracking error:', e);
            Alert.alert('Error', e.message || 'Failed to start tracking');
        }
    };

    const handleAgreeBgLocation = async () => {
        setShowBgLocationDisclosure(false);
        try {
            if (Platform.OS === 'android') {
                const fineGranted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                const coarseGranted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
                );
                if (!fineGranted && !coarseGranted) {
                    const foreground = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                    ]);
                    const fg = foreground[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
                    const cg = foreground[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];
                    if (fg !== PermissionsAndroid.RESULTS.GRANTED &&
                        cg !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert('Permission Denied', 'Location permission is required to view live coordinates.');
                        return;
                    }
                }

                if (Platform.Version >= 29) {
                    await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
                    );
                }
            }
        } catch (err) {
            console.warn('Permission request error:', err);
        }
        await executeStartTracking();
    };

    const handleDenyBgLocation = async () => {
        setShowBgLocationDisclosure(false);
        await executeStartTracking();
    };

    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const fineGranted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                const coarseGranted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
                );

                if (!fineGranted && !coarseGranted) {
                    setShowBgLocationDisclosure(true);
                    return false;
                }

                if (Platform.Version >= 29) {
                    const bgGranted = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
                    );
                    if (!bgGranted) {
                        setShowBgLocationDisclosure(true);
                        return false;
                    }
                }

                return true;
            } catch (err) {
                console.warn('Permission request exception:', err);
                return false;
            }
        }
        return true;
    };

    const startTracking = async () => {
        try {
            const hasPermission = await requestPermissions();
            if (hasPermission) {
                await executeStartTracking();
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const stopTracking = () => {
        try {
            if (watchIdRef.current !== null) {
                Geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setIsTracking(false);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const hasValidCoordinates = stats.latitude !== 0 || stats.longitude !== 0;

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
            <AppHeader title="Route Map" leftIcon="back" />

            <View style={styles.mapContainer}>
                <MapView
                    latitude={stats.latitude}
                    longitude={stats.longitude}
                    userLatitude={stats.latitude}
                    userLongitude={stats.longitude}
                    accuracy={stats.accuracy}
                    routePoints={routePoints}
                />

                {/* Status pill */}
                <View style={styles.statusPill}>
                    <View style={[styles.statusDot, { backgroundColor: isTracking ? THEME.COLOR.success : THEME.COLOR.danger }]} />
                    <Text style={styles.statusText}>
                        {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
                    </Text>
                </View>

                {/* Refresh route pill */}
                <TouchableOpacity 
                    style={styles.refreshPill} 
                    onPress={() => fetchRoutePoints()}
                    disabled={isLoadingRoute}
                    activeOpacity={0.8}
                >
                    {isLoadingRoute ? (
                        <ActivityIndicator size="small" color={THEME.COLOR.primaryDark} style={{ marginRight: 6 }} />
                    ) : (
                        <ReloadIcon size={14} color={THEME.COLOR.primaryDark} style={{ marginRight: 6 }} />
                    )}
                    <Text style={styles.statusText}>
                        {isLoadingRoute ? 'Loading...' : 'Refresh Route'}
                    </Text>
                </TouchableOpacity>

                {/* Stats card overlay */}
                <View style={styles.overlayCard}>
                    <Text style={styles.cardTitle}>GPS Coordinates</Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.statLabel}>Latitude</Text>
                            <Text style={styles.statValue}>
                                {hasValidCoordinates ? stats.latitude.toFixed(6) : '—'}
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.statLabel}>Longitude</Text>
                            <Text style={styles.statValue}>
                                {hasValidCoordinates ? stats.longitude.toFixed(6) : '—'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.statsGrid, { marginTop: 12 }]}>
                        <View style={styles.gridItem}>
                            <Text style={styles.statLabel}>Accuracy</Text>
                            <Text style={styles.statValue}>
                                {hasValidCoordinates ? `${stats.accuracy.toFixed(1)} m` : '—'}
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.statLabel}>Speed</Text>
                            <Text style={styles.statValue}>
                                {hasValidCoordinates ? `${stats.speed.toFixed(1)} m/s` : '—'}
                            </Text>
                        </View>
                    </View>

                    {routePoints.length > 0 && (
                        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' }}>
                            <Text style={styles.cardSubTitle}>Route Info</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.statLabel}>Route Points</Text>
                                    <Text style={styles.statValue}>{routePoints.length}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.statLabel}>Duration</Text>
                                    <Text style={styles.statValue}>
                                        {calculateRouteDuration(routePoints)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Records panel */}
                    <View style={styles.fetchNPanel}>
                        <Text style={styles.fetchNTitle}>Fetch Last N Records</Text>
                        <View style={styles.fetchNRow}>
                            <TextInput
                                style={[
                                    styles.fetchNInput,
                                    fetchNError ? styles.fetchNInputError : null,
                                ]}
                                value={recordCount}
                                onChangeText={text => {
                                    setFetchNError(null);
                                    setLastFetchedCount(null);
                                    if (/^\d*$/.test(text)) setRecordCount(text);
                                }}
                                keyboardType="number-pad"
                                placeholder="e.g. 50"
                                placeholderTextColor="#B0B0B0"
                                maxLength={5}
                                returnKeyType="done"
                                onSubmitEditing={fetchLastNRecords}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.fetchNButton,
                                    isFetchingN && styles.fetchNButtonDisabled,
                                ]}
                                onPress={fetchLastNRecords}
                                disabled={isFetchingN}
                                activeOpacity={0.8}
                            >
                                {isFetchingN ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.fetchNButtonText}>Fetch</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        {fetchNError ? (
                            <Text style={styles.fetchNError}>{fetchNError}</Text>
                        ) : lastFetchedCount !== null ? (
                            <Text style={styles.fetchNSuccess}>
                                ✓ {lastFetchedCount} records loaded
                            </Text>
                        ) : null}
                    </View>

                    {/* Action button */}
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            isTracking ? styles.stopButton : styles.startButton
                        ]}
                        onPress={isTracking ? stopTracking : startTracking}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {isTracking ? 'Stop Live Tracking' : 'Start Live Tracking'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <BackgroundLocationDisclosureModal
                visible={showBgLocationDisclosure}
                onAgree={handleAgreeBgLocation}
                onDeny={handleDenyBgLocation}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    statusPill: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        zIndex: 4,
    },
    refreshPill: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        zIndex: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: THEME.COLOR.textPrimary,
        fontFamily: THEME.FONTWEIGHT.Bold,
    },
    overlayCard: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: THEME.RADIUS.large,
        padding: 20,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        zIndex: 4,
        borderWidth: 1,
        borderColor: 'rgba(26, 115, 232, 0.08)',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: THEME.COLOR.textPrimary,
        fontFamily: THEME.FONTWEIGHT.Bold,
        marginBottom: 12,
    },
    cardSubTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: THEME.COLOR.textPrimary,
        fontFamily: THEME.FONTWEIGHT.Bold,
        marginBottom: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gridItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        color: THEME.COLOR.textSecondary,
        fontFamily: THEME.FONTWEIGHT.Regular,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '600',
        color: THEME.COLOR.textPrimary,
        fontFamily: THEME.FONTWEIGHT.Medium,
    },
    controlButton: {
        marginTop: 20,
        paddingVertical: 14,
        borderRadius: THEME.RADIUS.xs,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    startButton: {
        backgroundColor: THEME.COLOR.primaryDark,
    },
    stopButton: {
        backgroundColor: THEME.COLOR.danger,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        fontFamily: THEME.FONTWEIGHT.Bold,
    },

        fetchNPanel: {
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.07)',
    },
    fetchNTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: THEME.COLOR.textPrimary,
        fontFamily: THEME.FONTWEIGHT.Bold,
        marginBottom: 10,
    },
    fetchNRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fetchNInput: {
        flex: 1,
        height: 42,
        borderWidth: 1.5,
        borderColor: 'rgba(26, 115, 232, 0.3)',
        borderRadius: THEME.RADIUS.xs,
        paddingHorizontal: 12,
        fontSize: 15,
        fontFamily: THEME.FONTWEIGHT.Medium,
        color: THEME.COLOR.textPrimary,
        backgroundColor: '#F8FAFF',
    },
    fetchNInputError: {
        borderColor: THEME.COLOR.danger,
        backgroundColor: '#FFF5F5',
    },
    fetchNButton: {
        height: 42,
        paddingHorizontal: 18,
        borderRadius: THEME.RADIUS.xs,
        backgroundColor: THEME.COLOR.primaryDark,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    fetchNButtonDisabled: {
        opacity: 0.6,
    },
    fetchNButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        fontFamily: THEME.FONTWEIGHT.Bold,
    },
    fetchNError: {
        marginTop: 6,
        fontSize: 12,
        color: THEME.COLOR.danger,
        fontFamily: THEME.FONTWEIGHT.Regular,
    },
    fetchNSuccess: {
        marginTop: 6,
        fontSize: 12,
        color: THEME.COLOR.success,
        fontFamily: THEME.FONTWEIGHT.Medium,
    },
});

export default MapScreen;
