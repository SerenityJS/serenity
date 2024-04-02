use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;
use crate::stream::Endianness;
use crate::types::Uint16;

#[napi]
/**
 * **String**
 * 
 * Represents an unsigned 16-bit variable length ( 2 bytes ) utf-8 string. ( 0 to 65535 )
*/
pub struct String16 {}

#[napi]
impl String16 {
  #[napi]
  /**
   * **read**
   * 
   * Reads an unsigned 16-bit ( 2 bytes ) utf-8 string from the stream. ( 0 to 65535 )
  */
  pub fn read(stream: &mut BinaryStream, endian: Option<Endianness>) -> Result<String> {
    let len = match Uint16::read(stream, endian) {
      Ok(value) => value,
      Err(err) => return Err(err)
    };

    let value = String::from_utf8_lossy(&&stream.binary[stream.offset as usize..stream.offset as usize + len as usize]).to_string();
    stream.offset += len as u32;

    Ok(value)
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes an unsigned 16-bit ( 2 bytes ) utf-8 string to the stream. ( 0 to 65535 )
  */
  pub fn write(stream: &mut BinaryStream, value: String, endian: Option<Endianness>) {
    let len = value.len() as u16;
    Uint16::write(stream, len, endian);
    stream.write(value.as_bytes().to_vec())
  }
}
