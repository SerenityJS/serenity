use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::ZigZag;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readZigZag**
   * 
   * Reads a 32 bit ( 4 bytes ) zigzag encoded signed variable length integer from the stream. ( -2147483648 to 2147483647 )
  */
  pub fn read_zig_zag(&mut self) -> Result<i32> {
    ZigZag::read(self)
  }

  #[napi]
  /**
   * **writeZigZag**
   * 
   * Writes a 32 bit ( 4 bytes ) zigzag encoded signed variable length integer to the stream. ( -2147483648 to 2147483647 )
  */
  pub fn write_zig_zag(&mut self, value: i32) {
    ZigZag::write(self, value);
  }
}
