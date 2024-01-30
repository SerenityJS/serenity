import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';



class CommandDefinitionType extends DataType {
	public static override read(stream: BinaryStream): CommandDefinition {
        throw new Error("Not implemented");
	}

    public static readonly ValueWriters = {
        0(stream: BinaryStream, value: number){ stream.writeByte(value); },
        1(stream: BinaryStream, value: number){ stream.writeUint16(value, Endianness.Little); },
        2(stream: BinaryStream, value: number){ stream.writeUint32(value, Endianness.Little); }
    };
	public static override write(stream: BinaryStream, value: CommandDefinition): void {
        const length = value.enum_values.length;
        const writerMethod = this.ValueWriters[length<0xff?0:length<0xffff?1:2];
        
        stream.writeVarInt(value.enum_values.length);
        for (const s of value.enum_values) stream.writeVarString(s);
        stream.writeVarInt(value.chained_subcommand_values.length);
        for (const s of value.chained_subcommand_values) stream.writeVarString(s);
        stream.writeVarInt(value.suffixes.length);
        for (const s of value.suffixes) stream.writeVarString(s);
        stream.writeVarInt(value.enums.length);
        for (const {name, values} of value.enums) {
            stream.writeVarString(name);
            stream.writeVarInt(values.length);
            for (const v of values) writerMethod(stream, v);
        }
        
        stream.writeVarInt(value.chained_subcommands.length);
        for (const {name, values} of value.chained_subcommands) {
            stream.writeVarString(name);
            stream.writeVarInt(values.length);
            for (const {index, value} of values) {
                stream.writeUint16(index, Endianness.Little);
                stream.writeUint16(value, Endianness.Little);
            }
        }
        
        stream.writeVarInt(value.command_data.length);
        for (const {name, permission_level, alias, chained_subcommand_offsets, description, flags, overloads} of value.command_data) {
            stream.writeVarString(name);
            stream.writeVarString(description);
            stream.writeUint16(flags, Endianness.Little);
            stream.writeUint8(permission_level);
            stream.writeInt32(alias, Endianness.Little);
            stream.writeVarInt(chained_subcommand_offsets.length);
            for (const s of chained_subcommand_offsets) stream.writeUint16(s, Endianness.Little);
            stream.writeVarInt(overloads.length);
            for (const {chaining, parameters} of overloads){
                stream.writeBool(chaining);
                stream.writeVarInt(parameters.length);
                for (const {enum_type,name,optional,options,type} of parameters){
                    stream.writeVarString(name);
                    stream.writeUint16(type, Endianness.Little);
                    stream.writeUint16(enum_type, Endianness.Little);
                    stream.writeBool(optional);
                    stream.writeUint8(options); // options
                }
            }
        }
        
        stream.writeVarInt(value.dynamic_enums.length);
        for (const {name, values} of value.dynamic_enums) {
            stream.writeVarString(name);
            stream.writeVarInt(values.length);
            for (const s of values) stream.writeVarString(s);
        }

        stream.writeVarInt(value.enum_constraints.length);
        for (const {constraints,enumIndex,valueIndex} of value.enum_constraints) {
            stream.writeInt32(valueIndex, Endianness.Little);
            stream.writeInt32(enumIndex, Endianness.Little);
            stream.writeVarInt(constraints.length);
            for (const s of constraints) stream.writeUint8(s);
        }
	}
}
interface CommandDefinition {
    chained_subcommand_values: string[],
    chained_subcommands: ChainedSubCommand[],
    command_data: CommandData[],
    dynamic_enums: DynamicEnum[];
    enum_constraints:ConstraintsEnum [];
    enum_values: string[],
    enums: EnumCommandDefinition[],
    suffixes: string[];

}
interface ConstraintsEnum{
    constraints: number[],
    enumIndex: number;
    valueIndex: number;
}
interface DynamicEnum{
    name: string;
    values: string[];
}
interface CommandData{
    alias: number;
    chained_subcommand_offsets: number[],
    description: string;
    flags: number;
    name: string;
    overloads: CommandOverload[];
    permission_level: number;
}
interface ChainedSubCommand {
    name: string;
    values: {index: number; value: number;}[]
}
interface EnumCommandDefinition {
    name: string,
    values: number[],
}
interface CommandParam {
    enum_type: number;
    name: string;
    optional: boolean;
    options: CommandFlags;
    type: number;
}
interface CommandOverload{
    chaining: boolean;
    parameters: CommandParam[];
}
enum CommandFlags{
    
}
export { CommandDefinitionType, type CommandData, type CommandDefinition, 
    CommandFlags, type CommandOverload, type CommandParam, type ChainedSubCommand, 
    type ConstraintsEnum, type DynamicEnum, type EnumCommandDefinition };

/*

*/
