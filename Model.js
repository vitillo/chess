function Model(){
  this.state = p4_new_game();
  p4_log = function(){}

  /* checkmate, stalemate, draw, promotion */
  //this.state = p4_fen2state("8/2P5/8/8/8/6K1/4Q3/6k1 w - - 21 61");
  /* castling */
  //this.state = p4_fen2state("r3k2r/8/8/8/8/8/3Q4/R3K2R w KQkq - 21 61");
}

Model.prototype = {
  encode: function(position){
    return 20 + position.y*10 + position.x + 1;
  },

  decode: function(position){
    var y = Math.floor(position/10) - 2;
    var x = (position % 10) - 1;

    return {x: x, y: y};
  },

  get: function(x, y){
    var board = this.state.board;

    switch(board[this.encode({x: x, y: y})]){
      case 2: //white pawn
        return {color: "white", rank: "pawn"};
      case 3: //black pawn
        return {color: "black", rank: "pawn"};
      case 4: //white rook
        return {color: "white", rank: "rook"};
      case 5: //black rook
        return {color: "black", rank: "rook"};
      case 6: //white knight
        return {color: "white", rank: "knight"};
      case 7: //black knight
        return {color: "black", rank: "knight"};
      case 8: //white bishop
        return {color: "white", rank: "bishop"};
      case 9: //black bishop
        return {color: "black", rank: "bishop"};
      case 10: //white king
        return {color: "white", rank: "king"};
      case 11: //black king
        return {color: "black", rank: "king"};
      case 12: //white queen
        return {color: "white", rank: "queen"};
      case 13: //black queen
        return {color: "black", rank: "queen"};
    }

    return null;
  },

  getMoves: function(pos){
    var moves = [];
    var start = this.encode(pos);

    for(var i = 0; i < 8; i++){
      for(var j = 0; j < 8; j++){
        var end = this.encode({x: j, y: i});
        var move = this.state.move(start, end);

        if(move.ok){
          this.state.jump_to_moveno(-1);
          moves.push(this.decode(end));
        }
      }
    }

    return moves;
  },

  applyMove: function(from, to){
    var start = this.encode(from);
    var end = this.encode(to);
    var move = this.state.move(start, end);

    var checkmateMask = P4_MOVE_CHECKMATE;
    var stalemateMask = P4_MOVE_STALEMATE;
    var checkMask = (P4_MOVE_FLAG_OK | P4_MOVE_FLAG_CHECK);
    var drawMask = (P4_MOVE_FLAG_OK | P4_MOVE_FLAG_DRAW);
    var promotionMask = (P4_MOVE_FLAG_OK | P4_MOVE_FLAG_PROMOTION);
    var castleKing = (P4_MOVE_FLAG_OK | P4_MOVE_FLAG_CASTLE_KING);
    var castleQueen = (P4_MOVE_FLAG_OK | P4_MOVE_FLAG_CASTLE_QUEEN);
    var res = {};

    res.promoted = (move.flags & promotionMask) == promotionMask;
    res.castleKing = (move.flags & castleKing) == castleKing;
    res.castleQueen = (move.flags & castleQueen) == castleQueen;

    if((move.flags & drawMask) == drawMask){
      res.draw = true;
    }else if((move.flags & checkmateMask) == checkmateMask){
      res.checkmate = true;
    }else if((move.flags & stalemateMask) == stalemateMask){
      res.stalemate = true;
    }else if((move.flags & checkMask) == checkMask){
      res.check = true;
    }

    return res;
  },

  findMove: function(){
    var move = this.state.findmove(2);

    var from = this.decode(move[0]);
    var to = this.decode(move[1]);

    return {from: from, to: to};
  },

  getOpponent: function(){
    return this.state.to_play == 0 ? "black" : "white";
  },

  getPlayer: function(){
    return this.state.to_play == 0 ? "white" : "black";
  },

}
