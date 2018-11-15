import vertexShader from "./resources/vertexShader";
import fragmentShader from "./resources/fragmentShader";
import gl from "./../gl";

export default class Shaders{

    constructor(){
        this.shaders = {
            vertexShader,
            fragmentShader,
        }
    }

    loadShaders(){
        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = this.initShaderProgram(this.shaders.vertexShader, this.shaders.fragmentShader);

        // Collect all the info needed to use the shader program.
        // Look up which attributes our shader program is using
        // for aVertexPosition, aVertexNormal, aTextureCoord,
        // and look up uniform locations.
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            },
        };

        return programInfo;
    }

    initShaderProgram(vsSource, fsSource) {
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
      
        // Create the shader program
      
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
      
        // If creating the shader program failed, alert
      
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
          return null;
        }
      
        return shaderProgram;
    }

    loadShader(type, source) {
        const shader = gl.createShader(type);
      
        // Send the source to the shader object
      
        gl.shaderSource(shader, source);
      
        // Compile the shader program
      
        gl.compileShader(shader);
      
        // See if it compiled successfully
      
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
      
        return shader;
      }

}