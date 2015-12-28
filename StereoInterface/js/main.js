/**
 * Created by Tang on 2015/12/23.
 */

var windowW;
var windowH;
var stage, imageFrame, videoFrame, welcomeFrame, panoramaFrame;
var oj;
var frameSwitcher;

var constructStage = function(){
    //Create Objects
    var mainMenu = new Menu(2000);
    var imageBoard = new Board("Stereo Image", {color:"#cccccc"}, {texture: "img/board1.jpg"});
    var videoBoard = new Board("Stereo Video", {color: "#cccccc"}, {texture: "img/board2.jpg"});
    var panoramaBoard = new Board("Panorama", {color: "#cccccc"}, {texture: "img/board3.jpg"});
    var imageMenu = new Menu(2000);
    var image1 = new Board("Image1",
        {color:"#ffffff"},
        {texture: "img/stereo/stereo1_l.png"},
        {contentInf: {left:"img/stereo/stereo1_l.png", right:"img/stereo/stereo1_r.png"}}
    );
    var image2 = new Board("Image2",
        {color:"#ffffff"},
        {texture: "img/stereo/2l.png"},
        {contentInf: {left:"img/stereo/2l.png", right:"img/stereo/2r.png"}}
    );
    var image3 = new Board("Image3",
        {color:"#ffffff"},
        {texture: "img/stereo/3l.png"},
        {contentInf: {left:"img/stereo/3l.png", right:"img/stereo/3r.png"}}
    );
    var imageBackBoard = new Board("Back", {color:"#222222"}, {texture: "img/exit.jpg"});

    var videoMenu = new Menu(2000);
    var video1 = new Board("Logo",
        {color:"#ffffff"},
        {color:"#ff0000"},
        {contentInf: "video/stereo/1.mp4"}
    );
    var video2 = new Board("Subtitle",
        {color:"#ffffff"},
        {color:"#ff0000"},
        {contentInf: "video/stereo/2.mp4"}
    );
    var video3 = new Board("Animation",
        {color:"#ffffff"},
        {color:"#ff0000"},
        {contentInf: "video/stereo/3.mp4"}
    );
    var videoBackBoard = new Board("Back", {color:"#222222"}, {texture: "img/exit.jpg"});

    var panoramaMenu = new Menu(2000);
    var panorama1 = new Board("Image",
        {color:"#ffffff"},
        {texture:"img/p.jpg"},
        {contentInf: "img/panorama/1.jpg"}
    );
    var panoramaBackBoard = new Board("Back", {color:"#222222"}, {texture: "img/exit.jpg"});
    //Set links
    imageBoard.link = imageMenu;
    videoBoard.link = videoMenu;
    panoramaBoard.link = panoramaMenu;

    image1.link = imageFrame;
    image2.link = imageFrame;
    image3.link = imageFrame;
    imageBackBoard.link = frameSwitcher.stackPop;

    video1.link = videoFrame;
    video2.link = videoFrame;
    video3.link = videoFrame;
    videoBackBoard.link = frameSwitcher.stackPop;

    panorama1.link = panoramaFrame;
    panoramaBackBoard.link = frameSwitcher.stackPop;
    //Add boards to menu
    mainMenu.addBoard(imageBoard);
    mainMenu.addBoard(videoBoard);
    mainMenu.addBoard(panoramaBoard);

    imageMenu.addBoard(image1);
    imageMenu.addBoard(image2);
    imageMenu.addBoard(image3);
    imageMenu.addBoard(imageBackBoard);

    videoMenu.addBoard(video1);
    videoMenu.addBoard(video2);
    videoMenu.addBoard(video3);
    videoMenu.addBoard(videoBackBoard);

    panoramaMenu.addBoard(panorama1);
    panoramaMenu.addBoard(panoramaBackBoard);
    //Set stage
    stage.addLight(new Light("ambient", 0x333333));
    stage.addLight(new Light("spot", 0xffffff));
    //Add menu to stage
    stage.addMenu("main", mainMenu);
    stage.addMenu("image", imageMenu);
    stage.addMenu("video", videoMenu);
    stage.addMenu("panorama", panoramaMenu);
    //Construct Complete Scene for each menu
    stage.genScene();
    //Switch to main menu
    stage.switchMenu("main");
};

