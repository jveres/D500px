uno build Android --configuration=Release
cp build/Android/Release/D500px.apk D500px-debug.apk
git add .
git commit -m "bump"
git push origin master
