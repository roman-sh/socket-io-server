const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

let interval;
io.on('connection', socket => {
    console.log('New client connected');
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 10000);
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const city = 'Florence',
    apiKey = '5ce81ea3350724b0431026e887e45544';

const getApiAndEmit = async socket => {
    try {
        const res = await axios.get(
            //"https://api.darksky.net/forecast/0aca4f64a5c623b30a0f294726b6d650/43.7695,11.2558"
            `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
        ); // Getting the data from DarkSky
        //socket.emit("FromAPI", res.data.currently.temperature); // Emitting a new message. It will be consumed by the client
        socket.emit("FromAPI", res.data.main.temp);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};

server.listen(port, () => console.log(`Listening on port ${port}`));