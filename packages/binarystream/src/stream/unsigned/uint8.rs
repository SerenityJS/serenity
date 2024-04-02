use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::Uint8;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readUint8**
   * 
   * Reads an unsigned 8-bit ( 1 byte ) integer from the stream. ( 0 to 255 )
  */
  pub fn read_uint8(&mut self) -> Result<u8> {
    Uint8::read(self)
  }

  #[napi]
  /**
   * **writeUint8**
   * 
   * Writes an unsigned 8-bit ( 1 byte ) integer to the stream. ( 0 to 255 )
  */
  pub fn write_uint8(&mut self, value: u8) {
    Uint8::write(self, value);
  }
}
