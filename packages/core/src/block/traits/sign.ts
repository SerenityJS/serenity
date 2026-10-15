import {
  AbilityIndex,
  BlockFace,
  Color,
  IPosition,
  OpenSignPacket
} from "@serenityjs/protocol";
import { ByteTag, CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";

import { BlockInteractionOptions, BlockPlacementOptions } from "../../types";
import { CardinalDirection, FacingDirection } from "../../enums";

import { BlockTrait } from "./trait";

import type { Player } from "../../entity";
import type { Block } from "../block";
import type { BlockState } from "../types";

/**
 * The directions opposite each direction.
 */
const OppositeDirections: Record<CardinalDirection, CardinalDirection> = {
  [CardinalDirection.North]: CardinalDirection.South,
  [CardinalDirection.South]: CardinalDirection.North,
  [CardinalDirection.East]: CardinalDirection.West,
  [CardinalDirection.West]: CardinalDirection.East
};

/**
 * The directions a quarter turn clockwise from each direction, seen from above.
 */
const ClockwiseDirections: Record<CardinalDirection, CardinalDirection> = {
  [CardinalDirection.North]: CardinalDirection.East,
  [CardinalDirection.East]: CardinalDirection.South,
  [CardinalDirection.South]: CardinalDirection.West,
  [CardinalDirection.West]: CardinalDirection.North
};

/**
 * The facing direction of each cardinal direction.
 */
const CardinalFacingDirections: Record<CardinalDirection, FacingDirection> = {
  [CardinalDirection.North]: FacingDirection.North,
  [CardinalDirection.South]: FacingDirection.South,
  [CardinalDirection.East]: FacingDirection.East,
  [CardinalDirection.West]: FacingDirection.West
};

/**
 * The faces opposite each face of a block.
 */
const OppositeFaces: Record<BlockFace, BlockFace> = {
  [BlockFace.Bottom]: BlockFace.Top,
  [BlockFace.Top]: BlockFace.Bottom,
  [BlockFace.North]: BlockFace.South,
  [BlockFace.South]: BlockFace.North,
  [BlockFace.West]: BlockFace.East,
  [BlockFace.East]: BlockFace.West
};

/**
 * The facing directions along the north and south line.
 */
const NorthSouthFacings = new Set<number>([
  FacingDirection.North,
  FacingDirection.South
]);

/**
 * The way each facing direction points, along x and z.
 */
const FacingOffsets: Partial<Record<FacingDirection, [number, number]>> = {
  [FacingDirection.North]: [0, -1],
  [FacingDirection.South]: [0, 1],
  [FacingDirection.West]: [-1, 0],
  [FacingDirection.East]: [1, 0]
};

/**
 * The direction each side of a block points out to.
 */
const FaceDirections: Partial<Record<BlockFace, CardinalDirection>> = {
  [BlockFace.North]: CardinalDirection.North,
  [BlockFace.South]: CardinalDirection.South,
  [BlockFace.West]: CardinalDirection.West,
  [BlockFace.East]: CardinalDirection.East
};

class BlockSignTrait extends BlockTrait {
  public static readonly identifier = "sign";
  public static readonly tag = "text_sign";

  /**
   * Get the front text of the sign.
   * @returns The text on the front side of the sign, or an empty string if it doesn't exist.
   */
  public getFrontText(): string {
    // Get the front text from the block's NBT data
    const frontText = this.block.getStorageEntry<CompoundTag>("FrontText");

    // Return the text value of the front text, or an empty string if it doesn't exist
    return frontText?.get<StringTag>("Text")?.valueOf() ?? "";
  }

  /**
   * Set the front text of the sign.
   * @param text The text to set on the front side of the sign.
   */
  public setFrontText(text: string): void {
    // Check if the block has a front text in its NBT data
    if (!this.block.hasStorageEntry("FrontText")) this.onAdd();

    // Get the front text from the block's NBT data
    const frontText = this.block.getStorageEntry<CompoundTag>("FrontText")!;

    // Set the text value of the front text
    frontText.set("Text", new StringTag(text, "Text"));

    // Send a storage update packet to all players in the dimension
    this.block.sendStorageUpdate();
  }

  /**
   * Get the color of the front text of the sign.
   * @returns The color of the front text as a Color instance.
   */
  public getFrontTextColor(): Color {
    // Get the front text from the block's NBT data
    const frontText = this.block.getStorageEntry<CompoundTag>("FrontText");

    // Get the color value of the front text, or return a default color if it doesn't exist
    const value = frontText?.get<IntTag>("SignTextColor")?.valueOf() ?? 0;

    return Color.fromInt(value); // Convert the integer value to a Color instance
  }

  /**
   * Set the color of the front text of the sign.
   * @param color The color to set for the front text.
   */
  public setFrontTextColor(color: Color): void {
    // Check if the block has a front text in its NBT data
    if (!this.block.hasStorageEntry("FrontText")) this.onAdd();

    // Get the front text from the block's NBT data
    const frontText = this.block.getStorageEntry<CompoundTag>("FrontText")!;

    // Set the color value of the front text
    frontText.set("SignTextColor", new IntTag(color.toInt(), "SignTextColor"));

    // Send a storage update packet to all players in the dimension
    this.block.sendStorageUpdate();
  }

  /**
   * Get the back text of the sign.
   * @returns The text on the back side of the sign, or an empty string if it doesn't exist.
   */
  public getBackText(): string {
    // Get the back text from the block's NBT data
    const backText = this.block.getStorageEntry<CompoundTag>("BackText");

    // Return the text value of the back text, or an empty string if it doesn't exist
    return backText?.get<StringTag>("Text")?.valueOf() ?? "";
  }

  /**
   * Set the back text of the sign.
   * @param text The text to set on the back side of the sign.
   */
  public setBackText(text: string): void {
    // Check if the block has a back text in its NBT data
    if (!this.block.hasStorageEntry("BackText")) this.onAdd();

    // Get the back text from the block's NBT data
    const backText = this.block.getStorageEntry<CompoundTag>("BackText")!;

    // Set the text value of the back text
    backText.set("Text", new StringTag(text, "Text"));

    // Send a storage update packet to all players in the dimension
    this.block.sendStorageUpdate();
  }

  /**
   * Get the color of the back text of the sign.
   * @returns The color of the back text as a Color instance.
   */
  public getBackTextColor(): Color {
    // Get the back text from the block's NBT data
    const backText = this.block.getStorageEntry<CompoundTag>("BackText");

    // Get the color value of the back text, or return a default color if it doesn't exist
    const value = backText?.get<IntTag>("SignTextColor")?.valueOf() ?? 0;

    return Color.fromInt(value); // Convert the integer value to a Color instance
  }

  /**
   * Set the color of the back text of the sign.
   * @param color The color to set for the back text.
   */
  public setBackTextColor(color: Color): void {
    // Check if the block has a back text in its NBT data
    if (!this.block.hasStorageEntry("BackText")) this.onAdd();

    // Get the back text from the block's NBT data
    const backText = this.block.getStorageEntry<CompoundTag>("BackText")!;

    // Set the color value of the back text
    backText.set("SignTextColor", new IntTag(color.toInt(), "SignTextColor"));

    // Send a storage update packet to all players in the dimension
    this.block.sendStorageUpdate();
  }

  public onPlace(options: BlockPlacementOptions): boolean | void {
    // Destructuring the options to get cancel and origin
    const { cancel, origin, clickedFace } = options;

    // Check if the event is canceled or if there is no origin
    if (cancel || !origin || !origin.isPlayer()) return;

    // Check if the sign is a hanging sign, which hangs from a ceiling or sticks out of a wall
    if (this.block.identifier.endsWith("_hanging_sign")) {
      if (!this.placeHangingSign(origin, clickedFace)) return false;
    }

    // Check if the block has a state for ground sign direction
    else if (this.block.hasState("ground_sign_direction")) {
      // Turn the sign to face the player
      this.block.setState(
        "ground_sign_direction",
        this.getRotationTowards(origin)
      );
    }

    // Create a new OpenSignPacket to send to the player
    const packet = new OpenSignPacket();
    packet.position = this.block.position;
    packet.isFrontSide = true; // Assuming the sign is placed on the front side

    // Send the OpenSignPacket to the player
    origin.send(packet);
  }

  /**
   * Gets which of sixteen steps around a sign turned to face a player points, as standing signs count them.
   * 0 faces south, and each step turns a sixteenth of the way round, clockwise.
   * @param player The player the sign faces.
   */
  public getRotationTowards(player: Player): number {
    // Get the step the player looks along
    const step = Math.floor(((player.rotation.headYaw + 180) * 16) / 360 + 0.5);

    // Wrap the step into the sixteen steps around
    return ((step % 16) + 16) % 16;
  }

  /**
   * Places a hanging sign against a face of a block, as vanilla does.
   * Under a ceiling, it hangs from chains at its edges, facing away from the player, when the block above is solid;
   * otherwise, or when the player sneaks, it hangs from one chain in its middle and turns in sixteen steps.
   * Against a wall, it sticks out of the wall on a bracket, its faces at right angles to the wall.
   * Hanging signs are not placed on top of a block.
   * @param player The player placing the sign.
   * @param face The face of the block the sign was placed against.
   * @returns Whether the sign was placed.
   */
  protected placeHangingSign(player: Player, face?: BlockFace): boolean {
    // Get the direction the player faces
    const facing = player.getCardinalDirection();

    // Prepare the states of the sign
    let state: BlockState;

    // Check if the sign was placed under a ceiling
    if (face === BlockFace.Bottom) {
      // The sign hangs from the block above, which can not be one like air, or another sign
      const above = this.block.above();
      if (!this.canHoldUp(above)) return false;

      // The sign hangs from one chain when the player sneaks, or when the block above is not solid
      const centred = player.isSneaking || !above.isSolid;

      state = {
        hanging: true,
        attached_bit: centred,
        facing_direction: CardinalFacingDirections[OppositeDirections[facing]],
        ground_sign_direction: centred ? this.getRotationTowards(player) : 0
      };
    } else {
      // Get the direction the side of the wall points out to
      const side = face === undefined ? undefined : FaceDirections[face];
      if (side === undefined) return false;

      // The sign's faces are at right angles to the wall, and face the player
      let direction = ClockwiseDirections[OppositeDirections[side]];
      if (direction === facing) direction = OppositeDirections[direction];

      // The sign sticks out of the block it was placed against, which needs to hold it up
      const wall = this.block.face(OppositeFaces[face as BlockFace]);
      if (!this.holdsUpOnWall(wall, CardinalFacingDirections[direction]))
        return false;

      state = {
        hanging: false,
        attached_bit: false,
        facing_direction: CardinalFacingDirections[direction],
        ground_sign_direction: 0
      };
    }

    // Set the states of the sign
    const permutation = this.block.type.getPermutation({
      ...this.block.permutation.state,
      ...state
    });
    this.block.setPermutation(permutation);

    // Return true, as the sign was placed
    return true;
  }

  /**
   * Whether a block can hold up a hanging sign under it: any but blocks like air, and signs.
   * @param block The block to check.
   */
  public canHoldUp(block: Block): boolean {
    return !block.isReplaceable && !block.hasTrait(BlockSignTrait);
  }

  /**
   * Whether a block beside a hanging sign on a wall holds it up: any but blocks like air and signs,
   * or another hanging sign on a wall, facing along the same line, which the signs then hang in.
   * @param block The block beside the sign.
   * @param facing The direction the hanging sign faces; defaults to the direction this sign faces.
   */
  public holdsUpOnWall(
    block: Block,
    facing = this.block.getState<number>("facing_direction")
  ): boolean {
    // Check if the block is a hanging sign
    if (block.identifier.endsWith("_hanging_sign")) {
      // Only hanging signs on a wall hold others up
      if (block.getState<boolean>("hanging")) return false;

      // The signs face along the same line, north and south, or east and west
      const other = block.getState<number>("facing_direction");
      return NorthSouthFacings.has(other) === NorthSouthFacings.has(facing);
    }

    // Otherwise, the block holds up the sign like it does under a ceiling
    return this.canHoldUp(block);
  }

  /**
   * Whether a player clicking a face of this sign hangs the hanging sign they hold beside it, rather than editing it.
   * This is the case for the sides of a hanging sign on a wall, which another hangs from in line with it;
   * its front and back are the sides that are edited.
   * @param player The player clicking the sign.
   * @param face The face of the sign the player clicked.
   */
  public isHungBeside(player: Player, face?: BlockFace): boolean {
    // Check if the player holds a hanging sign, and this is a hanging sign on a wall
    if (!player.getHeldItem()?.type.identifier.endsWith("_hanging_sign"))
      return false;
    if (!this.block.identifier.endsWith("_hanging_sign")) return false;
    if (this.block.getState<boolean>("hanging")) return false;

    // Check if the face is one of the sides of the sign, at right angles to the way it faces
    if (
      face === undefined ||
      face === BlockFace.Top ||
      face === BlockFace.Bottom
    )
      return false;
    const facing = this.block.getState<number>("facing_direction");
    return NorthSouthFacings.has(facing) !== NorthSouthFacings.has(face);
  }

  public onInteract(options: BlockInteractionOptions): void {
    // Destructuring the options to get cancel and origin
    const { cancel, origin } = options;

    // Check if the event is canceled or if there is no origin
    if (cancel || !origin || !origin.isPlayer()) return;

    // Players sneaking with a block in hand place it rather than edit the sign,
    // and players holding a hanging sign hang it beside this one, when it is a hanging sign on a wall
    if (
      options.placingBlock &&
      (origin.isSneaking || this.isHungBeside(origin, options.clickedFace))
    )
      return;

    // Editing the sign takes the place of placing a block on it
    options.placingBlock = false;

    // Check if the player can build, and if the sign has not been waxed, which keeps it from being edited
    if (!origin.abilities.getAbility(AbilityIndex.Build) || this.isWaxed())
      return;

    // Create a new OpenSignPacket to send to the player
    const packet = new OpenSignPacket();
    packet.position = this.block.position;

    // Open the side of the sign the player sees
    packet.isFrontSide = this.facesFront(origin.position);

    // Send the OpenSignPacket to the player
    origin.send(packet);
  }

  /**
   * Whether the sign has been waxed, which keeps it from being edited.
   */
  public isWaxed(): boolean {
    return this.block.getStorageEntry<ByteTag>("IsWaxed")?.valueOf() === 1;
  }

  /**
   * Whether a player at a position sees the front of the sign, rather than its back.
   * The front faces the way the sign was put up: away from the wall it is on,
   * or turned to face whoever put it up, on the floor or hanging from a ceiling.
   * @param from The position the sign is seen from.
   */
  public facesFront(from: IPosition): boolean {
    // Check if the sign faces the way a wall does, rather than turning in sixteen steps
    const onWall =
      !this.block.hasState("ground_sign_direction") ||
      this.block.identifier.endsWith("wall_sign") ||
      (this.block.identifier.endsWith("_hanging_sign") &&
        !this.block.getState<boolean>("attached_bit"));

    // Get the direction the front of the sign faces
    let dx = 0;
    let dz = 0;
    if (onWall) {
      // Get the facing direction of the sign
      const facing = this.block.getState<number>("facing_direction");
      [dx, dz] = FacingOffsets[facing as FacingDirection] ?? [0, 1];
    } else {
      // Sixteen steps, from facing south, round through west
      const angle =
        (this.block.getState<number>("ground_sign_direction") * Math.PI) / 8;
      dx = -Math.sin(angle);
      dz = Math.cos(angle);
    }

    // The player sees the front if they are in front of the sign
    const { x, z } = this.block.position;
    return (from.x - (x + 0.5)) * dx + (from.z - (z + 0.5)) * dz >= 0;
  }

  public onAdd(): void {
    // Check if the block has a front text in its NBT data
    if (!this.block.hasStorageEntry("FrontText")) {
      // Create a new CompoundTag for the front text
      const frontText = new CompoundTag("FrontText");

      // Set the default text for the front text
      frontText.push(new StringTag("", "Text"));
      frontText.push(new ByteTag(1, "HideGlowOutline"));
      frontText.push(new ByteTag(1, "PersistFormatting"));
      frontText.push(new IntTag(-16777216, "SignTextColor")); // Default color for the sign text

      // Add the front text to the block's NBT data
      this.block.pushStorageEntry(frontText);
    }

    // Check if the block has a back text in its NBT data
    if (!this.block.hasStorageEntry("BackText")) {
      // Create a new CompoundTag for the back text
      const backText = new CompoundTag("BackText");

      // Set the default text for the back text
      backText.push(new StringTag("", "Text"));
      backText.push(new ByteTag(1, "HideGlowOutline"));
      backText.push(new ByteTag(1, "PersistFormatting"));
      backText.push(new IntTag(-16777216, "SignTextColor")); // Default color for the sign text

      // Add the back text to the block's NBT data
      this.block.pushStorageEntry(backText);
    }
  }

  public onRemove(): void {
    // Remove the front text from the block's NBT data
    this.block.deleteStorageEntry("FrontText");

    // Remove the back text from the block's NBT data
    this.block.deleteStorageEntry("BackText");
  }
}

export { BlockSignTrait };
