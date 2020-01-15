
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
    this.NO_PLAYERS = 0;
    this.ONE_PLAYER = 1;
    this.TWO_PLAYERS = 2;
    this.STOPPED = 3;
    this.BLACK = "black";
    this.WHITE = "white";

    // game state
    this.gameState = {
        status: this.NO_PLAYERS,
        yourColor: "", //BLACK or WHITE
        turnColor: this.WHITE, // BLACK or WHITE
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

Game.prototype.getPersonalizedState = function(user){
    if(user==this.wsUser1){
        this.gameState.yourColor = this.WHITE;
    } else {
        this.gameState.yourColor = this.BLACK;
    }
    return this.gameState;
}

Game.prototype.isValidMove = function(from, to){
    if( this.isValidFrom(from) && this.isValidTo(to) ){
        return true;
    }
    return false;
}

Game.prototype.isValidFrom = function(from){
    const piece = this.gameState.board[from];
    if(piece!=""){
        const pieceColor = piece[1]=='b'?this.BLACK:this.WHITE;
        console.log("is valid from %s, piece %s, pieceColor %s, turnColor", from, piece, pieceColor, this.gameState.turnColor);
        if(pieceColor==this.gameState.turnColor){
            return true;
        }
    }
    return false;
}

Game.prototype.isValidTo = function(to){
    const piece = this.gameState.board[to];
    if(piece==""){
        return true;
    } 
    const pieceColor = piece[1]=='b'?this.BLACK:this.WHITE;
    console.log("is valid to %s, piece %s, pieceColor %s, turnColor", to, piece, pieceColor, this.gameState.turnColor);
    if(pieceColor!=this.gameState.turnColor){
        return true;
    }
    return false;
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
        // update board
        const capturedPiece = board[to];
        board[to]=board[from];
        board[from]="";
        // add captured piece to off-board section
        if(capturedPiece!=""){
            this.gameState.offBoardPieces.push(capturedPiece);
        }
        // swap turnColor
        if(this.gameState.turnColor===this.WHITE){
            this.gameState.turnColor=this.BLACK;
        } else  {
            this.gameState.turnColor=this.WHITE;
        }
        // remember move
        const move = from + "->" + to;
        this.gameState.moves.push(move);
    }
    this.gameState.selectedCell = "";
}

Game.prototype.addUser = function(con){
    if(this.wsUser1==null){
        this.wsUser1 = con;
        this.gameState.status = this.ONE_PLAYER;
    } else if (this.wsUser2==null){
        this.wsUser2 = con;
        this.gameState.status = this.TWO_PLAYERS;
    }
}

Game.prototype.processMessage = function(ws, msg){
    if(this.wsUser1!=ws && this.wsUser2!=ws){
        return;
    }

    console.log(this.wsUser1.status);

    let user = this.wsUser1===ws?this.WHITE:this.BLACK;
    console.log('\nmessage from %s -> "%s"', user, msg);


    if (msg.startsWith("CLICK ON")) {
        if(this.gameState.turnColor!=user){
            // it is not the user's turn, don't except input
            return;
        }
        let clickedCell = msg.substring("CLICK ON".length+1);
        if( this.gameState.selectedCell==="" ) {
            // first click (-> from cell)
            this.prepareMove(clickedCell);
        } else {
            // second click (-> to cell)
            this.movePiece(clickedCell);
        }
    }
    if(this.wsUser1!=null){
        // personalize state and send
        let personlizedState = this.getPersonalizedState(this.wsUser1);
        this.wsUser1.send(JSON.stringify(personlizedState));
        console.log ("send personilized state to user1 (white): "+JSON.stringify(personlizedState));
    }
    if(this.wsUser2!=null){
        // personalize state and send
        let personlizedState = this.getPersonalizedState(this.wsUser2);
        this.wsUser2.send(JSON.stringify(personlizedState));
        console.log ("send personilized state to user2 (black): "+JSON.stringify(personlizedState));
    }
}
  