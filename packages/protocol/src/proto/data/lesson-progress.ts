import { VarInt, VarString } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.LessonProgress)
class LessonProgressPacket extends DataPacket {
  @Serialize(VarInt) public lessonAction!: number;
  @Serialize(VarInt) public score!: number;
  @Serialize(VarString) public activityId!: string;
}

export { LessonProgressPacket };
