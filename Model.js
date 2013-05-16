function Model(){
  this.state = p4_new_game();
  this.nMoves = 0;
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
          this.state.jump_to_moveno(this.nMoves);
          moves.push(this.decode(end));
        }
      }
    }

    return moves;
  },

  applyMove: function(from, to){
    var start = this.encode(from);
    var end = this.encode(to);

    this.state.move(start, end);
    this.nMoves++;
  },

  findMove: function(){
    var move = this.state.findmove(3);

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
