function Board(size){
  this.size = size;
  this.board = [[], [], [], [], [], [], [], []];
  this.movesDB = new MovesDB(); 
  this.state = new BoardState("white");
  
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
      for(var j = 0; j < 8; j++){
        var pawn = this.state.get(i, j);

        if(!pawn)
          continue;

        board[i][j].pawn = new Pawn(pawn.rank, pawn.color, this.getLocation(i, j), game.scene, board[i][j]);
      }
    }
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

    this.state.applyMove(fromTile.x, fromTile.y, toTile.x, toTile.y, pawn.rank, pawn.color);

    var cpoints = [fromPos];
    if(pawn.rank == "knight"){
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
    var nextMove;
    var move;
    var blocked = false;

    if(!tile.pawn || tile.pawn.color == "black")
      return;
    else if(tile.isHighlighted){
      this.clear();
      return;
    }

    this.clear();
    tile.highlight(true);


    var changeDirection = false;
    generateMove = this.movesDB.iterator(tile.pawn.color, tile.pawn.rank, tile.x, tile.y);

    while(move = generateMove(changeDirection)){
      changeDirection = false;

      blocked = !this._highlightTile(move.x, move.y);

      if(blocked && tile.pawn.rank != "knight"){
        changeDirection = true;
      }
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
