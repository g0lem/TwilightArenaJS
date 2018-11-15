(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

    class Window{
        constructor(){
            this.canvas = document.querySelector('#glcanvas');
            this.gl = this.canvas.getContext('webgl');
          
            // If we don't have a GL context, give up now
          
            if (!this.gl) {
              alert('Unable to initialize WebGL. Your browser or machine may not support it.');
              return;
            }       
            this.cubeRotation = 0.0; 
        }

        drawScene(programInfo, buffers, texture, deltaTime) {
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
            this.gl.clearDepth(1.0);                 // Clear everything
            this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
            this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
          
            // Clear the canvas before we start drawing on it.
          
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
          
            // Create a perspective matrix, a special matrix that is
            // used to simulate the distortion of perspective in a camera.
            // Our field of view is 45 degrees, with a width/height
            // ratio that matches the display size of the canvas
            // and we only want to see objects between 0.1 units
            // and 100 units away from the camera.
          
            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
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
              const type = this.gl.FLOAT;
              const normalize = false;
              const stride = 0;
              const offset = 0;
              this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
              this.gl.vertexAttribPointer(
                  programInfo.attribLocations.vertexPosition,
                  numComponents,
                  type,
                  normalize,
                  stride,
                  offset);
              this.gl.enableVertexAttribArray(
                  programInfo.attribLocations.vertexPosition);
            }
          
            // Tell WebGL how to pull out the texture coordinates from
            // the texture coordinate buffer into the textureCoord attribute.
            {
              const numComponents = 2;
              const type = this.gl.FLOAT;
              const normalize = false;
              const stride = 0;
              const offset = 0;
              this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.textureCoord);
              this.gl.vertexAttribPointer(
                  programInfo.attribLocations.textureCoord,
                  numComponents,
                  type,
                  normalize,
                  stride,
                  offset);
                this.gl.enableVertexAttribArray(
                  programInfo.attribLocations.textureCoord);
            }
          
            // Tell WebGL how to pull out the normals from
            // the normal buffer into the vertexNormal attribute.
            {
              const numComponents = 3;
              const type = this.gl.FLOAT;
              const normalize = false;
              const stride = 0;
              const offset = 0;
              this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.normal);
              this.gl.vertexAttribPointer(
                  programInfo.attribLocations.vertexNormal,
                  numComponents,
                  type,
                  normalize,
                  stride,
                  offset);
                this.gl.enableVertexAttribArray(
                  programInfo.attribLocations.vertexNormal);
            }
          
            // Tell WebGL which indices to use to index the vertices
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
          
            // Tell WebGL to use our program when drawing
          
            this.gl.useProgram(programInfo.program);
          
            // Set the shader uniforms
          
            this.gl.uniformMatrix4fv(
                programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            this.gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelViewMatrix,
                false,
                modelViewMatrix);
            this.gl.uniformMatrix4fv(
                programInfo.uniformLocations.normalMatrix,
                false,
                normalMatrix);
          
            // Specify the texture to map onto the faces.
          
            // Tell WebGL we want to affect texture unit 0
            this.gl.activeTexture(this.gl.TEXTURE0);
          
            // Bind the texture to texture unit 0
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
          
            // Tell the shader we bound the texture to texture unit 0
            this.gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
          
            {
              const vertexCount = 36;
              const type = this.gl.UNSIGNED_SHORT;
              const offset = 0;
              this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
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

    class Shaders{

        constructor(gl){
            this.shaders = {
                vertexShader,
                fragmentShader,
            };
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
            const vertexShader$$1 = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
            const fragmentShader$$1 = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
          
            // Create the shader program
          
            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader$$1);
            gl.attachShader(shaderProgram, fragmentShader$$1);
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

    class Buffers{
        constructor(gl){
            this.gl = gl;
        }

        initTexture(url) {
            const texture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
          
            // Because video havs to be download over the internet
            // they might take a moment until it's ready so
            // put a single pixel in the texture so we can
            // use it immediately.
            const level = 0;
            const internalFormat = this.gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = this.gl.RGBA;
            const srcType = this.gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                          width, height, border, srcFormat, srcType,
                          pixel);
          
            // Turn off mips and set  wrapping to clamp to edge so it
            // will work regardless of the dimensions of the video.
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
          
            return texture;
          }

          updateTexture(texture, video) {
            const level = 0;
            const internalFormat = this.gl.RGBA;
            const srcFormat = this.gl.RGBA;
            const srcType = this.gl.UNSIGNED_BYTE;
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
                          srcFormat, srcType, video);
          }
          
    }

    class Buffers$1{
        constructor(){
            
        }

        initBuffers(gl) {

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
    var shaders = new Shaders(window.gl);

    var programInfo = shaders.loadShaders();

    var buffers = new Buffers$1();
    var actualBuffers = buffers.initBuffers(window.gl);

    var texture = new Buffers(window.gl);

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

})));
