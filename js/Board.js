function Board(game){
  this.game = game;
  this.size = 2;
  this.board = [[], [], [], [], [], [], [], []];

  this.loadBoard();
  this.loadPieces();
}

Board.prototype = {
  loadBoard : function(){
    var is_white = false;
    var half = this.size/2;

    for(var z = 3*this.size + half, i = 0; z >= -4*this.size + half; z-=this.size, i++){
      is_white = !is_white;

      for(var x = -4*this.size + half, j = 0; x < 4*this.size + half; x+=this.size, j++){
        this.board[j][i] = new Tile(j, i, x, z, this.size, is_white, this.game);
        is_white = !is_white;
      }
    }

    var base_texture = THREE.ImageUtils.loadTexture("assets/pine_green.jpg");
    var base_geometry = new THREE.CubeGeometry(8 * this.size + 1.5, 0.1, 8 * this.size + 1.5);
    var base_material = new THREE.MeshPhongMaterial({map: base_texture, color : 0x222222, ambient: 0x111111});
    var base = new THREE.Mesh(base_geometry, base_material);

    base.receiveShadow = true;
    base.position.set(0, -.1, 0);

    this.game.scene.add(base);
  },

  loadPieces : function(){
    var board = this.board;
    this.model = new Model("white");

    for(var i = 0; i < 8; i++){
      for(var j = 0; j < 8; j++){
        if(board[i][j].piece)
          board[i][j].piece.unload();

        var piece = this.model.get(i, j);
        if(!piece)
          continue;

        board[i][j].piece && board[i][j].piece.unload();
        board[i][j].piece = new Piece(piece.rank, piece.color, this.getLocation(i, j), this.game.scene, board[i][j]);
      }
    }
  },

  getLocation : function(x, y){
    var half = this.size/2;
    var base_x = -4*this.size + half;
    var base_z = 3*this.size + half;

    return new THREE.Vector3(base_x + x * this.size, 0, base_z - y * this.size);
  },

  movePiece: function(from, to){
    var self = this;
    var fromTile = this.board[from.x][from.y];
    var toTile = this.board[to.x][to.y];
    var player = this.model.getPlayer();
    var res = {};

    var note = this.model.applyMove(fromTile, toTile);

    if(note.draw){
      res.message = "Draw!"
      res.gameover = true;
    }else if(note.checkmate){
      res.message = "Checkmate!";
      res.gameover = true;
    }else if(note.stalemate){
      res.message = "Stalemate!";
      res.gameover = true;
    }else if(note.check)
      res.message = "Check!";
    
    res.anim = [this._createAnimation(fromTile, toTile, note)];

    if(note.castleQueen){
      if(player == "white")
        res.anim.push(this._createAnimation(this.board[0][0], this.board[3][0], note, true));
      else
        res.anim.push(this._createAnimation(this.board[0][7], this.board[3][7], note, true));
    }else if(note.castleKing){
      if(player == "white")
        res.anim.push(this._createAnimation(this.board[7][0], this.board[5][0], note, true));
      else
        res.anim.push(this._createAnimation(this.board[7][7], this.board[5][7], note, true));
    }
    
    return res;
  },

  _createAnimation: function(fromTile, toTile, note, doJump){
    var piece = fromTile.piece;
    var fromPos = this.getLocation(fromTile.x, fromTile.y);
    var toPos = this.getLocation(toTile.x, toTile.y);

    toTile.piece && toTile.piece.unload();

    var cpoints = [fromPos];
    if(piece.rank == "knight" || doJump){
      cpoints.push(fromPos.clone().add(new THREE.Vector3(0, 2, 0)));
      cpoints.push(toPos.clone().add(new THREE.Vector3(0, 2, 0)));
    }
    cpoints.push(toPos);

    var spline = new THREE.Spline(cpoints);
    var duration = 1;
    var startTime = null;

    return function(time){
      if(!startTime){
        startTime = time;
        return true;
      }

      var left = duration - (time - startTime) / 1000;
      var current = (time - startTime) / 1000;

      if(current < duration){
        var n = (current/duration);
        var p = spline.getPoint(n);
        piece.position.set(p.x, p.y, p.z);
        return true;
      }else{
        var endPoint = cpoints[cpoints.length - 1];
        piece.position.set(endPoint.x, endPoint.y, endPoint.z);

        if(note.promoted){
          piece.rank = "queen";
          piece.reload();
        }

        toTile.piece = piece;
        piece.tile = toTile;
        fromTile.piece = null;

        return false;
      }
    }
  },

  highlight : function(tile){
    var x = tile.x;
    var y = tile.y;
    var board = this.board;
    var moves;
    var move;

    if(!tile.piece || tile.piece.color == "black")
      return;
    else if(tile.isHighlighted){
      this.clear();
      return;
    }

    this.clear();
    tile.highlight(true);

    moves = this.model.getMoves(tile);

    for(var i = 0; i < moves.length; i++){
      move = moves[i];
      this.board[move.x][move.y].highlight(true);
    }
  },

  clear : function(){
    for(var i = 0; i < 8; i++)
      for(var j = 0; j < 8; j++)
        this.board[i][j].highlight(false);
  }
};
