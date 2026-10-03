//! Query param parsing that mirrors the pydantic `Params` models in
//! `recipeyak.api.base.serialization`: unknown params are rejected and
//! `date` fields accept the same inputs pydantic does in lax mode.

use chrono::{DateTime, NaiveDate};

use crate::error::ValidationError;

/// Equivalent of Django's `request.GET.dict()`: keys in first-seen order,
/// the last value wins.
pub fn query_dict(query: Option<&str>) -> Vec<(String, String)> {
    let mut out: Vec<(String, String)> = Vec::new();
    for (k, v) in form_urlencoded::parse(query.unwrap_or("").as_bytes()) {
        match out.iter_mut().find(|(key, _)| *key == k) {
            Some(entry) => entry.1 = v.into_owned(),
            None => out.push((k.into_owned(), v.into_owned())),
        }
    }
    out
}

/// Parse `fields` as required dates, rejecting any extra params.
pub fn parse_dates<const N: usize>(
    params: &[(String, String)],
    fields: [&'static str; N],
) -> Result<[NaiveDate; N], Vec<ValidationError>> {
    let mut errors = Vec::new();
    let mut values = [NaiveDate::MIN; N];
    for (i, field) in fields.iter().enumerate() {
        match params.iter().find(|(k, _)| k == field) {
            None => errors.push(ValidationError {
                kind: "missing",
                loc: vec![field.to_string()],
                msg: "Field required".to_string(),
            }),
            Some((_, raw)) => match parse_date(raw) {
                Ok(date) => values[i] = date,
                Err(err) => errors.push(err.into_validation_error(field)),
            },
        }
    }
    for (key, _) in params {
        if !fields.contains(&key.as_str()) {
            errors.push(ValidationError {
                kind: "extra_forbidden",
                loc: vec![key.clone()],
                msg: "Extra inputs are not permitted".to_string(),
            });
        }
    }
    if errors.is_empty() {
        Ok(values)
    } else {
        Err(errors)
    }
}

#[derive(Debug, PartialEq)]
pub enum DateError {
    /// Could not be parsed as a date or a datetime.
    Parsing(&'static str),
    /// Parsed as a datetime with a non-zero time component.
    Inexact,
    /// Valid format, but Python's `date` can't represent it.
    YearZero,
}

impl DateError {
    fn into_validation_error(self, field: &str) -> ValidationError {
        let (kind, msg) = match self {
            DateError::Parsing(reason) => (
                "date_from_datetime_parsing",
                format!("Input should be a valid date or datetime, {reason}"),
            ),
            DateError::Inexact => (
                "date_from_datetime_inexact",
                "Datetimes provided to dates should have zero time - e.g. be exact dates"
                    .to_string(),
            ),
            DateError::YearZero => (
                "date_parsing",
                "Input should be a valid date in the format YYYY-MM-DD, year 0 is out of range"
                    .to_string(),
            ),
        };
        ValidationError {
            kind,
            loc: vec![field.to_string()],
            msg,
        }
    }
}

const TOO_SHORT: &str = "input is too short";
const EXTRA_CHARS: &str = "unexpected extra characters at the end of the input";

/// Port of the subset of speedate (pydantic's date parser) that applies to
/// string input: `YYYY-MM-DD`, an RFC 3339-ish datetime at midnight, or a
/// unix timestamp landing exactly on a day boundary.
pub fn parse_date(input: &str) -> Result<NaiveDate, DateError> {
    let bytes = input.as_bytes();
    if bytes.len() == 10
        && let Ok((y, m, d)) = parse_date_prefix(bytes)
    {
        return make_date(y, m, d);
    }
    if let Some(ts) = parse_number(input) {
        return date_from_timestamp(ts);
    }
    // when the plain date fails, pydantic reports the datetime parse error
    parse_datetime_as_date(bytes)
}

fn make_date(y: u32, m: u32, d: u32) -> Result<NaiveDate, DateError> {
    if y == 0 {
        return Err(DateError::YearZero);
    }
    NaiveDate::from_ymd_opt(y as i32, m, d)
        .ok_or(DateError::Parsing("day value is outside expected range"))
}

fn digits2(bytes: &[u8], at: usize, err: &'static str) -> Result<u32, &'static str> {
    match (bytes.get(at), bytes.get(at + 1)) {
        (Some(a @ b'0'..=b'9'), Some(b @ b'0'..=b'9')) => {
            Ok(u32::from(a - b'0') * 10 + u32::from(b - b'0'))
        }
        (Some(_), Some(_)) => Err(err),
        _ => Err(TOO_SHORT),
    }
}

fn parse_date_prefix(bytes: &[u8]) -> Result<(u32, u32, u32), &'static str> {
    if bytes.len() < 10 {
        return Err(TOO_SHORT);
    }
    let mut year = 0;
    for b in &bytes[0..4] {
        if !b.is_ascii_digit() {
            return Err("invalid character in year");
        }
        year = year * 10 + u32::from(b - b'0');
    }
    if bytes[4] != b'-' {
        return Err("invalid date separator, expected `-`");
    }
    let month = digits2(bytes, 5, "invalid character in month")?;
    if bytes[7] != b'-' {
        return Err("invalid date separator, expected `-`");
    }
    let day = digits2(bytes, 8, "invalid character in day")?;
    if !(1..=12).contains(&month) {
        return Err("month value is outside expected range of 1-12");
    }
    let leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    let max_day = match month {
        2 if leap => 29,
        2 => 28,
        4 | 6 | 9 | 11 => 30,
        _ => 31,
    };
    if day == 0 || day > max_day {
        return Err("day value is outside expected range");
    }
    Ok((year, month, day))
}

fn parse_datetime_as_date(bytes: &[u8]) -> Result<NaiveDate, DateError> {
    let (y, m, d) = parse_date_prefix(bytes).map_err(DateError::Parsing)?;
    match bytes.get(10) {
        Some(b'T' | b't' | b'_' | b' ') => {}
        _ => {
            return Err(DateError::Parsing(
                "invalid datetime separator, expected `T`, `t`, `_` or space",
            ));
        }
    }
    let exact = parse_time_is_midnight(&bytes[11..]).map_err(DateError::Parsing)?;
    let date = make_date(y, m, d)?;
    if exact {
        Ok(date)
    } else {
        Err(DateError::Inexact)
    }
}

/// Validates `HH:MM[:SS[.ffffff]][Z|±HH[:]MM]` and returns whether it's
/// exactly midnight (to microsecond precision, ignoring the offset).
fn parse_time_is_midnight(t: &[u8]) -> Result<bool, &'static str> {
    if t.len() < 5 {
        return Err(TOO_SHORT);
    }
    let hour = digits2(t, 0, "invalid character in hour")?;
    if t[2] != b':' {
        return Err("invalid time separator, expected `:`");
    }
    let minute = digits2(t, 3, "invalid character in minute")?;
    if hour > 23 {
        return Err("hour value is outside expected range of 0-23");
    }
    if minute > 59 {
        return Err("minute value is outside expected range of 0-59");
    }
    let mut pos = 5;
    let mut second = 0;
    let mut micros = 0;
    if t.get(pos) == Some(&b':') {
        second = digits2(t, pos + 1, "invalid character in second")?;
        if second > 59 {
            return Err("second value is outside expected range of 0-59");
        }
        pos += 3;
        if matches!(t.get(pos), Some(b'.' | b',')) {
            pos += 1;
            let start = pos;
            while t.get(pos).is_some_and(u8::is_ascii_digit) {
                if pos - start < 6 {
                    micros = micros * 10 + u32::from(t[pos] - b'0');
                }
                pos += 1;
            }
            if pos == start {
                return Err("second fraction value is missing");
            }
        }
    }
    match t.get(pos) {
        None => {}
        Some(b'Z' | b'z') => pos += 1,
        Some(b'+' | b'-') => {
            let tz_hour = digits2(t, pos + 1, "invalid timezone hour").map_err(|e| {
                if e == TOO_SHORT {
                    "invalid timezone hour"
                } else {
                    e
                }
            })?;
            pos += 3;
            if t.get(pos) == Some(&b':') {
                pos += 1;
            }
            let tz_minute = digits2(t, pos, "invalid timezone minute").map_err(|e| {
                if e == TOO_SHORT {
                    "invalid timezone minute"
                } else {
                    e
                }
            })?;
            pos += 2;
            if tz_hour * 60 + tz_minute >= 24 * 60 {
                return Err("timezone offset must be less than 24 hours");
            }
        }
        Some(_) => return Err("invalid timezone sign"),
    }
    if pos != t.len() {
        return Err(EXTRA_CHARS);
    }
    Ok(hour == 0 && minute == 0 && second == 0 && micros == 0)
}

/// `-?\d+(\.\d+)?` as seconds since the epoch, or milliseconds when the
/// magnitude is past 2e10 (speedate's heuristic).
fn parse_number(input: &str) -> Option<f64> {
    let unsigned = input.strip_prefix('-').unwrap_or(input);
    let (int, frac) = match unsigned.split_once('.') {
        Some((i, f)) => (i, Some(f)),
        None => (unsigned, None),
    };
    let all_digits = |s: &str| !s.is_empty() && s.bytes().all(|b| b.is_ascii_digit());
    if !all_digits(int) || frac.is_some_and(|f| !all_digits(f)) {
        return None;
    }
    input.parse().ok()
}

fn date_from_timestamp(ts: f64) -> Result<NaiveDate, DateError> {
    let seconds = if ts.abs() > 2e10 { ts / 1000.0 } else { ts };
    let micros = (seconds * 1_000_000.0).round() as i64;
    let datetime = DateTime::from_timestamp_micros(micros).ok_or(DateError::Parsing(
        "timestamp value is outside expected range",
    ))?;
    if micros.rem_euclid(86_400 * 1_000_000) != 0 {
        return Err(DateError::Inexact);
    }
    Ok(datetime.date_naive())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn date(y: i32, m: u32, d: u32) -> NaiveDate {
        NaiveDate::from_ymd_opt(y, m, d).unwrap()
    }

    fn reason(input: &str) -> &'static str {
        match parse_date(input) {
            Err(DateError::Parsing(r)) => r,
            other => panic!("expected parsing error for {input:?}, got {other:?}"),
        }
    }

    #[test]
    fn accepts_the_same_inputs_as_pydantic() {
        let cases = [
            ("2026-09-06", date(2026, 9, 6)),
            ("2024-02-29", date(2024, 2, 29)),
            ("2026-09-01T00:00", date(2026, 9, 1)),
            ("2026-09-01T00:00:00.000", date(2026, 9, 1)),
            ("2026-09-01T00:00:00+05:00", date(2026, 9, 1)),
            ("2026-09-01T00:00:00+0500", date(2026, 9, 1)),
            ("2026-09-01 00:00:00Z", date(2026, 9, 1)),
            ("2026-09-01t00:00:00z", date(2026, 9, 1)),
            ("2026-09-01_00:00", date(2026, 9, 1)),
            ("2026-09-01T00:00:00.0000000001", date(2026, 9, 1)),
            ("86400", date(1970, 1, 2)),
            ("86400.0", date(1970, 1, 2)),
            ("-86400", date(1969, 12, 31)),
            ("172800000", date(1975, 6, 24)),
            ("9999-12-31", date(9999, 12, 31)),
        ];
        for (input, expected) in cases {
            assert_eq!(parse_date(input), Ok(expected), "{input}");
        }
    }

    #[test]
    fn rejects_non_midnight_datetimes_as_inexact() {
        for input in [
            "2026-09-06T01:00:00",
            "2026-09-01T00:00:00.5",
            "1700000000",
            "20260906",
            "86400.5",
            "99999999999",
        ] {
            assert_eq!(parse_date(input), Err(DateError::Inexact), "{input}");
        }
    }

    #[test]
    fn reports_the_same_parse_errors_as_pydantic() {
        let cases = [
            ("", TOO_SHORT),
            ("2026-9-6", TOO_SHORT),
            ("1e5", TOO_SHORT),
            ("2026-09-01T", TOO_SHORT),
            ("2026-09-01T00", TOO_SHORT),
            ("2026-09-01 ", TOO_SHORT),
            (
                "2026-13-01",
                "month value is outside expected range of 1-12",
            ),
            (
                "2026-00-01",
                "month value is outside expected range of 1-12",
            ),
            ("2026-02-29", "day value is outside expected range"),
            ("2026-09-31", "day value is outside expected range"),
            ("x026-09-01", "invalid character in year"),
            (" 2026-09-01", "invalid character in year"),
            ("2026x09-01", "invalid date separator, expected `-`"),
            ("2026-x9-01", "invalid character in month"),
            ("2026-09-x1", "invalid character in day"),
            (
                "2026-09-06Z",
                "invalid datetime separator, expected `T`, `t`, `_` or space",
            ),
            (
                "2026-09-0100",
                "invalid datetime separator, expected `T`, `t`, `_` or space",
            ),
            (
                "2026-09-01T25:00",
                "hour value is outside expected range of 0-23",
            ),
            (
                "2026-09-01T24:00:00",
                "hour value is outside expected range of 0-23",
            ),
            (
                "2026-09-01T00:60",
                "minute value is outside expected range of 0-59",
            ),
            (
                "2026-09-01T00:00:60",
                "second value is outside expected range of 0-59",
            ),
            ("2026-09-01T0x:00", "invalid character in hour"),
            ("2026-09-01T00:00:00x", "invalid timezone sign"),
            ("2026-09-01T00:00:00+05", "invalid timezone minute"),
            (
                "2026-09-01T00:00:00+25:00",
                "timezone offset must be less than 24 hours",
            ),
        ];
        for (input, expected) in cases {
            assert_eq!(reason(input), expected, "{input}");
        }
    }

    #[test]
    fn year_zero_is_out_of_range() {
        assert_eq!(parse_date("0000-01-01"), Err(DateError::YearZero));
    }

    #[test]
    fn query_dict_keeps_last_value() {
        let q = query_dict(Some("start=a&end=b&start=c&x"));
        assert_eq!(
            q,
            vec![
                ("start".into(), "c".into()),
                ("end".into(), "b".into()),
                ("x".into(), "".into())
            ]
        );
    }

    #[test]
    fn collects_missing_invalid_and_extra_errors() {
        let params = query_dict(Some("start=nope&foo=1"));
        let errors = parse_dates(&params, ["start", "end"]).unwrap_err();
        let kinds: Vec<_> = errors.iter().map(|e| (e.kind, e.loc[0].as_str())).collect();
        assert_eq!(
            kinds,
            vec![
                ("date_from_datetime_parsing", "start"),
                ("missing", "end"),
                ("extra_forbidden", "foo"),
            ]
        );
    }
}
