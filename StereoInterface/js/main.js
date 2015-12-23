/**
 * Created by Tang on 2015/12/23.
 */

var stage = new Stage();
var menu = new Menu(2000);
var windowH = null;
var windowW = null;
var renderer;

menu.addBoard(new Board("test", "#ff0000"));
menu.addBoard(new Board("test2", "#00ff00"));
menu.addBoard(new Board("test3", "#0000ff"));
stage.addMenu("main", menu);

menu.genScene();


var init = function(){
    renderer = new THREE.WebGLRenderer();
    windowW = window.innerWidth;
    windowH = window.innerHeight;
    renderer.setSize(windowW, windowH);
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);
};

var mainLoop = function(){
    //Get Scene
    var scene = menu.th.scene;
    //Draw scene for each camera
    var eyes = stage.eyes;
    for (var i = 0; i < eyes.length; i++) {
        var eye = eyes[i];
        var camera = eye.th.camera;
        var left = Math.floor(windowW * eye.l);
        var bottom = Math.floor(windowH * eye.b);
        var width = Math.floor(windowW * eye.w);
        var height = Math.floor(windowH * eye.h);
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

