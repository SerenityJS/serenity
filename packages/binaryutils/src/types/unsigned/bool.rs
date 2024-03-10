use napi_derive::napi;
use napi::Result;
use crate::binary::BinaryStream;

#[napi]
/**
 * **Bool**
 * 
 * Represents a boolean value. ( true or false )
*/
pub struct Bool {}

#[napi]
impl Bool {
  #[napi]
  /**
   * **read**
   * 
   * Reads a boolean ( 1 byte ) value from the stream. ( true or false )
  */
  pub fn read(stream: &mut BinaryStream) -> Result<bool> {
    let bytes = match stream.read(1) {
      Ok(bytes) => bytes,
      Err(err) => return Err(err)
    };
    
    Ok(bytes[0] != 0)
  }

  #[napi]
  /**
   * **write**
   * 
   * Writes a boolean ( 1 byte ) value to the stream. ( true or false )
  */
  pub fn write(stream: &mut BinaryStream, value: bool) {
    let value = match value {
      true => 1,
      false => 0,
    };
    
    stream.write(vec![value])
  }
}
