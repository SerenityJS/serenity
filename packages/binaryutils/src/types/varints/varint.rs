use napi_derive::napi;
use napi::{ Result, Error, Status::GenericFailure };
use crate::binary::BinaryStream;
use crate::types::Uint8;

#[napi]
/**
 * **VarInt**
 * 
 * Represents a 32 bit ( 4 bytes ) unsigned variable length integer. ( 0 to 4294967295 )
*/
pub struct VarInt {}

#[napi]
impl VarInt {
  #[napi]
  /**
   * **read**
   * 
   * Reads a 32 bit ( 4 bytes ) unsigned variable length integer from the stream. ( 0 to 4294967295 )
  */
  pub fn read(stream: &mut BinaryStream) -> Result<u32> {
    let mut value = 0;
    let mut size = 0;
    loop {
      let byte = match Uint8::read(stream) {
        Ok(byte) => byte,
        Err(err) => return Err(err)
      };
      
      value |= (byte as u32 & 0x7F) << (size * 7);
      size += 1;
      if size > 5 {
        return Err(
          Error::new(
            GenericFailure,
            "VarInt is too big"
          )
        )
      }
      if (byte & 0x80) != 0x80 {
        break;
      }
    }

    Ok(value)
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a 32 bit ( 4 bytes ) unsigned variable length integer to the stream. ( 0 to 4294967295 )
  */
  pub fn write(stream: &mut BinaryStream, value: u32) {
    let mut value = value;
    loop {
      let mut byte = (value & 0x7F) as u8;
      value >>= 7;
      if value != 0 {
        byte |= 0x80;
      }
      Uint8::write(stream, byte);
      if value == 0 {
        break;
      }
    }
  }
}
