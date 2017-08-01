cd ..
ionic cordova plugin rm cordova-plugin-console
ionic cordova build android --release --prod
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk timbrage.apk
