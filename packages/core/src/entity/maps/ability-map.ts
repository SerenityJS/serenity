import {
  AbilityIndex,
  AbilityLayerType,
  AbilitySet,
  UpdateAbilitiesPacket
} from "@serenityjs/protocol";

import { Player } from "../player";

class AbilityMap extends Map<AbilityIndex, boolean> {
  /**
   * The player that the abilities are attached to
   */
  protected readonly player: Player;

  /**
   * Create a new ability map
   * @param player The player that the abilities are attached to
   */
  public constructor(player: Player) {
    super();
    this.player = player;
  }

  public set(key: AbilityIndex, value: boolean): this {
    // Call the original set method
    const result = super.set(key, value);

    // Update the abilities when a new value is added
    this.update();

    // Return the result
    return result;
  }

  public delete(key: AbilityIndex): boolean {
    // Call the original delete method
    const result = super.delete(key);

    // Update the abilities when a value is deleted
    this.update();

    // Return the result
    return result;
  }

  public clear(): void {
    // Call the original clear method
    super.clear();

    // Update the abilities when the map is cleared
    this.update();
  }

  /**
   * Call the original set method
   * @param key The ability index
   * @param value The value
   * @returns The ability map
   */
  public superSet(key: AbilityIndex, value: boolean): this {
    // Call the original set method
    return super.set(key, value);
  }

  /**
   * Update the abilities of the player
   */
  public update(): void {
    // Create a new UpdateAbilitiesPacket
    const packet = new UpdateAbilitiesPacket();
    packet.permissionLevel = this.player.permission;
    packet.commandPermissionLevel = this.player.permission === 2 ? 1 : 0;
    packet.entityUniqueId = this.player.uniqueId;
    packet.abilities = [
      {
        type: AbilityLayerType.Base,
        abilities: [...this.player.abilities.entries()].map(
          ([ability, value]) => new AbilitySet(ability, value)
        ),
        walkSpeed: 0.1,
        flySpeed: 0.05
      }
    ];

    // Send the packet to the player
    this.player.dimension.broadcast(packet);
  }
}

export { AbilityMap };
