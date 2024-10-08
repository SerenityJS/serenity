import { Server } from "@serenityjs/raknet";

interface ServerProperties {
  port: number;
  address: string;
}

const DefaultProperties: ServerProperties = {
  port: 19132,
  address: "0.0.0.0"
};

class Serenity {
  public readonly properties: ServerProperties = DefaultProperties;

  public readonly raknet: Server;

  public constructor(properties?: Partial<ServerProperties>) {
    this.properties = { ...DefaultProperties, ...properties };

    this.raknet = new Server(this.properties.address, this.properties.port);
  }
}

export { Serenity };
