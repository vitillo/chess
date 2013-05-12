function MovesDB(white_is_south){
  this.moves = [];

  for(var i = 0; i < 8; i++){
    this.moves[i] = []

    for(var j = 0; j < 8; j++){
      this.moves[i][j] = {"pawn": {}, "rook": {}, "knight": {}, "bishop": {}, "queen":{}, "king": {}};

      for(var rank in this.moves[i][j]){
        this.moves[i][j][rank] = {"n": [], "ne": [], "e": [], "se": [], "s": [], "sw": [], "w": [], "nw": [], "n": []};
      }
    }
  }

  for(var i = 0; i < 8; i++){
    for(var j = 0; j < 8; j++){
      this._generatePawnMoves(i, j);
      this._generateStraightMoves("rook", i, j);
      this._generateKnightMoves(i, j);
      this._generateDiagonalMoves("bishop", i, j);
      this._generateStraightMoves("queen", i, j);
      this._generateDiagonalMoves("queen", i, j);
      this._generateKingMoves(i, j);
    }
  }
}

MovesDB.prototype = {
  _generatePawnMoves: function(x, y){
    this._addMove("pawn", "n", x, y, x, y + 1);
    this._addMove("pawn", "n", x, y, x, y + 2);
    this._addMove("pawn", "s", x, y, x, y - 1);
    this._addMove("pawn", "s", x, y, x, y - 2);
  },

  _generateStraightMoves: function(rank, x, y){
    for(var i = x - 1; i >= 0; i--)
      this._addMove(rank, "w", x, y, i, y);

    for(var i = x + 1; i < 8; i++)
      this._addMove(rank, "e", x, y, i, y);

    for(var i = y + 1; i < 8; i++)
      this._addMove(rank, "n", x, y, x, i);

    for(var i = y - 1; i >= 0; i--)
      this._addMove(rank, "s", x, y, x, i);
  },

  _generateDiagonalMoves: function(rank, x, y){
    for(var i = x + 1, j = y + 1; i < 8 && j < 8; i++, j++)
      this._addMove(rank, "ne", x, y, i, j);

    for(var i = x + 1, j = y - 1; i < 8 && j >= 0; i++, j--)
      this._addMove(rank, "se", x, y, i, j);

    for(var i = x - 1, j = y - 1; i >= 0 && j >= 0; i--, j--)
      this._addMove(rank, "sw", x, y, i, j);
    
    for(var i = x - 1, j = y + 1; i >= 0 && j < 8; i--, j++)
      this._addMove(rank, "nw", x, y, i, j);
  },

  _generateKnightMoves: function(x, y){
    this._addMove("knight", "ne", x, y, x + 1, y + 2);
    this._addMove("knight", "ne", x, y, x + 2, y + 1);

    this._addMove("knight", "se", x, y, x + 1, y - 2);
    this._addMove("knight", "se", x, y, x + 2, y - 1);

    this._addMove("knight", "sw", x, y, x - 1, y - 2);
    this._addMove("knight", "sw", x, y, x - 2, y - 1);

    this._addMove("knight", "nw", x, y, x - 1, y + 2);
    this._addMove("knight", "nw", x, y, x - 2, y + 1);
  },

  _generateKingMoves: function(x, y){
    this._addMove("king", "n", x, y, x, y + 1);
    this._addMove("king", "ne", x, y, x + 1, y + 1);
    this._addMove("king", "e", x, y, x + 1, y);
    this._addMove("king", "se", x, y, x + 1, y - 1);
    this._addMove("king", "s", x, y, x, y - 1);
    this._addMove("king", "sw", x, y, x -1, y - 1);
    this._addMove("king", "w", x, y, x - 1, y);
    this._addMove("king", "nw", x, y, x - 1, y + 1);
  },

  _addMove: function(rank, direction, fromX, fromY, toX, toY){
    if(toX < 0 || toX > 7 || toY < 0 || toY > 7)
      return;

    this.moves[fromX][fromY][rank][direction].push({"x": toX, "y": toY});
  },

  _nextDirection: function(dir){
    switch(dir){
      case "n":
        return "ne";
      case "ne":
        return "e";
      case "e":
        return "se";
      case "se":
        return "s";
      case "s":
        return "sw";
      case "sw":
        return "w";
      case "w":
        return "nw";
      case "nw":
        return null;
      default:
        return null;
    }
  },

  iterator: function(color, rank, x, y){
    var self = this;
    var index = 0;
    var direction = (color == "black" && rank == "pawn" ? "s" : "n");

    return function(changeDirection){
      if(changeDirection){
        direction = self._nextDirection(direction);
        index = 0;
      }

      while(true){
        if(!direction) // no more moves left
          return null;

        var move = self.moves[x][y][rank][direction][index];

        if(move){ // move exists
          index++;
          return move;
        }else if(rank == "pawn"){
          return null;
        }else{
          index = 0;
          direction = self._nextDirection(direction);
        }
      }
    }
  },

}
