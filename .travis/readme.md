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
zipalign -v 4 HelloWorld-release-unsigned.apk HelloWorld.apk
```
