/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  January 2023  -- A3 Template
/////////////////////////////////////////////////////////////////////////////////////////

console.log('Hello world -- A3 Jan 2023');

var a=7;  
var b=2.6;
console.log('a=',a,'b=',b);
var myvector = new THREE.Vector3(0,1,2);
console.log('myvector =',myvector);

//var animation = true;
var jump = false;
var shake = true;
var mouse = false;
var meshesLoaded = false;
var RESOURCES_LOADED = false;
var deg2rad = Math.PI/180;

// give the following global scope (in this file), which is useful for motions and objects
// that are related to animation   
var catJumpMotion = new Motion(catSetMatrices);  
var catShakeMotion = new Motion(catSetMatrices);  
var catMouseMotion = new Motion(catSetMatrices);  
var linkBodyMiddle, linkRight, linkLeft, linkFR1, linkFL1, linkFR2, linkFL2, linkBL1, linkBL2, linkBL3, linkBR1, linkBR2, linkBR3, linkTail, linkHead, linkNeck;
var linkFrameBodyMiddle, linkFrameRight, linkFrameLeft, linkFrameFR1, linkFrameFL1, linkFrameFR2, linkFrameFL2, linkFrameBL1, linkFrameBL2, linkFrameBL3, linkFrameBR1, linkFrameBR2, linkFrameBR3, linkFrameTail, linkFrameHead, linkFrameNeck;
var sphere;    
var meshes = {};  

var linkMouseBack, linkMouseFront, linkMouseMiddle;
var linkFrameMouseBack, linkFrameMouseFront, linkFrameMouseMiddle;


// SETUP RENDERER & SCENE

var canvas = document.getElementById('canvas');
var camera;
var light;
var ambientLight;
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setClearColor(0xd0f0d0);     // set background colour
canvas.appendChild(renderer.domElement);


class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = t * 3 - 1.5;
		const ty = Math.sin( 2 * Math.PI * t );
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

	}

}


//////////////////////////////////////////////////////////
//  initCamera():   SETUP CAMERA
//////////////////////////////////////////////////////////

function initCamera() {
    // set up M_proj    (internally:  camera.projectionMatrix )
    var cameraFov = 30;     // initial camera vertical field of view, in degrees
      // view angle, aspect ratio, near, far
    camera = new THREE.PerspectiveCamera(cameraFov,1,0.1,1000); 

    var width = 10;  var height = 5;
//    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );

    // set up M_view:   (internally:  camera.matrixWorldInverse )
    camera.position.set(0,12,20);
    camera.up = new THREE.Vector3(0,1,0);
    camera.lookAt(0,0,0);
    scene.add(camera);

      // SETUP ORBIT CONTROLS OF THE CAMERA
//    const controls = new OrbitControls( camera, renderer.domElement );
    var controls = new THREE.OrbitControls(camera);
    controls.damping = 0.2;
    controls.autoRotate = false;
};

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
}

////////////////////////////////////////////////////////////////////////	
// init():  setup up scene
////////////////////////////////////////////////////////////////////////	

function init() {
    console.log('init called');

    initCamera();
    initMotions();
    initLights();
    initObjects();
    initCat();
    initFileObjects();

    window.addEventListener('resize',resize);
    resize();
};

////////////////////////////////////////////////////////////////////////
// initMotions():  setup Motion instances for each object that we wish to animate
////////////////////////////////////////////////////////////////////////

