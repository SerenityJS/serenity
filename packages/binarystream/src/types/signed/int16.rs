use napi_derive::napi;
use napi::Result;
use crate::binary::{ BinaryStream, Endianness };

#[napi]
/**
 * **Int16**
 * 
 * Represents a signed 16-bit ( 2 bytes ) integer. ( -32768 to 32767 )
*/
pub struct Int16 {}

#[napi]
impl Int16 {
  #[napi]
  /**
   * **read**
   * 
   * Reads a signed 16-bit ( 2 bytes ) integer from the stream. ( -32768 to 32767 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<i16> {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };

    let bytes = match stream.read(2) {
      Ok(bytes) => bytes,
      Err(err) => return Err(err)
    };

    match endian {
      Endianness::Big => Ok(i16::from_be_bytes([bytes[0], bytes[1]])),
      Endianness::Little => Ok(i16::from_le_bytes([bytes[0], bytes[1]])),
    }
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a signed 16-bit ( 2 bytes ) integer to the stream. ( -32768 to 32767 )
  */
  pub fn write(stream: &mut BinaryStream, value: i16, endian: Option<Endianness>) {
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
