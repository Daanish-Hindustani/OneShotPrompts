import { readFile } from "node:fs/promises";
import path from "node:path";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

export async function loadPromptTemplate(name: "requirements" | "plan") {
  const filePath = path.join(PROMPTS_DIR, `${name}.md`);
  return readFile(filePath, "utf8");
}
