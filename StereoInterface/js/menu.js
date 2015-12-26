/**
 * Created by Tang on 2015/12/23.
 */

/*
* Board {Title, Color, Callback]
*
* */



var rToP = function(x, radius){
    var circumference = Math.PI * radius;
    var posX = Math.cos(x + Math.PI / 2) * radius;
    var posZ = -Math.sin(x + Math.PI / 2) * radius;
    return {x: posX, z:posZ};
};

var Eye = function(position){
    if (position == 'left'){
        this.l = 0;
        this.offset = -this.eyeSpace / 2;
        this.position = -1;
    }
    else{
        this.l = 0.5;
        this.offset = this.eyeSpace / 2;
        this.position = 1;
    }
    this.b = 0;
    this.w = 0.5;
    this.h = 1;
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = this.offset;
    camera.rotation.order = "YXZ";

    this.th = {};
    this.th.camera = camera;
};

Eye.prototype.eyeSpace = 200;

Eye.prototype.getRotation = function(){
    return {x: this.th.camera.rotation.x, y: this.th.camera.rotation.y};
};

Eye.prototype.update = function(oj){
    var xRot = oj.getXAxisRotation();
    var yRot = oj.getYAxisRotation();
    var pos = rToP(yRot - this.position * Math.PI / 2, this.eyeSpace);
    this.th.camera.position.x = pos.x;
    this.th.camera.position.z = pos.z;
    this.th.camera.rotation.y = yRot;
    this.th.camera.rotation.x = xRot;
};

Light = function(type, color){
    this.th = {};
    this.lightId = null;
    this.type = type;
    this.color = color;
    if (type == "ambient"){
        this.th.light = new THREE.AmbientLight(color);
    }
    else if (type == "spot"){
        this.th.light = new THREE.SpotLight(color);
        this.th.light.position.set(0, 0, 0);
        this.th.light.target.position.set(0, 0, -2000);
        this.th.light.target.updateMatrixWorld();
    }
    else throw "Unsupported light type";
};

Light.prototype.update = function(oj){
    switch (this.type){
        case "spot":
            var targetPos = rToP(oj.getYAxisRotation(), 2000);
            this.th.light.target.position.x = targetPos.x;
            this.th.light.target.position.z = targetPos.z;
            this.th.light.target.updateMatrixWorld();
            break;
    }
};

var Stage = function(obj){
    Frame.call(this);
    if (!obj){
        obj = {};
    }
    this.continueLoop = false;
    this.debug = obj.debug ? obj.debug : false;
    this.activeMenu = null;
    this.staredObj = null;
    this.staredObjTime = null;
    this.lights = [];
    this.backStack = [];

    //Create Eyes
    this.eyes = [];
    this.eyes.push(new Eye("left"));
    this.eyes.push(new Eye("right"));
    this.menus = {};

    //Initialize Renderer
    this.init();
};

Stage.prototype = Frame.prototype;

Stage.prototype.init = function(){
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(windowW, windowH);
    renderer.setClearColor(0x000000, 1);
    this.renderer = renderer;
    this.dom = this.renderer.domElement;
    this.dom.style.display = "none";
    document.body.appendChild(renderer.domElement);
};

Stage.prototype.addLight = function(light){
    light.lightId = this.lights.length;
    this.lights.push(light);
    for (var i = 0; i < this.menus.length; i++){
        var menu = this.menus[i];
        menu.th.scene.add(light);
    }
};

Stage.prototype.addMenu = function(menuName, menu){
    this.menus[menuName] = menu;
    menu.parent = this;
    // Create Scene For Menu
    var scene = new THREE.Scene();
    // Add light
    for (var i = 0; i < this.lights.length; i++){
        var light = this.lights[i];
        var cloneLight = new Light(light.type, light.color);
        scene.add(cloneLight.th.light);
        menu.lights.push(cloneLight);
    }
    menu.th.scene = scene;
};

Stage.prototype.switchMenu = function(menu){
    if (menu instanceof Board){
        menu = menu.parent;
    }
    if (!(menu instanceof Menu)){
        menu = this.menus[menu];
    }
    if (!menu){
        throw "Invalid Menu";
    }
    this.activeMenu = menu;
    oj.resetInit();
};

Stage.prototype.genScene = function(){
    for (var menuId in this.menus){
        //noinspection JSUnfilteredForInLoop
        this.menus[menuId].genScene();
    }
};
Stage.prototype.getStaredObj = function(){
    var menu = this.activeMenu;
    var eyeRotation = this.eyes[0].getRotation();
    var xCo = eyeRotation.x;
    var yCo = eyeRotation.y;
    var lastObj;
    for (var i = 0; i < menu.boards.length; i++){
        var board = menu.boards[i];
        if (board.isStared(xCo, yCo)){
            if (this.staredObj && this.staredObj == board){
                if (this.debug){
                    this.debug.innerHTML = this.debugInf();
                }
                return {obj: board, lastTime: new Date().getTime() - this.staredObjTime, noLonger: null};
            }
            else{
                lastObj = this.staredObj;
                this.staredObj = board;
                this.staredObjTime = new Date().getTime();
                if (this.debug){
                    this.debug.innerHTML = this.debugInf();
                }
                return {obj: board, lastTime: 0, noLonger: lastObj};
            }
        }
    }
    lastObj = this.staredObj ? this.staredObj : null;
    this.staredObj = null;
    this.staredObjTime = null;
    if (this.debug){
        this.debug.innerHTML = this.debugInf();
    }
    return {obj: null, lastTime: null, noLonger: lastObj};
};

