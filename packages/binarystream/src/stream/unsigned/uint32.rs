use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Uint32;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readUint32**
   * 
   * Reads an unsigned 32-bit ( 4 bytes ) integer from the stream. ( 0 to 4294967295 )
  */
  pub fn read_uint32(&mut self, endian: Option<Endianness>) -> Result<u32> {
    Uint32::read(self, endian)
  }

  #[napi]
  /**
   * **writeUint32**
   * 
   * Writes an unsigned 32-bit ( 4 bytes ) integer to the stream. ( 0 to 4294967295 )
  */
  pub fn write_uint32(&mut self, value: u32, endian: Option<Endianness>) {
    Uint32::write(self, value, endian);
  }
}
