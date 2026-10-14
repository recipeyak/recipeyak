//! Handlers are re-exported so routes read as `calendar::list_view`.

mod calendars_list;
mod create;
mod delete;
mod event_delete;
mod list;
mod pin_create;
mod scheduled_recipe_create;
mod settings;
mod update;

pub mod scheduled_recipe;

pub use calendars_list::*;
pub use create::*;
pub use delete::*;
pub use event_delete::*;
pub use list::*;
pub use pin_create::*;
pub use scheduled_recipe_create::*;
pub use settings::*;
pub use update::*;
