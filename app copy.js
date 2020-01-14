var express = require("express");
var http = require("http");
var websocket = require("ws");

var port = process.argv[2];
var app = express();

app.use(express.static(__dirname + "/public"));
const server = http.createServer(app);
const wss = new websocket.Server({ server });
wss.on("connection", function connection(ws) {
  console.log(`connection from browser ${ws}`);

  let board = { 
    A1:"", B1:"", C1:"", D1:"", E1:"", F1:"", G1:"", H1:"",
    A2:"", B2:"", C2:"", D2:"", E2:"", F2:"", G2:"", H2:"",
    A3:"", B3:"", C3:"", D3:"", E3:"", F3:"", G3:"", H3:"",
    A4:"", B4:"", C4:"", D4:"", E4:"", F4:"", G4:"", H4:"",
    A5:"", B5:"", C5:"", D5:"", E5:"", F5:"", G5:"", H5:"",
    A6:"", B6:"", C6:"", D6:"", E6:"", F6:"", G6:"", H6:"",
    A7:"", B7:"", C7:"", D7:"", E7:"", F7:"", G7:"", H7:"",
    A8:"", B8:"", C8:"", D8:"", E8:"", F8:"", G8:"", H8:"",
  }
  const HIGHLIGHT = "*";
  setUpBoard();

  function setUpBoard(){
    board["B1"]="BH1";
    board["G1"]="BH2";
  }

  function isValidMove(from, to){
    if(from===to){
      return false;
    } else {
      return true;
    }
  }

  function movePiece(toCell){
    console.log("move '" + fromCell + "' -> '" + toCell + "'");

    if(isValidMove(fromCell, toCell)){

      let piece = board[fromCell];

      // remove highlight
      if(piece.startsWith(HIGHLIGHT)){
        piece = piece.substring(1);
      }

      // move piece
      board[toCell]=piece;
      board[fromCell]="";

    }  

    // reset from
    if(board[fromCell].startsWith(HIGHLIGHT)){
      board[fromCell]=board[fromCell].substring(1);
    }

    // reset from
    fromCell = "";
  }

  let fromCell = "";

  function prepareMove(from){
    console.log("prepare move for " + from + ", " + boardToString())
    const piece = board[from];
    if(piece.length===3){
      // valid - cell has a piece
      fromCell = from;
      board[fromCell]=HIGHLIGHT+board[fromCell];
    } else {
      // invalid - cell has no piece
      fromCell = "";
    }
    console.log("done prepare fromCell=" + fromCell + ", " + boardToString())
  }

  function boardToString(){
    msg = "Board State =";
    for(cell in board){
      piece = board[cell];
      if(piece!=""){
        msg = msg + "" + cell + ":" + piece;
      }
    }
    msg = msg + "]";
    return msg;
  }

  ws.on('message', (message) => {
    console.log('\nmessage from broswer -> "%s"', message);
    if ( message.startsWith("CLICK ON") ) {
        let clickedCell = message.substring("CLICK ON".length+1);
        if( fromCell==="" ) {
          // first click (from)
          prepareMove(clickedCell);
        } else {
          // second click (to)
          movePiece(clickedCell);
        }
    }
    console.log(boardToString());
    //console.log("send message '" + JSON.stringify(board)+ "'");
    ws.send(JSON.stringify(board));

  });
});
server.listen(port);
console.log("listening on port"+port); 