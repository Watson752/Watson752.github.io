const EXTRACTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+instructions?/i,
  /disregard\s+(all\s+|any\s+)?(previous|prior|above)/i,
  /(reveal|print|show|output|repeat|leak)\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
  /what\s+(is|are)\s+your\s+(system\s+)?(prompt|instructions|rules)/i,
  /\bapi[\s_-]?key\b/i,
  /\bsecret\b.*\b(key|token|credential)\b/i,
  /you\s+are\s+now\s+(dan|in\s+developer\s+mode|unrestricted)/i,
  /act\s+as\s+(a\s+)?(different|new)\s+(ai|assistant|system)/i,
];

export function isSuspiciousInput(message: string): boolean {
  return EXTRACTION_PATTERNS.some((pattern) => pattern.test(message));
}
