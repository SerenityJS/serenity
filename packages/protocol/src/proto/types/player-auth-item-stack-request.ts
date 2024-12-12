import { DataType } from "@serenityjs/raknet";
import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { InputData } from "../../enums";

import { ItemStackRequest } from "./item-stack-request";
import { ItemStackRequestAction } from "./item-stack-request-action";

import type { PlayerAuthInputData } from "./player-auth-input-data";

class PlayerAuthItemStackRequest extends DataType {
  /**
   * The item stack request id.
   */
  public readonly clientRequestId: number;

  /**
   * The item stack request actions.
   */
  public readonly actions: Array<ItemStackRequestAction>;

  /**
   * The filter strings of the item stack request.
   */
  public readonly filterStrings: Array<string>;

  /**
   * The origin of the strings filter.
   */
  public readonly stringsFilterOrigin: number;

  /**
   * Creates a new instance of ItemStackRequest.
   * @param clientRequestId - The item stack request id.
   * @param actions - The item stack request actions.
   * @param filterStrings - The filter strings of the item stack request.
   * @param stringsFilterOrigin - The origin of the strings filter.
   */
  public constructor(
    clientRequestId: number,
    actions: Array<ItemStackRequestAction>,
    filterStrings: Array<string>,
    stringsFilterOrigin: number
  ) {
    super();
    this.clientRequestId = clientRequestId;
    this.actions = actions;
    this.filterStrings = filterStrings;
    this.stringsFilterOrigin = stringsFilterOrigin;
  }

  public static read(
    stream: BinaryStream,
    _: unknown,
    data: PlayerAuthInputData
  ): PlayerAuthItemStackRequest | null {
    // Check if the input data has the block actions flag
    if (!data.hasFlag(InputData.PerformItemStackRequest)) return null;

    // Read the client request id.
    const clientRequestId = stream.readZigZag();

    // Read the actions.
    const actions = new Array<ItemStackRequestAction>();
    const actionsCount = stream.readVarInt();
    for (let index = 0; index < actionsCount; index++) {
      actions.push(ItemStackRequestAction.read(stream));
    }

    // Read the filter strings.
    const filterStrings = new Array<string>();
    const filterStringsCount = stream.readVarInt();
    for (let index = 0; index < filterStringsCount; index++) {
      filterStrings.push(stream.readVarString());
    }

    // Read the strings filter origin.
    const stringsFilterOrigin = stream.readInt32(Endianness.Little);

    return new this(
      clientRequestId,
      actions,
      filterStrings,
      stringsFilterOrigin
    );
  }

  public static write(
    stream: BinaryStream,
    value: ItemStackRequest,
    _: unknown,
    data: PlayerAuthInputData
  ): void {
    // Check if the input data has the block actions flag
    if (!data.hasFlag(InputData.PerformItemStackRequest)) return;

    // Write the client request id.
    stream.writeZigZag(value.clientRequestId);

    // Write the amount of actions.
    stream.writeVarInt(value.actions.length);

    // Iterate through the actions.
    for (const action of value.actions) {
      // Write the action.
      ItemStackRequestAction.write(stream, action);
    }

    // Write the amount of filter strings.
    stream.writeVarInt(value.filterStrings.length);
  }
}

export { PlayerAuthItemStackRequest };
