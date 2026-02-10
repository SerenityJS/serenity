import { BinaryStream, DataType } from "@serenityjs/binarystream";

class ServerTelemetryData extends DataType {
  /**
   * The unique identifier of the server instance.
   */
  public serverId: string;

  /**
   * The unique identifier of the scenario being executed.
   */
  public scenarioId: string;

  /**
   * The unique identifier of the world where the server is running.
   */
  public worldId: string;

  /**
   * The unique identifier of the owner of the server.
   */
  public ownerId: string;

  /**
   * Creates a new instance of ServerTelemetryData.
   * @param serverId The unique identifier of the server instance.
   * @param scenarioId The unique identifier of the scenario being executed.
   * @param worldId The unique identifier of the world where the server is running.
   * @param ownerId The unique identifier of the owner of the server.
   */
  public constructor(
    serverId: string,
    scenarioId: string,
    worldId: string,
    ownerId: string
  ) {
    super();
    this.serverId = serverId;
    this.scenarioId = scenarioId;
    this.worldId = worldId;
    this.ownerId = ownerId;
  }

  public static read(stream: BinaryStream): ServerTelemetryData {
    // Read each property from the binary stream
    const serverId = stream.readVarString();
    const scenarioId = stream.readVarString();
    const worldId = stream.readVarString();
    const ownerId = stream.readVarString();

    // Return a new instance of ServerTelemetryData
    return new this(serverId, scenarioId, worldId, ownerId);
  }

  public static write(stream: BinaryStream, value: ServerTelemetryData): void {
    // Write each property to the binary stream
    stream.writeVarString(value.serverId);
    stream.writeVarString(value.scenarioId);
    stream.writeVarString(value.worldId);
    stream.writeVarString(value.ownerId);
  }
}

export { ServerTelemetryData };
