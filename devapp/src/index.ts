import { Server } from "@serenityjs/raknet";

const server = new Server("0.0.0.0", 19132);

server.start();

console.log(`Raknet server started on ${server.address}:${server.port}`);

server.on("connect", (data) => {
  console.log(data);
});

setInterval(() => {}, 1);
