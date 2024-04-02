use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::Byte;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readByte**
   * 
   * Reads a signed 8-bit ( 1 byte ) integer from the stream. ( -128 to 127 )
  */
  pub fn read_byte(&mut self) -> Result<i8> {
    Byte::read(self)
  }

  #[napi]
  /**
   * **writeByte**
   * 
   * Writes a signed 8-bit ( 1 byte ) integer to the stream. ( -128 to 127 )
  */
  pub fn write_byte(&mut self, value: i8) {
    Byte::write(self, value);
  }
}
