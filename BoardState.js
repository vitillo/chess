function BoardState(player, state){
  this.state = state ? state : [0, 0, 0, 0, 0, 0, 0, 0];
  this.player = player;
  this.moves = new MovesDB();

  if(state)
    this.state = state;
  else
    this.initialize();
}

BoardState._decode = function(code){
  switch(code){
    case 1:
      return {color: "white", rank:"pawn"};
    case 2:
      return {color: "white", rank: "rook"};
    case 3:
      return {color: "white", rank: "knight"};
    case 4:
      return {color: "white", rank: "bishop"};
    case 5:
      return {color: "white", rank: "queen"};
    case 6:
      return {color: "white", rank: "king"};

    case 8:
      return {color: "black", rank: "pawn"};
    case 9:
      return {color: "black", rank: "rook"};
    case 10:
      return {color: "black", rank: "knight"};
    case 11:
      return {color: "black", rank: "bishop"};
    case 12:
      return {color: "black", rank: "queen"};
    case 13:
      return {color: "black", rank: "king"};

    default:
      return null;
  }
}

BoardState._encode = function(color, rank){
  var code;

  switch(rank){
    case "pawn":
      code = 1;
      break;
    case "rook":
      code = 2;
      break;
    case "knight":
      code = 3;
      break;
    case "bishop":
      code = 4;
      break;
    case "queen":
      code = 5;
      break;
    case "king":
      code = 6;
      break;
    default:
      return 0;
  }

  return color == "white" ? code : code + 7;
}

BoardState.prototype = {
  initialize: function(){
    this.set(7,6, "pawn", "black")

    for(var i = 0; i < 8; i++){
      this.set(i, 1, "pawn", "white");
      this.set(i, 6, "pawn", "black");
    }

    this.set(2, 0, "bishop", "white");
    this.set(5, 0, "bishop", "white");

    this.set(2, 7, "bishop", "black");
    this.set(5, 7, "bishop", "black");

    this.set(1, 0, "knight", "white");
    this.set(6, 0, "knight", "white");

    this.set(1, 7, "knight", "black");
    this.set(6, 7, "knight", "black");

    this.set(0, 0, "rook", "white");
    this.set(7, 0, "rook", "white");

    this.set(0, 7, "rook", "black");
    this.set(7, 7, "rook", "black");

    this.set(4, 0, "king", "white");
    this.set(4, 7, "king", "black");

    this.set(3, 0, "queen", "white");
    this.set(3, 7, "queen", "black");
  },

  set : function(x, y, rank, color){
    if(x < 0 || x > 7 || y < 0 ||  y > 7)
      return null;

    var code = BoardState._encode(color, rank);
    var clearMask = 15 << (x*4);

    this.state[y] = this.state[y] & ~clearMask; //clear
    this.state[y] = this.state[y] | code << (x*4);
  },

  get : function(x, y){
    if(x < 0 || x > 7 || y < 0 ||  y > 7)
      return;

    var row = this.state[y];
    var offset = x*4;
    var mask = 15 << offset;
    var code = (row & mask) >>> offset;

    return BoardState._decode(code);
  },

  getSuccessors : function(){
    var i = 0;
    var j = 0;
    var moveGenerator;
    var move;
    var piace;

    return function(){
      while(true){
        while(!move){
          piece = this.get(i, j);

          if(i < 8 && j < 8)
            j++;
          else if(i < 8 && j >= 8){
            j = 0;
            i++;
          }else
            return null;
        }

        if(!move)
          moveGenerator = this.movesDB.generate(this, piece.color, piece.rank, i, j);

        move = moveGenerator(this);

        if(!move)
          continue;

        var newBoard = new BoardState(this.getOpponent(), this.board);
        newBoard.applyMove(i, j, move.x, move.y, piece.rank, piece.color);
        return newBoard;
      }
    }

    /*for(var i = 0; i < 8; i++){
      for(var j = 0; j < 8; j++){
        var piece = this.get(i, j);
        var generateMove;
        var changeDirection;

        if(!piece)
          continue;

        generateMove = this.movesDB.generate(piece.color, piece.rank, i, j);
        while(move = generateMove(this)){
          var newBoard = new BoardState(this.getOpponent(), this.board);
          newBoard.applyMove(i, j, move.x, move.y, piece.rank, piece.color);
          return newBoard;
        }
      }
    }*/
  },

  applyMove: function(fromX, fromY, toX, toY, rank, color){
    var from = this.get(fromX, fromY);
    var to = this.get(toX, toY);

    this.set(fromX, fromY, null, null);
    this.set(toX, toY, rank, color);
  },

  validateMove: function(move, rank){
    var piece = this.get(move.x, move.y);

    if(!piece)
      return {isLastInDirection: false, valid: true};
    else if(piece.color == this.getOpponent())
      return {isLastInDirection: true && rank != "knight", valid: true};
    else
      return {isLastInDirection: true && rank != "knight", valid: false};

  },

  getOpponent: function(){
    return this.player == "white" ? "black" : "white";
  },

  getPlayer: function(){
    return this.player;
  }
}

