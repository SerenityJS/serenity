use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::types::VarInt;

#[napi]
/**
 * **String**
 * 
 * Represents a signed 32-bit variable length ( 4 bytes ) utf-8 string. ( 0 to 4294967295 )
*/
pub struct VarString {}

#[napi]
impl VarString {
  #[napi]
  /**
   * **read**
   * 
   * Reads a signed 32-bit ( 4 bytes ) utf-8 string from the stream. ( 0 to 4294967295 )
  */
  pub fn read(stream: &mut BinaryStream) -> Result<String> {
    let length = match VarInt::read(stream) {
      Ok(value) => value as usize,
      Err(err) => return Err(err)
    };

    let value = String::from_utf8_lossy(&&stream.binary[stream.offset as usize..stream.offset as usize + length]).to_string();
    stream.offset += length as u32;
    
    Ok(value)
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a signed 32-bit ( 4 bytes ) utf-8 string to the stream. ( 0 to 4294967295 )
  */
  pub fn write(stream: &mut BinaryStream, value: String) {
    let length = value.len() as u32;
    let vec = value.as_bytes().to_vec();
    VarInt::write(stream, length);
    stream.write(vec)
  }
}
