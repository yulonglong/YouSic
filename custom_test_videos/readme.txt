=====================
To Create Test Videos
=====================
Given 1 audio clip (audio.wav) and 1 image (img.jpg),
make a video that plays the audio while displaying the image.
(The video length is that of the audio length.)

Command:
ffmpeg -loop 1 -i img.jpg -i audio.wav -c:v libx264 -c:a aac -strict experimental -b:a 192k -shortest out.mp4





================
Test Video Links
================

https://youtu.be/CyhFHn-d_V8