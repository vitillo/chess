function GameState(context){
  this.context = context;
}

GameState.prototype.onclick = function(){}
GameState.prototype.render = function(){}
GameState.prototype._getTileFromClick = function(e){
  var x = 2*e.clientX/window.innerWidth - 1;
  var y = 2*(1 - e.clientY/window.innerHeight) - 1;

  var projector = new THREE.Projector();
  var raycaster = projector.pickingRay(new THREE.Vector3(x, y, 1), game.camera);
  var intersects = raycaster.intersectObjects(game.scene.children);

  if(intersects.length > 0){
    for(var i = 0; i < intersects.length; i++){
      var tile = intersects[i].object.userData.tile;

      if(!tile)
        continue;

      return tile;
    }
  }

  return null;
}

function SplashGameState(context){
  GameState.apply(this, arguments);
}

SplashGameState.prototype = Object.create(GameState.prototype);
SplashGameState.prototype.onclick = function(e){
  this.context.state = new TerminateSplash(this.context);
}
SplashGameState.prototype.render = function(time){
  game.cameraWrapper.rotation.y += 0.01 % (2*Math.PI);
}

function TerminateSplash(context){
  GameState.apply(this, arguments);
  this.rotationSign = game.cameraWrapper.rotation.y < Math.PI ? -1 : 1;
}
TerminateSplash.prototype = Object.create(GameState.prototype);
TerminateSplash.prototype.render = function(time){
  var completed = false;

  if(this.rotationSign < 0){
    game.cameraWrapper.rotation.y -= 0.1;

    if(game.cameraWrapper.rotation.y <= 0.2){
      game.cameraWrapper.rotation.y = 0;
      completed = true;
    }
  }else{
    game.cameraWrapper.rotation.y += 0.1;
  
    if(Math.abs(game.cameraWrapper.rotation.y % (2*Math.PI)) <= 0.2){
      game.cameraWrapper.rotation.y = 2*Math.PI;
      completed = true;
    }
  }

  if(completed){
    this.context.state = new WhiteSelectSrc(this.context);
  }
}

function WhiteSelectSrc(context){
  GameState.apply(this, arguments);
}

WhiteSelectSrc.prototype = Object.create(GameState.prototype);
WhiteSelectSrc.prototype.onclick = function(e){
  var anim;
  var tile = this._getTileFromClick(e);

  if(!tile)
    return;

  game.board.highlight(tile);
  if(tile.isHighlighted){
    this.context.state = new WhiteSelectDest(this.context, tile);
  }
}

function WhiteSelectDest(context, source){
  GameState.apply(this, arguments);
  this.source = source;
}

WhiteSelectDest.prototype = Object.create(GameState.prototype);
WhiteSelectDest.prototype.onclick = function(e){
  var tile = this._getTileFromClick(e);
  var anim;

  if(!tile)
    return;

  if(tile == this.source){
    this.context.state = new WhiteSelectSrc(this.context);
    this.context.onclick(e);
    return;
  }

  if(tile.isHighlighted){
    anim = game.board.movePawn(this.source, tile);
    this.context.state = new Animation(this.context, anim);
    game.board.clear();
  }else{
    if(tile.pawn && tile.pawn.color == "white"){
      this.context.state = new WhiteSelectSrc(this.context);
      this.context.onclick(e);
    }
  }
}

function Animation(context, animation){
  GameState.apply(this, arguments);
  this.animation = animation;
}

Animation.prototype = Object.create(GameState.prototype);
Animation.prototype.render = function(time){
  if(!this.animation(time)){
    this.context.state = new WhiteSelectSrc(this.context);
  }
}
