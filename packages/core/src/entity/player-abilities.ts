import {
  AbilityIndex,
  AbilityLayer,
  AbilityLayerType,
  AbilitySet,
  CommandPermissionLevel,
  DefaultAbilityValues,
  Gamemode,
  PermissionLevel,
  SetPlayerGameTypePacket,
  UpdateAbilitiesPacket
} from "@serenityjs/protocol";
import { ByteTag, CompoundTag, FloatTag } from "@serenityjs/nbt";

import { Player } from "./player";

const AbilityNameToIndex: Record<string, AbilityIndex> = {
  operatorcommands: AbilityIndex.OperatorCommands,
  teleport: AbilityIndex.Teleport,
  invulnerable: AbilityIndex.Invulnerable,
  flying: AbilityIndex.Flying,
  mayfly: AbilityIndex.MayFly,
  instabuild: AbilityIndex.InstantBuild,
  lightning: AbilityIndex.Lightning,
  flyspeed: AbilityIndex.FlySpeed,
  walkspeed: AbilityIndex.WalkSpeed,
  muted: AbilityIndex.Muted,
  worldbuilder: AbilityIndex.WorldBuilder,
  noclip: AbilityIndex.NoClip,
  privilegedbuilder: AbilityIndex.PrivilegedBuilder,
  verticalflyspeed: AbilityIndex.VerticalFlySpeed
};

class PlayerAbilities {
  /**
   * The player that the abilities are attached to.
   */
  private readonly player: Player;

  /**
   * The map of abilities for the player.
   */
  private readonly abilities = new Map<AbilityIndex, boolean>();

  private flySpeed = 0.05;

  private verticalFlySpeed = 1;

  private walkSpeed = 0.1;

  /**
   * Create a new PlayerAbilities instance.
   * @param player The player that the abilities are attached to.
   */
  public constructor(player: Player) {
    // Assign the player to the private field
    this.player = player;

    // Read the abilities from the player's NBT storage
    this.readFromStorage();

    // Add the default base abilities to the player
    for (const [ability, value] of Object.entries(DefaultAbilityValues)) {
      if (!this.abilities.has(+ability as AbilityIndex))
        this.abilities.set(+ability as AbilityIndex, value);
    }
  }

  /**
   * Get all abilities as an array of tuples.
   * @returns An array of tuples containing the abilities and their values.
   */
  public getAllAbilities(): Array<[AbilityIndex, boolean]> {
    return Array.from(this.abilities.entries());
  }

  /**
   * Get the value of an ability.
   * @param index The index of the ability to get the value of.
   * @returns The value of the ability, or false if it is not set.
   */
  public getAbility(index: AbilityIndex): boolean {
    return this.abilities.get(index) ?? false;
  }

  /**
   * Set the value of an ability.
   * @param index The index of the ability to set the value of.
   * @param value The value to set the ability to.
   */
  public setAbility(index: AbilityIndex, value: boolean): void {
    // Set the ability in the map
    this.abilities.set(index, value);

    // Create a new UpdateAbilitiesPacket
    const packet = new UpdateAbilitiesPacket();
    packet.permissionLevel = this.player.isOp
      ? PermissionLevel.Operator
      : PermissionLevel.Member;

    packet.commandPermissionLevel = this.player.isOp
      ? CommandPermissionLevel.Operator
      : CommandPermissionLevel.Normal;

    packet.entityUniqueId = this.player.uniqueId;
    packet.abilities = this.getAllAbilitiesAsLayers();

    // Send the packet to the player
    this.player.dimension.broadcast(packet);

    // NOTE: A weird bug occurs when updating an ability of a player in creative mode,
    // the player becomes in a bugged survival/creative state where they place blocks like in survival, but can break blocks like in creative,
    // so we need to resend the SetPlayerGameTypePacket to ensure the player stays in creative mode.

    // Check if the player is in creative mode
    if (this.player.gamemode === Gamemode.Creative) {
      // Ensure the player is in creative mode
      const packet = new SetPlayerGameTypePacket();

      // Set the packet values
      packet.gamemode = Gamemode.Creative;

      // Send the packet to the player
      this.player.send(packet);
    }
  }

