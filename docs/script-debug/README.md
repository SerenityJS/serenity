---
 title: Script debug overlays (DebugRenderer)
 group: Documents
---

# Introduction

This guide is for using the **ready-made** debug drawer helpers (`DebugText`, `DebugCircle`, `DebugRenderer`, etc.) from a `debugRenderer` module in your plugin. You create a shape, optionally tweak who sees it and how long it lasts, then call **`DebugRenderer.addShape`**. The manager assigns an internal id and sends the right packets to the client—no need to touch `ScriptDebugShape` by hand.

Copy the `debugRenderer` service into your plugin (for example `src/scripts/service/debugRenderer.ts`) and import it from your handlers or traits.

## Basic flow

1. `new DebugText(world, location, "text", { name?, dimensionType? })` (or another shape class).
2. Set extra fields if you need them: `visibleTo`, `persistent`, `attachedToEntityId`, `color`, etc.
3. `DebugRenderer.addShape(shape)`.

Only read `shape.id` **after** `addShape` (the id is assigned there).

## Example: label on use item

Same idea as a minimal handler: text at a position, only for that player, stuck to their entity.

```typescript
import { PlayerUseItemSignal } from "@serenityjs/core";
import { Vector3f } from "@serenityjs/protocol";
import { DebugText, DebugRenderer } from "../service/debugRenderer";

export class ItemUseHandler {
  static onUse(ev: PlayerUseItemSignal) {
    const { player } = ev;
    const location = new Vector3f(
      player.position.x,
      player.position.y,
      player.position.z
    );

    const text = new DebugText(player.world, location, "hello world", {
      name: "demo_label",
      dimensionType: player.dimension.type
    });
    text.visibleTo = [player];
    text.persistent = true;
    text.attachedToEntityId = player.runtimeId;

    DebugRenderer.addShape(text);
  }
}
```

## Extending it: another shape, remove later

You can register more than one shape (each `addShape` gets its own id). Here the same handler adds a **circle** at the player’s feet and keeps a reference to remove the text when you no longer need it.

```typescript
import { PlayerUseItemSignal } from "@serenityjs/core";
import { Vector3f } from "@serenityjs/protocol";
import { DebugCircle, DebugText, DebugRenderer } from "../service/debugRenderer";

export class ItemUseHandler {
  static onUse(ev: PlayerUseItemSignal) {
    const { player } = ev;
    const at = new Vector3f(player.position.x, player.position.y, player.position.z);

    const label = new DebugText(player.world, at, "hello world", {
      name: "demo_label",
      dimensionType: player.dimension.type
    });
    label.visibleTo = [player];
    label.attachedToEntityId = player.runtimeId;

    const ring = new DebugCircle(player.world, at, {
      dimensionType: player.dimension.type
    });
    ring.visibleTo = [player];
    ring.segments = 32;

    DebugRenderer.addShape(label);
    DebugRenderer.addShape(ring);

    // Later: label.remove();  or  DebugRenderer.removeShape(player.world, label.id);
  }
}
```

## Shape classes (constructors)

| Class | What it is |
|-------|------------|
| `DebugText` | `(world, location, text, options?)` |
| `DebugLine` | `(world, location, lineEndLocation, options?)` |
| `DebugBox` | `(world, location, boxBound, options?)` |
| `DebugCircle` | `(world, location, options?)` — optional `segments` |
| `DebugSphere` | `(world, location, options?)` — optional `segments` |
| `DebugArrow` | `(world, location, lineEndLocation, options?)` — optional head size / `segments` |

`options` is always `{ name?: string; dimensionType?: DimensionType }`.  
`dimensionType` limits the shape to that dimension inside the world; if you skip it, everyone in the world can receive it (subject to `visibleTo`).

Shortcuts on `DebugRenderer`: `addText`, `addLine`, `addBox`, `addCircle`, `addSphere`, `addArrow` — each builds the class and calls `addShape` for you.

## Useful fields (after `new`, before or after `addShape`)

- **`visibleTo`**: one `Player`, or `Player[]`. Only those players get the overlay.
- **`persistent`**: if `true`, the manager does not auto-remove the shape when a timer runs out.
- **`attachedToEntityId`**: set to `entity.runtimeId` to follow an entity on the client.
- **`color`**, **`scale`**, **`rotation`**, **`timeLeft`** / **`timeLeftTicks`**: styling and expiry (time is set after registration when using `timeLeft` helpers on the manager).

Removing: **`shape.remove()`** or **`DebugRenderer.removeShape(world, id)`**.

## Plugin `index.ts` for persistent data

Use this structure in your plugin `index.ts` so persistent debug text is restored/saved correctly:

```typescript
import { Plugin, PluginEvents, PluginPriority } from "@serenityjs/plugins";
import { WorldInitializeSignal } from "@serenityjs/core";
import { onInitialize } from "./scripts/setup/onInitialize";
import { DebugRenderer } from "./scripts/service/debugRenderer";

class DestinyZ_Plugins extends Plugin implements PluginEvents {
  public readonly priority: PluginPriority = PluginPriority.Low;

  public constructor() {
    super("destinyz-plugin", "1.0.0");
  }

  public onInitialize(): void {
    DebugRenderer.setPersistenceFilePath(
      DebugRenderer.defaultPersistencePath(this.path)
    );
    onInitialize.startOnInitialize(this.serenity);
  }

  public onWorldInitialize(ev: WorldInitializeSignal): void {
    // Keep only debug persistence logic here.
    DebugRenderer.restorePersistentFromDisk(ev.world.serenity);
  }

  public async onShutDown(_plugin: Plugin): Promise<void> {
    DebugRenderer.clearOnPluginUnload();
  }
}

export default new DestinyZ_Plugins();
```

What each hook does:

- **`onInitialize`**: defines the persistence file path and registers your event listeners.
- **`onWorldInitialize`**: restores again when each world finishes loading.
- **`onShutDown`**: saves persistent data and clears client overlays.

## What runs in the background (short)

`DebugRenderer` keeps shapes per **world**, hands out unique ids, and sends **`ServerScriptDebugDrawerPacket`** to the right players. If you use **time limits**, call **`DebugRenderer.tick(currentTick, world)`** from your world tick. If players **change dimension**, call **`DebugRenderer.onPlayerDimensionChange(player, fromDimension, toDimension)`** so overlays do not leak. On **plugin unload**, call **`DebugRenderer.clearOnPluginUnload()`** (and optionally configure persistence via **`DebugRenderer.setPersistenceFilePath`** if you use saved overlays).

For more copy-paste snippets, see [code.ts](https://github.com/SerenityJS/serenity/tree/main/docs/script-debug/code.ts).
