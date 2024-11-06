import { Attribute, AttributeName } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";

import { PlayerTrait } from "./trait";

class PlayerExhaustionTrait extends PlayerTrait {
  public static readonly identifier = "exhaustion";

  public static readonly types = [EntityIdentifier.Player];

  public onSpawn(): void {
    if (this.entity.attributes.has(AttributeName.PlayerExhaustion)) return;
    this.entity.attributes.set(
      AttributeName.PlayerExhaustion,
      new Attribute(0, 5, 0, 0, 5, 0, AttributeName.PlayerExhaustion, [])
    );
  }

  public get exhaustion(): number {
    return this.entity.attributes.get(AttributeName.PlayerExhaustion)!.current;
  }

  public set exhaustion(value: number) {
    this.entity.attributes.get(AttributeName.PlayerExhaustion)!.current = value;
  }
}

export { PlayerExhaustionTrait };
