import Window from "./Window";
import Shaders from "./Shaders/Shaders";
import Texture from "./Texture/Texture";
import Buffers from "./Buffers/Buffers";


var window = new Window();
var shaders = new Shaders();
var programInfo = shaders.getShaderProgramInfo();

var buffers = new Buffers();
var actualBuffers = buffers.initBuffers();

var texture = new Texture();

var actualTexture = texture.initTexture("cubetexture.png");

var then = 0;

function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    // if (copyVideo) {
    //   updateTexture(gl, texture, video);
    // }

    window.drawScene(programInfo, actualBuffers, actualTexture, deltaTime);

    requestAnimationFrame(render);
  }
requestAnimationFrame(render);