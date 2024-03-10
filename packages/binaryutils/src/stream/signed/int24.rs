use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Int24;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readInt24**
   * 
   * Reads a signed 24-bit ( 3 bytes ) integer from the stream. ( -8388608 to 8388607 )
  */
  pub fn read_int24(&mut self, endian: Option<Endianness>) -> Result<i32> {
    Int24::read(self, endian)
  }

  #[napi]
  /**
   * **writeInt24**
   * 
   * Writes a signed 24-bit ( 3 bytes ) integer to the stream. ( -8388608 to 8388607 )
  */
  pub fn write_int24(&mut self, value: i32, endian: Option<Endianness>) {
    Int24::write(self, value, endian);
  }
}
