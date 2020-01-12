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

  let prevCell = "";
  let board = { A1:"BH1", B2:"", C1:"", D1:"", E1:"", F1:"" }

  function movePiece(from, to){
    console.log("move '" + from + "' -> '" + to + "'");
    let piece = board[from];
    board[to]=piece;
    board[from]="";
  }

  ws.on('message', (message) => {
    console.log('\nmessage from broswer -> "%s"', message);
    if ( message.startsWith("CLICK ON") ) {
        let cell = message.substring("CLICK ON".length+1);
        if( prevCell=="" ) {
          prevCell = cell;
        } else {
          let from = prevCell
          let to = cell;
          movePiece(from, to);
          prevCell = "";
        }
    }
    ws.send(JSON.stringify(board));
    console.log("prevCell = '" + prevCell + "'");
    console.log("send message '" + JSON.stringify(board)+ "'");
  });
});
server.listen(port);
console.log("listening on port"+port); 