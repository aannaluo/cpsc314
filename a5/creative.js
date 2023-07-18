/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  Vjan2023
//  Assignment 5 Template;   compatible with three.js  r96
/////////////////////////////////////////////////////////////////////////////////////////


console.log('hello world');

//  another print example
myvector = new THREE.Vector3(0,1,2);
console.log('myvector =',myvector);
var motion = true;
var boxMotion = new Motion(boxSetMatrices);
var linkBox;
var clock = new THREE.Clock();
var speed = 2.0; //units a second
var delta = 0.0;

// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xd0f0d0); // set background colour
canvas.appendChild(renderer.domElement);

// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30,1,0.1,10000); // view angle, aspect ratio, near, far
camera.position.set(0,12,20);
camera.lookAt(0,0,0);
scene.add(camera);

// SETUP ORBIT CONTROLS OF THE CAMERA
var controls = new THREE.OrbitControls(camera, renderer.domElement);
// var controls = new THREE.OrbitControls(camera);
// controls.damping = 0.2;
 controls.autoRotate = true;
  controls.autoRotateSpeed = 2.0;

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
}

function init() {
  initMotions();
  initBox();
}

function initMotions() {
  boxMotion.addKeyFrame(new Keyframe('regular', 0.0, [0,3,0]));
  boxMotion.addKeyFrame(new Keyframe('up', 1.0, [0,2,0]));
  boxMotion.addKeyFrame(new Keyframe('left', 1.5, [-1,2,0]));
  boxMotion.addKeyFrame(new Keyframe('right', 2.5, [1,2,0]));
  boxMotion.addKeyFrame(new Keyframe('centre', 3.0, [0,2,0]));
  boxMotion.addKeyFrame(new Keyframe('centre', 4.0, [0,3,0]));
}
/////////////////////////////////////	
// ADD LIGHTS  and define a simple material that uses lighting
/////////////////////////////////////	

light = new THREE.PointLight(0xffffff);
light.position.set(0,4,4);
var vcsLight = new THREE.Vector3(light.position);
scene.add(light);
ambientLight = new THREE.AmbientLight(0x606060);
scene.add(ambientLight);

var diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
var diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
var basicMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  SHADERS /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

var textureLoader = new THREE.TextureLoader();

////////////////////// ENVMAP SHADER (and SkyBox textures)  /////////////////////////////

// posxTexture = textureLoader.load( "images/ABCD.jpg" );   // useful for debugging
posxTexture = textureLoader.load( "images/posx.jpg" ); 
posyTexture = textureLoader.load( "images/posy.jpg" ); 
poszTexture = textureLoader.load( "images/posz.jpg" ); 
negxTexture = textureLoader.load( "images/negx.jpg" ); 
negyTexture = textureLoader.load( "images/negy.jpg" ); 
negzTexture = textureLoader.load( "images/negz.jpg" ); 

minFilter = THREE.LinearFilter;
// minFilter = THREE.LinearMipMapLinearFilter;
magFilter = THREE.LinearFilter;

posxTexture.magFilter = magFilter;
posxTexture.minFilter = minFilter;
posyTexture.magFilter = magFilter;
posyTexture.minFilter = minFilter;
poszTexture.magFilter = magFilter;
poszTexture.minFilter = minFilter;
negxTexture.magFilter = magFilter;
negxTexture.minFilter = minFilter;
negyTexture.magFilter = magFilter;
negyTexture.minFilter = minFilter;
negzTexture.magFilter = magFilter;
negzTexture.minFilter = minFilter;

var envmapMaterial = new THREE.ShaderMaterial( {     
        uniforms: { 
           vcsLightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
	   matrixWorld: {value: new THREE.Matrix4()},
           uNegxTexture: {type: 't', value: negxTexture},
           uNegyTexture: {type: 't', value: negyTexture},
           uNegzTexture: {type: 't', value: negzTexture},
           uPosxTexture: {type: 't', value: posxTexture},
           uPosyTexture: {type: 't', value: posyTexture},
           uPoszTexture: {type: 't', value: poszTexture},
           myColor: { value: new THREE.Vector4(0.8,0.8,0.6,1.0) }
        },
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'envmapFragShader' ).textContent
} );

////////////////////// HOLEY SHADER /////////////////////////////

var holeyMaterial = new THREE.ShaderMaterial( {
        uniforms: { 
           vcsLightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(0.5,1.0,1.0,1.0) }
        },
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'holeyFragShader' ).textContent
} );

////////////////////// TOON SHADER /////////////////////////////

var toonMaterial = new THREE.ShaderMaterial( {
        uniforms: { 
           vcsLightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           toonColor: { value: new THREE.Vector4(0.5,0.5,0.8,1.0) }
        },
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'toonFragShader' ).textContent
} );

waveGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
var waveMaterial = new THREE.ShaderMaterial({
  uniforms: {
    clock_time: {value: delta},
    u_pointsize: { value: 2.0 },
  // wave 1
  u_noise_freq_1: { value: 3.0 },
  u_noise_amp_1: { value: 0.2 },
  u_spd_modifier_1: { value: 2.0 },
  // wave 2
  u_noise_freq_2: { value: 2.0 },
  u_noise_amp_2: { value: 0.3 },
  u_spd_modifier_2: { value: 0.8 }
  },
  vertexShader: document.getElementById( 'waveVertShader' ).textContent,
  fragmentShader: document.getElementById('waveFragShader').textContent
});
// const material = new THREE.MeshStandardMaterial();
wave = new THREE.Points(waveGeometry, waveMaterial);
scene.add(wave);

// set appropriate positioning
// this.mesh.position.set(-0.1, 0.4, 0);
wave.rotation.x = Math.PI / 2;


////////////////////// FLOOR SHADER /////////////////////////////

floorNormalTexture = textureLoader.load( "images/stone-map.png" ); 
floorTexture = textureLoader.load( "images/floor.jpg" );
floorTexture.magFilter = THREE.NearestFilter;
floorTexture.minFilter = THREE.NearestFilter;
floorTexture.wrapS = THREE.RepeatWrapping;

floorNormalTexture.minFilter = THREE.LinearMipMapLinearFilter;
floorNormalTexture.magFilter = THREE.LinearMipMapLinearFilter;
 floorTexture.minFilter = THREE.LinearMipMapLinearFilter;
 floorNormalTexture.minFilter = THREE.LinearMipMapLinearFilter;
var floorMaterial = new THREE.ShaderMaterial( {
        uniforms: { 
           vcsLightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(0.0,1.0,0.0,1.0) },
           normalMap: { type: 't', value: floorNormalTexture},
           textureMap: { type: 't', value: floorTexture}
        },
        side: THREE.DoubleSide,
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'floorFragShader' ).textContent
} );
floorMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;

////////////////////////////// WAVE SHADER /////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  OBJECTS /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////	
// WORLD COORDINATE FRAME
/////////////////////////////////////	

var worldFrame = new THREE.AxesHelper(5) ;
scene.add(worldFrame);

/////////////////////////////////////	
// Skybox 
/////////////////////////////////////	

// TO DO: 
//  - add the other skybox faces:  negx, negy, posy, negz, posz
//  - after debugging, change size to 1000

var size = 1000;
wallGeometry = new THREE.PlaneBufferGeometry(2*size, 2*size);

  // posxWall:  positive x-axis wall
posxMaterial = new THREE.MeshBasicMaterial( {map: posxTexture, side:THREE.DoubleSide });
posxWall = new THREE.Mesh(wallGeometry, posxMaterial);
posxWall.position.x = size;
posxWall.rotation.y = -Math.PI / 2;
scene.add(posxWall);

  // posyWall:  positive y-axis wall
  posyMaterial = new THREE.MeshBasicMaterial( {map: posyTexture, side:THREE.DoubleSide });
  posyWall = new THREE.Mesh(wallGeometry, posyMaterial);
  posyWall.position.y = size;
  posyWall.rotation.y = -Math.PI;
  posyWall.rotation.x = -Math.PI/2;
  scene.add(posyWall);
  // negxWall:  negative x-axis wall
  negxMaterial = new THREE.MeshBasicMaterial( {map: negxTexture, side:THREE.DoubleSide });
  negxWall = new THREE.Mesh(wallGeometry, negxMaterial);
  negxWall.position.x = -size;
  negxWall.rotation.y = Math.PI/2;
  scene.add(negxWall);
  // negyWall:  negative y-axis wall
  negyMaterial = new THREE.MeshBasicMaterial( {map: negyTexture, side:THREE.DoubleSide });
  negyWall = new THREE.Mesh(wallGeometry, negyMaterial);
  negyWall.position.y = -size;
  negyWall.rotation.x = Math.PI/2;
  negyWall.rotation.y = -Math.PI;
  //negyWall.rotation.y = -Math.PI;
  scene.add(negyWall);
  // poszWall:  positive z-axis wall
  poszMaterial = new THREE.MeshBasicMaterial( {map: poszTexture, side:THREE.DoubleSide });
  poszWall = new THREE.Mesh(wallGeometry, poszMaterial);
  poszWall.position.z = size;
  poszWall.rotation.y = -Math.PI;
  scene.add(poszWall);
  // negzWall:  negative z-axis wall
  negzMaterial = new THREE.MeshBasicMaterial( {map: negzTexture, side:THREE.DoubleSide });
  negzWall = new THREE.Mesh(wallGeometry, negzMaterial);
  negzWall.position.z = -size
  //negzWall.rotation.z = -Math.PI/2;
  //negzWall.rotation.x = -Math.PI/2;
  scene.add(negzWall);
/////////////////////////////////////	
// FLOOR:  texture-map  &  normal-map
/////////////////////////////////////	

floorGeometry = new THREE.PlaneBufferGeometry(15, 15);
floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1.1;
floor.rotation.x = -Math.PI / 2;
//scene.add(floor);

////////////////////////////////////////////////////////////////////////
//   wave Material
////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////
//   sphere, representing the light 
///////////////////////////////////////////////////////////////////////

sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
lightSphere = new THREE.Mesh(sphereGeometry, basicMaterial);
lightSphere.position.set(0,4,4);
lightSphere.position.set(light.position.x, light.position.y, light.position.z);
scene.add(lightSphere);

/////////////////////////////////////////////////////////////////////////
// holey-shaded torus
/////////////////////////////////////////////////////////////////////////

// parameters:   radius of torus, diameter of tube, segments around radius, segments around torus
torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
torus = new THREE.Mesh( torusGeometry, holeyMaterial);
torus.position.set(-3, 0.4, 0.3);   // translation
torus.rotation.set(0,0,0);     // rotation about x,y,z axes
//scene.add( torus );

/////////////////////////////////////////////////////////////////////////
// toon-shaded torus
/////////////////////////////////////////////////////////////////////////

// parameters:   radius of torus, diameter of tube, segments around radius, segments around torus
torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
torus = new THREE.Mesh( torusGeometry, toonMaterial);
torus.position.set(0, 0.4, 0.3);   // translation
torus.rotation.set(0,0,0);     // rotation about x,y,z axes
//scene.add( torus );

/////////////////////////////////////	
// MIRROR:  square patch on the ground
/////////////////////////////////////	

mirrorGeometry = new THREE.PlaneBufferGeometry(4,4);
mirror = new THREE.Mesh(mirrorGeometry, envmapMaterial);
mirror.position.x = -2.0;
mirror.position.z = 4.0;
mirror.position.y = -1.0;
mirror.rotation.x = -Math.PI / 2;
//scene.add(mirror);

/////////////////////////////////////	
// MARBLE:  square patch on the ground
/////////////////////////////////////	

var marbleMaterial = new THREE.ShaderMaterial( {
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'pnoiseFragShader' ).textContent,
        side: THREE.DoubleSide
} );

marbleGeometry = new THREE.PlaneBufferGeometry(4,4);
marble = new THREE.Mesh(marbleGeometry, marbleMaterial);
marble.position.x = 2.0;
marble.position.z = 4.0;
marble.position.y = -1.0;
marble.rotation.x = -Math.PI / 2;
//scene.add(marble);

/////////////////////////////////////////////////////////////////////////
// sphere
/////////////////////////////////////////////////////////////////////////

sphereA = new THREE.Mesh( new THREE.SphereGeometry( 3, 20, 10 ), envmapMaterial );
sphereA.position.set(6,0,-1);
//scene.add( sphereA );

///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

function boxSetMatrices(avars) {
  var xPosition = avars[0];
  var yPosition = avars[1];
  var zPosition = avars[2];

  var M = new THREE.Matrix4();

  linkBox.matrix.identity();
  linkBox.matrix.multiply(M.makeTranslation(xPosition, yPosition, zPosition));

  linkBox.updateMatrixWorld();

   
}

function initBox() {
  var boxTexture = new THREE.TextureLoader().load('images/ABCD.jpg');
  var boxMaterial = new THREE.MeshLambertMaterial({map: boxTexture});
  var movingSphereGeometry = new THREE.SphereGeometry(2,32,32);

  linkBox = new THREE.Mesh(movingSphereGeometry, toonMaterial); 
  linkBox.position.set(0,4,-3);
  scene.add(linkBox);

  linkBox.matrixAutoUpdate = false;
}


var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("W")) {
    console.log('W pressed');
    light.position.y += 0.1;
  } else if (keyboard.pressed("S"))
    light.position.y -= 0.1;
  if (keyboard.pressed("A"))
    light.position.x -= 0.1;
  else if (keyboard.pressed("D"))
    light.position.x += 0.1;
  if (keyboard.pressed("B"))
    light.position.z -= 0.1;
  else if (keyboard.pressed("F"))
    light.position.z += 0.1;
  lightSphere.position.set(light.position.x, light.position.y, light.position.z);
  

    // compute light position in VCS coords,  supply this to the shaders
  vcsLight.set(light.position.x, light.position.y, light.position.z);
  vcsLight.applyMatrix4(camera.matrixWorldInverse);

  floorMaterial.uniforms.vcsLightPosition.value = vcsLight;
  floorMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;
  toonMaterial.uniforms.vcsLightPosition.value = vcsLight;
  toonMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;
  holeyMaterial.uniforms.vcsLightPosition.value = vcsLight;
  holeyMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;
  envmapMaterial.uniforms.vcsLightPosition.value = vcsLight;
  envmapMaterial.uniforms.vcsLightPosition.value.needsUpdate = true;
}



document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;

  if (keyCode == " ".charCodeAt()) {
    motion = !motion;
  }
}

///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK
///////////////////////////////////////////////////////////////////////////////////////

function update() {
  checkKeyboard();
  requestAnimationFrame(update);
  envmapMaterial.uniforms.matrixWorld.value = camera.matrixWorld;
  envmapMaterial.uniforms.matrixWorld.update = true;
  delta = clock.getDelta();
  wave.rotation.y += delta * speed
  renderer.render(scene, camera);

  var dt = 0.02;
  if(motion) {
    boxMotion.timestep(dt);
  }
}



init();
update();

