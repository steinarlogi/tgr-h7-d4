/////////////////////////////////////////////////////////////////
//    Sýnislausn á dæmi 3 í heimadæmum 4 í Tölvugrafík
//     Sýnir tölvuskjá búinn til úr þremur teningum.
//
//    Hjálmtýr Hafsteinsson, febrúar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var texture = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -2.0;

var modelViewLoc;
var projectionLoc;
var projectionMatrix;

let boolLoc;

let texSkjar;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texture), gl.STATIC_DRAW );

    var vTex = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTex, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTex );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var spjaldBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spjaldBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(spjald), gl.STATIC_DRAW);

    gl.ver

    //Binda texture
    let skjaImage= document.getElementById('SkjaImage');
    texSkjar = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texSkjar);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skjaImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.uniform1i(gl.getUniformLocation(program, 'texture'), 0);

    modelViewLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionLoc = gl.getUniformLocation( program, "projectionMatrix" );
    boolLoc = gl.getUniformLocation(program, 'fDrawImage');

    gl.uniform1i(boolLoc, false);

    projectionMatrix = perspective( 60.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix) );


    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (e.offsetY - origY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp ör
                zDist += 0.1;
                break;
            case 40:	// niður ör
                zDist -= 0.1;
                break;
         }
     }  );  

    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  
       
    
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var textureCoords = [
        [ 1.0, 0.0 ],  // black
        [ 1.0, 1.0 ],  // red
        [ 0.0, 1.0 ],  // yellow
        [ 0.0, 0.0 ],  // green
        [ 0.0, 0.0 ],  // blue
        [ 0.0, 0.0 ],  // magenta
        [ 0.0, 0.0 ],  // cyan
        [ 0.0, 0.0 ]   // white
    ];

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        texture.push(textureCoords[indices[i]]);
    }
}

function spjald() {

}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1i(boolLoc, false);

    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

    // Smíða tölvuskjá
    // Fyrst botnplatan..
    mv1 = mult( mv, translate( 0.0, -0.2, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.4, 0.04, 0.25 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

	// Svo stöngin...
    mv1 = mult( mv, translate( 0.0, 0., 0.0 ) );
    mv1 = mult( mv1, scalem( 0.1, 0.4, 0.05 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // Loks skjárinn sjálfur...
    mv1 = mult( mv, translate( 0.0, 0.3, -0.02 ) );
    mv1 = mult( mv1, rotateX( 5 ));
    mv1 = mult( mv1, scalem( 0.7, 0.5, 0.02 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    gl.bindTexture(gl.TEXTURE_2D, texSkjar);
    // Svo loks teikna plötuna
    gl.uniform1i(boolLoc, true);

    mv1 = mult(mv1, translate(0.0, 0.0, -1.1));
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));

    console.log(points);
    console.log(texture);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimFrame( render );
}

