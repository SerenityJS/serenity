use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Uint16;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readUint16**
   * 
   * Read an unsigned 16-bit ( 2 bytes ) integer from the stream. ( 0 to 65535 )
  */
  pub fn read_uint16(&mut self, endian: Option<Endianness>) -> Result<u16> {
    Uint16::read(self, endian)
  }

  #[napi]
  /**
   * **writeUint16**
   * 
   * Write an unsigned 16-bit ( 2 bytes ) integer to the stream. ( 0 to 65535 )
  */
  pub fn write_uint16(&mut self, value: u16, endian: Option<Endianness>) {
    Uint16::write(self, value, endian);
  }
}
