import vertexShader from "./resources/vertexShader";
import fragmentShader from "./resources/fragmentShader";

export default class Shaders{

    constructor(gl){
        this.shaders = {
            vertexShader,
            fragmentShader,
        }
        this.gl = gl;
    }

    loadShaders(){
        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = this.initShaderProgram(this.gl, this.shaders.vertexShader, this.shaders.fragmentShader);

        // Collect all the info needed to use the shader program.
        // Look up which attributes our shader program is using
        // for aVertexPosition, aVertexNormal, aTextureCoord,
        // and look up uniform locations.
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
            vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: this.gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            textureCoord: this.gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
            projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: this.gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            uSampler: this.gl.getUniformLocation(shaderProgram, 'uSampler'),
            },
        };

        return programInfo;
    }

    initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
      
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
        const shader = this.gl.createShader(type);
      
        // Send the source to the shader object
      
        this.gl.shaderSource(shader, source);
      
        // Compile the shader program
      
        this.gl.compileShader(shader);
      
        // See if it compiled successfully
      
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
          this.gl.deleteShader(shader);
          return null;
        }
      
        return shader;
      }

}