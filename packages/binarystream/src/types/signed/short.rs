use napi_derive::napi;
use napi::Result;
use crate::binary::{ BinaryStream, Endianness };
use crate::types::Int16;

#[napi]
/**
 * **Short**
 * 
 * Represents a signed 16-bit ( 2 bytes ) integer. ( -32768 to 32767 )
*/
pub struct Short {}

#[napi]
impl Short {
  #[napi]
  /**
   * **read**
   * 
   * Reads a signed 16-bit ( 2 bytes ) integer from the stream. ( -32768 to 32767 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<i16> {
    Int16::read(stream, endian)
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a signed 16-bit ( 2 bytes ) integer to the stream. ( -32768 to 32767 )
  */
  pub fn write(stream: &mut BinaryStream, value: i16, endian: Option<Endianness>) {
    Int16::write(stream, value, endian);
  }
}
