#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

#[napi]
pub fn foo() -> String {
  String::from("@serenityjs/netbeans")
}