  /**
   * Get the walk speed of the player.
   * @returns The walk speed of the player.
   */
  public getWalkSpeed(): number {
    return this.walkSpeed;
  }

  /**
   * Set the walk speed of the player.
   * @param value The value to set the walk speed to.
   */
  public setWalkSpeed(value: number): void {
    this.walkSpeed = value;
    this.setAbility(AbilityIndex.WalkSpeed, true);
  }

  /**
   * Get the walk speed of the player.
   */
  public getFlySpeed(): number {
    return this.flySpeed;
  }

  /**
   * Set the walk speed of the player.
   * @param value The value to set the walk speed to.
   */
  public setFlySpeed(value: number): void {
    this.flySpeed = value;
    this.setAbility(AbilityIndex.FlySpeed, true);
  }

  /**
   * Get the vertical fly speed of the player.
   * @returns The vertical fly speed of the player.
   */
  public getVerticalFlySpeed(): number {
    return this.verticalFlySpeed;
  }

  /**
   * Set the vertical fly speed of the player.
   * @param value The value to set the vertical fly speed to.
   */
  public setVerticalFlySpeed(value: number): void {
    this.verticalFlySpeed = value;
    this.setAbility(AbilityIndex.VerticalFlySpeed, true);
  }

  /**
   * Get all abilities as layers.
   * @returns An array of ability layers.
   */
  public getAllAbilitiesAsLayers(): Array<AbilityLayer> {
    // Prepare the layers array
    const layers: Array<AbilityLayer> = [];

    // Push the base layer
    layers.push({
      type: AbilityLayerType.Base,
      abilities: [...this.abilities.entries()]
        .filter(([x]) => x !== AbilityIndex.MayFly)
        .map(([ability, value]) => new AbilitySet(ability, value)),
      walkSpeed: this.walkSpeed,
      verticalFlySpeed: this.verticalFlySpeed,
      flySpeed: this.flySpeed
    });

    // Push the command layer if the player has the MayFly ability
    layers.push({
      type: AbilityLayerType.Commands,
      abilities: [
        new AbilitySet(
          AbilityIndex.MayFly,
          this.getAbility(AbilityIndex.MayFly)
        )
      ],
      walkSpeed: this.walkSpeed,
      verticalFlySpeed: this.verticalFlySpeed,
      flySpeed: this.flySpeed
    });

    // Return the layers array
    return layers;
  }

  /**
   * Read the abilities from the player's NBT storage.
   */
  private readFromStorage(): void {
    // Read the abilities from the player's NBT storage
    const storage = this.player.nbt.get<CompoundTag>("abilities");

    // Check if the storage exists
    if (storage) {
      // Iterate over the base ability names and their corresponding indices
      for (const [name, index] of Object.entries(AbilityNameToIndex)) {
        // Attempt to get the ability from the storage
        const tag = storage.get<ByteTag>(name.toLowerCase());

        // If the tag exists, set the ability in the map
        if (tag) this.abilities.set(index, tag.valueOf() !== 0);
      }

      // Attempt to get the fly speed from the storage
      const flySpeedTag = storage.get<FloatTag>("flySpeed");
      if (flySpeedTag) this.flySpeed = flySpeedTag.valueOf();

      // Attempt to get the vertical fly speed from the storage
      const verticalFlySpeedTag = storage.get<FloatTag>("flyingSpeed");
      if (verticalFlySpeedTag)
        this.verticalFlySpeed = verticalFlySpeedTag.valueOf();

      // Attempt to get the walk speed from the storage
      const walkSpeedTag = storage.get<FloatTag>("walkSpeed");
      if (walkSpeedTag) this.walkSpeed = walkSpeedTag.valueOf();
    }
  }
}

export { PlayerAbilities };
