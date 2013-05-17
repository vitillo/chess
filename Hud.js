function Hud(){
  this.text = document.createElement('div');
  this.text.id = "hud";
  document.body.appendChild(this.text);
}

Hud.prototype = {
  setText: function(text){
    this.text.innerHTML = text;
  }
}
