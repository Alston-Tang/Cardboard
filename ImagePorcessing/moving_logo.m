obj = VideoReader('./materials/video/big.bang.s01e01.mp4');
wobjL = VideoWriter('./materials/video/big.bang.s01e01_withMovinglogoL');
wobjR = VideoWriter('./materials/video/big.bang.s01e01_withMovinglogoR');

vidWidth = obj.Width;
vidHeight = obj.Height;
mov = struct('cdata',zeros(vidHeight,vidWidth,3,'uint8'),'colormap',[]);
movL = struct('cdata',zeros(vidHeight,vidWidth,3,'uint8'),'colormap',[]);
movR = struct('cdata',zeros(vidHeight,vidWidth,3,'uint8'),'colormap',[]);

wobjL.FrameRate = obj.FrameRate;
wobjR.FrameRate = obj.FrameRate;

temp = im2double(imread('./materials/logo/MovingLogo/movingLogo00.png'));
[m,n] = size(temp(:,:,1));
x = 49;
L = zeros(m,n,3*x);
R = zeros(m,n,3*x);
AL3 = zeros(m,n,3*x);
AR3 = zeros(m,n,3*x);
for i = 1 : x
    if i <= 10 
        temp = ['0',num2str(i-1)];
    else
        temp = num2str(i-1);
    end
    L(:,:,3*i -2 : 3*i) = im2double(imread(['./materials/logo/MovingLogo/movingLogo',temp,'.png']));
    disparityMap = L(:,:,3*i -2);
    disparityMap(disparityMap > 0) = 0.5;
    R(:,:,3*i -2 : 3*i) = bWarping(L(:,:,3*i -2 : 3*i),disparityMap);
    AL = findAlpha(L(:,:,3*i -2));
    AR = findAlpha(R(:,:,3*i -2));
    AL3(:,:,3*i -2 : 3*i) = repmat(AL ,[1,1,3]);
    AR3(:,:,3*i -2 : 3*i) = repmat(AR ,[1,1,3]);
end
k = 1;
L = im2uint8(L);
R = im2uint8(R);
AL3 = uint8(AL3);
AR3 = uint8(AR3);
while hasFrame(obj)
    mov(k).cdata = readFrame(obj);
    j = mod(k,x);
    if j == 0 
        j = 49;
    end
    movL(k).cdata = AL3(:,:,3*j-2 : 3*j) .* L(:,:,3*j-2 : 3*j)  + (1-AL3(:,:,3*j-2 : 3*j)) .* mov(k).cdata;
    movR(k).cdata = AR3(:,:,3*j-2 : 3*j) .* R(:,:,3*j-2 : 3*j)  + (1-AR3(:,:,3*j-2 : 3*j)) .* mov(k).cdata;  
    k = k+1;
end

open(wobjL);
open(wobjR);
writeVideo(wobjL,movL);
writeVideo(wobjR,movR);
close(wobjL);
close(wobjR);
