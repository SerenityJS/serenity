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
  build: AbilityIndex.Build,
  mine: AbilityIndex.Mine,
  doorsandswitches: AbilityIndex.DoorsAndSwitches,
  opencontainers: AbilityIndex.OpenContainers,
  attackplayers: AbilityIndex.AttackPlayers,
  attackmobs: AbilityIndex.AttackMobs,
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
   * The storage key for abilities.
   */
  private static readonly ABILITIES_KEY = "abilities";

  /**
   * The player that the abilities are attached to.
   */
  private readonly player: Player;

  /**
   * The abilities map holding ability indices and their corresponding boolean values.
   */
  private readonly abilities = new Map<AbilityIndex, ByteTag>();

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

    // Get the initial abilities from the player's storage
    const abilities = player.getStorageEntry<CompoundTag>(
      PlayerAbilities.ABILITIES_KEY
    );

    // If there are no abilities, initialize with default values
    if (abilities) {
      // Populate the abilities map
      for (const [name, index] of Object.entries(AbilityNameToIndex)) {
        // Get the ability value from the compound tag
        const value = abilities.get<ByteTag>(name.toLowerCase());

        // If the value exists, add the ability to the map
        if (value) this.abilities.set(index, value);
      }

      // Get the fly speed from the compound tag
      const flySpeed = abilities.get<FloatTag>("flySpeed");
      if (flySpeed) this.flySpeed = flySpeed.valueOf();

      // Get the vertical fly speed from the compound tag
      const verticalFlySpeed = abilities.get<FloatTag>("flyingSpeed");
      if (verticalFlySpeed) this.verticalFlySpeed = verticalFlySpeed.valueOf();

      // Get the walk speed from the compound tag
      const walkSpeed = abilities.get<FloatTag>("walkSpeed");
      if (walkSpeed) this.walkSpeed = walkSpeed.valueOf();
    }

    // Initialize any missing abilities with default values
    for (const [index, value] of Object.entries(DefaultAbilityValues)) {
      // Get the ability index as a number
      const abilityIndex = Number(index) as AbilityIndex;

      // If the ability is not already set, initialize it with the default value
      if (!this.abilities.has(abilityIndex)) {
        this.abilities.set(abilityIndex, new ByteTag(value ? 1 : 0));
      }
    }
  }

  /**
   * Get all abilities as an array of tuples.
   * @returns An array of tuples containing the abilities and their values.
   */
  public getAllAbilities(): Array<[AbilityIndex, boolean]> {
    // Create an array to hold the abilities
    const abilities: Array<[AbilityIndex, boolean]> = [];

    // Iterate over the abilities map and push each ability to the array
    for (const [ability, value] of this.abilities) {
      abilities.push([ability, value.valueOf() === 1]);
    }

    // Return the abilities array
    return abilities;
  }

  /**
   * Get the value of an ability.
   * @param index The index of the ability to get the value of.
   * @returns The value of the ability, or false if it is not set.
   */
  public getAbility(index: AbilityIndex): boolean {
    return this.abilities.get(index)?.valueOf() === 1 || false;
  }

  /**
   * Set the value of an ability.
   * @param index The index of the ability to set the value of.
   * @param value The value to set the ability to.
   */
  public setAbility(index: AbilityIndex, value: boolean): void {
    // Set the ability in the map
    this.abilities.set(index, new ByteTag(value ? 1 : 0));

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
    if (this.player.getGamemode() === Gamemode.Creative) {
      // Ensure the player is in creative mode
      const packet = new SetPlayerGameTypePacket();

      // Set the packet values
      packet.gamemode = Gamemode.Creative;

      // Send the packet to the player
      this.player.send(packet);
    }

    // Create a new compound tag to hold the abilities
    const abilitiesTag = new CompoundTag();

    // Iterate over the abilities map and set each ability in the compound tag
    for (const [ability, value] of this.abilities) {
      // Attempt to get the ability name from the index
      const abilityName = Object.keys(AbilityNameToIndex).find(
        (key) => AbilityNameToIndex[key] === ability
      );

      // If the ability name exists, set it in the compound tag
      if (abilityName) abilitiesTag.set(abilityName.toLowerCase(), value);
    }

    // Set the fly speed in the compound tag
    abilitiesTag.set("flySpeed", new FloatTag(this.flySpeed));

    // Set the vertical fly speed in the compound tag
    abilitiesTag.set("flyingSpeed", new FloatTag(this.verticalFlySpeed));

    // Set the walk speed in the compound tag
    abilitiesTag.set("walkSpeed", new FloatTag(this.walkSpeed));

    // Set the abilities in the player's NBT storage
    this.player.setStorageEntry(PlayerAbilities.ABILITIES_KEY, abilitiesTag);
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
        .map(
          ([ability, value]) => new AbilitySet(ability, value.valueOf() === 1)
        ),
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
}

export { PlayerAbilities };
