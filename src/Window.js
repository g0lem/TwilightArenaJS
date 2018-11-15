export default class Window{
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