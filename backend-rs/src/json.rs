//! Serialization helpers to match the Django backend's JSON output (orjson).

use chrono::{DateTime, Timelike, Utc};
use serde::Serializer;

/// Formats like orjson: `2024-01-02T03:04:05.123456+00:00`, omitting the
/// fractional seconds when they're zero.
pub fn format_datetime(dt: &DateTime<Utc>) -> String {
    if dt.nanosecond() == 0 {
        dt.format("%Y-%m-%dT%H:%M:%S+00:00").to_string()
    } else {
        dt.format("%Y-%m-%dT%H:%M:%S%.6f+00:00").to_string()
    }
}

pub fn serialize_option_datetime<S: Serializer>(
    dt: &Option<DateTime<Utc>>,
    serializer: S,
) -> Result<S::Ok, S::Error> {
    match dt {
        Some(dt) => serializer.serialize_str(&format_datetime(dt)),
        None => serializer.serialize_none(),
    }
}

#[cfg(test)]
mod tests {
    use chrono::TimeZone;

    use super::*;

    #[test]
    fn format_datetime_matches_orjson() {
        let dt = Utc.with_ymd_and_hms(2024, 1, 2, 3, 4, 5).unwrap();
        assert_eq!(format_datetime(&dt), "2024-01-02T03:04:05+00:00");
        let dt = dt.with_nanosecond(123_456_000).unwrap();
        assert_eq!(format_datetime(&dt), "2024-01-02T03:04:05.123456+00:00");
    }
}
