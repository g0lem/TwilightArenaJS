import vertexShader from "./resources/vertexShader";
import fragmentShader from "./resources/fragmentShader";
import ShaderProgramInfo from "./ShaderProgramInfo";

export default class Shaders{

    constructor(){
        this.shaders = {
            vertexShader,
            fragmentShader,
        }

        this.shaderProgramInfo = new ShaderProgramInfo(this.shaders.vertexShader, this.shaders.fragmentShader);
    }

    getShaderProgramInfo(){
        return this.shaderProgramInfo.getShaderProgramInfo();
    }
}