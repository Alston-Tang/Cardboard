/**
 * Created by Tang on 2015/12/24.
 */

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


var OrientationJudge = function(obj){
    if (!obj) obj = {};
    this.debug = obj.debug ? obj.debug : false;
    this.lastA = null;
    this.lastB = null;
    this.lastC = null;
    this.a = null;
    this.b = null;
    this.c = null;
    this.initA = null;
    this.initB = null;
    this.initC = null;
};

OrientationJudge.prototype.registerEvent = function(){
    var cur = this;
    window.addEventListener('deviceorientation', function(event){
        cur.update(event.alpha, event.beta, event.gamma);
    });
};


OrientationJudge.prototype.update = function(a, b, c){
    if (!isNumber(this.initA)){
        this.initA = a;
        this.initB = b;
        this.initC = c;
    }
    this.lastA = a;
    this.lastB = b;
    this.lastC = c;
    this.a = a;
    this.b = b;
    this.c = c;
    if (this.debug){
        this.debug.innerHTML = this.debugInf();
    }
};

OrientationJudge.prototype.yRotationReverse = function(){
    return (this.initC * this.c < 0)
};

OrientationJudge.prototype.getYAxisRotation = function(){
    var rv = this.a;
    if (this.yRotationReverse()){
        rv += 180;
    }
    //Normalize to (-180, 180]
    if (rv <= -180) rv += 360;
    if (rv > 180) rv -= 360;
    return rv * Math.PI / 180;
};

OrientationJudge.prototype.getXAxisRotation = function(){
    var rv = 90 - this.c;
    if (rv > 90){
        rv = rv - 180;
    }
    return rv * Math.PI / 180;
};

OrientationJudge.prototype.debugInf = function(){
    if (this.a && this.b && this.c) {
        return "a: " + this.a.toFixed(2) + " b: " + this.b.toFixed(2) + " c: " + this.c.toFixed(2) +
            "<br>initA: " + this.initA.toFixed(2) + " initB: " + this.initB.toFixed(2) + " initC: " + this.initC.toFixed(2) +
            "<br>RotationX: " + this.getXAxisRotation().toFixed(2) + " RotationY: " + this.getYAxisRotation().toFixed(2);
    }
    else return "No orientation information";
};