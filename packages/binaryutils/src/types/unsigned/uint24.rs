use napi_derive::napi;
use napi::Result;
use crate::binary::{ BinaryStream, Endianness };

#[napi]
/**
 * **Uint24**
 * 
 * Represents an unsigned 24-bit ( 3 bytes ) integer. ( 0 to 16777215 )
*/
pub struct Uint24 {}

#[napi]
impl Uint24 {
  #[napi]
  /**
   * **read**
   * 
   * Reads an unsigned 24-bit ( 3 bytes ) integer from the stream. ( 0 to 16777215 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<u32> {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };

    let bytes = match stream.read(3) {
      Ok(bytes) => bytes,
      Err(err) => return Err(err)
    };

    match endian {
      Endianness::Big => Ok(u32::from_be_bytes([0, bytes[0], bytes[1], bytes[2]])),
      Endianness::Little => Ok(u32::from_le_bytes([bytes[0], bytes[1], bytes[2], 0])),
    }
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes an unsigned 24-bit ( 3 bytes ) integer to the stream. ( 0 to 16777215 )
  */
  pub fn write(stream: &mut BinaryStream, value: u32, endian: Option<Endianness>) {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };

    match endian {
      Endianness::Big => stream.write(value.to_be_bytes()[1..].to_vec()),
      Endianness::Little => stream.write(value.to_le_bytes()[..3].to_vec()),
    }
  }
}
