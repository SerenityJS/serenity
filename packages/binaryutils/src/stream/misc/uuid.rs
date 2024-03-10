use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::Uuid;

#[napi]
impl BinaryStream {
  #[napi]
  /**
   * **readUuid**
   * 
   * Reads a signed 128-bit ( 16 bytes ) uuid string from the stream.
  */
  pub fn read_uuid(&mut self) -> Result<String> {
    Uuid::read(self)
  }

  #[napi]
  /**
   * **writeUuid**
   * 
   * Writes a signed 128-bit ( 16 bytes ) uuid string to the stream.
  */
  pub fn write_uuid(&mut self, value: String) {
    Uuid::write(self, value);
  }
}
