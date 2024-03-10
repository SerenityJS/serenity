use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Int16;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readInt16**
   * 
   * Reads a signed 16-bit ( 2 bytes ) integer from the stream. ( -32768 to 32767 )
  */
  pub fn read_int16(&mut self, endian: Option<Endianness>) -> Result<i16> {
    Int16::read(self, endian)
  }

  #[napi]
  /**
   * **writeInt16**
   * 
   * Writes a signed 16-bit ( 2 bytes ) integer to the stream. ( -32768 to 32767 )
  */
  pub fn write_int16(&mut self, value: i16, endian: Option<Endianness>) {
    Int16::write(self, value, endian);
  }
}
