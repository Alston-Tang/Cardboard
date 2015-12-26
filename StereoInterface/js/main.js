/**
 * Created by Tang on 2015/12/23.
 */

var stage = new Stage({debug: document.querySelector("#stared")});
var mainMenu = new Menu(2000);
var windowH = null;
var windowW = null;
var renderer;
var oj = new OrientationJudge({debug: document.querySelector("#orientation")});





mainMenu.addBoard(new Board("Stereo Image", {color:"#ffffff"}, {texture: "img/board1.jpg"}));
mainMenu.addBoard(new Board("test2", {color: "#00ff00"}, {color: "#00ff00"}));
mainMenu.addBoard(new Board("test3", {color: "#0000ff"}, {color: "#0000ff"}));
stage.addLight(new Light("ambient", 0x333333));
stage.addLight(new Light("spot", 0xffffff));
stage.addMenu("main", mainMenu);
stage.switchMenu("main");
mainMenu.genScene();


var init = function(){
    //Initialize Renderer
    renderer = new THREE.WebGLRenderer();
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    renderer.setSize(windowW, windowH);
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);
    //Initialize Orientation Judge
    oj.registerEvent();
};

var mainLoop = function(){
    //Get Menu
    var menu = stage.activeMenu;
    //Get Scene
    var scene = menu.th.scene;
    //Detect stared
    var staredObject = stage.getStaredObj();
    if (staredObject.obj){
        var board = staredObject.obj;
        var lastTime = staredObject.lastTime;
        if (lastTime < 1000){
            board.setDistance(80);
        }
        else{
            board.setDistance(80 - (lastTime - 1000) / 2000 * 80);
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
    requestAnimationFrame(mainLoop);
};


window.onload = function(){
    init();
    mainLoop();
};

