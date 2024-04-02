use napi_derive::napi;
use napi::Result;
use crate::binary::{ BinaryStream, Endianness };
use crate::types::Uint16;

#[napi]
/**
 * **UShort**
 * 
 * Represents an unsigned 16-bit ( 2 bytes ) integer. ( 0 to 65535 )
*/
pub struct UShort {}

#[napi]
impl UShort {
  #[napi]
  /**
   * **read**
   * 
   * Reads an unsigned 16-bit ( 2 bytes ) integer from the stream. ( 0 to 65535 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<u16> {
    Uint16::read(stream, endian)
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes an unsigned 16-bit ( 2 bytes ) integer to the stream. ( 0 to 65535 )
  */
  pub fn write(stream: &mut BinaryStream, value: u16, endian: Option<Endianness>) {
    Uint16::write(stream, value, endian);
  }
}
