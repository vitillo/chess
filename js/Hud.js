function Hud(canvas){
  this.text = document.createElement('div');
  this.text.id = "hud";
  this.text.style.width = "420px";
  this.text.style.height = "100px";
  this.text.style.top = "20px";
  this.text.style.left = "20px";
  this.text.style.position = "absolute";
  this.text.style.font = "16px 'Lucida Grande', tahoma, verdana, arial, sans-serif";
  canvas.parentNode.appendChild(this.text);
}

Hud.prototype = {
  setText: function(text){
    this.text.innerHTML = text;
  }
}
