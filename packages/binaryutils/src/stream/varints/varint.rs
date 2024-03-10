use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::VarInt;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readVarInt**
   * 
   * Reads a 32 bit ( 4 bytes ) unsigned variable length integer from the stream. ( 0 to 4294967295 )
  */
  pub fn read_var_int(&mut self) -> Result<u32> {
    VarInt::read(self)
  }

  #[napi]
  /**
   * **writeVarInt**
   * 
   * Writes a 32 bit ( 4 bytes ) unsigned variable length integer to the stream. ( 0 to 4294967295 )
  */
  pub fn write_var_int(&mut self, value: u32) {
    VarInt::write(self, value);
  }
}
