function Game(){
  this._initialize();
  this._registerEventHandlers();
  this._startEventLoop();
}

Game.prototype = {
  _initialize: function(){
    this.hud = new Hud();
    this.state = new SplashScreen(this);
    this.scene = new THREE.Scene(); 
    this.board = new Board(this);

    this.renderer = new THREE.WebGLRenderer({antialias: true}); 
    this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    this.renderer.setClearColor(0x8CBED6);
    document.body.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.2, 1000 ); 
    this.camera.position.z = 10;
    this.camera.position.y = 10;
    this.camera.lookAt(new THREE.Vector3(0, 0, 2));

    this.cameraWrapper = new THREE.Object3D();
    this.cameraWrapper.add(this.camera);

    this.scene.add(new THREE.DirectionalLight(0xffffff));
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.scene.add(this.cameraWrapper);
  },

  onclick: function(e){
    this.state.onclick(e);
  },

  onkeydown: function(e){
    this.state.onkeydown(e);
  },

  render: function(time){
    this.state.render(time);
    this.renderer.render(this.scene, this.camera);
  },

  _registerEventHandlers: function(){
    var self = this;

    document.onclick = function(e){
      self.onclick(e);
    }

    document.onkeydown = function(e){
      e = e || window.event;
      self.onkeydown(e);
    }
  },

  _startEventLoop: function(){
    var self = this;

    function render(time) { 
      requestAnimationFrame(render);
      self.render(time);
    } 

    render(new Date().getTime());
  }
};
