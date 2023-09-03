import { json2csv } from "csv42";

export function jsonToCsv(jsonObject: Array<object>, fileName: string) {
  const csv = json2csv(jsonObject);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
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
