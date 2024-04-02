use napi_derive::napi;
use napi::Result;
use crate::{binary::BinaryStream, stream::Endianness};

#[napi]
/**
 * **Float32**
 * 
 * Respresents a signed 32-bit ( 4 bytes ) floating point number. ( -3.402823e38 to 3.402823e38 )
*/
pub struct Float32 {}

#[napi]
impl Float32 {
  #[napi]
  /**
   * **read**
   * 
   * Reads a signed 32-bit ( 4 bytes ) floating point number from the stream. ( -3.402823e38 to 3.402823e38 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<f64> {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };

    let bytes = match stream.read(4) {
      Ok(bytes) => bytes,
      Err(err) => return Err(err)
    };

    match endian {
      Endianness::Big => Ok(f32::from_be_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]) as f64),
      Endianness::Little => Ok(f32::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]) as f64),
    }
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a signed 32-bit ( 4 bytes ) floating point number to the stream. ( -3.402823e38 to 3.402823e38 )
  */
  pub fn write(stream: &mut BinaryStream, value: f64, endian: Option<Endianness>) {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };

    let value = value as f32;
    
    match endian {
      Endianness::Big => stream.write(value.to_be_bytes().to_vec()),
      Endianness::Little => stream.write(value.to_le_bytes().to_vec()),
    }
  }
}
