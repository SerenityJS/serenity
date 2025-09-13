import { Client } from "@serenityjs/raknet";

const client = new Client({
  address: "127.0.0.1",
  port: 19132,
  mtu: 1492,
  tickRate: 20,
  timeout: 30000,
});

client.on("connect", () => {
  client.logger.info("Connected to server");
});
client.on("encapsulated", (packet) => {
  client.logger.info("Encapsulated packet received:", packet);
});

client.connect();
