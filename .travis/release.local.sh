#!/bin/bash

output_apk=timbrage.apk
device_folder=/sdcard/Download

if [ -e $output_apk ]
then
    echo "Output file '$output_apk' exists !"
    exit 0;
fi

read -s -p "Enter Passphrase for keystore: " storepass

#ionic cordova plugin rm cordova-plugin-console

echo -e '\n\nBUILDING android app..\n\n'

ionic cordova build android --release --prod

echo '\n\nSIGNING android app..\n\n'

jarsigner -storepass $storepass -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .travis/release-keystore.jks platforms/android/build/outputs/apk/android-release-unsigned.apk timbrage-app

echo '\n\nFINISHING android app..\n\n'

~/Documents/prog/tools/android-sdk/build-tools/23.0.3/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk $output_apk
