/**
 * Created by Tang on 2015/12/26.
 */


var FrameSwitcher = function(){
    var cur = this;
    this.activeFrame = null;
    this.frames = {};
    this.backStack = [];
};

FrameSwitcher.prototype.addFrame = function(frameId, frame){
    if (this.frames[frameId]){
        throw "Duplicated FrameId";
    }
    this.frames[frameId] = frame;
    frame.frameId = frameId;
};

FrameSwitcher.prototype.switch = function(link, contentInf){
    var frame = link;
    while (frame.parent){
        frame = frame.parent;
    }
    if (frame != this.activeFrame){
        if (this.activeFrame){
            this.activeFrame.off();
        }
        frame.on(link, contentInf);
    }
    else{
        frame.switch(link, contentInf);
    }
    this.activeFrame = frame;
};

FrameSwitcher.prototype.stackPush = function(obj){
    this.backStack.push(obj);
};

FrameSwitcher.prototype.stackPop = function(){
    if (this.backStack.length <= 0){
        return null;
    }
    return this.backStack.pop();
};

var Frame = function(dom){
    this.dom = dom ? dom : null;
    this.simple = false;
    if (this.dom){
        if(this.dom.getAttribute("simple")){
            this.simple = true;
        }
    }
    if (this.simple){
        this.leftDom = this.dom.querySelector(".left");
        this.leftDom.width = windowW / 2;
        this.leftDom.height = windowH;
        this.rightDom = this.dom.querySelector(".right");
        this.rightDom.width = windowH / 2;
        this.rightDom.height = windowH;
    }
};

Frame.prototype.on = function(){
    throw "Not implemented";
};

Frame.prototype.off = function(){
    throw "Not implemented";
};

Frame.prototype.switch = function(){
    throw "Not implemented";
};