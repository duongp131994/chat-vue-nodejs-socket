const httpServer = require("http").createServer();
const PORT = process.env.PORT || 3001;


const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
    },
});
//rendom id
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");


const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

io.use((socket, next) => {
    const id = socket.handshake.auth.userId;
    if (id) {
        const session = sessionStore.findSession(id);
        if (session) {//session exist
            socket.sessionID = session.sessionID;
            socket.userId = id;
            socket.date = Date.now();
            socket.username = session.username;
            return next();
        }
    }

    let userName = socket.handshake.auth.username;
    if (!userName) {
        return next(new Error("invalid username"));
    }

    //create random id for session, user
    socket.sessionID = randomId();
    socket.userId = randomId();
    socket.date = Date.now();
    socket.username = userName;
    next();
});

io.on("connection", (socket) => {
    //saving session
    sessionStore.saveSession(socket.userId, {
        userId: socket.userId,
        sessionID: socket.sessionID,
        username: socket.username,
        date: socket.date,
        connected: true,
    })
    console.log(`server connection :${socket.userId}`);

    //pass session details
    socket.emit('session-details', {
        sessionID: socket.sessionID,
        userId: socket.userId,
    })

    //join room
    socket.join(socket.userId);

    //get list user
    const users = [];
    sessionStore.findAllSessions().forEach((session) => {
        console.log(session)
        users.push({
            userId: session.userId,
            username: session.username,
            sessionID: session.sessionID,
            date: session.date,
            connected: session.connected,
        });
    });

    socket.emit("list-users", users);
    console.log(users);
    console.log('list-users');

    socket.broadcast.emit("user connected", {
        userId: socket.userId,
        username: socket.username,
        date: socket.date,
        connected: true,
    });

    // forward the private message to the right recipient
    socket.on("private message", ({ content, to }) => {
        console.log(content, to, socket.userId)
        socket.to(to).to(socket.userId).emit("private message", {
            content,
            from: socket.userId,
            to,
        });
    });

    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.userId).allSockets();
        const isDisconnected = matchingSockets.size === 0;

        if (isDisconnected) {
            // notify other users
            socket.broadcast.emit("user disconnected", socket.userId);
            // update the connection status of the session
            sessionStore.saveSession(socket.userId, {
                userId: socket.userId,
                username: socket.username,
                date: socket.date,
                sessionID: socket.sessionID,
                connected: false,
            });
        }
    });
});

httpServer.listen(PORT, () =>
    console.log(`server listening at http://localhost:${PORT}`)
);