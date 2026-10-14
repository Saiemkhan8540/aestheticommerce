const http = require("http");
const {Server} = require("socket.io");
const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./db/db");
const { initBadgeCron } = require("./jobs/badgeCron");
dotenv.config();

async function startServer(){
  await connectDB();

  // Initialize Badge Automation Cron Job
  initBadgeCron();

  // Start server (Render will provide PORT)
  const PORT = process.env.PORT || 3000;
  
  const server = http.createServer(app);

  const io = new Server(server,{
    cors: {
      origin: "*",
    },
  })


global.io = io ;

global.riderToSocket = new Map();
global.socketToRider = new Map();

io.on("connection",(socket) =>{
  console.log("New socket connected :",socket.id);

  socket.on("registerRider",(riderId)=>{
    riderToSocket.set(riderId, socket.id);
    socketToRider.set(socket.id, riderId);
    console.log("Rider online :" ,riderId);
  });

  socket.on("disconnect",()=>{
    const riderId = socketToRider.get(socket.id);

  if (riderId) {
    riderToSocket.delete(riderId);
    socketToRider.delete(socket.id);
    console.log("Rider offline:", riderId);
  }
  }); 
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().then(() => {
  console.log("Server started successfully after DB connection");
}).catch((error) => {
  console.error("Failed to start server:", error);
});