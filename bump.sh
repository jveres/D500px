fuse build --target=Android --release
cp .build/Android-Release/bin/D500px-debug.apk .
git add .
git commit -m "bump"
git push origin master
