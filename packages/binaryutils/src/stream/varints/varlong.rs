use napi::bindgen_prelude::BigInt;
use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::VarLong;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readVarLong**
   * 
   * Reads a 64 bit ( 8 bytes ) unsigned variable length integer from the stream. ( 0 to 18446744073709551615 )
  */
  pub fn read_var_long(&mut self) -> Result<BigInt> {
    VarLong::read(self)
  }

  #[napi]
  /**
   * **writeVarLong**
   * 
   * Writes a 64 bit ( 8 bytes ) unsigned variable length integer to the stream. ( 0 to 18446744073709551615 )
  */
  pub fn write_var_long(&mut self, value: BigInt) {
    VarLong::write(self, value);
  }
}
