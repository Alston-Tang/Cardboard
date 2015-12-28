obj = VideoReader('./materials/video/big.bang.s01e01.mp4');
wobjL = VideoWriter('./materials/video/big.bang.s01e01_withsubtitleL');
wobjR = VideoWriter('./materials/video/big.bang.s01e01_withsubtitleR');
disparityMap = im2double(imread('./materials/video/subtitles/disparityMap.jpg'));

temp = im2double(imread('./materials/video/subtitles/subtitle0.png'));
[m,n] = size(temp(:,:,1));
x = 11;
L = zeros(m,n,3*x);
R = zeros(m,n,3*x);
for i = 1 : x
    L(:,:,3*i -2 : 3*i) = im2double(imread(['./materials/video/subtitles/subtitle',num2str(i-1),'.png'])); 
    R(:,:,3*i -2 : 3*i) = bWarping(L(:,:,3*i -2 : 3*i),disparityMap(:,:,1));
end
AL = findAlpha(L(:,:,1));
AR = findAlpha(R(:,:,1));
AL3 = repmat(AL ,[1,1,3]);
AR3 = repmat(AR ,[1,1,3]);

vidWidth = obj.Width;
vidHeight = obj.Height;
mov = struct('cdata',zeros(vidHeight,vidWidth,3,'uint8'),'colormap',[]);
movL = struct('cdata',zeros(vidHeight,vidWidth,3,'uint8'),'colormap',[]);
movR = struct('cdata',zeros(vidHeight,vidWidth,3,'uint8'),'colormap',[]);
wobjL.FrameRate = obj.FrameRate;
wobjR.FrameRate = obj.FrameRate;
k = 1;
j = 1;
S = [18,90,151,181,263,306,360,569,594,708,754];
L = im2uint8(L);
R = im2uint8(R);
AL3 = uint8(AL3);
AR3 = uint8(AR3);
while hasFrame(obj)
    mov(k).cdata = readFrame(obj);
    if (k > 420 && k <= 569) || (k > 637 && k <= 708)
        movL(k).cdata = AL3 .* L(:,:,1:3)  + (1-AL3) .* mov(k).cdata;
        movR(k).cdata = AR3 .* R(:,:,1:3)  + (1-AR3) .* mov(k).cdata;
    elseif k < S(j)           
        movL(k).cdata = AL3 .* L(:,:,3*j-2 : 3*j)  + (1-AL3) .* mov(k).cdata;
        movR(k).cdata = AR3 .* R(:,:,3*j-2 : 3*j)  + (1-AR3) .* mov(k).cdata;  
    else
        j = j + 1;
        movL(k).cdata = AL3 .* L(:,:,3*j-2 : 3*j)  + (1-AL3) .* mov(k).cdata;
        movR(k).cdata = AR3 .* R(:,:,3*j-2 : 3*j)  + (1-AR3) .* mov(k).cdata;
    end
    k = k+1;
end

open(wobjL);
open(wobjR);
writeVideo(wobjL,movL);
writeVideo(wobjR,movR);
close(wobjL);
close(wobjR);
