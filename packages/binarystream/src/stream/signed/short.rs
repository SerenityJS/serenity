use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Short;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readShort**
   * 
   * Reads a signed 16-bit ( 2 bytes ) integer from the stream. ( -32768 to 32767 )
  */
  pub fn read_short(&mut self, endian: Option<Endianness>) -> Result<i16> {
    Short::read(self, endian)
  }

  #[napi]
  /**
   * **writeShort**
   * 
   * Writes a signed 16-bit ( 2 bytes ) integer to the stream. ( -32768 to 32767 )
  */
  pub fn write_short(&mut self, value: i16, endian: Option<Endianness>) {
    Short::write(self, value, endian);
  }
}
