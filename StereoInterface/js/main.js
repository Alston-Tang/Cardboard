/**
 * Created by Tang on 2015/12/23.
 */

var windowW;
var windowH;
var stage, imageFrame, videoFrame;
var oj;
var frameSwitcher;

var constructStage = function(){
    //Create Objects
    var mainMenu = new Menu(2000);
    var imageBoard = new Board("Stereo Image", {color:"#ffffff"}, {texture: "img/board1.jpg"});
    var videoBoard = new Board("Stereo Video", {color: "#00ff00"}, {color: "#00ff00"});
    var panoramaBoard = new Board("test3", {color: "#0000ff"}, {color: "#ffffff"});
    var mainBackBoard = new Board("Back", {color: "#0000ff"}, {color: "#ffffff"});
    var imageMenu = new Menu(2000);
    var image1 = new Board("Image1",
        {color:"#ffffff"},
        {color:"#ff0000"},
        {contentInf: {left:"img/stereo/stereo1_l.png", right:"img/stereo/stereo1_r.png"}}
    );
    var imageBackBoard = new Board("Back", {color:"#ffffff"}, {color:"#ff0000"});
    var videoMenu = new Menu(2000);
    var video1 = new Board("Image1",
        {color:"#ffffff"},
        {color:"#ff0000"},
        {contentInf: {left:"video/stereo/1l.mp4", right:"video/stereo/1r.mp4"}}
    );
    var videoBackBoard = new Board("Back", {color:"#ffffff"}, {color:"#ff0000"});
    //Set links
    imageBoard.link = imageMenu;
    videoBoard.link = videoMenu;
    mainBackBoard.link = frameSwitcher.stackPop;

    image1.link = imageFrame;
    imageBackBoard.link = frameSwitcher.stackPop;

    video1.link = videoFrame;
    videoBackBoard.link = frameSwitcher.stackPop;
    //Add boards to menu
    mainMenu.addBoard(imageBoard);
    mainMenu.addBoard(videoBoard);
    mainMenu.addBoard(panoramaBoard);
    mainMenu.addBoard(mainBackBoard);

    imageMenu.addBoard(image1);
    imageMenu.addBoard(imageBackBoard);

    videoMenu.addBoard(video1);
    videoMenu.addBoard(videoBackBoard);
    //Set stage
    stage.addLight(new Light("ambient", 0x333333));
    stage.addLight(new Light("spot", 0xffffff));
    //Add menu to stage
    stage.addMenu("main", mainMenu);
    stage.addMenu("image", imageMenu);
    stage.addMenu("video", videoMenu);
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
        var cur = this;
        var videoLinks = contentInf;
        this.leftDom.querySelector("source").setAttribute("src", videoLinks.left);
        this.rightDom.querySelector("source").setAttribute("src", videoLinks.right);
        this.leftDom.load();
        this.rightDom.load();
        //Wait for loading
        this.leftDom.addEventListener("canplay", function(){
            if (cur.leftDom.readyState == 4 && cur.rightDom.readyState == 4){
                cur.leftDom.play();
                cur.rightDom.play();
            }
        });
        this.rightDom.addEventListener("canplay", function(){
            if (cur.leftDom.readyState == 4 && cur.rightDom.readyState == 4){
                cur.leftDom.play();
                cur.rightDom.play();
            }
        });
        this.dom.style.display = "inline";
    };
    videoFrame.off = function(){
        this.dom.style.display = "none";
    };
    videoFrame.switch = function(link, contentInf){
        var cur = this;
        var videoLinks = contentInf;
        this.leftDom.querySelector("source").setAttribute("src", videoLinks.left);
        this.rightDom.querySelector("source").setAttribute("src", videoLinks.right);
        this.leftDom.load();
        this.rightDom.load();
        //Wait for loading
        this.leftDom.addEventListener("canplay", function(){
            if (cur.leftDom.readyState == 4 && cur.rightDom.readyState == 4){
                cur.leftDom.play();
                cur.rightDom.play();
            }
        });
        this.rightDom.addEventListener("canplay", function(){
            if (cur.leftDom.readyState == 4 && cur.rightDom.readyState == 4){
                cur.leftDom.play();
                cur.rightDom.play();
            }
        });
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
    }
    else{
        frameSwitcher.stackPush(obj);
    }
    frameSwitcher.switch(link, obj.contentInf);
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


window.onload = function(){
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    //Every thing starts after window size is determined
    //Initialize orientation judege
    oj = new OrientationJudge({debug: document.querySelector("#orientation")});
    oj.registerEvent();
    //Set event listener
    window.addEventListener("trigger", triggerProcess);

    frameSwitcher = new FrameSwitcher();
    stage = new Stage({debug: document.querySelector("#stared")});
    imageFrame = new Frame(document.querySelector("#image"));
    videoFrame = new Frame(document.querySelector("#video"));
    frameSwitcher.addFrame("image", imageFrame);
    frameSwitcher.addFrame("stage", stage);
    frameSwitcher.addFrame("video", videoFrame);

    constructImageFrame();
    constructVideoFrame();
    constructStage();
    frameSwitcher.switch(stage.menus["main"]);
};

