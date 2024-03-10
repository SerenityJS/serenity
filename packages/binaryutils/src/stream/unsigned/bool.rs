use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::Bool;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readBool**
   * 
   * Reads a boolean ( 1 byte ) value from the stream. ( true or false )
  */
  pub fn read_bool(&mut self) -> Result<bool> {
    Bool::read(self)
  }

  #[napi]
  /**
   * **writeBool**
   * 
   * Writes a boolean ( 1 byte ) value to the stream. ( true or false )
  */
  pub fn write_bool(&mut self, value: bool) {
    Bool::write(self, value);
  }
}
