use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;

#[napi]
/**
 * **Int8**
 * 
 * Represents a signed 8-bit ( 1 byte ) integer. ( -128 to 127 )
*/
pub struct Int8 {}

#[napi]
impl Int8 {
  #[napi]
  /**
   * **read**
   * 
   * Reads a signed 8-bit ( 1 byte ) integer from the stream. ( -128 to 127 )
  */
  pub fn read(stream: &mut BinaryStream) -> Result<i8> {
    let bytes = match stream.read(1) {
      Ok(bytes) => bytes,
      Err(err) => return Err(err)
    };
    
    Ok(bytes[0] as i8)
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a signed 8-bit ( 1 byte ) integer to the stream. ( -128 to 127 )
  */
  pub fn write(stream: &mut BinaryStream, value: i8) {
    stream.write(vec![value as u8])
  }
}
