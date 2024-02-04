const express = require("express");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 80;
const { exec } = require("child_process");

app.use(express.static(path.join(__dirname, 'www')));

app.get('/', function(req, res) {
    res.redirect('index.html');
});

io.on("connection", function(socket){
    const initialUserName = socket.handshake.query.initialUserName;
    addNewUser(socket.id, initialUserName);
    console.log("Connected:" + userNameHash[socket.id]);
    socket.on("log", function(logText){
        console.log(userNameHash[socket.id]+":"+logText);
    });
    socket.on("drawStart", (xy) => {
        lineStart(socket.id, xy);
    });
    socket.on("drawMove", (xy) => {
        lineMove(socket.id, xy);
    });
    socket.on("drawEnd", (xy) => {
        lineMove(socket.id, xy);
    });
    socket.on("disconnect", () => {
        console.log("Disconnected:" + userNameHash[socket.id]);
    });
    socket.on("changeUsername", (newName)=>{
        const oldName = userNameHash[socket.id];
        changeUsername(socket.id, newName);
        console.log("New Name: " + oldName + " > " + userNameHash[socket.id]);
    });
})

http.listen(PORT, function(){
    console.log('server listening at Port:' + PORT);
});

let drawCount = 0
let drawHash = {"socketID":drawCount};
let lineHistory = []

const lineStart = (socketid, xy) => {
    drawCount++;
    drawHash[socketid] = drawCount;
    lineHistory[drawCount] = xy
};

const lineMove = (socketid, xy) => {
    oldXY = lineHistory[drawHash[socketid]];
    newXY = xy;
    io.emit("addline", {"oldXY":oldXY, "newXY":newXY});
    lineHistory[drawHash[socketid]] = newXY;
}

let userNameHash = {"socketID":"Username"};

const addNewUser = (socketid, userName) => {
    if(userNameHash[socketid] == undefined){
        userNameHash[socketid] = userName;
    }
}

const changeUsername = (socketid,newUsername) => {
    userNameHash[socketid] = newUsername;
}