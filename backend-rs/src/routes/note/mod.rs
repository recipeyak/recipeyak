//! Handlers are re-exported so routes read as `note::create_view`.

mod create;
mod delete;
mod update;

pub mod serialize;

pub use create::*;
pub use delete::*;
pub use update::*;
