use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::String16;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readString16**
   * 
   * Reads an unsigned 16-bit ( 2 bytes ) utf-8 string from the stream. ( 0 to 65535 )
  */
  pub fn read_string16(&mut self, endian: Option<Endianness>) -> Result<String> {
    String16::read(self, endian)
  }

  #[napi]
  /**
   * **writeString16**
   * 
   * Writes an unsigned 16-bit ( 2 bytes ) utf-8 string to the stream. ( 0 to 65535 )
  */
  pub fn write_string16(&mut self, value: String, endian: Option<Endianness>) {
    String16::write(self, value, endian);
  }
}
