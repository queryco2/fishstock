use std::collections::HashMap;
use std::time::Duration;

use encoding_rs::GBK;
use reqwest::blocking::Client;
use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct Quote {
    symbol: String,
    market: String,
    #[serde(rename = "type")]
    quote_type: String,
    name: String,
    price: Option<f64>,
    change_amount: Option<f64>,
    change_percent: Option<f64>,
    volume: Option<f64>,
    amount: Option<f64>,
    source: String,
    status: String,
    updated_at: String,
    cached: bool,
}

#[derive(Clone, Serialize)]
struct SymbolSearchResult {
    symbol: String,
    market: String,
    #[serde(rename = "type")]
    quote_type: String,
    name: String,
}

#[tauri::command]
fn fetch_quotes(symbols: Vec<String>) -> Result<Vec<Quote>, String> {
    if symbols.is_empty() {
        return Ok(Vec::new());
    }

    fetch_tencent_quotes(&symbols)
}

#[tauri::command]
fn search_symbols(keyword: String) -> Result<Vec<SymbolSearchResult>, String> {
    let keyword = keyword.trim();
    if keyword.is_empty() {
        return Ok(Vec::new());
    }

    search_eastmoney_symbols(keyword)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![fetch_quotes, search_symbols])
        .run(tauri::generate_context!())
        .expect("error while running FishStock");
}

fn search_eastmoney_symbols(keyword: &str) -> Result<Vec<SymbolSearchResult>, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .map_err(|error| error.to_string())?;
    let payload: serde_json::Value = client
        .get("https://searchapi.eastmoney.com/api/suggest/get")
        .query(&[("input", keyword), ("type", "14")])
        .header("User-Agent", "Mozilla/5.0")
        .header("Referer", "https://quote.eastmoney.com/")
        .send()
        .map_err(|error| error.to_string())?
        .json()
        .map_err(|error| error.to_string())?;

    let rows = payload
        .get("QuotationCodeTable")
        .and_then(|table| table.get("Data"))
        .and_then(|data| data.as_array())
        .cloned()
        .unwrap_or_default();

    let mut results = Vec::new();
    for row in rows.into_iter().take(8) {
        let code = value_string(&row, "Code").or_else(|| value_string(&row, "UnifiedCode"));
        let name = value_string(&row, "Name");
        let (Some(code), Some(name)) = (code, name) else {
            continue;
        };
        let market = eastmoney_result_market(&row, &code);
        results.push(SymbolSearchResult {
            symbol: code.clone(),
            market,
            quote_type: detect_type(&code),
            name,
        });
    }

    Ok(results)
}

fn fetch_tencent_quotes(symbols: &[String]) -> Result<Vec<Quote>, String> {
    let symbol_map: HashMap<String, ParsedSymbol> = symbols
        .iter()
        .map(|symbol| {
            let parsed = parse_symbol(symbol);
            (to_tencent_symbol(&parsed), parsed)
        })
        .collect();
    let query = symbol_map.keys().cloned().collect::<Vec<_>>().join(",");

    if query.is_empty() {
        return Ok(Vec::new());
    }

    let client = Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .map_err(|error| error.to_string())?;
    let bytes = client
        .get(format!(
            "https://qt.gtimg.cn/q={query}&_={}",
            chrono::Local::now().timestamp_millis()
        ))
        .header("User-Agent", "Mozilla/5.0")
        .header("Cache-Control", "no-cache")
        .header("Pragma", "no-cache")
        .send()
        .map_err(|error| error.to_string())?
        .bytes()
        .map_err(|error| error.to_string())?;
    let (decoded, _, _) = GBK.decode(&bytes);
    let updated_at = current_time_text();
    let mut quotes = Vec::new();

    for line in decoded.trim().split(';') {
        if !line.contains('=') || !line.contains('"') {
            continue;
        }

        let Some(raw_key) = line.split('=').next() else {
            continue;
        };
        let key = raw_key.split('_').last().unwrap_or(raw_key);
        let Some(parsed) = symbol_map.get(key) else {
            continue;
        };
        let Some(payload) = line.split('"').nth(1) else {
            continue;
        };
        let parts: Vec<&str> = payload.split('~').collect();
        if parts.len() < 38 {
            continue;
        }

        let market = detect_market(&parsed.code, parsed.market_hint.as_deref());
        let amount = parse_amount(parts[37], &market);
        let quote_updated_at = parts
            .get(30)
            .and_then(|value| parse_tencent_time(value))
            .unwrap_or_else(|| updated_at.clone());
        quotes.push(Quote {
            symbol: parsed.code.clone(),
            market: market.clone(),
            quote_type: detect_type(&parsed.code),
            name: non_empty(parts.get(1).copied()).unwrap_or_else(|| parsed.code.clone()),
            price: safe_float(parts.get(3).copied()),
            change_amount: safe_float(parts.get(31).copied()),
            change_percent: safe_float(parts.get(32).copied()),
            volume: safe_float(parts.get(36).copied()),
            amount,
            source: "tencent".to_string(),
            status: "normal".to_string(),
            updated_at: quote_updated_at,
            cached: false,
        });
    }

    Ok(quotes)
}

