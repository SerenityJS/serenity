import { Proto } from "@serenityjs/raknet";

import { AttributeLayerPayloadType, Packet } from "../../enums";
import {
  AttributeLayerData,
  AttributeLayerSettings,
  EnvironmentAttributeData
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientBoundAttributeLayerSync)
class ClientBoundAttributeLayerSyncPacket extends DataPacket {
  public payloadType!: AttributeLayerPayloadType;
  public layers!: Array<AttributeLayerData>;
  public layerName!: string;
  public dimensionId = 0;
  public settings!: AttributeLayerSettings | null;
  public environmentAttributes!: Array<EnvironmentAttributeData>;
  public removeAttributeNames!: Array<string>;

  public override serialize(): Buffer {
    this.writeVarInt(Packet.ClientBoundAttributeLayerSync);
    this.writeVarInt(this.payloadType);

    switch (this.payloadType) {
      case AttributeLayerPayloadType.UpdateLayers: {
        this.writeVarInt(this.layers.length);

        for (const layer of this.layers) {
          AttributeLayerData.write(this, layer);
        }
        break;
      }
      case AttributeLayerPayloadType.UpdateSettings: {
        this.writeLayerTarget();
        AttributeLayerSettings.write(
          this,
          this.settings ?? new AttributeLayerSettings(0, 0, false, false)
        );
        break;
      }
      case AttributeLayerPayloadType.UpdateEnvironment: {
        this.writeLayerTarget();
        this.writeVarInt(this.environmentAttributes.length);

        for (const attribute of this.environmentAttributes) {
          EnvironmentAttributeData.write(this, attribute);
        }
        break;
      }
      case AttributeLayerPayloadType.RemoveEnvironment: {
        this.writeLayerTarget();
        this.writeVarInt(this.removeAttributeNames.length);

        for (const name of this.removeAttributeNames) {
          this.writeVarString(name);
        }
        break;
      }
      default: {
        throw new Error(`Unknown attribute layer payload type: ${this.payloadType}`);
      }
    }

    return this.getBuffer();
  }

  public override deserialize(): this {
    this.readVarInt();
    this.payloadType = this.readVarInt();

    switch (this.payloadType) {
      case AttributeLayerPayloadType.UpdateLayers: {
        const amount = this.readVarInt();
        this.layers = [];

        for (let i = 0; i < amount; i++) {
          this.layers.push(AttributeLayerData.read(this));
        }
        break;
      }
      case AttributeLayerPayloadType.UpdateSettings: {
        this.readLayerTarget();
        this.settings = AttributeLayerSettings.read(this);
        break;
      }
      case AttributeLayerPayloadType.UpdateEnvironment: {
        this.readLayerTarget();
        const amount = this.readVarInt();
        this.environmentAttributes = [];

        for (let i = 0; i < amount; i++) {
          this.environmentAttributes.push(EnvironmentAttributeData.read(this));
        }
        break;
      }
      case AttributeLayerPayloadType.RemoveEnvironment: {
        this.readLayerTarget();
        const amount = this.readVarInt();
        this.removeAttributeNames = [];

        for (let i = 0; i < amount; i++) {
          this.removeAttributeNames.push(this.readVarString());
        }
        break;
      }
      default: {
        throw new Error(`Unknown attribute layer payload type: ${this.payloadType}`);
      }
    }

    return this;
  }

  private readLayerTarget(): void {
    this.layerName = this.readVarString();
    this.dimensionId = this.readZigZag();
  }

  private writeLayerTarget(): void {
    this.writeVarString(this.layerName);
    this.writeZigZag(this.dimensionId);
  }
}

export { ClientBoundAttributeLayerSyncPacket };
