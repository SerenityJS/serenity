import { ActorDamageCause, Gamemode } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";

class EntityDamageComponent extends EntityComponent {
	public static readonly identifier = "minecraft:damaging";

	public static types: Array<EntityIdentifier> = [EntityIdentifier.Player];

	public constructor(entity: Entity) {
		super(entity, EntityDamageComponent.identifier);
	}

	public onTick(): void {
		if (this.isBelowWorld() && this.entity.getWorld().currentTick % 10n == 0n) {
			if (!this.entity.isAlive) return;
			if (this.entity.isPlayer() && this.entity.gamemode == Gamemode.Creative)
				return;
			// ? Apply damage if is below dimension bounds
			this.entity.applyDamage(4, ActorDamageCause.Void);
		}
	}

	public isBelowWorld(): boolean {
		return this.entity.position.y < this.entity.dimension.bounds.min - 12;
	}
}

export { EntityDamageComponent };
