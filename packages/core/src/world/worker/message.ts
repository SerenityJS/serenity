import { DimensionType } from "@serenityjs/protocol";

import { WorkerMessageType } from "./message-type";

interface WorkerMessageTypeDescriptor {
  [WorkerMessageType.ReadChunk]: {
    cx: number;
    cz: number;
    type: DimensionType;
    dimension?: number;
  };

  [WorkerMessageType.WriteChunk]: null;

  [WorkerMessageType.ReadChunkResponse]: {
    cx: number;
    cz: number;
    type: DimensionType;
    buffer: Uint8Array;
  };

  [WorkerMessageType.ReadChunkResponseNull]: {
    cx: number;
    cz: number;
    type: DimensionType;
  };

  [WorkerMessageType.Shutdown]: {
    threadId: number;
  };
}

interface WorkerMessage<T extends WorkerMessageType = WorkerMessageType> {
  identifier: string;
  type: T;
  data: WorkerMessageTypeDescriptor[T];
}

export type { WorkerMessage };
