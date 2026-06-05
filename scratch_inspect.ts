import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env.local
const envLocalPath = path.join(__dirname, ".env.local");
let url = "";
let key = "";

if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    const matchUrl = line.match(/^NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)$/);
    if (matchUrl) url = matchUrl[1].trim();
    const matchKey = line.match(/^SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)$/);
    if (matchKey) key = matchKey[1].trim();
  }
}

if (!url || !key) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function inspect() {
  const tables = ["system_administrators", "seb_officers", "elections", "positions", "candidates", "voters"];
  for (const t of tables) {
    const { data: cols, error: err } = await supabase.from(t).select("*").limit(1);
    if (err) {
      console.error(`Error querying table ${t}:`, err.message);
    } else {
      console.log(`Table ${t} columns:`, cols && cols.length > 0 ? Object.keys(cols[0]) : "empty table");
    }
  }

  // Also check if there's any logs table
  const { data: logCols, error: logErr } = await supabase.from("admin_logs").select("*").limit(1);
  if (logErr) {
    console.log("admin_logs table does not exist or error:", logErr.message);
  } else {
    console.log("admin_logs columns:", logCols && logCols.length > 0 ? Object.keys(logCols[0]) : "empty");
  }

  const { data: logCols2, error: logErr2 } = await supabase.from("audit_logs").select("*").limit(1);
  if (logErr2) {
    console.log("audit_logs table does not exist or error:", logErr2.message);
  } else {
    console.log("audit_logs columns:", logCols2 && logCols2.length > 0 ? Object.keys(logCols2[0]) : "empty");
  }
}

inspect();
