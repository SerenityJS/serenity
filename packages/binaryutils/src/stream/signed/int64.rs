use napi::bindgen_prelude::BigInt;
use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Int64;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readInt64**
   * 
   * Reads a signed 64-bit ( 8 bytes ) integer from the stream. ( -9223372036854775808 to 9223372036854775807 )
  */
  pub fn read_int64(&mut self, endian: Option<Endianness>) -> Result<BigInt> {
    Int64::read(self, endian)
  }

  #[napi]
  /**
   * **writeInt64**
   * 
   * Writes a signed 64-bit ( 8 bytes ) integer to the stream. ( -9223372036854775808 to 9223372036854775807 )
  */
  pub fn write_int64(&mut self, value: BigInt, endian: Option<Endianness>) {
    Int64::write(self, value, endian);
  }
}
