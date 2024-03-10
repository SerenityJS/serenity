import { RaknetServer } from "@serenityjs/raknet";
const server = new RaknetServer("127.0.0.1", 19_132);
server.start();

server.on("connect", (connection) => {
	console.log(`Player connected: ${connection.identifier}`);
});

server.on("disconnect", (connection) => {
	console.log(`Player disconnected: ${connection.identifier}`);
});

server.on("encapsulated", (connection, buffer) => {
	console.log(buffer);
});

server.on("error", (error) => {
	console.log(error.message);
});
