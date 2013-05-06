function Board(size){
  this.size = size;
  this.board = [[], [], [], [], [], [], [], []];
  
  for(var i = 0;  i < 8; i++)
    for(var j = 0; j < 8; j++)
      this.board[i][j] = new Tile(i, j, this.board);

  this.loadBoard();
  this.loadPawns();
}

Board.prototype = {
  loadBoard : function(){
    var square_geometry = new THREE.CubeGeometry(this.size, 0.1, this.size);
    var black_material = new THREE.MeshPhongMaterial({color : 0x000000, ambient: 0x111111});
    var white_material = new THREE.MeshPhongMaterial({color : 0xffffff, ambient: 0x111111});

    var is_white = false;
    var half = this.size/2;

    for(var x = 3*this.size + half, i = 0; x >= -4*this.size + half; x-=this.size, i++){
      is_white = !is_white;

      for(var z = -4*this.size + half, j = 0; z < 4*this.size + half; z+=this.size, j++){
        var square = is_white ? new THREE.Mesh(square_geometry, white_material.clone()) : 
                              new THREE.Mesh(square_geometry, black_material.clone());

        square.position.x = z;
        square.position.z = x;
        is_white = !is_white;
        game.scene.add(square);

        this.board[j][i].square = square;
        square.userData['tile'] = this.board[j][i];
        square.userData['color'] = square.material.color.getHex();
      }
    }
  },

  loadPawns : function(){
    var board = this.board;

    for(var i = 0; i < 8; i++){
      board[i][1].pawn = new Pawn("pawn", "white", this.getLocation(i, 1), game.scene, board[i][1]);
      board[i][6].pawn = new Pawn("pawn", "black", this.getLocation(i, 6), game.scene, board[i][6]);
    }

    board[2][0].pawn = new Pawn("bishop", "white", this.getLocation(2, 0), game.scene, board[2][0]);
    board[5][0].pawn = new Pawn("bishop", "white", this.getLocation(5, 0), game.scene, board[5][0]);

    board[2][7].pawn = new Pawn("bishop", "black", this.getLocation(2, 7), game.scene, board[2][7]);
    board[5][7].pawn = new Pawn("bishop", "black", this.getLocation(5, 7), game.scene, board[5][7]);

    board[1][0].pawn = new Pawn("knight", "white", this.getLocation(1, 0), game.scene, board[1][0]);
    board[6][0].pawn = new Pawn("knight", "white", this.getLocation(6, 0), game.scene, board[6][0]);

    board[1][7].pawn = new Pawn("knight", "black", this.getLocation(1, 7), game.scene, board[1][7]);
    board[6][7].pawn = new Pawn("knight", "black", this.getLocation(6, 7), game.scene, board[6][7]);

    board[0][0].pawn = new Pawn("rook", "white", this.getLocation(0, 0), game.scene, board[0][0]);
    board[7][0].pawn = new Pawn("rook", "white", this.getLocation(7, 0), game.scene, board[7][0]);

    board[0][7].pawn = new Pawn("rook", "black", this.getLocation(0, 7), game.scene, board[0][7]);
    board[7][7].pawn = new Pawn("rook", "black", this.getLocation(7, 7), game.scene, board[7][7]);

    board[4][0].pawn = new Pawn("king", "white", this.getLocation(4, 0), game.scene, board[4][0]);
    board[4][7].pawn = new Pawn("king", "black", this.getLocation(4, 7), game.scene, board[4][7]);

    board[3][0].pawn = new Pawn("queen", "white", this.getLocation(3, 0), game.scene, board[3][0]);
    board[3][7].pawn = new Pawn("queen", "black", this.getLocation(3, 7), game.scene, board[3][7]);
  },

  getLocation : function(x, y){
    var half = this.size/2;
    var base_x = -4*this.size + half;
    var base_z = 3*this.size + half;

    return new THREE.Vector3(base_x + x * this.size, 0, base_z - y * this.size);
  },

  movePawn: function(fromTile, toTile){
    var fromPos = this.getLocation(fromTile.x, fromTile.y);
    var toPos = this.getLocation(toTile.x, toTile.y);
    var pawn = fromTile.pawn;

    var cpoints = [fromPos];
    if(pawn.type == "knight"){
      cpoints.push(fromPos.clone().add(new THREE.Vector3(0, 2, 0)));
      cpoints.push(toPos.clone().add(new THREE.Vector3(0, 2, 0)));
    }
    cpoints.push(toPos);

    var spline = new THREE.Spline(cpoints);
    var duration = 1;

    var startTime = null;
    var points = null;

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
        pawn.position.set(p.x, p.y, p.z);
        return true;
      }else{
        var endPoint = cpoints[cpoints.length - 1];
        pawn.position.set(endPoint.x, endPoint.y, endPoint.z);
        toTile.pawn = pawn;
        fromTile.pawn = null;
        return false;
      }
    }
  },

  highlight : function(tile){
    var x = tile.x;
    var y = tile.y;
    var board = this.board;

    if(!tile.pawn || tile.pawn.color == "black")
      return;
    else if(tile.isHighlighted){
      this.clear();
      return;
    }

    this.clear();
    tile.highlight(true);

    switch(tile.pawn.type){
      case "pawn":
        this._highlightTile(x, y+1) && this._highlightTile(x, y+2);
        break;
      case "knight":
        this._highlightTile(x-1,y+2);
        this._highlightTile(x+1,y+2);
        this._highlightTile(x-2,y+1);
        this._highlightTile(x+2,y+1);
        this._highlightTile(x-2,y-1);
        this._highlightTile(x+2,y-1);
        this._highlightTile(x-1,y-2);
        this._highlightTile(x+1,y-2);
        break;
      case "bishop":
      case "queen":
        for(var i = x-1, j = y-1, cont = true; x >=0 && y >= 0 && cont; i--, j--)
          cont = this._highlightTile(i, j);
        for(var i = x+1, j = y+1, cont = true; x < 8 && y < 8 && cont; i++, j++)
          cont = this._highlightTile(i, j);
       for(var i = x-1, j = y+1, cont = true; x >=0 && y < 8 && cont; i--, j++)
          cont = this._highlightTile(i, j);
       for(var i = x+1, j = y-1, cont = true; x < 8 && y >= 0 && cont; i++, j--)
          cont = this._highlightTile(i, j);

       if(tile.pawn.type == "bishop")
        break;
      case "rook":
        for(var i = x-1, cont = true; i >=0 && cont; i--)
          cont = this._highlightTile(i,y);
        for(var i = x+1, cont = true; i <8 && cont; i++)
          cont = this._highlightTile(i,y);
        for(var i = y-1, cont = true; i >= 0 && cont; i++)
          cont = this._highlightTile(x, i);
        for(var i = y+1, cont = true; i < 8 && cont; i++)
          cont = this._highlightTile(x, i);
        break;
      case "king":
        this._highlightTile(x, y+1) && this._highlightTile(x, y-1);
        this._highlightTile(x+1, y) && this._highlightTile(x-1, y);
        this._highlightTile(x+1, y+1) && this._highlightTile(x-1, y+1);
        this._highlightTile(x+1, y-1) && this._highlightTile(x-1, y-1);
        break;
    }
  },

  _highlightTile: function(x, y){
    if(x < 0 || x > 7 || y < 0 || y > 7)
      return false;

    if(!this.board[x][y].pawn){
      this.board[x][y].highlight(true);
      return true;
    }else if(this.board[x][y].pawn.color == "black"){
      this.board[x][y].highlight(true);
      return false;
    }

    return false;
  },

  clear : function(){
    for(var i = 0; i < 8; i++)
      for(var j = 0; j < 8; j++)
        this.board[i][j].highlight(false);
  }
};
