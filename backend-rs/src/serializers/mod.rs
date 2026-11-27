//! Response types used by more than one route, or by realtime messages.
//! Types used by a single route stay in that route's module.

pub mod scheduled_recipe;

pub use scheduled_recipe::ScheduledRecipe;
