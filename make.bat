if not %POCKETBOOKSDK%.==. goto C1
echo Environment variable POCKETBOOKSDK is not set
pause
:C1
set PATH=%POCKETBOOKSDK%\bin;%PATH%

set INCLUDE=-I%POCKETBOOKSDK%\usr\include
set LIBS=-linkview -lfreetype -lcurl -ljpeg -lz -lgdi32 -L%POCKETBOOKSDK%\lib\w32api -L%POCKETBOOKSDK%\lib
set OUTPUT=2048.exe

rm -f %OUTPUT%

set IMAGES=
if not exist images\*.bmp goto NOIMG
set IMAGES=%TEMP%\images.temp.c
pbres -c %IMAGES% images/*.bmp
if errorlevel 1 goto L_ER
:NOIMG

gcc -static -Wall -O2 -fomit-frame-pointer %INCLUDE% -o %OUTPUT% src/*.c %IMAGES% %LIBS%
if errorlevel 1 goto L_ER


:L_ER

