/**
 * Examples for your plugin — copy this file next to your handlers so
 * `../service/debugRenderer` resolves to your `debugRenderer` module.
 */

import { PlayerUseItemSignal } from "@serenityjs/core";
import { Vector3f } from "@serenityjs/protocol";
// @ts-expect-error — path exists in a plugin layout, not under `docs/`.
import { DebugCircle, DebugText, DebugRenderer } from "../service/debugRenderer";

/** Same core idea as a minimal item-use handler: text + optional attachment. */
export function exampleLabelOnUse(ev: PlayerUseItemSignal) {
  const { player } = ev;
  const location = new Vector3f(player.position.x, player.position.y, player.position.z);

  const text = new DebugText(player.world, location, "hello world", {
    name: "demo_label",
    dimensionType: player.dimension.type
  });
  text.visibleTo = [player];
  text.persistent = true;
  text.attachedToEntityId = player.runtimeId;

  DebugRenderer.addShape(text);
}

/** Extension: add a circle at the same spot and show how to remove the label later. */
export function exampleLabelAndCircleOnUse(ev: PlayerUseItemSignal) {
  const { player } = ev;
  const at = new Vector3f(player.position.x, player.position.y, player.position.z);

  const text = new DebugText(player.world, at, "hello world", {
    name: "demo_label",
    dimensionType: player.dimension.type
  });
  text.visibleTo = [player];
  text.attachedToEntityId = player.runtimeId;

  const ring = new DebugCircle(player.world, at, {
    dimensionType: player.dimension.type
  });
  ring.visibleTo = [player];
  ring.segments = 32;

  DebugRenderer.addShape(text);
  DebugRenderer.addShape(ring);

  // When you want to clear only the label:
  // text.remove();
}
