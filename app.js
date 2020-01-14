var express = require("express");
var http = require("http");
var websocket = require("ws");
var Game = require("./game.js");

var port = process.argv[2];
var app = express();

app.use(express.static(__dirname + "/public"));
const server = http.createServer(app);
const wss = new websocket.Server({ server });
let game = Game.init();

var websockets = {}; 

setInterval(function() {
  for (let i in websockets) {
    if (Object.prototype.hasOwnProperty.call(websockets,i)) {
      let gameObj = websockets[i];
      if (gameObj.finalStatus != null) {
        delete websockets[i];
      }
    }
  }
}, 50000);

var connectionID = 0;

wss.on("connection", function connection(ws) {
  let con = ws;
  con.id = connectionID++;
  game.addUser(con);
  websockets[con.id] = game;

  console.log(`connection from browser ${con}`);

  con.on('message', (message) => {
    game.processMessage(ws, message);
  });
   
});

server.listen(port);
console.log("listening on port"+port); 