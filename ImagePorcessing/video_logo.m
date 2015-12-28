%clear all
%clc
obj = VideoReader('./materials/video/big.bang.s01e01.mp4');
wobjL = VideoWriter('./materials/video/big.bang.s01e01_withlogoL');
wobjR = VideoWriter('./materials/video/big.bang.s01e01_withlogoR');
L = im2double(imread('./materials/video/logoInVideo.png'));
disparityMap = im2double(imread('./materials/video/disparityMap1.jpg'));
R = circshift(L, 20, 2);
AL = findAlpha(L);
AR = findAlpha(R);
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

L = im2uint8(L);
R = im2uint8(R);
AL3 = uint8(AL3);
AR3 = uint8(AR3);
while hasFrame(obj)
    mov(k).cdata = readFrame(obj);
    movL(k).cdata = AL3 .* L  + (1-AL3) .* mov(k).cdata;
    movR(k).cdata = AR3 .* R  + (1-AR3) .* mov(k).cdata;
    k = k+1;
end

open(wobjL);
open(wobjR);
writeVideo(wobjL,movL);
writeVideo(wobjR,movR);
close(wobjL);
close(wobjR);