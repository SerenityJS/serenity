import { Attribute, AttributeName } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";

import { PlayerTrait } from "./trait";

class PlayerSaturationTrait extends PlayerTrait {
  public static readonly identifier = "saturation";

  public static readonly types = [EntityIdentifier.Player];

  public onSpawn(): void {
    if (this.entity.attributes.has(AttributeName.PlayerSaturation)) return;
    this.entity.attributes.set(
      AttributeName.PlayerSaturation,
      new Attribute(0, 20, 20, 0, 20, 20, AttributeName.PlayerSaturation, [])
    );
  }

  public get saturation(): number {
    return this.entity.attributes.get(AttributeName.PlayerSaturation)!.current;
  }

  public set saturation(value: number) {
    this.entity.attributes.get(AttributeName.PlayerSaturation)!.current = value;
  }
}

export { PlayerSaturationTrait };
