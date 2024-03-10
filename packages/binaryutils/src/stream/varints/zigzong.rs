use napi::bindgen_prelude::BigInt;
use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::ZigZong;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readZigZong**
   * 
   * Reads a 64 bit ( 8 bytes ) zigzag encoded signed variable length integer from the stream. ( -9223372036854775808 to 9223372036854775807 )
  */
  pub fn read_zig_zong(&mut self) -> Result<BigInt> {
    ZigZong::read(self)
  }

  #[napi]
  /**
   * **writeZigZong**
   * 
   * Writes a 64 bit ( 8 bytes ) zigzag encoded signed variable length integer to the stream. ( -9223372036854775808 to 9223372036854775807 )
  */
  pub fn write_zig_zong(&mut self, value: BigInt) {
    ZigZong::write(self, value);
  }
}
