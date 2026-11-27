//! Extractors shared across routes. Use `Json`, `Path` and `Params` from here
//! instead of axum's so bad requests get Django's error responses.

pub mod calendar;
mod db;
mod json;
mod params;
mod path;
pub mod team;
pub mod user;

pub use json::Json;
pub use params::Params;
pub use path::Path;
