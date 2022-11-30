const httpServer = require("http").createServer();
const PORT = process.env.PORT || 3001;

const { ModelContent, ModelUser, ModelConversion } = require("./model");
const modelContent = new ModelContent();
const modelUser = new ModelUser();
const modelConversion = new ModelConversion();

modelContent.createTable()
modelUser.createTable()
modelConversion.createTable()

async function craeteRoot() {
    let user = await modelUser.selectUser({userName: 'root@gmail.com'})
    if (!(user && user.length > 0)) {
        await modelUser.insertUser({
            userName: 'root@gmail.com',
            password: '41a67a17f83673c511a8c0f6b55c6ee7e0faa8de66dd9c026fcc3dec'
        })
    }
    let chatContent = await modelContent.selectAllInConversionLimit({conversionId: 1, limit: 1})
    if (!(chatContent && chatContent.length > 0)) {
        await modelContent.insertContent({content: 'Welcome to vndandelions.com ', conversion_id: 1, user_id: 1})
    }
    let Conversion = await modelConversion.selectConversion({id: 1})
    if (!(Conversion && Conversion.length > 0)) {
        await modelConversion.insertInto({name: 'Welcome', users: [1]})
    }
}

craeteRoot()


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
    const userName = socket.handshake.auth.username;
    const createNew = socket.handshake.auth.createNew;

    const password = socket.handshake.auth.password;
    const cryptoPassword = crypto.SHA3("Message", { outputLength: 224 }).toString();

    if (!userName) {
        socket.error = 'User name not valid'
        return next();
    }

    let user = await modelUser.selectUser({userName});

    if (createNew) {
        socket.newUser = true;
        if (!(user && user.length > 0)) {
            socket.username = userName;
            socket.cryptoPassword = cryptoPassword;
            return next();
        }
        socket.error = 'User name existed'
        return next();
    }
    console.clear()
    console.log(user, cryptoPassword, user[0]?.password);
    if (password) {
        if (user && user.length > 0 && cryptoPassword === user[0]?.password) {//session exist
            socket.newUser = false;
            socket.userId = user[0].id;
            socket.date = Date.now();
            socket.username = user[0].username;
            socket.params = JSON.parse(user[0].params);

            modelUser.updateInto({id: socket.userId, log_out_date: socket.date})
            return next();
        } else {
            return next(new Error("Login failed"));
        }
    }
    next();
});

io.on("connection", async (socket) => {
    const sessionID = socket.id;

    if (socket.error) {
        socket.join(randomId);
        socket.emit('error-connection', {
            error: socket.error
        })
        socket.disconnect(true)
        return false;
    }

    console.log('connection!')

    if (socket.newUser) {
        console.log(`new user connection`);
        let conversion = await modelConversion.insertInto({name: 'Welcome', users: [1]})
        let room = conversion.insertId

        const user = await modelUser.insertUser({userName:socket.username, password:socket.cryptoPassword, params: {conversion: [room]}})
        socket.userId = user.insertId;
        socket.date = Date.now();
        socket.params = {
            conversion: [room]
        };

        await modelConversion.updateInto({id: room, users: [1, socket.userId]})
        await modelContent.insertContent({content: 'Welcome to vndandelions.com ', conversion_id: room, user_id: 1})
        console.log(`new user connection :${socket.userId}`);
    }

    // pass session details
    io.to(`${sessionID}`).emit('userConnect', {
        username: socket.username,
        sessionID: sessionID,
        userId: socket.userId,
        date: socket.date,
        params: socket.params
    })

    // saving session
    sessionStore.saveSession(socket.userId, {
        userId: socket.userId,
        sessionID: sessionID,
        username: socket.username,
        connected: true,
    })

    // user new connect
    socket.broadcast.emit("user connected", {
        userId: socket.userId,
        username: socket.username,
        date: socket.date,
        connected: true,
    });

    // conversionContents details
    if (!socket.params?.conversion) {
        io.to(`${sessionID}`).emit("conversionContents", []);
    } else {
        await getConversionsContents({socket, ids: socket.params?.conversion, limit: 30});
    }

    // your conversions details
    if (!socket.params?.conversion) {
        io.to(`${sessionID}`).emit("conversion-details", []);
    } else {
        await getConversions({socket, ids: socket.params?.conversion});
    }

    // user accept join to room
    socket.on("joinToRoom", async (room) => {
        socket.join(room)

        socket.to(room).broadcast.emit("newUserJoin", {
            userId: socket.userId,
            username: socket.username,
            connected: true
        });
    })

    // Add a user to a room
    socket.on("addUserConversion", async ({userName, room}) => {
        let user = await modelUser.selectUser({userName});

        if (!(user && user.length > 0)) {
            io.to(`${sessionID}`).emit("addUserConversionReturn", [false, room, {}, 'user not exist']);//status, room id, sessionUser, notification
        } else {
            let conversion = await modelConversion.selectConversion({id: room})
            let roomUsers = JSON.parse(conversion[0].users)

            await modelConversion.updateInto({id: room, users: roomUsers.push(user[0].id)})
            let sessionUser = sessionStore.findSession(user[0].id)

            io.to(`${sessionID}`).emit("addUserConversionReturn", [true, room, sessionUser || {
                userId: user[0].id,
                username: user[0].username,
                connected: false,
            }, 'user is added']);

            if (sessionUser.connected) {//user added to a room
                io.to(`${sessionUser.sessionID}`).emit("userAddedConversionReturn", room);
            }
        }
    })

    // forward the private message to the right recipient
    // to: conversion id
    // from: current id
    socket.on("private message", ({ content, room }) => {
        console.log(content, room, socket.userId)
        let date = Date.now();
        let chatContent = modelContent.insertContent({content:content, date:date, conversion_id: room, user_id:socket.userId})
        if (typeof chatContent.insertId !== 'undefined') {
            socket.to(room).to(sessionID).emit("private message", {
                content,
                from: socket.userId,
                room,
                date,
            });
        }
    });

    socket.on("disconnect", async () => {
        console.log('disconnect' + socket.userId)
        const matchingSockets = await io.in(socket.userId).allSockets();
        const isDisconnected = matchingSockets.size === 0;

        if (isDisconnected) {
            let date = Date.now();
            // notify other users
            socket.broadcast.emit("user disconnected", {userId: socket.userId, date: date, connected: false});

            sessionStore.saveSession(socket.userId, {
                userId: socket.userId,
                username: socket.username,
                connected: false,
            })

            // update the connection status of the session
            modelUser.updateInto({id:socket.userId,log_out_date:date})
        }
    });
});

