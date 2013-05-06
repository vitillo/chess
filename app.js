var game = new Game();

function render(time) { 
  requestAnimationFrame(render);
  game.render(time);
} 

document.onclick = function(e){
  game.onclick(e);
}

document.onkeydown = function(e){
  e = e || window.event;
  
  switch(e.keyCode){
    default:
      break;
  }
}

window.onload = function(){
  game.initialize();
  render(new Date().getTime());
}

function printMatrix(matrix){
  var e = matrix.elements;

  console.log(e[0], e[4], e[8], e[12]);
  console.log(e[1], e[5], e[9], e[13]);
  console.log(e[2], e[6], e[10], e[14]);
  console.log(e[3], e[7], e[11], e[15]);
}

