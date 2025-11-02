/**
 * Extract the first line or first 50 characters as a title
 */
export function extractTitle(content: string): string {
  if (!content) return "Untitled Note";

  // Remove HTML tags for better title extraction
  const plainText = content
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  if (!plainText) return "Untitled Note";

  // Get first line or first 50 characters
  const firstLine = plainText.split("\n")[0].trim();
  const title = firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;

  return title || "Untitled Note";
}

