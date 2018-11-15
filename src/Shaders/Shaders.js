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
        const shaderProgram = initShaderProgram(this.gl, vsSource, fsSource);

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
    }

}