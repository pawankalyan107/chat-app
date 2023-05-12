import express from 'express'
import http from 'http'
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import path from 'path';
import { generateMessage, generateLocationMessage } from './utils/msgs.js';
import { addUser, getUser, getUsersInRoom, removeUser } from './utils/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const server = http.createServer(app)
const io = new Server(server);

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

const WelcomeMessage = 'Welcome to the Chat App'

io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  socket.on('join', (options, cb) => {
    const { error, user } = addUser({ id: socket.id, ...options })
    if (error) {
      return cb(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Admin', WelcomeMessage))
    socket.broadcast.to(user.room).emit('message', generateMessage(user.userName, `${user.userName} has joined!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    cb()
  })

  socket.on('clientMessage', (data, cb) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('message', generateMessage(user.userName, data))
    cb('Delivered')
  })

  socket.on('location', (coords, cb) => {
    const user = getUser(socket.id)
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.userName, `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`))
    cb('Location shared!')
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage(user.userName, `${user.userName} has left`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log(`server is up on port ${port}`)
})
