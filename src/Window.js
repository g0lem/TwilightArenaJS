export default class Window{
    constructor(){
        this.canvas = document.querySelector('#glcanvas');
        this.gl = this.canvas.getContext('webgl');
      
        // If we don't have a GL context, give up now
      
        if (!this.gl) {
          alert('Unable to initialize WebGL. Your browser or machine may not support it.');
          return;
        }        
    }

}