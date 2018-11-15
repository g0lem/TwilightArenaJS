(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

    var gl = (function(){
        var canvas = document.querySelector('#glcanvas');
        var gl = canvas.getContext('webgl');
          
        // If we don't have a GL context, give up now
          
        if (!gl) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }       
        return gl;
    })();

    class Window{
        constructor(){
            this.cubeRotation = 0.0; 
        }

        drawScene(programInfo, buffers, texture, deltaTime) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
            gl.clearDepth(1.0);                 // Clear everything
            gl.enable(gl.DEPTH_TEST);           // Enable depth testing
            gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
          
            // Clear the canvas before we start drawing on it.
          
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          
            // Create a perspective matrix, a special matrix that is
            // used to simulate the distortion of perspective in a camera.
            // Our field of view is 45 degrees, with a width/height
            // ratio that matches the display size of the canvas
            // and we only want to see objects between 0.1 units
            // and 100 units away from the camera.
          
            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            const projectionMatrix = mat4.create();
          
            // note: glmatrix.js always has the first argument
            // as the destination to receive the result.
            mat4.perspective(projectionMatrix,
                             fieldOfView,
                             aspect,
                             zNear,
                             zFar);
          
            // Set the drawing position to the "identity" point, which is
            // the center of the scene.
            const modelViewMatrix = mat4.create();
          
            // Now move the drawing position a bit to where we want to
            // start drawing the square.
          
            mat4.translate(modelViewMatrix,     // destination matrix
                           modelViewMatrix,     // matrix to translate
                           [-0.0, 0.0, -6.0]);  // amount to translate
            mat4.rotate(modelViewMatrix,  // destination matrix
                        modelViewMatrix,  // matrix to rotate
                        this.cubeRotation,     // amount to rotate in radians
                        [0, 0, 1]);       // axis to rotate around (Z)
            mat4.rotate(modelViewMatrix,  // destination matrix
                        modelViewMatrix,  // matrix to rotate
                        this.cubeRotation * .7,// amount to rotate in radians
                        [0, 1, 0]);       // axis to rotate around (X)
          
            const normalMatrix = mat4.create();
            mat4.invert(normalMatrix, modelViewMatrix);
            mat4.transpose(normalMatrix, normalMatrix);
          
            // Tell WebGL how to pull out the positions from the position
            // buffer into the vertexPosition attribute
            {
              const numComponents = 3;
              const type = gl.FLOAT;
              const normalize = false;
              const stride = 0;
              const offset = 0;
              gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
              gl.vertexAttribPointer(
                  programInfo.attribLocations.vertexPosition,
                  numComponents,
                  type,
                  normalize,
                  stride,
                  offset);
              gl.enableVertexAttribArray(
                  programInfo.attribLocations.vertexPosition);
            }
          
            // Tell WebGL how to pull out the texture coordinates from
            // the texture coordinate buffer into the textureCoord attribute.
            {
              const numComponents = 2;
              const type = gl.FLOAT;
              const normalize = false;
              const stride = 0;
              const offset = 0;
              gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
              gl.vertexAttribPointer(
                  programInfo.attribLocations.textureCoord,
                  numComponents,
                  type,
                  normalize,
                  stride,
                  offset);
                gl.enableVertexAttribArray(
                  programInfo.attribLocations.textureCoord);
            }
          
            // Tell WebGL how to pull out the normals from
            // the normal buffer into the vertexNormal attribute.
            {
              const numComponents = 3;
              const type = gl.FLOAT;
              const normalize = false;
              const stride = 0;
              const offset = 0;
              gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
              gl.vertexAttribPointer(
                  programInfo.attribLocations.vertexNormal,
                  numComponents,
                  type,
                  normalize,
                  stride,
                  offset);
                gl.enableVertexAttribArray(
                  programInfo.attribLocations.vertexNormal);
            }
          
            // Tell WebGL which indices to use to index the vertices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
          
            // Tell WebGL to use our program when drawing
          
            gl.useProgram(programInfo.program);
          
            // Set the shader uniforms
          
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelViewMatrix,
                false,
                modelViewMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.normalMatrix,
                false,
                normalMatrix);
          
            // Specify the texture to map onto the faces.
          
            // Tell WebGL we want to affect texture unit 0
            gl.activeTexture(gl.TEXTURE0);
          
            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, texture);
          
            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
          
            {
              const vertexCount = 36;
              const type = gl.UNSIGNED_SHORT;
              const offset = 0;
              gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
          
            // Update the rotation for the next draw
          
            this.cubeRotation += deltaTime;
          }

    }

    const vertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
    }