function initMotions() {

      // keyframes for cat:    name, time, [x, y, bodyMiddle, bodyRight, bodyLeft, FR1, FR2, FL1, FL2, BR1, BR2, BR3, BL1, BL2, BL3, Tail, Neck, Head, MouseX, MouseZ, BodyX]
    catJumpMotion.addKeyFrame(new Keyframe('straight',         0.0, [0, 3,    90,   0,  0,    0,    0,     0,   0,     0,  0, 0,      0,  0, 0,     0,  0, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('straight',         0.5, [0, 2,    90, -10, 10,    30, -60,    30, -60,   -30, 60, 0,    -30, 60, 0,   -30, 30, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('right finger curl',1.0, [0, 2,    90, -10, 10,    30, -60,    30, -60,   -30, 60, 0,    -30, 60, 0,   -30, 30, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('straight',         2.0, [0, 2,    90, -10, 10,    30, -60,    30, -60,   -30, 60, 0,    -30, 60, 0,   -30, 30, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('left finger curl', 2.5, [0, 4,    90,   0,  0,    0,    0,     0,   0,     0,  0, 0,      0,  0, 0,     0,  0, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('left finger curl', 3.0, [0, 3,    90,   0,  0,    0,    0,     0,   0,     0,  0, 0,      0,  0, 0,     0,  0, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('left finger curl', 3.5, [0, 2,    90, -10, 10,   30,  -60,    30, -60,   -30, 60, 0,    -30, 60, 0,   -30, 30, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('left finger curl', 4.0, [0, 2,    90, -10, 10,   30,  -60,    30, -60,   -30, 60, 0,    -30, 60, 0,   -30, 30, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('straight',         4.5, [0, 5,    90,   0,  0,    0,    0,     0,   0,     0,  0, 0,      0,  0, 0,     0,  0, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('both fingers curl',5.0, [0, 4,    90,   0,  0,    0,    0,     0,   0,     0,  0, 0,      0,  0, 0,     0,  0, 0,  0, 3,  0]));
    catJumpMotion.addKeyFrame(new Keyframe('straight',         6.0, [0, 3,    90,   0,  0,    0,    0,     0,   0,     0,  0, 0,      0,  0, 0,     0,  0, 0,  0, 3,  0]));

    catShakeMotion.addKeyFrame(new Keyframe('straight',         0.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,   0,   0,  0,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('right finger curl',1.0, [0, 2,    60, -30, 30,    -40, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('straight',         2.0, [0, 2,    60, -30, 30,    -40, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('left finger curl', 3.0, [0, 2,    60, -30, 30,    -40, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('straight',         5.0, [0, 2,    60, -30, 30,    -40, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('both fingers curl',5.5, [0, 2,    60, -30, 30,   -120, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('both fingers curl',6.0, [0, 2,    60, -30, 30,    -40, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('both fingers curl',6.5, [0, 2,    60, -30, 30,   -120, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('both fingers curl',7.0, [0, 2,    60, -30, 30,    -40, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('both fingers curl',7.5, [0, 2,    60, -30, 30,    -40, 40,   -40, 40,   0, 60, -30,   0, 60, -30,   0, -30, 30,  0, 3,  0]));
    catShakeMotion.addKeyFrame(new Keyframe('straight',         8.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,   0,   0,  0,  0, 3,  0]));

    catMouseMotion.addKeyFrame(new Keyframe('straight',         0.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  0,  0,    0,  3,  100]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',1.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  30,  0,    1,  2,  120]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',2.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  30,  0,    2,  1,  130]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',3.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  45,  0,    3,  0,  150]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',4.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  30,  0,    4, -1,  180]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',5.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  20,  0,    5, -2,  200]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',6.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  10,  0,    2, -3,  220]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',7.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  20,  0,    -1, -4,  250]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',8.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  30,  0,    -2, -3,  300]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',9.0, [0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  0,  0,    -3, 0,  360]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',10.0,[0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  0,  0,    -4, 2,  400]));
    catMouseMotion.addKeyFrame(new Keyframe('right finger curl',11.0,[0, 3,    90,   0,  0,      0,  0,     0,  0,   0,  0,   0,   0,  0,   0,    0,  0,  0,    0,  3,  460]));
}

///////////////////////////////////////////////////////////////////////////////////////
// catSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function catSetMatrices(avars) {
    //[x, y, bodyMiddle, bodyRight, bodyLeft, FR1, FR2, FL1, FL2, BR1, BR2, BR3, BL1, BL2, BL3, Tail, Neck, Head]
    var xPosition = avars[0];
    var yPosition = avars[1];

    var bodyMiddle = avars[2]*deg2rad;
    var bodyRight = avars[3]*deg2rad;
    var bodyLeft = avars[4]*deg2rad;

    var FR1 = avars[5]*deg2rad;
    var FR2 = avars[6]*deg2rad;

    var FL1 = avars[7]*deg2rad;
    var FL2 = avars[8]*deg2rad;

    var BR1 = avars[9]*deg2rad;
    var BR2 = avars[10]*deg2rad;
    var BR3 = avars[11]*deg2rad;

    var BL1 = avars[12]*deg2rad;
    var BL2 = avars[13]*deg2rad;
    var BL3 = avars[14]*deg2rad;

    var Tail = avars[15]*deg2rad;
    var Neck = avars[16]*deg2rad;
    var Head = avars[17]*deg2rad;

    var mouseX = avars[18];
    var mouseZ = avars[19];

    var BodyX = avars[20]*deg2rad;

    var M =  new THREE.Matrix4();
    var Mmouse = new THREE.Matrix4();
    
      ////////////// link1 
    linkFrameBodyMiddle.matrix.identity(); 
    linkFrameBodyMiddle.matrix.multiply(M.makeTranslation(xPosition,yPosition,0));   
    linkFrameBodyMiddle.matrix.multiply(M.makeRotationZ(bodyMiddle)); 
    linkFrameBodyMiddle.matrix.multiply(M.makeRotationX(BodyX));
      // Frame 1 has been established, now setup the extra transformations for the scaled box geometry
    linkBodyMiddle.matrix.copy(linkFrameBodyMiddle.matrix);
    linkBodyMiddle.matrix.multiply(M.makeTranslation(0,0,0));   
    linkBodyMiddle.matrix.multiply(M.makeScale(2,2,2));    

      ////////////// linkRight
    linkFrameRight.matrix.copy(linkFrameBodyMiddle.matrix);      // start with parent frame
    linkFrameRight.matrix.multiply(M.makeTranslation(0,-1.5,0));
    linkFrameRight.matrix.multiply(M.makeRotationZ(bodyRight));    
      // Frame 2 has been established, now setup the extra transformations for the scaled box geometry
    linkRight.matrix.copy(linkFrameRight.matrix);
    linkRight.matrix.multiply(M.makeTranslation(0,0,0));   
    linkRight.matrix.multiply(M.makeScale(2,1,2));    

      ///////////////  linkLeft
    linkFrameLeft.matrix.copy(linkFrameBodyMiddle.matrix);
    linkFrameLeft.matrix.multiply(M.makeTranslation(0,1.5,0));
    linkFrameLeft.matrix.multiply(M.makeRotationZ(bodyLeft));    
      // Frame 3 has been established, now setup the extra transformations for the scaled box geometry
    linkLeft.matrix.copy(linkFrameLeft.matrix);
    linkLeft.matrix.multiply(M.makeTranslation(0,0,0));   
    linkLeft.matrix.multiply(M.makeScale(2,1,2));    

      /////////////// linkFR1
    linkFrameFR1.matrix.copy(linkFrameLeft.matrix);
    linkFrameFR1.matrix.multiply(M.makeTranslation(-0.5,0,-0.5));
    linkFrameFR1.matrix.multiply(M.makeRotationZ(FR1));

      // Frame 4 has been established, now setup the extra transformations for the scaled box geometry
    linkFR1.matrix.copy(linkFrameFR1.matrix);
    linkFR1.matrix.multiply(M.makeTranslation(-0.6,-0.5,0));
    linkFR1.matrix.multiply(M.makeRotationZ(-Math.PI/3 + Math.PI));
    linkFR1.matrix.multiply(M.makeScale(0.5,2,0.5));   
    
    linkFrameFR2.matrix.copy(linkFrameFR1.matrix);
    linkFrameFR2.matrix.multiply(M.makeTranslation(-1.35,-0.5,0));
    linkFrameFR2.matrix.multiply(M.makeRotationZ(FR2));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkFR2.matrix.copy(linkFrameFR2.matrix);
    linkFR2.matrix.multiply(M.makeTranslation(-0.75,0,0));
    linkFR2.matrix.multiply(M.makeRotationZ(Math.PI/3));
    linkFR2.matrix.multiply(M.makeScale(0.5,2,0.5)); 

      // linkFL1
    linkFrameFL1.matrix.copy(linkFrameLeft.matrix);
    linkFrameFL1.matrix.multiply(M.makeTranslation(-0.5,0,0.5));
    linkFrameFL1.matrix.multiply(M.makeRotationZ(FL1));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkFL1.matrix.copy(linkFrameFL1.matrix);
    linkFL1.matrix.multiply(M.makeTranslation(-0.6,-0.5,0));
    linkFL1.matrix.multiply(M.makeRotationZ(-Math.PI/3 + Math.PI));   
    linkFL1.matrix.multiply(M.makeScale(0.5,2,0.5));    

    linkFrameFL2.matrix.copy(linkFrameFL1.matrix);
    linkFrameFL2.matrix.multiply(M.makeTranslation(-1.35,-0.5,0));
    linkFrameFL2.matrix.multiply(M.makeRotationZ(FL2));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkFL2.matrix.copy(linkFrameFL2.matrix);
    linkFL2.matrix.multiply(M.makeTranslation(-0.75,0,0));
    linkFL2.matrix.multiply(M.makeRotationZ(Math.PI/3));
    linkFL2.matrix.multiply(M.makeScale(0.5,2,0.5)); 
    
    linkFrameBL1.matrix.copy(linkFrameRight.matrix);
    linkFrameBL1.matrix.multiply(M.makeTranslation(-1,0.25,0.5));
    linkFrameBL1.matrix.multiply(M.makeRotationZ(BL1));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkBL1.matrix.copy(linkFrameBL1.matrix);
    linkBL1.matrix.multiply(M.makeTranslation(0,0,0));
    linkBL1.matrix.multiply(M.makeRotationZ(Math.PI/3.5));
    linkBL1.matrix.multiply(M.makeScale(0.5,1.5,0.5)); 
    
    linkFrameBL2.matrix.copy(linkFrameBL1.matrix);
    linkFrameBL2.matrix.multiply(M.makeTranslation(-0.25,0,0));
    linkFrameBL2.matrix.multiply(M.makeRotationZ(BL2));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkBL2.matrix.copy(linkFrameBL2.matrix);
    linkBL2.matrix.multiply(M.makeTranslation(-0.75,0,0));
    linkBL2.matrix.multiply(M.makeRotationZ(-Math.PI/3.5));
    linkBL2.matrix.multiply(M.makeScale(0.5,2,0.5)); 

    linkFrameBL3.matrix.copy(linkFrameBL2.matrix);
    linkFrameBL3.matrix.multiply(M.makeTranslation(-1.5,-0.25,0));
    linkFrameBL3.matrix.multiply(M.makeRotationZ(BL3));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkBL3.matrix.copy(linkFrameBL3.matrix);
    linkBL3.matrix.multiply(M.makeTranslation(0,0,0));
    linkBL3.matrix.multiply(M.makeRotationZ(Math.PI/6));
    linkBL3.matrix.multiply(M.makeScale(0.5,1,0.5)); 
    
    linkFrameBR1.matrix.copy(linkFrameRight.matrix);
    linkFrameBR1.matrix.multiply(M.makeTranslation(-1,0.25,-0.5));
    linkFrameBR1.matrix.multiply(M.makeRotationZ(BR1));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkBR1.matrix.copy(linkFrameBR1.matrix);
    linkBR1.matrix.multiply(M.makeTranslation(0,0,0));
    linkBR1.matrix.multiply(M.makeRotationZ(Math.PI/3.5));
    linkBR1.matrix.multiply(M.makeScale(0.5,1.5,0.5)); 

    linkFrameBR2.matrix.copy(linkFrameBR1.matrix);
    linkFrameBR2.matrix.multiply(M.makeTranslation(-0.25,0,0));
    linkFrameBR2.matrix.multiply(M.makeRotationZ(BR2));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    
    linkBR2.matrix.copy(linkFrameBR2.matrix);
    linkBR2.matrix.multiply(M.makeTranslation(-0.75,0,0));
    linkBR2.matrix.multiply(M.makeRotationZ(-Math.PI/3.5));
    linkBR2.matrix.multiply(M.makeScale(0.5,2,0.5)); 
    
    linkFrameBR3.matrix.copy(linkFrameBR2.matrix);
    linkFrameBR3.matrix.multiply(M.makeTranslation(-1.5,-0.25,0));
    linkFrameBR3.matrix.multiply(M.makeRotationZ(BR3));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkBR3.matrix.copy(linkFrameBR3.matrix);
    linkBR3.matrix.multiply(M.makeTranslation(0,0,0));
    linkBR3.matrix.multiply(M.makeRotationZ(Math.PI/6));
    linkBR3.matrix.multiply(M.makeScale(0.5,1,0.5)); 

    linkFrameTail.matrix.copy(linkFrameRight.matrix);
    linkFrameTail.matrix.multiply(M.makeTranslation(1.25,0,0));
    linkFrameTail.matrix.multiply(M.makeRotationZ(Tail));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkTail.matrix.copy(linkFrameTail.matrix);
    linkTail.matrix.multiply(M.makeTranslation(0,-0.75,0));
    linkTail.matrix.multiply(M.makeRotationZ(-Math.PI/4));
    linkTail.matrix.multiply(M.makeScale(0.5,0.5,0.5)); 

    linkFrameNeck.matrix.copy(linkFrameLeft.matrix);
    linkFrameNeck.matrix.multiply(M.makeTranslation(1,-0.5,0));
    linkFrameNeck.matrix.multiply(M.makeRotationZ(Neck));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkNeck.matrix.copy(linkFrameNeck.matrix);
    linkNeck.matrix.multiply(M.makeTranslation(0,1,0));
    linkNeck.matrix.multiply(M.makeRotationZ(-Math.PI/4));
    linkNeck.matrix.multiply(M.makeScale(0.75,1.5,0.75)); 

    linkFrameHead.matrix.copy(linkFrameNeck.matrix);
    linkFrameHead.matrix.multiply(M.makeTranslation(1,1.5,0));
    linkFrameHead.matrix.multiply(M.makeRotationZ(Head));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkHead.matrix.copy(linkFrameHead.matrix);
    linkHead.matrix.multiply(M.makeTranslation(-0.25,0.25,0));
    linkHead.matrix.multiply(M.makeScale(1.75,1.75,1.75)); 

    linkFrameMouseFront.matrix.copy(linkFrameMouseMiddle.matrix);
    linkFrameMouseFront.matrix.multiply(Mmouse.makeTranslation(0,-0.125,0));
    linkFrameMouseFront.matrix.multiply(Mmouse.makeRotationZ(Math.PI));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkMouseFront.matrix.copy(linkFrameMouseFront.matrix);
    linkMouseFront.matrix.multiply(Mmouse.makeTranslation(0,0.25,0));
    linkMouseFront.matrix.multiply(Mmouse.makeScale(0.5,0.5,0.5)); 

    linkFrameMouseBack.matrix.copy(linkFrameMouseMiddle.matrix);
    linkFrameMouseBack.matrix.multiply(Mmouse.makeTranslation(0,0.125,0));
    linkFrameMouseBack.matrix.multiply(Mmouse.makeRotationZ(0));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkMouseBack.matrix.copy(linkFrameMouseBack.matrix);
    linkMouseBack.matrix.multiply(Mmouse.makeTranslation(0,0,0));
    linkMouseBack.matrix.multiply(Mmouse.makeScale(0.5,0.5,0.5)); 

    linkFrameMouseMiddle.matrix.identity();
    linkFrameMouseMiddle.matrix.multiply(Mmouse.makeTranslation(mouseX,-0.75,mouseZ));
    linkFrameMouseMiddle.matrix.multiply(Mmouse.makeRotationZ(Math.PI/2));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    linkMouseMiddle.matrix.copy(linkFrameMouseMiddle.matrix);
    linkMouseMiddle.matrix.multiply(Mmouse.makeTranslation(0,0,0));
    linkMouseMiddle.matrix.multiply(Mmouse.makeScale(0.5,0.25,0.5)); 

    linkBodyMiddle.updateMatrixWorld();
    linkRight.updateMatrixWorld();
    linkLeft.updateMatrixWorld();
    linkFR1.updateMatrixWorld();
    linkFL1.updateMatrixWorld();
    linkFR2.updateMatrixWorld();
    linkFL2.updateMatrixWorld();
    linkBL1.updateMatrixWorld();
    linkBL2.updateMatrixWorld();
    linkBL3.updateMatrixWorld();
    linkBR1.updateMatrixWorld();
    linkBR2.updateMatrixWorld();
    linkBR3.updateMatrixWorld();
    linkTail.updateMatrixWorld();
    linkHead.updateMatrixWorld();
    linkNeck.updateMatrixWorld();
    linkMouseFront.updateMatrixWorld();
    linkMouseBack.updateMatrixWorld();
    linkMouseMiddle.updateMatrixWorld();

    linkFrameBodyMiddle.updateMatrixWorld();
    linkFrameRight.updateMatrixWorld();
    linkFrameLeft.updateMatrixWorld();
    linkFrameFR1.updateMatrixWorld();
    linkFrameFL1.updateMatrixWorld();
    linkFrameFR2.updateMatrixWorld();
    linkFrameFL2.updateMatrixWorld();
    linkFrameBL1.updateMatrixWorld();
    linkFrameBL2.updateMatrixWorld();
    linkFrameBL3.updateMatrixWorld();
    linkFrameBR1.updateMatrixWorld();
    linkFrameBR2.updateMatrixWorld();
    linkFrameHead.updateMatrixWorld();
    linkFrameNeck.updateMatrixWorld();
    linkFrameMouseFront.updateMatrixWorld();
    linkFrameMouseBack.updateMatrixWorld();
    linkFrameMouseMiddle.updateMatrixWorld();
}

/////////////////////////////////////	
// initLights():  SETUP LIGHTS
/////////////////////////////////////	

function initLights() {
    light = new THREE.PointLight(0xffffff);
    light.position.set(0,4,2);
    scene.add(light);
    ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
}

/////////////////////////////////////	
// MATERIALS
/////////////////////////////////////	

var diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
var diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
var basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );

/////////////////////////////////////	
// initObjects():  setup objects in the scene
/////////////////////////////////////	

function initObjects() {
    var worldFrame = new THREE.AxesHelper(5) ;
    scene.add(worldFrame);

    // textured floor
    var floorTexture = new THREE.TextureLoader().load('images/floor.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    var floorGeometry = new THREE.PlaneGeometry(15, 15);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -1.1;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    // sphere, located at light position
    var sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
    sphere = new THREE.Mesh(sphereGeometry, basicMaterial);
    sphere.position.set(0,4,2);
    sphere.position.set(light.position.x, light.position.y, light.position.z);
    scene.add(sphere);

    // box
    var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth
    var box = new THREE.Mesh( boxGeometry, diffuseMaterial );
    box.position.set(-4, 0, 0);
    // scene.add( box );

    // multi-colored cube      [https://stemkoski.github.io/Three.js/HelloWorld.html] 
    var cubeMaterialArray = [];    // order to add materials: x+,x-,y+,y-,z+,z-
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff3333 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff8800 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xffff33 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x33ff33 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x3333ff } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x8833ff } ) );
      // Cube parameters: width (x), height (y), depth (z), 
      //        (optional) segments along x, segments along y, segments along z
    var mccGeometry = new THREE.BoxGeometry( 1.5, 1.5, 1.5, 1, 1, 1 );
    var mcc = new THREE.Mesh( mccGeometry, cubeMaterialArray );
    mcc.position.set(0,0,0);
    // scene.add( mcc );	

    // cylinder
    // parameters:  radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
    var cylinderGeometry = new THREE.CylinderGeometry( 0.30, 0.30, 0.80, 20, 4 );
    var cylinder = new THREE.Mesh( cylinderGeometry, diffuseMaterial);
    cylinder.position.set(2, 0, 0);
    // scene.add( cylinder );

    // cone:   parameters --  radiusTop, radiusBot, height, radialSegments, heightSegments
    var coneGeometry = new THREE.CylinderGeometry( 0.0, 0.30, 0.80, 20, 4 );
    var cone = new THREE.Mesh( coneGeometry, diffuseMaterial);
    cone.position.set(4, 0, 0);
    // scene.add( cone);

    // torus:   parameters -- radius, diameter, radialSegments, torusSegments
    var torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
    var torus = new THREE.Mesh( torusGeometry, diffuseMaterial);

    torus.rotation.set(0,0,0);     // rotation about x,y,z axes
    torus.scale.set(1,2,3);
    torus.position.set(-6, 0, 0);   // translation

    // scene.add( torus );

    /////////////////////////////////////
    //  CUSTOM OBJECT 
    ////////////////////////////////////
    
    var geom = new THREE.Geometry(); 
    var v0 = new THREE.Vector3(0,0,0);
    var v1 = new THREE.Vector3(3,0,0);
    var v2 = new THREE.Vector3(0,3,0);
    var v3 = new THREE.Vector3(3,3,0);
    
    geom.vertices.push(v0);
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
    
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geom.faces.push( new THREE.Face3( 1, 3, 2 ) );
    geom.computeFaceNormals();
    
    customObject = new THREE.Mesh( geom, diffuseMaterial );
    customObject.position.set(0, 0, -2);
    //scene.add(customObject);
}

/////////////////////////////////////////////////////////////////////////////////////
//  initCat():  define all geometry associated with the cat
/////////////////////////////////////////////////////////////////////////////////////

function initCat() {
    var catTexture = new THREE.TextureLoader().load('images/catskin.jpg');
    var catHeadTexture = new THREE.TextureLoader().load('images/catHead.jpg');
    var catMaterial = new THREE.MeshLambertMaterial( {map: catTexture} );
    var mouseMaterial = new THREE.MeshLambertMaterial( 0xffffff);
    var boxGeometry = new THREE.CylinderGeometry( 0.5, 0.5, 1, 32, 64);    // width, height, depth
    const path = new CustomSinCurve(1);
    var tailGeometry = new THREE.TubeGeometry(path, 20, 0.5, 8, false);
    var sphereGeometry = new THREE.SphereGeometry(0.5,32,16);
    var catHeadMaterial = new THREE.MeshLambertMaterial({map: catHeadTexture});
    var mouseFrontGeometry = new THREE.CylinderGeometry(0.125, 0.5, 1, 32, 64)

    linkBodyMiddle = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkBodyMiddle );
    linkFrameBodyMiddle   = new THREE.AxesHelper(1) ;   scene.add(linkFrameBodyMiddle);
    linkRight = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkRight );
    linkFrameRight   = new THREE.AxesHelper(1) ;   scene.add(linkFrameRight);
    linkLeft = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkLeft );
    linkFrameLeft   = new THREE.AxesHelper(1) ;   scene.add(linkFrameLeft);
    linkFR1 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkFR1 );
    linkFrameFR1   = new THREE.AxesHelper(1) ;   scene.add(linkFrameFR1);
    linkFL1 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkFL1 );
    linkFrameFL1   = new THREE.AxesHelper(1) ;   scene.add(linkFrameFL1);

    linkFR2 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkFR2 );
    linkFrameFR2   = new THREE.AxesHelper(1) ;   scene.add(linkFrameFR2);

    linkFL2 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkFL2 );
    linkFrameFL2   = new THREE.AxesHelper(1) ;   scene.add(linkFrameFL2);

    linkBL1 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkBL1 );
    linkFrameBL1   = new THREE.AxesHelper(1) ;   scene.add(linkFrameBL1);

    linkBL2 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkBL2 );
    linkFrameBL2   = new THREE.AxesHelper(1) ;   scene.add(linkFrameBL2);

    linkBL3 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkBL3 );
    linkFrameBL3   = new THREE.AxesHelper(1) ;   scene.add(linkFrameBL3);

    linkBR1 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkBR1 );
    linkFrameBR1   = new THREE.AxesHelper(1) ;   scene.add(linkFrameBR1);

    linkBR2 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkBR2 );
    linkFrameBR2   = new THREE.AxesHelper(1) ;   scene.add(linkFrameBR2);

    linkBR3 = new THREE.Mesh( boxGeometry, catMaterial );  scene.add( linkBR3 );
    linkFrameBR3   = new THREE.AxesHelper(1) ;   scene.add(linkFrameBR3);

    linkTail = new THREE.Mesh(tailGeometry, catMaterial) ; scene.add(linkTail);
    linkFrameTail = new THREE.AxesHelper(1); scene.add(linkFrameTail);

    linkNeck = new THREE.Mesh(boxGeometry, catMaterial) ; scene.add(linkNeck);
    linkFrameNeck = new THREE.AxesHelper(1); scene.add(linkFrameNeck);

    linkHead = new THREE.Mesh(sphereGeometry, catHeadMaterial) ; scene.add(linkHead);
    linkFrameHead = new THREE.AxesHelper(1); scene.add(linkFrameHead);

    linkMouseFront = new THREE.Mesh(mouseFrontGeometry, mouseMaterial) ; scene.add(linkMouseFront);
    linkFrameMouseFront = new THREE.AxesHelper(1); scene.add(linkFrameMouseFront);

    linkMouseBack = new THREE.Mesh(sphereGeometry, mouseMaterial) ; scene.add(linkMouseBack);
    linkFrameMouseBack = new THREE.AxesHelper(1); scene.add(linkFrameMouseBack);

    linkMouseMiddle = new THREE.Mesh(boxGeometry, mouseMaterial) ; scene.add(linkMouseMiddle);
    linkFrameMouseMiddle = new THREE.AxesHelper(1); scene.add(linkFrameMouseMiddle);

    linkBodyMiddle.matrixAutoUpdate = false;  
    linkRight.matrixAutoUpdate = false;  
    linkLeft.matrixAutoUpdate = false;  
    linkFR1.matrixAutoUpdate = false;  
    linkFL1.matrixAutoUpdate = false;
    linkFR2.matrixAutoUpdate = false;
    linkFL2.matrixAutoUpdate = false;
    linkBL1.matrixAutoUpdate = false;
    linkBL2.matrixAutoUpdate = false;
    linkBL3.matrixAutoUpdate = false;
    linkBR1.matrixAutoUpdate = false;
    linkBR2.matrixAutoUpdate = false;
    linkBR3.matrixAutoUpdate = false;
    linkTail.matrixAutoUpdate = false;
    linkNeck.matrixAutoUpdate = false;
    linkHead.matrixAutoUpdate = false;
    linkMouseFront.matrixAutoUpdate = false;
    linkMouseBack.matrixAutoUpdate = false;
    linkMouseMiddle.matrixAutoUpdate = false;


    linkFrameBodyMiddle.matrixAutoUpdate = false;  
    linkFrameRight.matrixAutoUpdate = false;  
    linkFrameLeft.matrixAutoUpdate = false;  
    linkFrameFR1.matrixAutoUpdate = false;  
    linkFrameFL1.matrixAutoUpdate = false;
    linkFrameFR2.matrixAutoUpdate = false;
    linkFrameFL2.matrixAutoUpdate = false;
    linkFrameBL1.matrixAutoUpdate = false;
    linkFrameBL2.matrixAutoUpdate = false;
    linkFrameBL3.matrixAutoUpdate = false;
    linkFrameBR1.matrixAutoUpdate = false;
    linkFrameBR2.matrixAutoUpdate = false;
    linkFrameBR3.matrixAutoUpdate = false;
    linkFrameTail.matrixAutoUpdate = false;
    linkFrameNeck.matrixAutoUpdate = false;
    linkFrameHead.matrixAutoUpdate = false;
    linkFrameMouseFront.matrixAutoUpdate = false;
    linkFrameMouseBack.matrixAutoUpdate = false;
    linkFrameMouseMiddle.matrixAutoUpdate = false;
}

/////////////////////////////////////////////////////////////////////////////////////
//  create customShader material
/////////////////////////////////////////////////////////////////////////////////////

var customShaderMaterial = new THREE.ShaderMaterial( {
//        uniforms: { textureSampler: {type: 't', value: floorTexture}},
	vertexShader: document.getElementById( 'customVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'customFragmentShader' ).textContent
} );

// var ctx = renderer.context;
// ctx.getShaderInfoLog = function () { return '' };   // stops shader warnings, seen in some browsers

////////////////////////////////////////////////////////////////////////	
// initFileObjects():    read object data from OBJ files;  see onResourcesLoaded() for instances
////////////////////////////////////////////////////////////////////////	

var models;

function initFileObjects() {
        // list of OBJ files that we want to load, and their material
    models = {     
	teapot:    {obj:"obj/teapot.obj", mtl: customShaderMaterial, mesh: null	},
	dragon:    {obj:"obj/dragon.obj", mtl: customShaderMaterial, mesh: null }
    };

    var manager = new THREE.LoadingManager();
    manager.onLoad = function () {
	console.log("loaded all resources");
	RESOURCES_LOADED = true;
	onResourcesLoaded();
    }
    var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
	    var percentComplete = xhr.loaded / xhr.total * 100;
	    console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
    };
    var onError = function ( xhr ) {
    };

    // Load models;  asynchronous in JS, so wrap code in a fn and pass it the index
    for( var _key in models ){
	console.log('Key:', _key);
	(function(key){
	    var objLoader = new THREE.OBJLoader( manager );
	    objLoader.load( models[key].obj, function ( object ) {
		object.traverse( function ( child ) {
		    if ( child instanceof THREE.Mesh ) {
			child.material = models[key].mtl;
			child.material.shading = THREE.SmoothShading;
		    }	} );
		models[key].mesh = object;
	    }, onProgress, onError );
	})(_key);
    }
}

/////////////////////////////////////////////////////////////////////////////////////
// onResourcesLoaded():  once all OBJ files are loaded, this gets called.
//                       Object instancing is done here
/////////////////////////////////////////////////////////////////////////////////////

function onResourcesLoaded(){

    meshesLoaded = true;
}


///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

// movement
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    // up
    if (keyCode == "W".charCodeAt()) {          // W = up
        light.position.y += 0.11;
        // down
    } else if (keyCode == "S".charCodeAt()) {   // S = down
        light.position.y -= 0.11;
        // left
    } else if (keyCode == "A".charCodeAt()) {   // A = left
	light.position.x -= 0.1;
        // right
    } else if (keyCode == "D".charCodeAt()) {   // D = right
        light.position.x += 0.11;
    } else if (keyCode == " ".charCodeAt()) {   // space
	    if(jump == true || mouse == true) {
            jump = false;
            shake = true;
            mouse = false;
        } else {
            shake = false;
            jump = true;
            mouse = false;
        }
    } else if (keyCode == "P".charCodeAt()) {   // P = pause
	    if(jump == false && shake == false && mouse == false) {
            jump = true;
        } else {
        jump = false;
        shake = false;
        mouse = false;
        }
    } else if(keyCode == "M".charCodeAt()) {   // M = mouse
        if (mouse == false) {
            jump = false;
            shake = false;
            mouse = true;
        } else {
            mouse = false;
        }
    }
};


///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK:    This is the main animation loop
///////////////////////////////////////////////////////////////////////////////////////

function update() {
//    console.log('update()');
    var dt=0.02;
    if (jump && meshesLoaded) {
	// advance the motion of all the animated objects
    catJumpMotion.timestep(dt);
    }
    if (shake && meshesLoaded) {
        catShakeMotion.timestep(dt);
    } 
    if (mouse && meshesLoaded) {
        catMouseMotion.timestep(dt);
    }
    if (meshesLoaded) {
	sphere.position.set(light.position.x, light.position.y, light.position.z);
	renderer.render(scene, camera);
    }
    requestAnimationFrame(update);      // requests the next update call;  this creates a loop
}

init();
update();