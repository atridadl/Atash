import { parse } from "json2csv";

export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  const csv = parse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function isAdmin(meta: UserPublicMetadata | undefined) {
  return (meta?.isAdmin as boolean | undefined) || false;
}

export function isVIP(meta: UserPublicMetadata | undefined) {
  return (meta?.isVIP as boolean | undefined) || false;
}
