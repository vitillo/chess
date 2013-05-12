function Game(){
  this.state = new SplashGameState(this);
}

Game.prototype = {
  initialize: function(){
    this.scene = new THREE.Scene(); 
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.2, 1000 ); 
    this.cameraWrapper = new THREE.Object3D();
    this.renderer = new THREE.WebGLRenderer({antialias: true}); 
    this.board = new Board(2, this.scene);

    this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    this.renderer.setClearColor(0x8CBED6);
    document.body.appendChild( this.renderer.domElement );

    this.cameraWrapper.add(this.camera);

    this.scene.add(new THREE.DirectionalLight(0xffffff));
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.scene.add(this.cameraWrapper);

    this.camera.position.z = 10;
    this.camera.position.y = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 2));
  },
  onclick: function(e){
    this.state.onclick(e);
  },
  render: function(time){
    this.state.render(time);
    this.renderer.render(this.scene, this.camera);
  }
};
