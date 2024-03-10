use napi::bindgen_prelude::BigInt;
use napi_derive::napi;
use napi::Result;
use crate::binary::{ BinaryStream, Endianness };
use crate::types::Int64;

#[napi]
/**
 * **Long**
 * 
 * Represents a signed 64-bit ( 8 bytes ) integer. ( -9223372036854775808 to 9223372036854775807 )
*/
pub struct Long {}

#[napi]
impl Long {
  #[napi]
  /**
   * **read**
   * 
   * Reads a signed 64-bit ( 8 bytes ) integer from the stream. ( -9223372036854775808 to 9223372036854775807 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<BigInt> {
    Int64::read(stream, endian)
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a signed 64-bit ( 8 bytes ) integer to the stream. ( -9223372036854775808 to 9223372036854775807 )
  */
  pub fn write(stream: &mut BinaryStream, value: BigInt, endian: Option<Endianness>) {
    Int64::write(stream, value, endian);
  }
}
