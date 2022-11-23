const httpServer = require("http").createServer();
const PORT = process.env.PORT || 3001;
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
    },
});

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
});

io.on("connection", (socket) => {
    console.log(`server connection at http://localhost:${PORT}`)
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            userID: id,
            username: socket.username,
        });
    }

    console.log(users)
    socket.emit("users", users);

    socket.broadcast.emit("user connected", {
        userID: socket.id,
        username: socket.username,
    });

    // forward the private message to the right recipient
    socket.on("private message", ({ content, to }) => {
        socket.to(to).emit("private message", {
            content,
            from: socket.id,
        });
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("user disconnected", socket.id);
    });
});

httpServer.listen(PORT, () =>
    console.log(`server listening at http://localhost:${PORT}`)
);