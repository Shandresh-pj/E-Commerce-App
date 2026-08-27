import { Platform, PermissionsAndroid, NativeModules, Alert } from 'react-native'
import Geolocation from '@react-native-community/geolocation'
import DeviceInfo from 'react-native-device-info'

export interface LocationCoords {
  latitude: number
  longitude: number
}

// Ensure RN Geolocation config
try {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
    locationProvider: 'auto',
  })
} catch (e) {
  console.warn('Geolocation setRNConfiguration error:', e)
}

/**
 * 1. Request Android/iOS location permissions (Fine & Coarse)
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const fineGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      )
      const coarseGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      )

      if (fineGranted || coarseGranted) {
        return true
      }

      const status = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ])

      const fg = status[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]
      const cg = status[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION]

      const isGranted =
        fg === PermissionsAndroid.RESULTS.GRANTED || cg === PermissionsAndroid.RESULTS.GRANTED

      return isGranted
    } else if (Platform.OS === 'ios') {
      if (typeof Geolocation.requestAuthorization === 'function') {
        Geolocation.requestAuthorization()
      }
      return true
    }
    return true
  } catch (error) {
    console.warn('requestLocationPermission error:', error)
    return false
  }
}

/**
 * 2. Ensure device GPS / Location settings are turned on
 */
export const ensureLocationEnabled = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const isEnabled = await DeviceInfo.isLocationEnabled()
      if (!isEnabled) {
        const { LocationEnabler } = NativeModules
        if (LocationEnabler && typeof LocationEnabler.showLocationSettings === 'function') {
          try {
            await LocationEnabler.showLocationSettings()
            return true
          } catch (enablerErr: any) {
            console.warn('LocationEnabler dialog dismissed or failed:', enablerErr?.message)
            return false
          }
        }
      }
      return true
    }
    return true
  } catch (err) {
    console.warn('ensureLocationEnabled error:', err)
    return false
  }
}

/**
 * 3. Retrieve accurate GPS coordinates with low-accuracy fallback
 */
export const fetchGpsPosition = (): Promise<LocationCoords> => {
  return new Promise((resolve, reject) => {
    let resolved = false

    const timeoutTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        reject(new Error('GPS request timed out'))
      }
    }, 12000)

    // Try High Accuracy GPS first
    Geolocation.getCurrentPosition(
      (position) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeoutTimer)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        }
      },
      (highAccError) => {
        console.warn('High accuracy location failed, attempting low accuracy...', highAccError)
        // Fallback to low accuracy / cellular / wifi provider
        Geolocation.getCurrentPosition(
          (fallbackPos) => {
            if (!resolved) {
              resolved = true
              clearTimeout(timeoutTimer)
              resolve({
                latitude: fallbackPos.coords.latitude,
                longitude: fallbackPos.coords.longitude,
              })
            }
          },
          (lowAccError) => {
            if (!resolved) {
              resolved = true
              clearTimeout(timeoutTimer)
              reject(lowAccError)
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000,
          }
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 5000,
      }
    )
  })
}

/**
 * Combined all-in-one location acquirer:
 * 1. Requests permission
 * 2. Prompts to enable GPS if turned off
 * 3. Fetches live GPS coordinates
 */
export const getLiveCurrentLocation = async (): Promise<{
  success: boolean
  coords?: LocationCoords
  permissionDenied?: boolean
  gpsDisabled?: boolean
  error?: string
}> => {
  // 1. Permission check & request
  const hasPermission = await requestLocationPermission()
  if (!hasPermission) {
    return {
      success: false,
      permissionDenied: true,
      error: 'Location permission was denied by user',
    }
  }

  // 2. Turn on GPS
  await ensureLocationEnabled()

  // 3. Get GPS coordinates
  try {
    const coords = await fetchGpsPosition()
    return {
      success: true,
      coords,
    }
  } catch (err: any) {
    console.warn('fetchGpsPosition error:', err)
    return {
      success: false,
      gpsDisabled: true,
      error: err?.message || 'Unable to retrieve GPS coordinates',
    }
  }
}
