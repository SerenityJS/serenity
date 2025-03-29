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
import { AsyncMap } from "../../utility/async-map";

class AbilityMap extends AsyncMap<AbilityIndex, boolean> {
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
   * @deprecated Use setBuild instead. Errors will be lost if you use this.
   */
  public set build(value: boolean) {
    void this.setBuild(value);
  }

  /**
   * Whether the player can build
   */
  public async setBuild(value: boolean) {
    return this.set(AbilityIndex.Build, value);
  }

  /**
   * Whether the player can mine
   */
  public get mine(): boolean {
    return this.get(AbilityIndex.Mine) ?? false;
  }

  /**
   * Whether the player can mine
   * @deprecated Use setMine instead. Errors will be lost if you use this.
   */
  public set mine(value: boolean) {
    void this.setMine(value);
  }

  /**
   * Whether the player can mine
   */
  public async setMine(value: boolean) {
    return this.set(AbilityIndex.Mine, value);
  }

  /**
   * Whether the player can interact with doors and switches
   */
  public get doorsAndSwitches(): boolean {
    return this.get(AbilityIndex.DoorsAndSwitches) ?? false;
  }

  /**
   * Whether the player can interact with doors and switches
   * @deprecated Use setDoorsAndSwitches instead. Errors will be lost if you use this.
   */
  public set doorsAndSwitches(value: boolean) {
    void this.setDoorsAndSwitches(value);
  }

  /**
   * Whether the player can interact with doors and switches
   */
  public async setDoorsAndSwitches(value: boolean) {
    return this.set(AbilityIndex.DoorsAndSwitches, value);
  }

  /**
   * Whether the player can open containers
   */
  public get openContainers(): boolean {
    return this.get(AbilityIndex.OpenContainers) ?? false;
  }

  /**
   * Whether the player can open containers
   * @deprecated Use setOpenContainers instead. Errors will be lost if you use this.
   */
  public set openContainers(value: boolean) {
    void this.setOpenContainers(value);
  }

  /**
   * Whether the player can open containers
   */
  public async setOpenContainers(value: boolean) {
    return this.set(AbilityIndex.OpenContainers, value);
  }

  /**
   * Whether the player can attack players
   */
  public get attackPlayers(): boolean {
    return this.get(AbilityIndex.AttackPlayers) ?? false;
  }

  /**
   * Whether the player can attack players
   * @deprecated Use setAttackPlayers instead. Errors will be lost if you use this.
   */
  public set attackPlayers(value: boolean) {
    void this.setAttackPlayers(value);
  }

  /**
   * Whether the player can attack players
   */
  public async setAttackPlayers(value: boolean) {
    return this.set(AbilityIndex.AttackPlayers, value);
  }

  /**
   * Whether the player can attack mobs
   */
  public get attackMobs(): boolean {
    return this.get(AbilityIndex.AttackMobs) ?? false;
  }

  /**
   * Whether the player can attack mobs
   * @deprecated Use setAttackMobs instead. Errors will be lost if you use this.
   */
  public set attackMobs(value: boolean) {
    void this.setAttackMobs(value);
  }

  /**
   * Whether the player can attack mobs
   */
  public async setAttackMobs(value: boolean) {
    return this.set(AbilityIndex.AttackMobs, value);
  }

  /**
   * Whether the player can use operator commands
   */
  public get operatorCommands(): boolean {
    return this.get(AbilityIndex.OperatorCommands) ?? false;
  }

  /**
   * Whether the player can use operator commands
   * @deprecated Use setOperatorCommands instead. Errors will be lost if you use this.
   */
  public set operatorCommands(value: boolean) {
    void this.setOperatorCommands(value);
  }

  /**
   * Whether the player can use operator commands
   */
  public async setOperatorCommands(value: boolean) {
    return this.set(AbilityIndex.OperatorCommands, value);
  }

  /**
   * Whether the player can teleport
   */
  public get mayFly(): boolean {
    return this.get(AbilityIndex.MayFly) ?? false;
  }

  /**
   * Whether the player can teleport
   * @deprecated Use setMayFly instead. Errors will be lost if you use this.
   */
  public set mayFly(value: boolean) {
    void this.setMayFly(value);
  }

  /**
   * Whether the player can teleport
   */
  public async setMayFly(value: boolean) {
    return this.set(AbilityIndex.MayFly, value);
  }

  /**
   * Create a new ability map
   * @param player The player that the abilities are attached to
   */
  public constructor(player: Player) {
    super();
    this.player = player;
  }

  public async set(key: AbilityIndex, value: boolean): Promise<this> {
    // Create a new PlayerAbilityUpdateSignal
    const signal = new PlayerAbilityUpdateSignal(this.player, key, value);

    // If the signal was cancelled, return this
    if (!(await signal.emit())) return this;

    // Call the original set method
    await super.set(key, signal.value);

    // Update the abilities when a new value is added
    await this.update();

    // Return the result
    return this;
  }

  public async delete(key: AbilityIndex): Promise<boolean> {
    // Call the original delete method
    const result = super.delete(key);

    // Update the abilities when a value is deleted
    await this.update();

    // Return the result
    return result;
  }

  public async clear(): Promise<void> {
    // Call the original clear method
    await super.clear();

    // Update the abilities when the map is cleared
    return this.update();
  }

  /**
   * Update the abilities of the player
   */
  public async update(): Promise<void> {
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
        type: AbilityLayerType.Base,
        abilities: [...this.player.abilities.entries()].map(
          ([ability, value]) => new AbilitySet(ability, value)
        ),
        walkSpeed: 0.1,
        verticalFlySpeed: 1,
        flySpeed: 0.05
      }
    ];

    // Send the packet to the player
    await this.player.dimension.broadcast(packet);

    // Check if the player is alive
    if (!this.player.isAlive) return;

    // Create a new SetPlayerGameTypePacket
    const gamemode = new SetPlayerGameTypePacket();
    gamemode.gamemode = this.player.gamemode;

    // Send the gamemode packet to the player
    return this.player.send(gamemode);
  }
}

export { AbilityMap };
