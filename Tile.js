function Tile(x, y){
  this.x = x;
  this.y = y;
  this.square = undefined;
  this.pawn = undefined;
  this.isHighlighted = false;
}

Tile.prototype = {
  highlight: function(activate){
    if(activate){
      var high = new THREE.Color(0xff4500);
      var color = this.square.material.color;
      var a = 0.6;
      var r = a*high.r+(1-a)*color.r;
      var g = a*high.g+(1-a)*color.g;
      var b = a*high.b+(1-a)*color.b;

      this.square.material.color.setRGB(r,g,b);
      this.isHighlighted = true;
    }else{
      this.square.material.color.setHex(this.square.userData['color']);
      this.isHighlighted = false;
    }
  },

  isHighlighted: function(){
    return this.isHighlighted;
  }
};
