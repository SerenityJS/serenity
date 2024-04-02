use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::Int8;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readInt8**
   * 
   * Reads a signed 8-bit ( 1 byte ) integer from the stream. ( -128 to 127 )
  */
  pub fn read_int8(&mut self) -> Result<i8> {
    Int8::read(self)
  }

  #[napi]
  /**
   * **writeInt8**
   * 
   * Writes a signed 8-bit ( 1 byte ) integer to the stream. ( -128 to 127 )
  */
  pub fn write_int8(&mut self, value: i8) {
    Int8::write(self, value);
  }
}