import Window from "./Graphics/Window";
import Shaders from "./Graphics/Shaders/Shaders";
import Texture from "./Graphics/Texture/Texture";
import Buffers from "./Graphics/Buffers/Buffers";

var window = new Window();
var shaders = new Shaders();
var programInfo = shaders.getShaderProgramInfo();

var buffers = new Buffers();
var actualBuffers = buffers.initBuffers();

var texture = new Texture();

var actualTexture = texture.initTexture("cubetexture.png");

var then = 0;

var elapsedTime = 0;
var frameCount = 0;
var lastTime = 0;


function render(now) {
    var ms = now;
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    // if (copyVideo) {
    //   updateTexture(gl, texture, video);
    // }
    var now2 = ms;

    frameCount++;
 
    if(ms - lastTime >= 1000) {
        let fps = frameCount;
        frameCount = 0;
        lastTime = ms;
 
        document.getElementById('test').innerHTML = fps;
    }

    window.drawScene(programInfo, actualBuffers, actualTexture, deltaTime);


    requestAnimationFrame(render);
  }
requestAnimationFrame(render);
