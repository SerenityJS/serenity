import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { ItemStackResponseResult } from "../../enums";

import { ItemStackResponseContainerInfo } from "./item-stack-response-container-info";

class ItemStackResponseInfo extends DataType {
  /**
   * The status of the item stack response.
   */
  public result: ItemStackResponseResult;

  /**
   * The id of the client request.
   */
  public clientRequestId: number;

  /**
   * The containers associated with this response.
   */
  public containers?: Array<ItemStackResponseContainerInfo>;

  /**
   * Creates a new ItemStackResponseInfo instance.
   * @param result The status of the item stack response.
   * @param clientRequestId The id of the client request.
   * @param containers The containers associated with this response.
   */
  public constructor(
    result: ItemStackResponseResult,
    clientRequestId: number,
    containers?: Array<ItemStackResponseContainerInfo>
  ) {
    super();
    this.result = result;
    this.clientRequestId = clientRequestId;
    this.containers = containers;
  }

  public static read(stream: BinaryStream): Array<ItemStackResponseInfo> {
    // Prepare an array to store the responses.
    const responses: Array<ItemStackResponseInfo> = [];

    // Read the number of responses.
    const responseCount = stream.readVarInt();

    // Loop through the number of responses.
    for (let i = 0; i < responseCount; i++) {
      // Read the result.
      const result = stream.readUint8() as ItemStackResponseResult;

      // Read the client request id.
      const clientRequestId = stream.readZigZag();

      // Prepare an array to store the containers.
      const containers: Array<ItemStackResponseContainerInfo> = [];

      // Check if the result is Success.
      if (result === ItemStackResponseResult.Success) {
        // Read the number of containers.
        const containerCount = stream.readVarInt();

        // Loop through the number of containers.
        for (let j = 0; j < containerCount; j++) {
          // Read the container info and add it to the array.
          const containerInfo = ItemStackResponseContainerInfo.read(stream);
          containers.push(containerInfo);
        }
      }

      // Create a new ItemStackResponseInfo instance and add it to the array.
      const response = new this(
        result,
        clientRequestId,
        containers.length > 0 ? containers : undefined
      );
      responses.push(response);
    }

    // Return the array of responses.
    return responses;
  }

  public static write(
    stream: BinaryStream,
    value: Array<ItemStackResponseInfo>
  ): void {
    // Write the number of responses.
    stream.writeVarInt(value.length);

    // Loop through the responses.
    for (const response of value) {
      // Write the result.
      stream.writeUint8(response.result);

      // Write the client request id.
      stream.writeZigZag(response.clientRequestId);

      // Check if the result is Success and containers exist.
      if (
        response.result === ItemStackResponseResult.Success &&
        response.containers
      ) {
        // Write the number of containers.
        stream.writeVarInt(response.containers.length);

        // Loop through the containers and write each one.
        for (const container of response.containers) {
          ItemStackResponseContainerInfo.write(stream, container);
        }
      }
    }
  }
}

export { ItemStackResponseInfo };
