use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Uint24;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readUint24**
   * 
   * Reads an unsigned 24-bit ( 3 bytes ) integer from the stream. ( 0 to 16777215 )
  */
  pub fn read_uint24(&mut self, endian: Option<Endianness>) -> Result<u32> {
    Uint24::read(self, endian)
  }

  #[napi]
  /**
   * **writeUint24**
   * 
   * Writes an unsigned 24-bit ( 3 bytes ) integer to the stream. ( 0 to 16777215 )
  */
  pub fn write_uint24(&mut self, value: u32, endian: Option<Endianness>) {
    Uint24::write(self, value, endian);
  }
}
