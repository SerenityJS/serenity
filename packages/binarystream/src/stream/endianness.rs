use napi_derive::napi;

#[napi]
pub enum Endianness {
  Big,
  Little,
}
