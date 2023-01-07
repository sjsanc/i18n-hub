import { exportJson } from "../../utils/export";
import supabase from "../../utils/supabase";

export default async function handler(req, res) {
  const entries = await supabase
    .from("entries")
    .select("*")
    .eq("project_id", "2c28b91f-42af-4fc7-8d3a-57774c0ab3be");

  const namespaces = await supabase
    .from("namespaces")
    .select("*")
    .eq("project_id", "2c28b91f-42af-4fc7-8d3a-57774c0ab3be");

  res.status(200).json(exportJson(entries?.data, namespaces?.data));
}
