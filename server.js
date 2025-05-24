const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001; 

const usersLocation = {};

io.on('connection', (socket) => {
    console.log('Пользователь подключился:', socket.id);

    socket.on('updateLocation', (data) => {
        const { userId, lat, lng } = data;
        usersLocation[userId] = { lat, lng, socketId: socket.id };
        console.log(`Местоположение ${userId}: ${lat}, ${lng}`);

        io.emit('friendsLocationUpdate', usersLocation);
    });

    socket.emit('friendsLocationUpdate', usersLocation);

    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
        // Удаляем пользователя из списка при отключении
        for (const userId in usersLocation) {
            if (usersLocation[userId].socketId === socket.id) {
                delete usersLocation[userId];
                break;
            }
        }
        io.emit('friendsLocationUpdate', usersLocation);
    });
});

server.listen(PORT, () => {
    console.log(`Сервер Socket.IO запущен на порту ${PORT}`);
});
