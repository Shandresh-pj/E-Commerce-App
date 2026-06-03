package com.futurebelieve

import android.content.pm.PackageManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PackageCheckerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PackageChecker"

    @ReactMethod
    fun isInstalled(packageId: String, promise: Promise) {
        try {
            @Suppress("DEPRECATION")
            reactContext.packageManager.getPackageInfo(packageId, PackageManager.GET_META_DATA)
            promise.resolve(true)
        } catch (e: PackageManager.NameNotFoundException) {
            // Fallback: check for a launchable intent (works on some Android 11+ configs
            // where getPackageInfo visibility is blocked but intent query is allowed)
            try {
                val intent = reactContext.packageManager.getLaunchIntentForPackage(packageId)
                promise.resolve(intent != null)
            } catch (e2: Exception) {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}
