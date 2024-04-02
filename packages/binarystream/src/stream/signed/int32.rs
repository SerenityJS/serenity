use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Int32;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readInt32**
   * 
   * Reads a signed 32-bit ( 4 bytes ) integer from the stream. ( -2147483648 to 2147483647 )
  */
  pub fn read_int32(&mut self, endian: Option<Endianness>) -> Result<i32> {
    Int32::read(self, endian)
  }

  #[napi]
  /**
   * **writeInt32**
   * 
   * Write a signed 32-bit ( 4 bytes ) integer to the stream. ( -2147483648 to 2147483647 )
  */
  pub fn write_int32(&mut self, value: i32, endian: Option<Endianness>) {
    Int32::write(self, value, endian);
  }
}
