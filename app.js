import express from 'express'
import http from 'http'
import {Server} from 'socket.io'
import { spawn } from "child_process";

import dotenv from 'dotenv'
import path from 'path'
dotenv.config()
const app = express()

const server = http.createServer(app)

const io = new Server(server,{
    cors: {
        origin: "*",
        credentials: true
    }
})

app.use(express.static(path.resolve("./public")))

const options = [
    '-re',
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-maxrate', '3000k',
    '-bufsize', '6000k',
    '-pix_fmt', 'yuv420p',
    '-g', '50',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '44100',
    '-f', 'flv',
    'rtmp://live.twitch.tv/app/live_1242670328_d7wFw0QAtRDdekArXlaaXyvCnjsuSC'
];

const ffmpegProcess = spawn('ffmpeg',options)

ffmpegProcess.stdout.on("data",function(data) {
    console.log(`Data Coming: ${data}`)
})

ffmpegProcess.stderr.on('error',function(error) {
    console.log(`Error is ${error}`)
})

ffmpegProcess.on('close',function(code) {
    console.log(`ffmpeg process closed with code ${code}`)
})

io.on("connection",function(socket) {
    console.log(`Connected ${socket.id}`)

    socket.on("binaryStream",function(data) {
        console.log("Binary Stream Incoming")

        if (ffmpegProcess.stdin.writable) {
            ffmpegProcess.stdin.write(data, err => {
                if (err) {
                    console.log("Error", err)
                }
            })
        } else {
            console.log("ffmpegProcess.stdin is not writable")
        }
    })

    socket.on("disconnect",function() {
        console.log(`Disconnected ${socket.id}`)
    })
})

app.get("/",function(req,res) {
    res.sendFile("index.html")
})


const port = process.env.PORT || 4000
server.listen(port,function() {
    console.log(`Server is running on port ${port}`)
})