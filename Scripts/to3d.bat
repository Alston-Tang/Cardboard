@echo off

ffmpeg -i %1 -vn -acodec copy audio.aac
ffmpeg -i %2 -i %3 -filter_complex "[0:v:0]pad=iw*2:ih[bg]; [bg][1:v:0]overlay=w" temp.mp4
ffmpeg -i temp.mp4 -i audio.aac -c:v libx264 -c:a libvo_aacenc -shortest %4