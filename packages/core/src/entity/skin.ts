import { randomUUID } from "node:crypto";

import { SerializedSkin, SkinImage } from "@serenityjs/protocol";
import { Bitmap, Jimp } from "jimp";

import { Player } from "./player";
import { PlayerListTrait } from "./traits";

class PlayerSkin {
  /**
   * The player that is attached to this skin.
   */
  private readonly player: Player;

  /**
   * The original source of the skin.
   */
  private source: SerializedSkin;

  /**
   * The custom identifier for the skin.
   */
  private readonly customIdentifier: string = randomUUID();

  /**
   * Create a new player skin.
   * @param player The player that is attached to this skin.
   * @param source The original source of the skin.
   */
  public constructor(player: Player, source: SerializedSkin) {
    // Set the player and source of the skin.
    this.player = player;
    this.source = source;
  }

  /**
   * Get the current geometry of the skin.
   * @returns The geometry of the skin.
   */
  public getGeometry(): Record<string, unknown> {
    // Parse the geometry data from the source.
    return JSON.parse(this.source.geometryData);
  }

  /**
   * Set the geometry of the skin.
   * @param geometry The geometry to set, either as a record or a string.
   */
  public setGeometry(geometry: Record<string, unknown> | string) {
    // Prepare a variable to hold the parsed geometry.
    let parsed = geometry as Record<string, unknown>;

    // Check if the geometry is a string, if so, parse it.
    if (typeof geometry === "string") parsed = JSON.parse(geometry);

    // Prepare a veriable to hold the geometry version.
    let geometryVersion = this.source.geometryVersion;

    // Check if there is a formatVersion
    if ("formatVersion" in parsed) {
      // Set the geometry version to the formatVersion
      geometryVersion = parsed.formatVersion as string;
    }

    // Set the geometry data and version in the source.
    this.source.geometryVersion = geometryVersion;

    // Generate a random uuid for the identifier.
    this.source.identifier = this.customIdentifier;
    this.source.fullIdentifier = this.customIdentifier;

    // Set the identifier for the geometry in the parsed data.
    if ("minecraft:geometry" in parsed) {
      // Cast the minecraft:geometry to an array of records.
      const geo = parsed["minecraft:geometry"] as Array<
        Record<string, unknown>
      >;

      // Set the identifier for each geometry in the array.
      for (const g of geo) {
        // Check if there is a discription property.
        if ("description" in g) {
          // Get the discription property and cast it to a record.
          const desc = g["description"] as Record<string, unknown>;

          // Set the identifier in the discription.
          desc.identifier = `geometry.${this.player.username}.${this.customIdentifier.replace(/-/g, "")}`;
        }
      }
    }

    // Set the resource patch for the source.
    this.source.resourcePatch = JSON.stringify({
      geometry: {
        default: `geometry.${this.player.username}.${this.customIdentifier.replace(/-/g, "")}`
      }
    });

    // Set the geometry data in the source.
    this.source.geometryData = JSON.stringify(parsed);

    // Iterate through all the players in the world and clear their player list trait
    for (const player of this.player.world.getPlayers()) {
      // Check if the player has the player list trait
      if (!player.hasTrait(PlayerListTrait)) continue;

      // Get the player list trait
      const trait = player.getTrait(PlayerListTrait);

      // Clear the player list trait for the player
      trait.clear(player);
    }
  }

  /**
   * Get the skin image as a bitmap.
   * @returns The skin image bitmap.
   */
  public async getSkinImage(): Promise<Bitmap> {
    // Read the skin image from the source.
    const image = await Jimp.fromBitmap(this.source.skinImage);

    // Return a new skin image with the width, height, and data from the image.
    return image.bitmap;
  }

  /**
   * Set the skin image from a bitmap or buffer.
   * @param image The skin image to set, either as a bitmap or buffer.
   * @note When setting a skin, you must also set the geometry, otherwise the skin will not be displayed correctly.
   */
  public async setSkinImage(image: Bitmap | Buffer | string): Promise<void> {
    // Generate a random uuid for the identifier.
    this.source.identifier = this.customIdentifier;
    this.source.fullIdentifier = this.customIdentifier;

    // Check if the image is a bitmap
    if (image instanceof Buffer || typeof image === "string") {
      // Read the image from the buffer
      const { width, height, data } = (await Jimp.read(image)).bitmap;

      // Set the skin image in the source
      this.source.skinImage = new SkinImage(width, height, data);
    } else {
      // Get the width, height, and data from the bitmap
      const { width, height, data } = image as Bitmap;

      // Set the skin image in the source
      this.source.skinImage = new SkinImage(width, height, data);
    }

    // Iterate through all the players in the world and clear their player list trait
    for (const player of this.player.world.getPlayers()) {
      // Check if the player has the player list trait
      if (!player.hasTrait(PlayerListTrait)) continue;

      // Get the player list trait
      const trait = player.getTrait(PlayerListTrait);

      // Clear the player list trait for the player
      trait.clear(player);
    }
  }

  /**
   * Get the serialized skin.
   * @returns The serialized skin.
   */
  public getSerialized(): SerializedSkin {
    return this.source;
  }

  /**
   * Sets the serialized skin.
   * @param skin The serialized skin to set.
   */
  public setSerialized(skin: SerializedSkin) {
    this.source = skin;
  }

  /**
   * Gets the identifier of the skin.
   */
  public get identifier(): string {
    return this.source.identifier;
  }
}

export { PlayerSkin };
