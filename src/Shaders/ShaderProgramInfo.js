import ShaderProgram from "./ShaderProgram";
import gl from "./../gl";

export default class ShaderProgramInfo{

    constructor(vertexShader, fragmentShader){
        this.shaderProgram = ShaderProgram(vertexShader, fragmentShader);
    }

    getShaderProgramInfo(){
        const shaderProgramInfo = {
            program: this.getShaderProgram(),
            attribLocations: this.getAttribLocation(),
            uniformLocations: this.getUniformLocations(),
        };

        return shaderProgramInfo;
    }

    
    getShaderProgram(){
        return this.shaderProgram;
    }

    getAttribLocation(){
        return {
            vertexPosition: gl.getAttribLocation(this.getShaderProgram(), 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(this.getShaderProgram(), 'aVertexNormal'),
            textureCoord: gl.getAttribLocation(this.getShaderProgram(), 'aTextureCoord'),
        }
    }

    getUniformLocations(){
        return {
            projectionMatrix: gl.getUniformLocation(this.getShaderProgram(), 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(this.getShaderProgram(), 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(this.getShaderProgram(), 'uNormalMatrix'),
            uSampler: gl.getUniformLocation(this.getShaderProgram(), 'uSampler'),
        }
    }
}