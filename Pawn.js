function Pawn(rank, color, position, scene, tile){
  this.rank = rank;
  this.color = color;
  this.position = position;
  this.scene = scene;
  this.tile = tile;

  this.load(rank, scene);
}

Pawn.prototype = {
  load : function(){
    var self = this;
    var loader = new THREE.JSONLoader();
    var texture = THREE.ImageUtils.loadTexture("assets/pine_green.jpg");
    var material = new THREE.MeshPhongMaterial({ambient: 0x111111, map: texture});

    loader.load(
        "assets/" + this.rank + ".js",
         function (geometry) {
           self.mesh = new THREE.Mesh(geometry, material);

           self.mesh.position = self.position;
           self.mesh.scale.set(5, 5, 5);

           if(self.color == "white"){
             self.mesh.rotation.y = Math.PI;
           }else{
             material.color.setHex(0x555555);
           }

           self.scene.add(self.mesh);
        }
    );
  },

  unload: function(){
    this.scene.remove(this.mesh);
    this.tile.pawn = null;
  }
};
