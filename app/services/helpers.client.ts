import { json2csv } from "csv42";

export const jsonToCsv = (jsonObject: Array<object>, fileName: string) => {
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
};

export function isAdmin(meta: UserPublicMetadata | undefined) {
  return (meta?.isAdmin as boolean | undefined) || false;
}

export function isVIP(meta: UserPublicMetadata | undefined) {
  return (meta?.isVIP as boolean | undefined) || false;
}

export const writeToLogs = (
  level: "warn" | "info" | "error" | "success",
  message: string
) => {
  switch (level) {
    case "info":
      console.log(`[ℹ️ INFO]: ${message}`);
      break;
    case "warn":
      console.log(`[⚠️ WARN]: ${message}`);
      break;
    case "error":
      console.log(`[❌ ERROR]: ${message}`);
      break;
    case "success":
      console.log(`[✅ SUCCESS]: ${message}`);
      break;

    default:
      console.log(`[ℹ️ INFO]: ${message}`);
      break;
  }
};
