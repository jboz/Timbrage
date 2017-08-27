#!/bin/bash

ionic cordova plugin rm cordova-plugin-console

echo '

BUILDING android app..

'
ionic cordova build android --release --prod

echo '

SIGNING android app..

'
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .travis/release.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name

echo '

FINISHING android app..

'
zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk timbrage.apk
