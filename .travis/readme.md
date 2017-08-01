First time :
```bash
ionic cordova plugin rm cordova-plugin-console
```
```bash
ionic cordova build android --release --prod
```
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore .travis/release.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
<<<<<<< HEAD
my-release-key.keystore HelloWorld-release-unsigned.apk alias_name
=======
>>>>>>> b60ed691e25df780bfb14f75828ee3921ad829dc
```
```bash
zipalign -v 4 HelloWorld-release-unsigned.apk HelloWorld.apk
```
