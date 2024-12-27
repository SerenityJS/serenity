import { Proto, Serialize } from "@serenityjs/raknet";
import {
  Bool,
  Int8,
  VarString,
  ZigZag,
  ZigZong
} from "@serenityjs/binarystream";

import { ContainerId, ContainerType, Packet } from "../../enums";
import { TradeOffer } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateTrade)
class UpdateTradePacket extends DataPacket {
  @Serialize(Int8)
  public windowId!: ContainerId;

  @Serialize(Int8)
  public containerType!: ContainerType;

  @Serialize(ZigZag)
  public size!: number;

  @Serialize(ZigZag)
  public tradeTier!: number;

  @Serialize(ZigZong)
  public tradeActorUnique!: bigint;

  @Serialize(ZigZong)
  public playerTradingUnique!: bigint;

  @Serialize(VarString)
  public displayName!: string;

  @Serialize(Bool)
  public useNewUI!: boolean;

  @Serialize(Bool)
  public economyTrade!: boolean;

  @Serialize(TradeOffer)
  public offers!: Array<TradeOffer>;
}

export { UpdateTradePacket };
