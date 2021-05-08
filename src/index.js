const app = require('./app')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const port = process.env.PORT | 3000

const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

 
    // Join Socket Connection
    socket.on('join', ({ username, room }, callback) => {
        // socket.emit, io.emit, socket.broadcast.emit
        const { error, user } = addUser({ id:socket.id, username, room })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))

        // io.to.emit, socket.broadcast.to.emit  --> communiucate members' room
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        // listing users in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback() 
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('messages', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))

            // listing users int he room after someone has left
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })
})

server.listen(port, () => {
    console.log(`Server is on port ${port}`)
})