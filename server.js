const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

var nodeMailer=require("nodemailer");
const { error, info } = require("console");
const transporter=nodeMailer.createTransport({
    port:587,
    host:"smtp.gmail.com",
    auth:{
        user:"vimala5042@gmail.com",
        pass:"msiozzmoizamlsuk"
    },
    secure:true
})

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/send-mail",(req,res)=>{
    const to=req.body.to
    const url = req.body.url
    const maildata={
        from : "vimala5042@gmail.com",
        to:to,
        subject:"Join the video chat",
        html:`<p>Hey There,</p><p> Join the video chat and have fun in chatting-${url}</p>`
    }
    transporter.sendMail(maildata,(error,info)=>{
        if(error){
            return console.log(error)
        }
        res.status(200).send({
            message:"Invitation sent",
            messageid:info.messageId
        })
    })
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected",userId)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(3030);