use napi::bindgen_prelude::BigInt;
use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Long;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readLong**
   * 
   * Reads a signed 64-bit ( 8 bytes ) integer from the stream. ( -9223372036854775808 to 9223372036854775807 )
  */
  pub fn read_long(&mut self, endian: Option<Endianness>) -> Result<BigInt> {
    Long::read(self, endian)
  }

  #[napi]
  /**
   * **writeLong**
   * 
   * Writes a signed 64-bit ( 8 bytes ) integer to the stream. ( -9223372036854775808 to 9223372036854775807 )
  */
  pub fn write_long(&mut self, value: BigInt, endian: Option<Endianness>) {
    Long::write(self, value, endian);
  }
}
