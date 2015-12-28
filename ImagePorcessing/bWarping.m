function [ output ] = bWarping( colorIm , disparityIm )
    [m,n] = size(disparityIm) ;
    [x,y] = meshgrid(1:n , 1:m);
    x1 = x + disparityIm * 8 ;
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
    output = vq;

end

