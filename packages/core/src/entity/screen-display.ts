import {
  HudElement,
  HudElementData,
  HudVisibility,
  SetHudPacket,
  SetTitlePacket,
  TextPacket,
  TextPacketType,
  TitleType
} from "@serenityjs/protocol";

import { TitleDisplayOptions } from "../types";

import type { Player } from "./player";

class ScreenDisplay {
  /**
   * The player that the screen display is for.
   */
  protected readonly player: Player;

  /**
   * The elements that are hidden from the screen display.
   */
  public readonly hiddenElements = new Set<HudElement>();

  /**
   * Create a new screen display for the player.
   * @param player The player that the screen display is for.
   */
  public constructor(player: Player) {
    this.player = player;
  }

  /**
   * Hide a specific element from the screen display.
   * @param element The element to hide.
   */
  public hideElement(...elements: Array<HudElement>): void {
    // Add the element to the hidden elements.
    for (const element of elements) this.hiddenElements.add(element);

    // Create a new SetHudPacket.
    const packet = new SetHudPacket();

    // Map the hidden elements to the packet.
    packet.elements = [...this.hiddenElements].map(
      (element) => new HudElementData(element)
    );

    // Set the visibility to hidden.
    packet.visibility = HudVisibility.Hide;

    // Send the packet to the player.
    this.player.send(packet);
  }

  /**
   * Show a specific element from the screen display.
   * @param element The element to show.
   */
  public showElement(...elements: Array<HudElement>): void {
    // Remove the element from the hidden elements.
    for (const element of elements) this.hiddenElements.delete(element);

    // Create a new SetHudPacket.
    const packet = new SetHudPacket();

    // Map the hidden elements to the packet.
    packet.elements = [...this.hiddenElements].map(
      (element) => new HudElementData(element)
    );

    // Set the visibility to shown.
    packet.visibility = HudVisibility.Reset;

    // Send the packet to the player.
    this.player.send(packet);
  }

  /**
   * Hide all elements from the screen display.
   */
  public hideAllElements(): void {
    // Add all elements to the hidden elements.
    const values = Object.values(HudElement).filter(
      (element) => typeof element === "number"
    );

    // Add the elements to the hidden elements.
    this.hideElement(...values);
  }

  /**
   * Show all elements from the screen display.
   */
  public showAllElements(): void {
    // Remove all elements from the hidden elements.
    const values = Object.values(HudElement).filter(
      (element) => typeof element === "number"
    );

    // Remove the elements from the hidden elements.
    this.showElement(...values);
  }

  /**
   * Set the title of the player.
   * @param text The text to display.
   * @param options The additional options for the title.
   */
  public setTitle(text: string, options?: TitleDisplayOptions): void {
    // Create a new SetTitlePacket.
    const packet = new SetTitlePacket();
    packet.type = TitleType.Title;
    packet.text = text;
    packet.fadeInTime = options?.fadeInDuration ?? 20;
    packet.stayTime = options?.stayDuration ?? 60;
    packet.fadeOutTime = options?.fadeOutDuration ?? 20;
    packet.xuid = this.player.xuid;
    packet.platformOnlineId = String();
    packet.filteredText = text; // TODO: Filter the text.

    // Update the subtitle if it is provided
    if (options?.subtitle) this.updateSubtitle(options.subtitle, options);

    // Send the packet to the player.
    this.player.send(packet);
  }

  /**
   * Set the action bar of the player.
   * @param text The text to display.
   * @param options The additional options for the action bar.
   */
  public setActionBar(text: string, options?: TitleDisplayOptions): void {
    // Create a new SetTitlePacket.
    const packet = new SetTitlePacket();
    packet.type = TitleType.Actionbar;
    packet.text = text;
    packet.fadeInTime = options?.fadeInDuration ?? 20;
    packet.stayTime = options?.stayDuration ?? 60;
    packet.fadeOutTime = options?.fadeOutDuration ?? 20;
    packet.xuid = this.player.xuid;
    packet.platformOnlineId = String();
    packet.filteredText = text; // TODO: Filter the text.

    // Send the packet to the player.
    this.player.send(packet);
  }

  /**
   * Set the jukebox popup of the player.
   * @param text The text to display.
   */
  public setJukeboxPopup(text: string): void {
    // Create a new TextPacket.
    const packet = new TextPacket();
    packet.type = TextPacketType.JukeboxPopup;
    packet.needsTranslation = false;
    packet.source = null;
    packet.message = text;
    packet.parameters = [];
    packet.xuid = this.player.xuid;
    packet.platformChatId = String();
    packet.filtered = text; // TODO: Filter the text.

    // Send the packet to the player.
    this.player.send(packet);
  }

  /**
   * Set the tooltip text of the player.
   * @param text The text to display.
   */
  public setToolTip(text: string): void {
    // Create a new TextPacket.
    const packet = new TextPacket();
    packet.type = TextPacketType.Tip;
    packet.needsTranslation = false;
    packet.source = null;
    packet.message = text;
    packet.parameters = [];
    packet.xuid = this.player.xuid;
    packet.platformChatId = String();
    packet.filtered = text; // TODO: Filter the text.

    // Send the packet to the player.
    this.player.send(packet);
  }

  /**
   * Update the subtitle for the title of the player.
   * @param text The text to display.
   * @param options The additional options for the subtitle.
   */
  public updateSubtitle(text: string, options?: TitleDisplayOptions): void {
    // Create a new SetTitlePacket.
    const packet = new SetTitlePacket();
    packet.type = TitleType.Subtitle;
    packet.text = text;
    packet.fadeInTime = options?.fadeInDuration ?? 20;
    packet.stayTime = options?.stayDuration ?? 60;
    packet.fadeOutTime = options?.fadeOutDuration ?? 20;
    packet.xuid = this.player.xuid;
    packet.platformOnlineId = String();
    packet.filteredText = text; // TODO: Filter the text.

    // Send the packet to the player.
    this.player.send(packet);
  }

  /**
   * Clear the title of the player.
   */
  public clearTitle(): void {
    // Create a new SetTitlePacket.
    const packet = new SetTitlePacket();
    packet.type = TitleType.Clear;
    packet.text = String();
    packet.fadeInTime = 0;
    packet.stayTime = 0;
    packet.fadeOutTime = 0;
    packet.xuid = this.player.xuid;
    packet.platformOnlineId = String();
    packet.filteredText = String(); // TODO: Filter the text.

    // Send the packet to the player.
    this.player.send(packet);
  }
}

export { ScreenDisplay };
