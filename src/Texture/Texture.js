export default class Buffers{
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