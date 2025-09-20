import {
  AbilityIndex,
  AbilityLayerType,
  AbilitySet,
  CommandPermissionLevel,
  PermissionLevel,
  SetPlayerGameTypePacket,
  UpdateAbilitiesPacket
} from "@serenityjs/protocol";

import { Player } from "../player";
import { PlayerAbilityUpdateSignal } from "../../events";

class AbilityMap extends Map<AbilityIndex, boolean> {
  /**
   * The player that the abilities are attached to
   */
  protected readonly player: Player;

  /**
   * Whether the player can build
   */
  public get build(): boolean {
    return this.get(AbilityIndex.Build) ?? false;
  }

  /**
   * Whether the player can build
   */
  public set build(value: boolean) {
    this.set(AbilityIndex.Build, value);
  }

  /**
   * Whether the player can mine
   */
  public get mine(): boolean {
    return this.get(AbilityIndex.Mine) ?? false;
  }

  /**
   * Whether the player can mine
   */
  public set mine(value: boolean) {
    this.set(AbilityIndex.Mine, value);
  }

  /**
   * Whether the player can interact with doors and switches
   */
  public get doorsAndSwitches(): boolean {
    return this.get(AbilityIndex.DoorsAndSwitches) ?? false;
  }

  /**
   * Whether the player can interact with doors and switches
   */
  public set doorsAndSwitches(value: boolean) {
    this.set(AbilityIndex.DoorsAndSwitches, value);
  }

  /**
   * Whether the player can open containers
   */
  public get openContainers(): boolean {
    return this.get(AbilityIndex.OpenContainers) ?? false;
  }

  /**
   * Whether the player can open containers
   */
  public set openContainers(value: boolean) {
    this.set(AbilityIndex.OpenContainers, value);
  }

  /**
   * Whether the player can attack players
   */
  public get attackPlayers(): boolean {
    return this.get(AbilityIndex.AttackPlayers) ?? false;
  }

  /**
   * Whether the player can attack players
   */
  public set attackPlayers(value: boolean) {
    this.set(AbilityIndex.AttackPlayers, value);
  }

  /**
   * Whether the player can attack mobs
   */
  public get attackMobs(): boolean {
    return this.get(AbilityIndex.AttackMobs) ?? false;
  }

  /**
   * Whether the player can attack mobs
   */
  public set attackMobs(value: boolean) {
    this.set(AbilityIndex.AttackMobs, value);
  }

  /**
   * Whether the player can use operator commands
   */
  public get operatorCommands(): boolean {
    return this.get(AbilityIndex.OperatorCommands) ?? false;
  }

  /**
   * Whether the player can use operator commands
   */
  public set operatorCommands(value: boolean) {
    this.set(AbilityIndex.OperatorCommands, value);
  }

  /**
   * Whether the player can teleport
   */
  public get mayFly(): boolean {
    return this.get(AbilityIndex.MayFly) ?? false;
  }

  /**
   * Whether the player can teleport
   */
  public set mayFly(value: boolean) {
    this.set(AbilityIndex.MayFly, value);
  }

  /**
   * Create a new ability map
   * @param player The player that the abilities are attached to
   */
  public constructor(player: Player) {
    super();
    this.player = player;
  }

  public set(key: AbilityIndex, value: boolean): this {
    // Create a new PlayerAbilityUpdateSignal
    const signal = new PlayerAbilityUpdateSignal(this.player, key, value);

    // If the signal was cancelled, return this
    if (!signal.emit()) return this;

    // Call the original set method
    const result = super.set(key, signal.value);

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
    packet.permissionLevel = this.player.isOp
      ? PermissionLevel.Operator
      : PermissionLevel.Member;

    packet.commandPermissionLevel = this.player.isOp
      ? CommandPermissionLevel.Operator
      : CommandPermissionLevel.Normal;

    packet.entityUniqueId = this.player.uniqueId;
    packet.abilities = [
      {
        type: AbilityLayerType.Commands,
        abilities: [...this.player.abilities.entries()].map(
          ([ability, value]) => new AbilitySet(ability, value)
        ),
        walkSpeed: 0.1,
        verticalFlySpeed: 1,
        flySpeed: 0.05
      }
    ];

    // Send the packet to the player
    this.player.dimension.broadcast(packet);

    // Check if the player is alive
    if (!this.player.isAlive) return;

    // Create a new SetPlayerGameTypePacket
    const gamemode = new SetPlayerGameTypePacket();
    gamemode.gamemode = this.player.gamemode;

    // Send the gamemode packet to the player
    this.player.send(gamemode);
  }
}

export { AbilityMap };