var constructImageFrame = function(){
    imageFrame.on = function(link, contentInf){
        var imgLinks = contentInf;
        this.leftDom.setAttribute("src", imgLinks.left);
        this.rightDom.setAttribute("src", imgLinks.right);
        this.dom.style.display = "inline";
    };
    imageFrame.off = function(){
        this.dom.style.display = "none";
    };
    imageFrame.switch = function(link, contentInf){
        var imgLinks = contentInf;
        this.leftDom.setAttribute("src", imgLinks.left);
        this.rightDom.setAttribute("src", imgLinks.right);
    };
};

var constructVideoFrame = function(){
    videoFrame.on = function(link, contentInf){
        var video = this.dom.querySelector("video");
        var cur = this;
        video.querySelector("source").setAttribute("src", contentInf);
        video.load();
        //Wait for loading
        video.addEventListener("loadeddata", function(e){
            e.target.removeEventListener(e.type, arguments.callee);
            video.play();
        });
        this.dom.style.display = "inline";
    };
    videoFrame.off = function(){
        this.dom.querySelector("video").pause();
        this.dom.style.display = "none";
    };
    videoFrame.switch = function(link, contentInf){
        var video = this.dom.querySelector("video");
        var cur = this;
        video.querySelector("source").setAttribute("src", contentInf);
        video.load();
        //Wait for loading
        video.addEventListener("loadeddata", function(e){
            e.target.removeEventListener(e.type, arguments.callee);
            video.play();
        });
    };
};

var constructWelcomeFrame = function(){
    welcomeFrame.on = function(){
        this.dom.style.display = "inline";
    };
    welcomeFrame.off = function(){
        this.dom.style.display = "none";
    };
};

var constructPanoramaFrame = function(){
    panoramaFrame.width = null;
    panoramaFrame.height = null;
    panoramaFrame.canvas = panoramaFrame.leftDom;
    panoramaFrame.ctx = panoramaFrame.canvas.getContext("2d");
    panoramaFrame.rcanvas = panoramaFrame.rightDom;
    panoramaFrame.rctx = panoramaFrame.rcanvas.getContext("2d");
    panoramaFrame.canvas.width = 960;
    panoramaFrame.canvas.height = 1080;
    panoramaFrame.rcanvas.width = 960;
    panoramaFrame.rcanvas.height = 1080;
    panoramaFrame.img = panoramaFrame.dom.querySelector("img");
    panoramaFrame.viewRange = 30 / 180 * Math.PI;
    panoramaFrame.continue = false;
    panoramaFrame.rToI = function(r){
        if (!this.width){
            throw "No image loaded";
        }
        return r / (Math.PI * 2) * this.width;
    };
    panoramaFrame.on = function(link, contentInf){
        var cur = this;
        this.img.setAttribute("src", contentInf);
        this.img.addEventListener("load", function(e){
            e.target.removeEventListener(e.type, arguments.callee);
            oj.resetInit();
            cur.continue = true;
            cur.width = cur.img.naturalWidth;
            cur.height = cur.img.naturalHeight;
            cur.loop();
            cur.dom.style.display = "inline";
        });
    };
    panoramaFrame.off= function(){
        this.dom.style.display = "none";
        this.width = null;
        this.height = null;
        this.continue = false;
    };
    panoramaFrame.switch = function(){

    };
    panoramaFrame.loop = function(){
        var yRot = oj.getYAxisRotation();
        var lr = -yRot + Math.PI - panoramaFrame.viewRange / 2;
        var rr = -yRot + Math.PI + panoramaFrame.viewRange / 2;
        var segments = [];
        //Check Whether need to separate to two segment
        if (lr < 0){
            lr += Math.PI * 2;
            segments.push([panoramaFrame.rToI(lr), panoramaFrame.width]);
            segments.push([0, panoramaFrame.rToI(rr)]);
        }
        else if (rr > Math.PI * 2){
            segments.push([panoramaFrame.rToI(lr), panoramaFrame.width]);
            rr -= Math.PI * 2;
            segments.push([0, panoramaFrame.rToI(rr)]);
        }
        else{
            segments.push([panoramaFrame.rToI(lr), panoramaFrame.rToI(rr)]);
        }
        var startPoint = 0;
        for (var i = 0; i < segments.length; i++){
            var segment = segments[i];
            var ratio = panoramaFrame.canvas.width / (panoramaFrame.width * (panoramaFrame.viewRange / (Math.PI * 2)));
            panoramaFrame.ctx.drawImage(
                panoramaFrame.img,
                segment[0], 0,
                segment[1] - segment[0], panoramaFrame.height,
                startPoint, 0,
                (segment[1] - segment[0]) * ratio, panoramaFrame.canvas.height
            );
            panoramaFrame.rctx.drawImage(
                panoramaFrame.img,
                segment[0], 0,
                segment[1] - segment[0], panoramaFrame.height,
                startPoint, 0,
                (segment[1] - segment[0]) * ratio, panoramaFrame.canvas.height
            );
            startPoint += (segment[1] - segment[0]) * ratio;
        }
        if (panoramaFrame.continue){
            requestAnimationFrame(panoramaFrame.loop);
        }
    };
};

