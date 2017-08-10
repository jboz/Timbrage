
# test on android

```bash
ionic cordova run android --device
```

# make a release

First time :
```bash
ionic cordova plugin rm cordova-plugin-console
```
```bash
ionic cordova build android --release --prod
```
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .travis/release.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
```
```bash
zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk .travis/timbrage.apk
```
