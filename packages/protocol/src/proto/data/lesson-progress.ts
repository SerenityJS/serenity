import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.LessonProgress)
class LessonProgressPacket extends DataPacket {
  @Serialize(VarInt) public lessonAction!: number;
  @Serialize(VarInt) public score!: number;
  @Serialize(VarString) public activityId!: string;
}

export { LessonProgressPacket };
