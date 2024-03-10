use napi_derive::napi;
use napi::Result;
use napi::bindgen_prelude::BigInt;
use crate::binary::{ BinaryStream, Endianness };

#[napi]
/**
 * **Uint64**
 * 
 * Represents an unsigned 64-bit ( 8 bytes ) integer. ( 0 to 18446744073709551615 )
*/
pub struct Uint64 {}

#[napi]
impl Uint64 {
  #[napi]
  /**
   * **read**
   * 
   * Reads an unsigned 64-bit ( 8 bytes ) integer from the stream. ( 0 to 18446744073709551615 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<BigInt> {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };

    let bytes = match stream.read(8) {
      Ok(bytes) => bytes,
      Err(err) => return Err(err)
    };

    match endian {
      Endianness::Big => Ok(BigInt::from(u64::from_be_bytes([bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]]))),
      Endianness::Little => Ok(BigInt::from(u64::from_le_bytes([bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]]))),
    }
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes an unsigned 64-bit ( 8 bytes ) integer to the stream. ( 0 to 18446744073709551615 )
  */
  pub fn write(stream: &mut BinaryStream, value: BigInt, endian: Option<Endianness>) {
    let endian = match endian {
      Some(endian) => endian,
      None => Endianness::Big,
    };

    let value = value.get_u64().1;
    
    match endian {
      Endianness::Big => stream.write(value.to_be_bytes().to_vec()),
      Endianness::Little => stream.write(value.to_le_bytes().to_vec()),
    }
  }
}
