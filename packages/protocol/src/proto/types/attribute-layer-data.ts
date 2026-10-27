import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { AttributeLayerSettings } from "./attribute-layer-settings";
import { EnvironmentAttributeData } from "./environment-attribute-data";

class AttributeLayerData extends DataType {
  public name: string;
  public dimensionId: number;
  public settings: AttributeLayerSettings;
  public environmentAttributes: Array<EnvironmentAttributeData>;

  public constructor(
    name: string,
    dimensionId: number,
    settings: AttributeLayerSettings,
    environmentAttributes: Array<EnvironmentAttributeData>
  ) {
    super();
    this.name = name;
    this.dimensionId = dimensionId;
    this.settings = settings;
    this.environmentAttributes = environmentAttributes;
  }

  public static read(stream: BinaryStream): AttributeLayerData {
    const name = stream.readVarString();
    const dimensionId = stream.readZigZag();
    const settings = AttributeLayerSettings.read(stream);
    const amount = stream.readVarInt();
    const environmentAttributes: Array<EnvironmentAttributeData> = [];

    for (let i = 0; i < amount; i++) {
      environmentAttributes.push(EnvironmentAttributeData.read(stream));
    }

    return new this(name, dimensionId, settings, environmentAttributes);
  }

  public static write(stream: BinaryStream, value: AttributeLayerData): void {
    stream.writeVarString(value.name);
    stream.writeZigZag(value.dimensionId);
    AttributeLayerSettings.write(stream, value.settings);
    stream.writeVarInt(value.environmentAttributes.length);

    for (const attribute of value.environmentAttributes) {
      EnvironmentAttributeData.write(stream, attribute);
    }
  }
}

export { AttributeLayerData };
