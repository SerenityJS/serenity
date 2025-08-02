import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { BookEditAction } from "../../enums";

class BookActions extends DataType {
  public pageIndex: number;
  public pageIndexB: number;
  public textA: string;
  public textB: string;
  public xuid: string;

  public constructor(
    pageIndex: number,
    textA: string,
    textB: string,
    xuid: string,
    pageIndexB: number
  ) {
    super();
    this.pageIndex = pageIndex;
    this.textA = textA;
    this.textB = textB;
    this.xuid = xuid;
    this.pageIndexB = pageIndexB;
  }

  public static override read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<BookEditAction>
  ) {
    let pageIndex = 0;
    let pageIndexB = 0;
    let textA = "";
    let textB = "";
    let xuid = "";

    switch (options?.parameter) {
      case BookEditAction.ReplacePage:
      case BookEditAction.AddPage: {
        pageIndex = stream.readUint8();
        textA = stream.readVarString();
        textB = stream.readVarString();
        break;
      }
      case BookEditAction.DeletePage: {
        pageIndex = stream.readUint8();
        break;
      }
      case BookEditAction.SwapPage: {
        pageIndex = stream.readUint8();
        pageIndexB = stream.readUint8();
        break;
      }
      case BookEditAction.Finalize: {
        textA = stream.readVarString();
        textB = stream.readVarString();
        xuid = stream.readVarString();
      }
    }
    return new BookActions(pageIndex, textA, textB, xuid, pageIndexB);
  }

  public static write(
    stream: BinaryStream,
    value: BookActions,
    options?: PacketDataTypeOptions<BookEditAction>
  ): void {
    switch (options?.parameter) {
      case BookEditAction.ReplacePage:
      case BookEditAction.AddPage: {
        stream.writeUint8(value.pageIndex);
        stream.writeVarString(value.textA);
        stream.writeVarString(value.textB);
        break;
      }
      case BookEditAction.DeletePage: {
        stream.writeUint8(value.pageIndex);
        break;
      }
      case BookEditAction.SwapPage: {
        stream.writeUint8(value.pageIndex);
        stream.writeUint8(value.pageIndexB);
        break;
      }
      case BookEditAction.Finalize: {
        stream.writeVarString(value.textA);
        stream.writeVarString(value.textB);
        stream.writeVarString(value.xuid);
        break;
      }
    }
  }
}

export { BookActions };
