import {
  ClientboundDataDrivenUIClosePacket,
  ClientboundDataDrivenUIShowScreenPacket,
  ClientboundDataStorePacket,
  DataStoreChange
} from "@serenityjs/protocol";

import { Player } from "../../entity";

import { ObjectProperty } from "./properties";
import { LayoutElement } from "./elements";

abstract class DataDrivenScreen extends ObjectProperty {
  /**
   * The identifier of the screen.
   */
  public abstract readonly identifier: string;

  /**
   * The data store property name associated with the screen.
   */
  public abstract readonly property: string;

  private readonly viewers: Set<Player> = new Set();

  protected readonly layout = new LayoutElement(this);

  public constructor() {
    super("");

    this.setProperty(this.layout);
  }

  public show(player: Player): void {
    const update = new DataStoreChange("minecraft", "custom_form_data", 1, {
      type: 6,
      value: this.toJson()
    });

    const data = new ClientboundDataStorePacket();
    data.updates = [update];

    const show = new ClientboundDataDrivenUIShowScreenPacket();
    show.screenId = this.identifier;
    show.formId = 0;

    player.screens.set(this.property, this);
    this.viewers.add(player);

    player.send(data, show);
  }

  public close(player: Player): void {
    player.screens.delete(this.property);
    this.viewers.delete(player);

    const close = new ClientboundDataDrivenUIClosePacket();
    player.send(close);
  }

  public debug(): void {
    // @ts-ignore
    console.log(this.toJson().layout.value);
  }

  /**
   * Get all the viewers currently viewing the screen.
   * @returns The viewers as an array of Player instances.
   */
  public getAllViewers(): Array<Player> {
    return Array.from(this.viewers);
  }

  public getRootScreen(): DataDrivenScreen {
    return this;
  }
}

export { DataDrivenScreen };
