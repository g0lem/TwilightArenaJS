export default (function(){
    var canvas = document.querySelector('#glcanvas');
    var gl = canvas.getContext('webgl');

    alert("GL");
      
    // If we don't have a GL context, give up now
      
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }       
    return gl;

})();