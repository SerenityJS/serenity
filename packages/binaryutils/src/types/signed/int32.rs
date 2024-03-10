use napi_derive::napi;
use napi::Result;
use crate::binary::{ BinaryStream, Endianness };

#[napi]
/**
 * **Int32**
 * 
 * Represents a signed 32-bit ( 4 bytes ) integer. ( -2147483648 to 2147483647 )
*/
pub struct Int32 {}

#[napi]
impl Int32 {
  #[napi]
  /**
   * **read**
   * 
   * Reads a signed 32-bit ( 4 bytes ) integer from the stream. ( -2147483648 to 2147483647 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<i32> {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };

    let bytes = match stream.read(4) {
      Ok(bytes) => bytes,
      Err(err) => return Err(err)
    };

    match endian {
      Endianness::Big => Ok(i32::from_be_bytes([bytes[0], bytes[1], bytes[2], bytes[3]])),
      Endianness::Little => Ok(i32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]])),
    }
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a signed 32-bit ( 4 bytes ) integer to the stream. ( -2147483648 to 2147483647 )
  */
  pub fn write(stream: &mut BinaryStream, value: i32, endian: Option<Endianness>) {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };
    
    match endian {
      Endianness::Big => stream.write(value.to_be_bytes().to_vec()),
      Endianness::Little => stream.write(value.to_le_bytes().to_vec()),
    }
  }
}
