
module.exports = {
    init : function(){
        let game = new Game();
        return game;
    }
};

function Game(){

    // the ws connections of the players
    this.wsUser1;
    this.wsUser2;
    
    // game state constants
    const NO_PLAYERS = 0;
    const ONE_PLAYER = 1;
    const TWO_PLAYERS = 2;
    const STOPPED = 3;
    const BLACK = "black";
    const WHITE = "white";

    // game state
    this.gameState = {
        status: NO_PLAYERS,
        turn: "", // BLACK or WHITE
        selectedCell: "",
        moves: [],
        offBoardPieces: [],
        board: { 
            A1:"Rb1", B1:"Nb1", C1:"Bb1", D1:"Qb1", E1:"Kb1", F1:"Bb2", G1:"Kb2", H1:"Rb2",
            A2:"Pb1", B2:"Pb2", C2:"Pb3", D2:"Pb4", E2:"Pb5", F2:"Pb6", G2:"Pb7", H2:"Pb8",
            A3:"", B3:"", C3:"", D3:"", E3:"", F3:"", G3:"", H3:"",
            A4:"", B4:"", C4:"", D4:"", E4:"", F4:"", G4:"", H4:"",
            A5:"", B5:"", C5:"", D5:"", E5:"", F5:"", G5:"", H5:"",
            A6:"", B6:"", C6:"", D6:"", E6:"", F6:"", G6:"", H6:"",
            A7:"Pw1", B7:"Pw2", C7:"Pw3", D7:"Pw4", E7:"Pw5", F7:"Pw6", G7:"Pw7", H7:"Pw8",
            A8:"Rw1", B8:"Nw1", C8:"Bw1", D8:"Qw1", E8:"Kw1", F8:"Bw2", G8:"Nw2", H8:"Rw2",
        }
    }
}

Game.prototype.isValidMove = function(from, to){
    if(from===to){
        return false;
    } else {
        return true;
    }
}

Game.prototype.isValidFrom = function(from){
    const cellContent=this.gameState.board[from];
    if(cellContent!=""){
        return true;
    } else {
        return false;
    }
}

Game.prototype.prepareMove = function(from){
    console.log("prepare move for " + from);
    if(this.isValidFrom(from)){
        this.gameState.selectedCell = from;
    }
    console.log("done prepare from = " + from);
}

Game.prototype.movePiece = function(to){
    const from = this.gameState.selectedCell
    let board = this.gameState.board;
    console.log("move '" + from + "' -> '" + to + "'");
    if(this.isValidMove(from, to)){
        const capturedPiece = board[to];
        board[to]=board[from];
        board[from]="";
        const move = from + "->" + to;
        this.gameState.moves.push(move);
        if(capturedPiece!=""){
            this.gameState.offBoardPieces.push(capturedPiece);
        }
    }
    this.gameState.selectedCell = "";
}

Game.prototype.addUser = function(ws){
    if(this.wsUser1==null){
        this.wsUser1 = ws;
    } else if (this.wsUser2==null){
        this.wsUser2 = ws;
    }
}

Game.prototype.processMessage = function(ws, msg){
    if(this.wsUser1!=ws && this.wsUser2!=ws){
        return;
    }
    let user = this.wsUser1===ws?"player white":"player black";
    console.log('\nmessage from %s -> "%s"', user, msg);


    if (msg.startsWith("CLICK ON")) {
        let clickedCell = msg.substring("CLICK ON".length+1);
        if( this.gameState.selectedCell==="" ) {
            // first click (-> from cell)
            this.prepareMove(clickedCell);
        } else {
            // second click (-> to cell)
            this.movePiece(clickedCell);
        }
    }
    console.log ("send state to browser: ");
    console.log(JSON.stringify(this.gameState));
    if(this.wsUser1!=null){
        this.wsUser1.send(JSON.stringify(this.gameState));
    }
    if(this.wsUser2!=null){
        this.wsUser2.send(JSON.stringify(this.gameState));
    }
}
  