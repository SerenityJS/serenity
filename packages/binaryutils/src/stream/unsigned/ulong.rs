use napi::bindgen_prelude::BigInt;
use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::ULong;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readULong**
   * 
   * Reads an usigned 64-bit ( 8 bytes ) integer from the stream. ( 0 to 18446744073709551615 )
  */
  pub fn read_u_long(&mut self, endian: Option<Endianness>) -> Result<BigInt> {
    ULong::read(self, endian)
  }

  #[napi]
  /**
   * **writeULong**
   * 
   * Writes an unsigned 64-bit ( 8 bytes ) integer to the stream. ( 0 to 18446744073709551615 )
  */
  pub fn write_u_long(&mut self, value: BigInt, endian: Option<Endianness>) {
    ULong::write(self, value, endian);
  }
}
