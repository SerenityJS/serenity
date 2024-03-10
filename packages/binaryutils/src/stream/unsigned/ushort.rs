use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::UShort;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readUShort**
   * 
   * Read an unsigned 16-bit ( 2 bytes ) integer from the stream. ( 0 to 65535 )
  */
  pub fn read_u_short(&mut self, endian: Option<Endianness>) -> Result<u16> {
    UShort::read(self, endian)
  }

  #[napi]
  /**
   * **writeUShort**
   * 
   * Write an unsigned 16-bit ( 2 bytes ) integer to the stream. ( 0 to 65535 )
  */
  pub fn write_u_short(&mut self, value: u16, endian: Option<Endianness>) {
    UShort::write(self, value, endian);
  }
}
