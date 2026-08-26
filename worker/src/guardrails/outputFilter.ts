const SECRET_PATTERNS: RegExp[] = [
  /sk-ant-[a-zA-Z0-9_-]{20,}/g,
  /sk-[a-zA-Z0-9]{16,}/g,
  /Bearer\s+[A-Za-z0-9\-_.]{20,}/gi,
  /AKIA[0-9A-Z]{16}/g,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
];

const HIGH_ENTROPY_TOKEN = /\b[A-Za-z0-9_-]{32,}\b/g;

function shannonEntropyBitsPerChar(value: string): number {
  const counts = new Map<string, number>();
  for (const char of value) {
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / value.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function redactSecrets(text: string): string {
  let result = text;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, "[redacted]");
  }
  result = result.replace(HIGH_ENTROPY_TOKEN, (match) =>
    shannonEntropyBitsPerChar(match) > 4.0 ? "[redacted]" : match,
  );
  return result;
}
