use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::String32;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readString32**
   * 
   * Reads a signed 32-bit ( 4 bytes ) utf-8 string from the stream. ( 0 to 4294967295 )
  */
  pub fn read_string32(&mut self, endian: Option<Endianness>) -> Result<String> {
    String32::read(self, endian)
  }

  #[napi]
  /**
   * **writeString32**
   * 
   * Writes a signed 32-bit ( 4 bytes ) utf-8 string to the stream. ( 0 to 4294967295 )
  */
  pub fn write_string32(&mut self, value: String, endian: Option<Endianness>) {
    String32::write(self, value, endian);
  }
}
