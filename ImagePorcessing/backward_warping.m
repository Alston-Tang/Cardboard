clear all
clc
colorIm = im2double(imread('./materials/image_disparity_pair/20_color.png'));
disparityIm = im2double(imread('./materials/image_disparity_pair/20_disparity.png'));
[m,n] = size(disparityIm) ;
newIm = zeros(m,n,3);
%forward
%{
[x,y] = meshgrid(1:n , 1:m);
x = x + disparityIm * 20;
maxX = max(x(:));
[xq,yq] = meshgrid(1:(maxX+1) , 1:m);
vq = zeros(m, ceil(maxX),3);
for i = 1 : 3
    temp = colorIm(:,:,i);
    %vq(:,:,i) = griddata(x(:),y(:),temp(:),xq,yq,'natural');
    F = scatteredInterpolant(x(:),y(:),temp(:));
    vq(:,:,i) = F(xq,yq);
end
imshow(vq);
%}
%backward
[x,y] = meshgrid(1:n , 1:m);
x1 = x + disparityIm * 45 ;
maxX = max(x1(:));
[xq,yq] = meshgrid(1:(maxX+1) , 1:m);
F = scatteredInterpolant(x(:),y(:),x1(:));
newX = F(xq,yq);
newX = newX(:,1:n);
yq = yq(:,1:n);
vq = zeros(m, n,3);
for i = 1 : 3
    vq(:,:,i) = interp2(x,y,colorIm(:,:,i),newX,yq,'natural');
end
%imshow(vq);
imwrite(vq, './materials/image_disparity_pair/out1.png');
