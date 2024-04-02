use napi::bindgen_prelude::BigInt;
use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Uint64;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readUint64**
   * 
   * Reads an usigned 64-bit ( 8 bytes ) integer from the stream. ( 0 to 18446744073709551615 )
  */
  pub fn read_uint64(&mut self, endian: Option<Endianness>) -> Result<BigInt> {
    Uint64::read(self, endian)
  }

  #[napi]
  /**
   * **writeUint64**
   * 
   * Writes an unsigned 64-bit ( 8 bytes ) integer to the stream. ( 0 to 18446744073709551615 )
  */
  pub fn write_uint64(&mut self, value: BigInt, endian: Option<Endianness>) {
    Uint64::write(self, value, endian);
  }
}