var triggerEvent = function(obj){
    var event = new CustomEvent("trigger", {detail: obj});
    window.dispatchEvent(event);
};

var triggerProcess = function(event){
    var obj = event.detail;
    if (!obj.link){
        throw "Invalid Object";
    }
    var link = obj.link;
    if (typeof link == "function"){
        link = link.call(frameSwitcher);
        //If Undo Stack is empty
        if (!link) return;
    }
    else{
        frameSwitcher.stackPush(obj);
    }
    frameSwitcher.switch(link, obj.contentInf);
};

var polarProcess = function(event){
    var lastTime = event.detail.lastTime;
    if (lastTime > 3000){
        triggerEvent({link: frameSwitcher.stackPop});
    }
};



var mainLoop = function(){
    //Get Menu
    var menu = stage.activeMenu;
    //Get Scene
    var scene = menu.th.scene;
    //Get Renderer
    var renderer = stage.renderer;
    //Detect stared
    var staredObject = stage.getStaredObj();
    if (staredObject.obj){
        var board = staredObject.obj;
        var lastTime = staredObject.lastTime;
        if (lastTime < 500){
            board.setDistance(80);
        }
        else if (lastTime <= 2200){
            board.setDistance(80 - (lastTime - 500) / 2000 * 80);
        }
        else if (lastTime > 2200){
            triggerEvent(staredObject.obj);
        }
    }
    if (staredObject.noLonger){
        staredObject.noLonger.setDistance(100);
    }
    //Update Scene Position
    stage.update(oj);
    //Draw scene for each camera
    var eyes = stage.eyes;
    for (var i = 0; i < eyes.length; i++) {
        var eye = eyes[i];
        var camera = eye.th.camera;
        var left = Math.floor(windowW * eye.l);
        var bottom = Math.floor(windowH * eye.b);
        var width = Math.floor(windowW * eye.w);
        var height = Math.floor(windowH  * eye.h);
        renderer.setViewport(left, bottom, width, height);
        renderer.setScissor(left, bottom, width, height);
        renderer.enableScissorTest(true);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
    }
    if (stage.continueLoop) {
        requestAnimationFrame(mainLoop);
    }
};

var initVideoPlayer = function(){
    var video = videoFrame.dom.querySelector("video");
    video.play();
    video.pause();
    frameSwitcher.switch(stage.menus["main"]);
};


window.onload = function(){
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    //Every thing starts after window size is determined
    //Initialize orientation judege
    oj = new OrientationJudge({debug: document.querySelector("#orientation")});
    oj.registerEvent();
    //Set event listener
    window.addEventListener("trigger", triggerProcess);
    window.addEventListener("staredPolar", polarProcess);

    frameSwitcher = new FrameSwitcher();

    stage = new Stage({debug: document.querySelector("#stared")});

    imageFrame = new Frame(document.querySelector("#image"));
    videoFrame = new Frame(document.querySelector("#video"));
    welcomeFrame = new Frame(document.querySelector("#welcome"));
    panoramaFrame = new Frame(document.querySelector("#panorama"));
    frameSwitcher.addFrame("image", imageFrame);
    frameSwitcher.addFrame("stage", stage);
    frameSwitcher.addFrame("video", videoFrame);
    frameSwitcher.addFrame("welcome", welcomeFrame);
    frameSwitcher.addFrame("panorama", panoramaFrame);

    constructImageFrame();
    constructVideoFrame();
    constructStage();
    constructWelcomeFrame();
    constructPanoramaFrame();
    frameSwitcher.switch(welcomeFrame);
};

