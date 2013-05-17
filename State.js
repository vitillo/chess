function GameState(game){
  this.game = game;
}
GameState.prototype.onclick = function(){}

GameState.prototype.render = function(){}

GameState.prototype._getTileFromClick = function(e){
  var x = 2*e.clientX/window.innerWidth - 1;
  var y = 2*(1 - e.clientY/window.innerHeight) - 1;

  var projector = new THREE.Projector();
  var raycaster = projector.pickingRay(new THREE.Vector3(x, y, 1), this.game.camera);
  var intersects = raycaster.intersectObjects(this.game.scene.children);

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

/***** SplashScreen ****/
function SplashScreen(game, message, reloadPieces){
  GameState.apply(this, arguments);

  game.hud.setText(message || "Press any key to start...");
  this.reloadPieces = reloadPieces;
}

SplashScreen.prototype = Object.create(GameState.prototype);

SplashScreen.prototype.onclick = function(e){
  this.game.state = new TerminateSplashScreen(this.game);

  if(this.reloadPieces)
    this.game.board.loadPieces();
}

SplashScreen.prototype.render = function(time){
  this.game.cameraWrapper.rotation.y += 0.01;
  this.game.cameraWrapper.rotation.y %= 2*Math.PI;
}

/***** TerminateSplashScreenScreen *****/
function TerminateSplashScreen(game){
  GameState.apply(this, arguments);

  game.hud.setText("");
  this.rotationSign = this.game.cameraWrapper.rotation.y < Math.PI ? -1 : 1;
}

TerminateSplashScreen.prototype = Object.create(GameState.prototype);

TerminateSplashScreen.prototype.render = function(time){
  var completed = false;

  if(this.rotationSign < 0){
    this.game.cameraWrapper.rotation.y -= 0.1;

    if(this.game.cameraWrapper.rotation.y <= 0.2){
      this.game.cameraWrapper.rotation.y = 0;
      completed = true;
    }
  }else{
    this.game.cameraWrapper.rotation.y += 0.1;
  
    if(Math.abs(this.game.cameraWrapper.rotation.y % (2*Math.PI)) <= 0.2){
      this.game.cameraWrapper.rotation.y = 2*Math.PI;
      completed = true;
    }
  }

  if(completed){
    this.game.state = new WhiteSelectSource(this.game);
  }
}

/***** WhiteSelectSource *****/
function WhiteSelectSource(game, message){
  GameState.apply(this, arguments);

  game.hud.setText(message ? message : "" + "Your turn!");
}

WhiteSelectSource.prototype = Object.create(GameState.prototype);

WhiteSelectSource.prototype.onclick = function(e){
  var anim;
  var tile = this._getTileFromClick(e);

  if(!tile)
    return;

  this.game.board.highlight(tile);
  if(tile.isHighlighted)
    this.game.state = new WhiteSelectDestination(this.game, tile);
}

/***** WhiteSelectDestination *****/
function WhiteSelectDestination(game, source){
  GameState.apply(this, arguments);
  this.source = source;
}

WhiteSelectDestination.prototype = Object.create(GameState.prototype);

WhiteSelectDestination.prototype.onclick = function(e){
  var tile = this._getTileFromClick(e);

  if(!tile)
    return;

  if(tile == this.source){
    this.game.state = new WhiteSelectSource(this.game);
    this.game.onclick(e);
    return;
  }

  if(tile.isHighlighted){
    var res = this.game.board.movePiece(this.source, tile);
    this.game.state = new Animation(this.game, res, "white");
    this.game.board.clear();
  }else{
    if(tile.piece && tile.piece.color == "white"){
      this.game.state = new WhiteSelectSource(this.game);
      this.game.onclick(e);
    }
  }
}

/***** Animation *****/
function Animation(game, notes, player){
  GameState.apply(this, arguments);

  game.hud.setText("");
  this.notes = notes;
  this.player = player;
}

Animation.prototype = Object.create(GameState.prototype);

Animation.prototype.render = function(time){
  var done = false;

  for(var i = 0; i < this.notes.anim.length; i++){
    if(!this.notes.anim[i](time))
      done = true;
  }

  if(done){
    if(this.notes.gameover)
      this.game.state = new EndGame(this.game, this.notes.message);
    else
      this.game.state = this.player == "white" ? new BlackMove(this.game, this.notes.message) : new WhiteSelectSource(this.game, this.notes.message);
  }
}

/***** BlackMove *****/
function BlackMove(game, message){
  GameState.apply(this, arguments);

  game.hud.setText(message ? message : "" + "Let me think about...");
}

BlackMove.prototype = Object.create(GameState.prototype);

BlackMove.prototype.render = function(){
  var move = this.game.board.model.findMove();
  var res = this.game.board.movePiece(move.from, move.to);
  this.game.state = new Animation(this.game, res, "black");
}

/***** EndGameGame *****/
function EndGame(game, reason){
  GameState.apply(this, arguments);

  this.message = reason + " Press any key to start a new game.";
}

EndGame.prototype = Object.create(GameState.prototype);
EndGame.prototype.render = function(){
  this.game.state = new SplashScreen(this.game, this.message, true);
}