Stage.prototype.update = function(oj){
    //Update Camera
    for (var i = 0; i < this.eyes.length; i++){
        this.eyes[i].update(oj);
    }
    this.activeMenu.update(oj);
};

Stage.prototype.on = function(menu){
    this.switchMenu(menu);
    this.dom.style.display = "inline";
    this.continueLoop = true;
    mainLoop();
};

Stage.prototype.off = function(){
    this.continueLoop = false;
    this.dom.style.display = "none";
};

Stage.prototype.switch = function(menu){
    this.switchMenu(menu);
};

Stage.prototype.debugInf = function(){
    var staredObj = this.staredObj;
    if (staredObj){
        return "MenuId: " + staredObj.menuId + " Last Time: " + ((new Date().getTime() - this.staredObjTime) / 1000).toFixed(2);
    }
    return "No stared object";
};


var Menu = function(radius){
    this.parent = null;
    this.radius = radius;
    this.boards = [];
    this.lights = [];
    this.th = {};
};

Menu.prototype.addBoard = function(board){
    board["menuId"] = this.boards.length;
    board.parent = this;
    this.boards.push(board);
    //Update Position
    this.calcBoardPos();
};

Menu.prototype.update = function(oj){
    //Update light direction
    for (var i = 0; i < this.lights.length; i++){
        this.lights[i].update(oj);
    }
};

Menu.prototype.calcBoardPos = function(){
    var circumference = Math.PI * this.radius;
    var boardRadian = (Board.prototype.width) / circumference * Math.PI;
    var marginRadian = (Board.prototype.width + Board.prototype.margin) / circumference * Math.PI;
    var centerR = (this.boards.length - 1) / 2 * marginRadian;
    for (var i = 0; i < this.boards.length; i++){
        var board = this.boards[i];
        board.rl = centerR + boardRadian / 2;
        board.rr = centerR - boardRadian / 2;
        board.rt = (Board.prototype.height / 2) / circumference * Math.PI;
        board.rb = -board.rt;
        var pos = rToP(centerR, this.radius);
        board.pos = pos;
        board.th.group.position.x = pos.x;
        board.th.group.position.z = pos.z;
        board.th.group.rotation.y = centerR;

        centerR -= marginRadian;
    }
};

Menu.prototype.genScene = function(){
    //Do not call this function twice or duplicated objects will be added
    if (!this.th || !this.th.scene){
        throw "Add menu to stage first";
    }
    var scene = this.th.scene;
    for (var i = 0; i < this.boards.length; i++){
        var board = this.boards[i];
        scene.add(board.th.group);
    }
};


var Board = function(title, textObj, boardObj, ext){
    if (!textObj) textObj = {};
    if (!boardObj) boardObj = {};
    if (!ext) ext = {};
    this.text = {};
    this.board = {};
    this.link = null;
    //Custom content information
    this.contentInf = ext.contentInf ? ext.contentInf : null;
    //Color
    this.text.color = textObj.color ? textObj.color : "#ffffff";
    this.board.color = boardObj.color ? textObj.color : "#ffffff";
    //Texture
    this.text.texture = textObj.texture ? new THREE.ImageUtils.loadTexture(textObj.texture) : null;
    this.board.texture = boardObj.texture ? new THREE.ImageUtils.loadTexture(boardObj.texture) : null;

    this.parent = null;
    this.title = title;
    this.distancePercent = 100;
    this.pos = {x: null, z: null};
    this.th = {};
    this.th.boardGeometry = new THREE.BoxGeometry(Board.prototype.width, Board.prototype.height, Board.prototype.thickness);
    this.th.boardMaterial = new THREE.MeshLambertMaterial( {map: this.board.texture, color: this.board.color} );
    this.th.textGeometry = new THREE.TextGeometry(this.title, {font: 'helvetiker'});
    this.th.textMaterial = new THREE.MeshLambertMaterial({map: this.text.texture, color: this.text.color});
    this.th.boardMesh = new THREE.Mesh(this.th.boardGeometry, this.th.boardMaterial);
    this.th.textMesh = new THREE.Mesh(this.th.textGeometry, this.th.textMaterial);
    //Shift Text to Center of Board
    this.th.textGeometry.computeBoundingBox();
    var textBox = this.th.textGeometry.boundingBox;
    this.th.textMesh.position.x = -(textBox.max.x - textBox.min.x) / 2;

    this.th.group = new THREE.Group();
    this.th.group.add(this.th.boardMesh);
    this.th.group.add(this.th.textMesh);
};

Board.prototype.isStared = function(xRotation, yRotation){
    if (xRotation < this.rb || xRotation > this.rt){
        return false;
    }
    return !(yRotation < this.rr || yRotation > this.rl);

};

Board.prototype.setDistance = function(percent){
    if (percent < 0) percent = 0;
    this.distancePercent = percent;
    this.th.group.position.x = this.pos.x * this.distancePercent / 100;
    this.th.group.position.z = this.pos.z * this.distancePercent / 100;
};

Board.prototype.width = 1000;
Board.prototype.height = 700;
Board.prototype.thickness = 10;
Board.prototype.margin = 200;