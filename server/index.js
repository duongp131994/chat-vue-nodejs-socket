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
        await modelConversion.insertInto({name: 'Welcome', users: 1})
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
    if (socket.error) {
        socket.join(randomId);
        socket.emit('error-connection', {
            error: socket.error
        })
        socket.disconnect(true)
        return false;
    }

    //saving session
    console.log('connection!')

    if (socket.newUser) {
        console.log(`new user connection`);
        const user = await modelUser.insertUser({userName:socket.username, password:socket.cryptoPassword})
        socket.userId = user.insertId;
        socket.date = Date.now();
        socket.params = {
            conversion: [1]
        };
        console.log(`new user connection :${socket.userId}`);
    }


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

    //conversionContents details
    if (!socket.params?.conversion) {
        socket.emit("conversionContents", []);
    } else {
        await getConversionsContents({socket, ids: socket.params?.conversion, limit: 30});
    }

    //conversion details
    if (!socket.params?.conversion) {
        socket.emit("conversion-details", []);
    } else {
        await getConversions({socket, ids: socket.params?.conversion});
    }

    // forward the private message to the right recipient
    //to: conversion id
    //from: current id
    socket.on("private message", ({ content, to }) => {
        console.log(content, to, socket.userId)
        let date = Date.now();
        let chatContent = modelContent.insertContent({content:content, date:date, conversion_id: to, user_id:socket.userId})
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
        console.log('disconnect' + socket.userId)
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

const getConversions = async function (data) {
    const listConversions = [];
    let ids = data.ids || []

    if (ids.length > 0) {
        for (let id in ids) {
            let conversion = await modelConversion.selectConversion({id: ids[id]}) || []
            listConversions.push(conversion[0] || []);
        }
    }

    data.socket.emit("conversion-details", listConversions);
}
const getConversionsContents = async function (data) {
    const listChat = {};
    var firstChat = [];
    let ids = data.ids || []
    let date = data.date || 0
    let minDate = data.min || 0
    let limit = data.limit || 30
    let firstRoom = 1
    if (ids.length > 0) {
        for (let id in ids) {
            if (date > 0) {
                listChat[ids[id]] = await modelContent.selectAllInConversionTime({conversionId:ids[id], date, minDate})
            } else {
                listChat[ids[id]] = await modelContent.selectAllInConversionLimit({conversionId:ids[id], limit})
            }
            listChat[ids[id]] = listChat[ids[id]] || [];
            let last = listChat[ids[id]].at(-1) || null;
            if (firstChat.length > 0) {
                if (last?.send_date > firstChat[1]) {
                    firstChat = [ids[id], last?.send_date]
                    firstRoom = ids[id]
                }
            } else {
                firstChat = [ids[id], last?.send_date]
                firstRoom = ids[id]
            }
        }
    }

    //join room
    console.log(data.socket.userId);
    data.socket.join(firstRoom);

    data.socket.emit("conversionContents", [listChat, firstChat]);
}

httpServer.listen(PORT, () =>
    console.log(`server listening at http://localhost:${PORT}`)
);