#[derive(Clone)]
struct ParsedSymbol {
    code: String,
    market_hint: Option<String>,
}

fn parse_symbol(symbol: &str) -> ParsedSymbol {
    let parts: Vec<String> = symbol
        .trim()
        .to_uppercase()
        .split('.')
        .map(ToString::to_string)
        .collect();

    if parts.len() == 2 && matches!(parts[0].as_str(), "SH" | "SZ" | "BJ" | "HK" | "US" | "FUND" | "INDEX") {
        return ParsedSymbol {
            code: parts[1].clone(),
            market_hint: Some(parts[0].clone()),
        };
    }

    ParsedSymbol {
        code: parts.last().cloned().unwrap_or_default(),
        market_hint: None,
    }
}

fn to_tencent_symbol(parsed: &ParsedSymbol) -> String {
    let code = &parsed.code;
    let market_hint = parsed.market_hint.as_deref();

    if market_hint == Some("HK") || (market_hint.is_none() && is_hk_code(code)) {
        return format!("hk{code}");
    }
    if market_hint == Some("SH") || (market_hint.is_none() && starts_with_any(code, &["5", "6", "9"])) {
        return format!("sh{code}");
    }
    if market_hint == Some("BJ") || (market_hint.is_none() && starts_with_any(code, &["4", "8"])) {
        return format!("bj{code}");
    }
    if market_hint == Some("INDEX") && starts_with_any(code, &["0", "9"]) {
        return format!("sh{code}");
    }
    format!("sz{code}")
}

fn detect_market(code: &str, market_hint: Option<&str>) -> String {
    if let Some(hint) = market_hint {
        return hint.to_string();
    }
    if is_hk_code(code) {
        return "HK".to_string();
    }
    if code.starts_with('6') {
        return "SH".to_string();
    }
    if starts_with_any(code, &["0", "3", "1", "2"]) {
        return "SZ".to_string();
    }
    if starts_with_any(code, &["8", "4"]) {
        return "BJ".to_string();
    }
    "INDEX".to_string()
}

fn detect_type(code: &str) -> String {
    if is_hk_code(code) || starts_with_any(code, &["0", "3", "6", "8", "4"]) {
        return "stock".to_string();
    }
    if starts_with_any(code, &["5", "1"]) {
        return "etf".to_string();
    }
    "index".to_string()
}

fn eastmoney_result_market(row: &serde_json::Value, code: &str) -> String {
    let quote_id = value_string(row, "QuoteID").unwrap_or_default();
    let market_type = value_string(row, "MarketType")
        .or_else(|| value_string(row, "MktNum"))
        .unwrap_or_default();
    let exchange = value_string(row, "JYS")
        .or_else(|| value_string(row, "Classify"))
        .unwrap_or_default()
        .to_uppercase();

    if quote_id.starts_with("116.") || market_type == "5" || market_type == "116" || exchange == "HK" {
        return "HK".to_string();
    }
    if quote_id.starts_with("1.") || market_type == "1" {
        return "SH".to_string();
    }
    if quote_id.starts_with("0.") || market_type == "0" {
        return "SZ".to_string();
    }
    detect_market(code, None)
}

fn value_string(row: &serde_json::Value, key: &str) -> Option<String> {
    match row.get(key)? {
        serde_json::Value::String(value) if !value.is_empty() => Some(value.clone()),
        serde_json::Value::Number(value) => Some(value.to_string()),
        _ => None,
    }
}

fn is_hk_code(code: &str) -> bool {
    code.len() == 5 && code.chars().all(|char| char.is_ascii_digit())
}

fn starts_with_any(value: &str, prefixes: &[&str]) -> bool {
    prefixes.iter().any(|prefix| value.starts_with(prefix))
}

fn parse_amount(value: &str, market: &str) -> Option<f64> {
    let parsed = safe_float(Some(value))?;
    if market == "HK" {
        Some(parsed)
    } else {
        Some(parsed * 10000.0)
    }
}

fn safe_float(value: Option<&str>) -> Option<f64> {
    let text = value?.trim();
    if text.is_empty() || text == "-" {
        return None;
    }
    text.parse::<f64>().ok()
}

fn non_empty(value: Option<&str>) -> Option<String> {
    let text = value?.trim();
    if text.is_empty() {
        None
    } else {
        Some(text.to_string())
    }
}

fn current_time_text() -> String {
    chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

fn parse_tencent_time(value: &str) -> Option<String> {
    let text = value.trim();
    if text.len() != 14 || !text.chars().all(|char| char.is_ascii_digit()) {
        return None;
    }

    Some(format!(
        "{}-{}-{} {}:{}:{}",
        &text[0..4],
        &text[4..6],
        &text[6..8],
        &text[8..10],
        &text[10..12],
        &text[12..14]
    ))
}
