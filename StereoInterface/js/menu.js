/**
 * Created by Tang on 2015/12/23.
 */

/*
* Board {Title, Color, Callback]
*
* */
var eyeSpace = 200;
var Eye = function(position){
    if (position == 'left'){
        this.l = 0;
        this.offset = -eyeSpace / 2;
    }
    else{
        this.l = 0.5;
        this.offset = eyeSpace / 2;
    }
    this.b = 0;
    this.w = 0.5;
    this.h = 1;
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = this.offset;

    this.th = {};
    this.th.camera = camera;
};

var Stage = function(){
    this.activeMenu = null;
    //Create Light
    this.th = {};
    this.th.light = new THREE.AmbientLight(0xffffff);
    //Create Eyes
    this.eyes = [];
    this.eyes.push(new Eye("left"));
    this.eyes.push(new Eye("right"));
    this.menus = {};
};

Stage.prototype.addMenu = function(menuName, menu){
    this.menus[menuName] = menu;
    // Create Scene For Menu
    var scene = new THREE.Scene();
    // Add light
    scene.add(this.th.light);

    menu.th.scene = scene;
};

Stage.prototype.switchMenu = function(menuName){
    this.activeMenu = this.menus[menuName];
};


var Menu = function(radius){
    this.radius = radius;
    this.boards = [];
    this.th = {};
};

Menu.prototype.addBoard = function(board){
    board["menuId"] = this.boards.length;
    this.boards.push(board);
    //Update Position
    this.calcBoardPos();
};

Menu.prototype.calcBoardPos = function(){
    var circumference = Math.PI * this.radius;
    var marginRadian = (Board.prototype.width + Board.prototype.margin) / circumference * Math.PI;
    var leftR = Math.PI / 2 + (this.boards.length - 1) / 2 * marginRadian;
    for (var i = 0; i < this.boards.length; i++){
        var board = this.boards[i];
        var posX = Math.cos(leftR) * this.radius;
        var posZ = -Math.sin(leftR) * this.radius;
        board.th.group.position.x = posX;
        board.th.group.position.z = posZ;
        board.th.group.rotation.y = leftR - Math.PI / 2;

        leftR -= marginRadian;
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

var Board = function(title, color){
    this.title = title;
    this.color = color;
    this.th = {};
    this.th.boardGeometry = new THREE.BoxGeometry(Board.prototype.width, Board.prototype.height, Board.prototype.thickness);
    this.th.boardMaterial = new THREE.MeshLambertMaterial( { color: color} );
    this.th.textGeometry = new THREE.TextGeometry(title, {font: 'helvetiker'});
    this.th.textMaterial = this.th.boardMaterial;
    this.th.boardMesh = new THREE.Mesh(this.th.boardGeometry, this.th.boardMaterial);
    this.th.textMesh = new THREE.Mesh(this.th.textGeometry, this.th.textMaterial);

    this.th.group = new THREE.Group();
    this.th.group.add(this.th.boardMesh);
    this.th.group.add(this.th.textMesh);
};

Board.prototype.width = 500;
Board.prototype.height = 350;
Board.prototype.thickness = 10;
Board.prototype.margin = 100;