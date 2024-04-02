use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Float64;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readFloat64**
   * 
   * Reads a signed 64 bit ( 8 bytes ) floating point number from the stream. ( -1.7976931348623157e308 to 1.7976931348623157e308 )
  */
  pub fn read_float64(&mut self, endian: Option<Endianness>) -> Result<f64> {
    Float64::read(self, endian)
  }

  #[napi]
  /**
   * **writeFloat64**
   * 
   * Writes a signed 64 bit ( 8 bytes ) floating point number to the stream. ( -1.7976931348623157e308 to 1.7976931348623157e308 )
  */
  pub fn write_float64(&mut self, value: f64, endian: Option<Endianness>) {
    Float64::write(self, value, endian);
  }
}
