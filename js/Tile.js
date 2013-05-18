function Tile(x, y, posX, posZ, size, is_white, game){
  var texture = THREE.ImageUtils.loadTexture("assets/pine_green.jpg");
  var square_geometry = new THREE.CubeGeometry(size, 0.1, size);
  var black_material = new THREE.MeshPhongMaterial({map: texture, color : 0x444444, ambient: 0x111111});
  var white_material = new THREE.MeshPhongMaterial({color : 0xffffff, ambient: 0x111111});

  this.x = x;
  this.y = y;
  this.isHighlighted = false;

  this.square = is_white ? new THREE.Mesh(square_geometry, white_material.clone()) : 
                           new THREE.Mesh(square_geometry, black_material.clone());

  this.square.receiveShadow = true;
  this.square.position.x = posX;
  this.square.position.z = posZ;
  this.square.userData['tile'] = this;
  this.square.userData['color'] = this.square.material.color.getHex();

  game.scene.add(this.square);
}

Tile.prototype = {
  highlight: function(activate){
    if(activate){
      var high = new THREE.Color(0x44BB44);
      var color = this.square.material.color;
      var a = 0.8;
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
