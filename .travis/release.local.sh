#!/bin/bash

read -s -p "Enter Passphrase for keystore: " storepass

#ionic cordova plugin rm cordova-plugin-console

echo '

BUILDING android app..

'
ionic cordova build android --release --prod

echo '

SIGNING android app..

'
jarsigner -storepass $storepass -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .travis/release.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name

echo '

FINISHING android app..

'
~/Documents/prog/tools/android-sdk/build-tools/23.0.3/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk timbrage.apk
