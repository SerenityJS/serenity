use napi_derive::napi;
use napi::bindgen_prelude::*;
use napi::{ Result, Status::GenericFailure };

#[napi]
pub struct BinaryStream {
  /**
   * **binary**
   * 
   * The binary data of the stream.
  */
  pub binary: Vec<u8>,
  /**
   * **offset**
   * 
   * The current offset of the stream.
   */
  pub offset: u32,
}

#[napi]
impl BinaryStream {
  /**
   * **BinaryStream**
   * 
   * Creates a new BinaryStream with an optional JavaScript Buffer.
  */
  #[napi(constructor)]
  pub fn new(buffer: Option<Buffer>, offset: Option<u32>) -> Self {
    // Match the buffer, if none is provided, create a new buffer.
    let bin = match buffer {
      Some(buffer) => buffer,
      None => Buffer::from(vec![]),
    };

    // Match the offset, if none is provided, set it to 0.
    let offset = match offset {
      Some(offset) => offset,
      None => 0,
    };

    // Return the new BinaryStream.
    BinaryStream {
      binary: bin.to_vec(),
      offset,
    }
  }

  /**
   * **from**
   * 
   * Creates a new BinaryStream from a binary vector.
  */
  #[napi(factory)]
  pub fn from(binary: Vec<u8>, offset: Option<u32>) -> Self {
    // Match the offset, if none is provided, set it to 0.
    let offset = match offset {
        Some(offset) => offset,
        None => 0,
    };

    // Return the new BinaryStream.
    BinaryStream {
      binary,
      offset,
    }
  }

  /**
   * **fromBuffer**
   * 
   * Creates a new BinaryStream from a JavaScript Buffer.
  */
  #[napi(factory)]
  pub fn from_buffer(buffer: Buffer, offset: Option<u32>) -> Self {
    // Match the offset, if none is provided, set it to 0.
    let offset = match offset {
        Some(offset) => offset,
        None => 0,
    };

    // Return the new BinaryStream.
    BinaryStream {
      binary: buffer.to_vec(),
      offset,
    }
  }

  /**
   * **read**
   * 
   * Reads a number of bytes from the stream.
  */
  #[napi]
  pub fn read(&mut self, length: u32) -> Result<Vec<u8>> {
    // Check if the length is greater than the remaining bytes.
    if length > self.binary.len() as u32 {
      return Err(
        Error::new(
          GenericFailure,
          "Length is greater than the remaining bytes.".to_string()
        )
      )
    }

    // Check if the offset is in the bounds of the binary.
    if self.offset + length > self.binary.len() as u32 {
      return Err(
        Error::new(
          GenericFailure,
          "Offset is out of bounds.".to_string()
        )
      )
    }

    // Get the start and end of the bytes.
    let start = self.offset as usize;
    let end = (self.offset + length) as usize;
    self.offset += length;

    Ok(self.binary[start..end].to_vec())
  }

  /**
   * **readBuffer**
   * 
   * Reads a number of bytes from the stream and returns a JavaScript Buffer.
  */
  #[napi]
  pub fn read_buffer(&mut self, length: u32) -> Result<Buffer> {
    let bytes = match self.read(length) {
      Ok(bytes) => bytes,
      Err(err) => return Err(err)
    };

    Ok(Buffer::from(bytes))
  }

  /**
   * **write**
   * 
   * Writes a number of bytes to the stream.
  */
  #[napi]
  pub fn write(&mut self, data: Vec<u8>) {
    self.binary.extend(data);
  }

  /**
   * **writeBuffer**
   * 
   * Writes a JavaScript Buffer to the stream.
  */
  #[napi]
  pub fn write_buffer(&mut self, data: Buffer) {
    self.binary.extend(data.to_vec());
  }

  /**
   * **readRemaining**
   * 
   * Reads the remaining bytes from the stream.
  */
  #[napi]
  pub fn read_remaining(&mut self) -> Vec<u8> {
    let start = self.offset as usize;
    let end = self.binary.len();
    self.offset = end as u32;

    self.binary[start..end].to_vec()
  }

  /**
   * **readRemainingBuffer**
   * 
   * Reads the remaining bytes from the stream and returns a JavaScript Buffer.
  */
  #[napi]
  pub fn read_remaining_buffer(&mut self) -> Buffer {
    let bytes = self.read_remaining();

    Buffer::from(bytes)
  }

  /**
   * **skip**
   * 
   * Skips a number of bytes from the stream.
  */
  #[napi]
  pub fn skip(&mut self, length: u32) {
    self.offset += length;
  }

  /**
   * **cursorAtEnd**
   * 
   * Checks if the cursor is at the end of the stream.
  */
  #[napi]
  pub fn cursor_at_end(&self) -> bool {
    self.offset == self.binary.len() as u32
  }

  /**
   * **cursorAtStart**
   * 
   * Checks if the cursor is at the start of the stream.
  */
  #[napi]
  pub fn cursor_at_start(&self) -> bool {
    self.offset == 0
  }

  /**
   * **getBuffer**
   * 
   * Gets the binary as a JavaScript Buffer.
  */
  #[napi]
  pub fn get_buffer(&self) -> Buffer {
    Buffer::from(self.binary.clone())
  }
}
