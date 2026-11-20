export function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

// Removes junk that PDFs and slides leave behind
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/^\s*[●•▪◦▫■□►➢➤]\s*/, "").trimEnd()) // bullet symbols
    .filter((line) => !/^\s*\d{1,4}\s*$/.test(line)) // lines that are only a page number
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Cuts the text into chunks of roughly 150 to 250 words,
// preferring to cut at blank lines or at headings like "II. Encryption Methods"
export function chunkText(text: string, target = 1000, max = 1600): string[] {
  const chunks: string[] = [];
  let current: string[] = [];
  let size = 0;

  function flush() {
    const chunk = current.join("\n").trim();
    if (chunk) chunks.push(chunk);
    current = [];
    size = 0;
  }

  for (const line of text.split("\n")) {
    const isBlank = line.trim() === "";
    const isHeading = /^[IVX]+\.\s+[A-Z]/.test(line); // roman numeral headings

    if (isBlank && size >= target) flush();
    else if (isHeading && size > 300) flush();
    else if (size + line.length > max) flush();

    current.push(line);
    size += line.length + 1;
  }
  flush();

  return chunks;
}