use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Int32;

#[napi]
/**
 * **String**
 * 
 * Represents a signed 32-bit variable length ( 4 bytes ) utf-8 string. ( 0 to 4294967295 )
*/
pub struct String32 {}

#[napi]
impl String32 {
  #[napi]
  /**
   * **read**
   * 
   * Reads a signed 32-bit ( 4 bytes ) utf-8 string from the stream. ( 0 to 4294967295 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<String> {
    let length = match Int32::read(stream, endian) {
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
  pub fn write(stream: &mut BinaryStream, value: String, endian: Option<Endianness>) {
    let len = value.len() as i32;
    Int32::write(stream, len, endian);
    stream.write(value.as_bytes().to_vec())
  }
}
