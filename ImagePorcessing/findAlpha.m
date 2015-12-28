function [ output ] = findAlpha( inputImg )
   inputImg(inputImg > 0) = 1;
   output = inputImg(:,:,1);
end

