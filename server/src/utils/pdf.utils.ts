import * as fs from "fs";
import pdfParse from "pdf-parse";

export async function extractTextFromPdf(path: string): Promise<string> {
  const dataBuffer = fs.readFileSync(path);
  const data = await pdfParse(dataBuffer);
  return (data.text || "").trim();
}

export function parseMetaFromFilename(filename: string) {
  const base = filename.replace(/\.[^/.]+$/, "");
  const parts = base.split(/[_\- ]+/);

  let roll = "";
  let name = "";

  if (parts.length >= 2) {
    if (/^\d+$/.test(parts[0])) {
      roll = parts[0];
      name = parts.slice(1).join(" ");
    } else if (/^\d+$/.test(parts[parts.length - 1])) {
      roll = parts[parts.length - 1];
      name = parts.slice(0, parts.length - 1).join(" ");
    } else {
      name = parts.join(" ");
    }
  } else {
    name = base;
  }

  return {
    name: name || null,
    roll: roll || null,
  };
}