const getConversions = async function (data) {
    const listConversions = [];
    let idConversions = data.ids || []

    if (idConversions.length > 0) {
        for (let id in idConversions) {
            let conversion = await modelConversion.selectConversion({id: idConversions[id]}) || []
            let users = JSON.parse(conversion[0].users);
            let user_details = [];
            if (users.length > 0) {
                for (let i in users) {
                    user_details.push(sessionStore.findSession(users[i]));
                }
            }

            listConversions.push([conversion[0] || [], user_details]);
        }
    }

    io.to(`${data.socket.id}`).emit("conversion-details", listConversions);
}
const getConversionsContents = async function (data) {
    let listChat = {};
    let allChat = {};
    let threeFirstChat = [];
    let ids = data.ids || []
    let date = data.date || 0
    let minDate = data.min || 0
    let limit = data.limit || 30
    let threeFirstRoom = []
    if (ids.length > 0) {
        for (let id in ids) {
            if (date > 0) {
                allChat[ids[id]] = await modelContent.selectAllInConversionTime({conversionId:ids[id], date, minDate})
            } else {
                allChat[ids[id]] = await modelContent.selectAllInConversionLimit({conversionId:ids[id], limit})
            }
            allChat[ids[id]] = allChat[ids[id]] || [];

            //join all room
            data.socket.join(ids[id]);

            //get 3 chat join the closest
            let last = listChat[ids[id]].at(-1) || null;
            if (threeFirstChat.length < 1) {
                threeFirstChat = [last?.send_date]
                threeFirstRoom = [ids[id]]
                listChat = allChat[ids[id]]
            }

            for(let i = 0; i < threeFirstChat.length; i++) {
                if (threeFirstChat[i] < last?.send_date) {
                    threeFirstChat.splice(i, 0, last?.send_date);
                    threeFirstRoom.splice(i, 0, ids[id]);
                    listChat.splice(i, 0, allChat[ids[id]]);
                }
            }

            if (threeFirstChat.length < 3) {
                threeFirstChat.push(last?.send_date)
                threeFirstRoom.push(ids[id])
                listChat.push(allChat[ids[id]])
            }

            if (threeFirstChat.length > 3) {
                threeFirstChat.slice(0, 3)
                threeFirstRoom.slice(0, 3)
                listChat.slice(0, 3)
            }
        }

        //also load chat content in 3 room join the closest
        io.to(`${data.socket.id}`).emit("conversionContents", [listChat, threeFirstRoom]);

        data.socket.to(threeFirstRoom[0]).emit("newUserJoin", data.socket.userId);
    }
}

const getSessionID = function (id) {
    let Session = sessionStore.findSession(id)
    return Session?.sessionID || null
}

httpServer.listen(PORT, () =>
    console.log(`server listening at http://localhost:${PORT}`)
);