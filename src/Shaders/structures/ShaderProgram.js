import Shader from "./Shader";
import gl from "../../Graphics/gl";

export default (vsSource, fsSource) => {
    const vertexShader = Shader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = Shader(gl.FRAGMENT_SHADER, fsSource);
    
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
