import { Color, Gamemode, OpenSignPacket } from "@serenityjs/protocol";
import { ByteTag, CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";

import { BlockInteractionOptions, BlockPlacementOptions } from "../../types";

import { BlockTrait } from "./trait";

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

  public onPlace(options: BlockPlacementOptions): void {
    // Destructuring the options to get cancel and origin
    const { cancel, origin } = options;

    // Check if the event is canceled or if there is no origin
    if (cancel || !origin || !origin.isPlayer()) return;

    // Check if the block has a state for ground sign direction
    if (this.block.hasState("ground_sign_direction")) {
      // Get the rotation based on the normalized headYaw
      const rotation = Math.round((origin.rotation.headYaw + 180) / 22.5);

      // Set the state of the block to the normalized headYaw
      this.block.setState("ground_sign_direction", rotation);
    }

    // Create a new OpenSignPacket to send to the player
    const packet = new OpenSignPacket();
    packet.position = this.block.position;
    packet.isFrontSide = true; // Assuming the sign is placed on the front side

    // Send the OpenSignPacket to the player
    origin.send(packet);
  }

  public onInteract(options: BlockInteractionOptions): void {
    // Destructuring the options to get cancel and origin
    const { cancel, origin, placingBlock } = options;

    // Check if the event is canceled or if there is no origin
    if (cancel || !origin || !origin.isPlayer() || placingBlock) return;

    // Check if the player is in creative mode
    if (origin.getGamemode() !== Gamemode.Creative) return;

    // Get the state of the block for ground sign direction
    const state = this.block.getState<number>("ground_sign_direction");

    // Get the rotation based on the normalized headYaw
    const rotation = Math.round((origin.rotation.headYaw + 180) / 22.5);

    // Create a new OpenSignPacket to send to the player
    const packet = new OpenSignPacket();
    packet.position = this.block.position;

    // Determine if the player is interacting with the front or back side of the sign
    // There should be room for margin of 3 degrees to account for slight inaccuracies
    if (rotation >= state - 3 && rotation <= state + 3) {
      packet.isFrontSide = true; // Player is interacting with the front side of the sign
    } else {
      packet.isFrontSide = false; // Player is interacting with the back side of the sign
    }

    // Send the OpenSignPacket to the player
    origin.send(packet);
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
