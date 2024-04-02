use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Float32;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readFloat32**
   * 
   * Reads a signed 32-bit ( 4 bytes ) integer from the stream. ( -2147483648 to 2147483647 )
  */
  pub fn read_float32(&mut self, endian: Option<Endianness>) -> Result<f64> {
    Float32::read(self, endian)
  }

  #[napi]
  /**
   * **writeFloat32**
   * 
   * Write a signed 32-bit ( 4 bytes ) integer to the stream. ( -2147483648 to 2147483647 )
  */
  pub fn write_float32(&mut self, value: f64, endian: Option<Endianness>) {
    Float32::write(self, value, endian);
  }
}
