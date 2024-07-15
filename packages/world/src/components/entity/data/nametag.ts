import { ActorDataId, ActorDataType } from "@serenityjs/protocol";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityNametagComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:nametag";

	public readonly key = ActorDataId.Name;

	public readonly type = ActorDataType.String;

	public defaultValue = this.entity.type.identifier as string;

	/**
	 * Creates a new entity nametag component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity nametag component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityNametagComponent.identifier);

		// Check if the entity is a player
		if (entity.isPlayer()) this.defaultValue = entity.username;

		// Set the entity to have a nametag
		this.setCurrentValue(this.defaultValue, false);
	}

	/**
	 * Gets the current value of the entity nametag component.
	 * @returns The current value of the entity nametag component.
	 */
	public getCurrentValue(): string {
		return super.getCurrentValue() as string;
	}

	/**
	 * Sets the current value of the entity nametag component.
	 *
	 * @param value The new value of the entity nametag component.
	 * @param sync Whether to synchronize the entity nametag component.
	 */
	public setCurrentValue(value: string, sync?: boolean): void {
		super.setCurrentValue(value, sync);
	}
}

export { EntityNametagComponent };
