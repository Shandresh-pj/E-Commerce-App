import React, { useEffect, useRef, useState, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { THEME } from '../assets/styles/theme';

export interface RoutePoint {
  RouteId: any;
  latitude: number;
  longitude: number;
  accuracy?: number;
  recordedAt?: string;
}

interface MapViewProps {
  latitude: number;
  longitude: number;
  userLatitude?: number;
  userLongitude?: number;
  accuracy?: number;
  onMapLoaded?: () => void;
  routePoints?: RoutePoint[];
  showRecenter?: boolean;
  recenterBottom?: number;
  showMapType?: boolean;
  mapTypeBottom?: number;
  onRegionChangeStart?: () => void;
  onRegionChangeComplete?: (latitude: number, longitude: number) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  userLatitude,
  userLongitude,
  onMapLoaded,
  routePoints = [],
  showRecenter = true,
  recenterBottom,
  showMapType = true,
  mapTypeBottom,
  onRegionChangeStart,
  onRegionChangeComplete,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localMapType, setLocalMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // HTML content for Leaflet Map
  const mapHtml = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #f4f5f7;
        }
        
        /* Pulse locator animation styles */
        .gps-marker-container {
          background: transparent;
          border: none;
        }
        .gps-dot {
          width: 12px;
          height: 12px;
          background-color: #1A73E8;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0,0,0,0.45);
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -6px;
          margin-left: -6px;
          z-index: 10;
        }
        .gps-pulse {
          width: 28px;
          height: 28px;
          background-color: rgba(26, 115, 232, 0.35);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -14px;
          margin-left: -14px;
          animation: pulse 2s infinite ease-out;
          z-index: 9;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.4);
            opacity: 1;
          }
          100% {
            transform: scale(2.0);
            opacity: 0;
          }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map;
        var startMarker;
        var endMarker;
        var liveLocationMarker;
        var routePath;
        var routeMarkers = [];
        var initialized = false;
        var currentLat = 0;
        var currentLng = 0;
        var roadmapLayer;
        var satelliteLayer;

        function initMap() {
          if (initialized) return;
          
          map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([0, 0], 18);

          // Standard roadmap layer (Direct mt1 server mapping)
          roadmapLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 21
          });

          // Satellite hybrid layer (Direct mt1 server mapping)
          satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            maxZoom: 21
          });

          // Default to roadmap
          roadmapLayer.addTo(map);

          // Map pan/move listeners for location selection
          map.on('movestart', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_MOVE_START' }));
          });
          map.on('moveend', function() {
            var center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_MOVE_END',
              latitude: center.lat,
              longitude: center.lng
            }));
          });

          initialized = true;
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
        }

        function setMapType(type) {
          if (!initialized) return;
          if (type === 'satellite') {
            if (map.hasLayer(roadmapLayer)) {
              map.removeLayer(roadmapLayer);
            }
            satelliteLayer.addTo(map);
          } else {
            if (map.hasLayer(satelliteLayer)) {
              map.removeLayer(satelliteLayer);
            }
            roadmapLayer.addTo(map);
          }
        }

        function setCamera(lat, lng, zoom) {
          if (!initialized) return;
          map.setView([lat, lng], zoom || 18, { animate: true, duration: 1.0 });
        }

        function recenterMap() {
          if (!initialized) return;
          if (currentLat !== 0 || currentLng !== 0) {
            map.setView([currentLat, currentLng], 18, { animate: true, duration: 1.0 });
          } else {
            var bounds = L.latLngBounds();
            if (startMarker) bounds.extend(startMarker.getLatLng());
            if (endMarker) bounds.extend(endMarker.getLatLng());
            if (liveLocationMarker) bounds.extend(liveLocationMarker.getLatLng());
            routeMarkers.forEach(function(m) {
              bounds.extend(m.getLatLng());
            });

            if (bounds.isValid()) {
              if (bounds.getSouthWest().equals(bounds.getNorthEast())) {
                map.setView(bounds.getSouthWest(), 18, { animate: true, duration: 1.0 });
              } else {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
              }
            }
          }
        }

        function drawRoute(points, liveLat, liveLng) {
          if (!initialized) return;

          // 1. Clear existing dynamic route elements
          if (routePath) {
            map.removeLayer(routePath);
            routePath = null;
          }
          if (startMarker) {
            map.removeLayer(startMarker);
            startMarker = null;
          }
          if (endMarker) {
            map.removeLayer(endMarker);
            endMarker = null;
          }
          if (liveLocationMarker) {
            map.removeLayer(liveLocationMarker);
            liveLocationMarker = null;
          }
          routeMarkers.forEach(function(m) {
            map.removeLayer(m);
          });
          routeMarkers = [];

          var latlngs = [];
          var hasLive = (liveLat !== undefined && liveLng !== undefined && liveLat !== 0 && liveLng !== 0);

          // 2. Add API route points
          if (points && points.length > 0) {
            points.forEach(function(p) {
              latlngs.push([p.latitude, p.longitude]);
            });
          }

          // 3. Update current context position to live position if present (for live pulsing dot)
          if (hasLive) {
            currentLat = liveLat;
            currentLng = liveLng;
          }

          // Draw the route line connecting all points
          if (latlngs.length > 1) {
            routePath = L.polyline(latlngs, {
              color: '#1A73E8',
              weight: 5,
              opacity: 0.8,
              lineJoin: 'round'
            }).addTo(map);
          }

          // 4. Start marker
          if (points && points.length > 0) {
            var startLatLng = [points[0].latitude, points[0].longitude];
            var startIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="width: 24px; height: 24px; background-color: #2E7D32; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px;">S</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            startMarker = L.marker(startLatLng, { icon: startIcon }).bindPopup('<b>Start Location</b>').addTo(map);
          }

          // 5. End marker of route
          if (points && points.length > 1) {
            var endLatLng = [points[points.length - 1].latitude, points[points.length - 1].longitude];
            var endIcon = L.divIcon({
              className: 'custom-marker',
              html: '<div style="width: 24px; height: 24px; background-color: #C62828; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px;">E</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            endMarker = L.marker(endLatLng, { icon: endIcon }).bindPopup('<b>End Location</b>').addTo(map);
          }

          // 6. Live Location Marker (Pulsing Blue Dot with High zIndexOffset)
          if (hasLive) {
            var liveLatLng = [currentLat, currentLng];
            var liveIcon = L.divIcon({
              className: 'gps-marker-container',
              html: '<div class="gps-pulse"></div><div class="gps-dot" style="background-color: #1A73E8;"></div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            liveLocationMarker = L.marker(liveLatLng, {
              icon: liveIcon,
              zIndexOffset: 1000
            }).bindPopup('<b>Current Live Location</b>').addTo(map);
          }

          // 7. Intermediate points markers
          if (points && points.length > 2) {
            for (var i = 1; i < points.length - 1; i++) {
              var p = points[i];
              var waypoint = L.circleMarker([p.latitude, p.longitude], {
                radius: 4,
                color: '#1A73E8',
                fillColor: '#FFFFFF',
                fillOpacity: 1,
                weight: 2
              }).bindPopup('Waypoint ' + (i + 1)).addTo(map);
              routeMarkers.push(waypoint);
            }
          }

          // 8. Automatic fitting of all markers within the viewport (only if we have route points!)
          if (points && points.length > 0) {
            var bounds = L.latLngBounds();
            if (startMarker) bounds.extend(startMarker.getLatLng());
            if (endMarker) bounds.extend(endMarker.getLatLng());
            if (liveLocationMarker) bounds.extend(liveLocationMarker.getLatLng());
            routeMarkers.forEach(function(m) {
              bounds.extend(m.getLatLng());
            });

            if (bounds.isValid()) {
              if (bounds.getSouthWest().equals(bounds.getNorthEast())) {
                map.setView(bounds.getSouthWest(), 18, { animate: true, duration: 1.0 });
              } else {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
              }
            }
          }
        }

        // Initialize immediately
        initMap();
      </script>
    </body>
    </html>
  `, []);

  // Inject user live location updates and route updates when props change
  useEffect(() => {
    if (isWebViewReady) {
      const liveLat = userLatitude !== undefined ? userLatitude : latitude;
      const liveLng = userLongitude !== undefined ? userLongitude : longitude;
      const injectCode = `
        if (typeof drawRoute === 'function') {
          drawRoute(${JSON.stringify(routePoints)}, ${liveLat}, ${liveLng});
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(injectCode);
    }
  }, [routePoints, latitude, longitude, userLatitude, userLongitude, isWebViewReady]);

  // Set map camera position when coordinates are updated programmatically
  const lastWebviewCenter = useRef({ latitude: 0, longitude: 0 });
  useEffect(() => {
    const hasCoordsChanged = Math.abs(latitude - lastWebviewCenter.current.latitude) > 0.00001 ||
                             Math.abs(longitude - lastWebviewCenter.current.longitude) > 0.00001;
    if (isWebViewReady && hasCoordsChanged && latitude !== 0 && longitude !== 0) {
      lastWebviewCenter.current = { latitude, longitude };
      const injectCode = `
        if (typeof setCamera === 'function') {
          setCamera(${latitude}, ${longitude});
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(injectCode);
    }
  }, [latitude, longitude, isWebViewReady]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setIsWebViewReady(true);
        setIsLoading(false);
        if (onMapLoaded) {
          onMapLoaded();
        }
      } else if (data.type === 'MAP_MOVE_START') {
        if (onRegionChangeStart) {
          onRegionChangeStart();
        }
      } else if (data.type === 'MAP_MOVE_END') {
        lastWebviewCenter.current = { latitude: data.latitude, longitude: data.longitude };
        if (onRegionChangeComplete) {
          onRegionChangeComplete(data.latitude, data.longitude);
        }
      }
    } catch (e) {
      console.warn('Failed to parse WebView message:', e);
    }
  };

  const handleRecenter = () => {
    if (isWebViewReady) {
      const injectCode = `
        if (typeof recenterMap === 'function') {
          recenterMap();
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(injectCode);
    }
  };

  const handleToggleMapType = () => {
    const nextType = localMapType === 'roadmap' ? 'satellite' : 'roadmap';
    setLocalMapType(nextType);
    if (isWebViewReady) {
      const injectCode = `
        if (typeof setMapType === 'function') {
          setMapType('${nextType}');
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(injectCode);
    }
  };

  const hasValidPosition = latitude !== 0 || longitude !== 0 || (userLatitude !== undefined && userLatitude !== 0);

  const Web: any = WebView;

  return (
    <View style={styles.container}>
      <Web
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        style={styles.webView}
        onLoadEnd={() => {
          if (!isWebViewReady) {
            const injectInit = `
              if (typeof initMap === 'function') {
                initMap();
              }
              if (typeof setCamera === 'function' && ${latitude} !== 0) {
                setCamera(${latitude}, ${longitude});
              }
              true;
            `;
            webViewRef.current?.injectJavaScript(injectInit);
          }
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.COLOR.primary} />
          <Text style={styles.loadingText}>Loading Map Tiles...</Text>
        </View>
      )}
      {showRecenter && isWebViewReady && hasValidPosition && (
        <TouchableOpacity
          style={[styles.recenterButton, recenterBottom !== undefined ? { bottom: recenterBottom } : {}]}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Text style={styles.recenterButtonText}>📍 Recenter</Text>
        </TouchableOpacity>
      )}
      {showMapType && isWebViewReady && (
        <TouchableOpacity
          style={[styles.mapTypeButton, mapTypeBottom !== undefined ? { bottom: mapTypeBottom } : {}]}
          onPress={handleToggleMapType}
          activeOpacity={0.8}
        >
          <Text style={styles.mapTypeButtonText}>
            {localMapType === 'roadmap' ? '🛰️ Satellite' : '🗺️ Map'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F4F5F7',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 245, 247, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: THEME.COLOR.textSecondary,
    fontFamily: THEME.FONTWEIGHT.Medium,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: THEME.COLOR.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 5,
  },
  recenterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.COLOR.primaryDark,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
  mapTypeButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: THEME.COLOR.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 5,
  },
  mapTypeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.COLOR.primaryDark,
    fontFamily: THEME.FONTWEIGHT.Bold,
  },
});
