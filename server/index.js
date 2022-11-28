const httpServer = require("http").createServer();
const PORT = process.env.PORT || 3001;

const { ModelContent, ModelUser, ModelConversion } = require("./model");
const modelContent = new ModelContent();
const modelUser = new ModelUser();
const modelConversion = new ModelConversion();


modelContent.createTable()
modelUser.createTable()
modelConversion.createTable()

const bcrypt = require('bcrypt');
const saltRounds = 5;

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
    },
});
//rendom id
const crypto = require("crypto-js");
const randomId = () => crypto.randomBytes(8).toString("hex");


const { InMemorySessionStore } = require("./sessionStore");
const sessionStore = new InMemorySessionStore();

io.use(async (socket, next) => {
    let userName = socket.handshake.auth.username;
    if (!userName) {
        return next(new Error("invalid username"));
    }
    const createNew = socket.handshake.auth.createNew;

    var user1 = null;
    let user = await modelUser.selectUser({userName, callback: (result) => {
        if (result) {
            user1 = result
            console.log(user1)
        }
    }});

    if (createNew) {
        await createNewUser({user, socket, next})
    }

    const password = socket.handshake.auth.password;
    socket.cryptoPassword = crypto.AES.encrypt(password, 'dandelions').toString();

    if (password) {
        if (user && socket.cryptoPassword === user.password) {//session exist
            socket.newUser = false;
            socket.userId = id;
            socket.date = Date.now();
            socket.username = user.username;
            socket.params = JSON.parse(user.params);
            modelUser.updateInto({id:socket.userId,log_out_date:socket.date})
            return next();
        } else {
            return next(new Error("Login failed"));
        }
    }
    next();
});

var createNewUser = function ({user, socket, next}) {
    console.log('user')
    console.log(user)
    if (user && user.length < 1) {
        socket.newUser = true;
        socket.username = 'userName';
        return next();
    }
    return next(new Error("Create failed"));
}

io.on("connection", (socket) => {
    //saving session
    console.log('connection')
    socket.disconnect(true)
    if (socket.newUser) {
        const user = modelUser.insertInto({userName:socket.username, password:socket.cryptoPassword})
        socket.userId = user.insertId;
        socket.date = Date.now();
        socket.params = {
            conversion: []
        };
        console.log(`new user connection :${socket.userId}`);
    }

    //join room
    socket.join(socket.userId);

    //pass session details
    socket.emit('session-details', {
        userId: socket.userId,
        params: socket.params
    })

    //user new connect
    socket.broadcast.emit("user connected", {
        userId: socket.userId,
        username: socket.username,
        date: socket.date,
        connected: true,
    });

    //conversion details
    const conversions = socket.params?.conversion || [];
    const conversionContents = getConversions({ids: conversions, limit: 30});
    socket.emit("conversionContents", conversionContents);

    // forward the private message to the right recipient
    //to: conversion id
    //from: current id
    socket.on("private message", ({ content, to }) => {
        console.log(content, to, socket.userId)
        let date = Date.now();
        let chatContent = modelContent.insertInto({content:content, date:date, conversion_id: to, user_id:socket.userId})
        if (typeof chatContent.insertId !== 'undefined') {
            socket.to(to).to(socket.userId).emit("private message", {
                content,
                from: socket.userId,
                to,
                date,
            });
        }
    });

    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.userId).allSockets();
        const isDisconnected = matchingSockets.size === 0;

        if (isDisconnected) {
            let date = Date.now();
            // notify other users
            socket.broadcast.emit("user disconnected", {userId: socket.userId, log_out_date:date});
            // update the connection status of the session
            modelUser.updateInto({id:socket.userId,log_out_date:date})
        }
    });
});

const getConversions = function ({ids, limit, min}) {
    const listChat = {};
    var firstChat = [];
    if (ids.length > 0) {
        for (let id in ids) {
            if (typeof min !== 'undefined') {
                listChat[ids[id]] = modelContent.selectAllInConversionLimit({conversionId:ids[id], date:limit, minDate:min})
            } else {
                listChat[ids[id]] = modelContent.selectAllInConversionLimit({conversionId:ids[id], date:limit})
            }
            listChat[ids[id]] = listChat[ids[id]] || [];
            let last = listChat[ids[id]].at(-1) || null;
            if (firstChat.length > 0) {
                if (last?.send_date > firstChat[1]) {
                    firstChat = [id, last?.send_date]
                }
            } else {
                firstChat = [id, last?.send_date]
            }
        }
    }

    return [listChat, firstChat];
}

httpServer.listen(PORT, () =>
    console.log(`server listening at http://localhost:${PORT}`)
);