`;

    const fragmentShader = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
`;

    var Shader = (type, source) => {
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
    };

    var ShaderProgram = (vsSource, fsSource) => {
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
    };

    class ShaderProgramInfo{

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

    class Shaders{

        constructor(){
            this.shaders = {
                vertexShader,
                fragmentShader,
            };

            this.shaderProgramInfo = new ShaderProgramInfo(this.shaders.vertexShader, this.shaders.fragmentShader);
        }

        getShaderProgramInfo(){
            return this.shaderProgramInfo.getShaderProgramInfo();
        }
    }

    class Buffers{
        constructor(){
            
        }

        initTexture(url) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
          
            // Because video havs to be download over the internet
            // they might take a moment until it's ready so
            // put a single pixel in the texture so we can
            // use it immediately.
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                          width, height, border, srcFormat, srcType,
                          pixel);
          
            // Turn off mips and set  wrapping to clamp to edge so it
            // will work regardless of the dimensions of the video.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          
            return texture;
          }

          updateTexture(texture, video) {
            const level = 0;
            const internalFormat = gl.RGBA;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                          srcFormat, srcType, video);
          }
          
    }

    class Buffers$1{
        constructor(){
            
        }

        initBuffers() {

            // Create a buffer for the cube's vertex positions.
          
            const positionBuffer = gl.createBuffer();
          
            // Select the positionBuffer as the one to apply buffer
            // operations to from here out.
          
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          
            // Now create an array of positions for the cube.
          
            const positions = [
              // Front face
              -1.0, -1.0,  1.0,
               1.0, -1.0,  1.0,
               1.0,  1.0,  1.0,
              -1.0,  1.0,  1.0,
          
              // Back face
              -1.0, -1.0, -1.0,
              -1.0,  1.0, -1.0,
               1.0,  1.0, -1.0,
               1.0, -1.0, -1.0,
          
              // Top face
              -1.0,  1.0, -1.0,
              -1.0,  1.0,  1.0,
               1.0,  1.0,  1.0,
               1.0,  1.0, -1.0,
          
              // Bottom face
              -1.0, -1.0, -1.0,
               1.0, -1.0, -1.0,
               1.0, -1.0,  1.0,
              -1.0, -1.0,  1.0,
          
              // Right face
               1.0, -1.0, -1.0,
               1.0,  1.0, -1.0,
               1.0,  1.0,  1.0,
               1.0, -1.0,  1.0,
          
              // Left face
              -1.0, -1.0, -1.0,
              -1.0, -1.0,  1.0,
              -1.0,  1.0,  1.0,
              -1.0,  1.0, -1.0,
            ];
          
            // Now pass the list of positions into WebGL to build the
            // shape. We do this by creating a Float32Array from the
            // JavaScript array, then use it to fill the current buffer.
          
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
          
            // Set up the normals for the vertices, so that we can compute lighting.
          
            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
          
            const vertexNormals = [
              // Front
               0.0,  0.0,  1.0,
               0.0,  0.0,  1.0,
               0.0,  0.0,  1.0,
               0.0,  0.0,  1.0,
          
              // Back
               0.0,  0.0, -1.0,
               0.0,  0.0, -1.0,
               0.0,  0.0, -1.0,
               0.0,  0.0, -1.0,
          
              // Top
               0.0,  1.0,  0.0,
               0.0,  1.0,  0.0,
               0.0,  1.0,  0.0,
               0.0,  1.0,  0.0,
          
              // Bottom
               0.0, -1.0,  0.0,
               0.0, -1.0,  0.0,
               0.0, -1.0,  0.0,
               0.0, -1.0,  0.0,
          
              // Right
               1.0,  0.0,  0.0,
               1.0,  0.0,  0.0,
               1.0,  0.0,  0.0,
               1.0,  0.0,  0.0,
          
              // Left
              -1.0,  0.0,  0.0,
              -1.0,  0.0,  0.0,
              -1.0,  0.0,  0.0,
              -1.0,  0.0,  0.0
            ];
          
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                          gl.STATIC_DRAW);
          
            // Now set up the texture coordinates for the faces.
          
            const textureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
          
            const textureCoordinates = [
              // Front
              0.0,  0.0,
              1.0,  0.0,
              1.0,  1.0,
              0.0,  1.0,
              // Back
              0.0,  0.0,
              1.0,  0.0,
              1.0,  1.0,
              0.0,  1.0,
              // Top
              0.0,  0.0,
              1.0,  0.0,
              1.0,  1.0,
              0.0,  1.0,
              // Bottom
              0.0,  0.0,
              1.0,  0.0,
              1.0,  1.0,
              0.0,  1.0,
              // Right
              0.0,  0.0,
              1.0,  0.0,
              1.0,  1.0,
              0.0,  1.0,
              // Left
              0.0,  0.0,
              1.0,  0.0,
              1.0,  1.0,
              0.0,  1.0,
            ];
          
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                          gl.STATIC_DRAW);
          
            // Build the element array buffer; this specifies the indices
            // into the vertex arrays for each face's vertices.
          
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
          
            // This array defines each face as two triangles, using the
            // indices into the vertex array to specify each triangle's
            // position.
          
            const indices = [
              0,  1,  2,      0,  2,  3,    // front
              4,  5,  6,      4,  6,  7,    // back
              8,  9,  10,     8,  10, 11,   // top
              12, 13, 14,     12, 14, 15,   // bottom
              16, 17, 18,     16, 18, 19,   // right
              20, 21, 22,     20, 22, 23,   // left
            ];
          
            // Now send the element array to GL
          
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(indices), gl.STATIC_DRAW);
          
            return {
              position: positionBuffer,
              normal: normalBuffer,
              textureCoord: textureCoordBuffer,
              indices: indexBuffer,
            };
          }
    }

    var window = new Window();
    var shaders = new Shaders();
    var programInfo = shaders.getShaderProgramInfo();

    var buffers = new Buffers$1();
    var actualBuffers = buffers.initBuffers();

    var texture = new Buffers();

    var actualTexture = texture.initTexture("cubetexture.png");

    var then = 0;
    var frameCount = 0;
    var lastTime = 0;


    function render(now) {
        var ms = now;
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

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

})));
