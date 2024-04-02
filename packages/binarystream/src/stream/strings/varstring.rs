use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::VarString;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readVarString**
   * 
   * Reads a signed 32-bit ( 4 bytes ) utf-8 string from the stream. ( 0 to 4294967295 )
  */
  pub fn read_var_string(&mut self) -> Result<String> {
    VarString::read(self)
  }

  #[napi]
  /**
   * **writeVarString**
   * 
   * Writes a signed 32-bit ( 4 bytes ) utf-8 string to the stream. ( 0 to 4294967295 )
  */
  pub fn write_var_string(&mut self, value: String) {
    VarString::write(self, value);
  }
}
