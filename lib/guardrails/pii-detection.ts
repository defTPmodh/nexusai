import { PIIMatch } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase/client';

const PII_ENABLED = process.env.PII_DETECTION_ENABLED !== 'false'; // Default to enabled
const GUARDRAIL_CACHE_TTL_MS = 30_000;

type GuardrailConfig = {
  enabled: boolean;
  pii_types: string[];
  action: 'redact' | 'block' | 'warn';
  allowlist_patterns: string[];
};

const defaultGuardrailConfig: GuardrailConfig = {
  enabled: true, // Enable by default for security
  pii_types: ['ssn', 'credit_card', 'email', 'phone', 'ip_address'],
  action: 'redact',
  allowlist_patterns: [],
};

let cachedGuardrailConfig: GuardrailConfig | null = null;
let cachedGuardrailFetchedAt = 0;

// PII Detection Patterns
const PII_PATTERNS: Array<{ type: GuardrailConfig['pii_types'][number]; regex: RegExp }> = [
  {
    type: 'ssn',
    regex: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  },
  {
    type: 'credit_card',
    regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  },
  {
    type: 'email',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi,
  },
  {
    type: 'phone',
    regex: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  },
  {
    type: 'ip_address',
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  },
];

function buildAllowlistRegexes(allowlist: string[]): RegExp[] {
  const sanitized = allowlist
    .filter(Boolean)
    .map((pattern) => pattern.trim())
    .filter((pattern) => pattern.length > 0);

  return sanitized.reduce<RegExp[]>((regexes, pattern) => {
    try {
      regexes.push(new RegExp(pattern, 'gi'));
    } catch (e) {
      console.warn(`Invalid allowlist regex skipped: ${pattern}`);
    }
    return regexes;
  }, []);
}

export function detectPII(text: string, piiTypes?: string[], allowlist: string[] = []): PIIMatch[] {
  if (!PII_ENABLED) {
    return [];
  }

  const matches: PIIMatch[] = [];
  const typesToDetect = piiTypes && piiTypes.length > 0 ? piiTypes : PII_PATTERNS.map((p) => p.type);
  const allowlistRegexes = buildAllowlistRegexes(allowlist);

  for (const pattern of PII_PATTERNS) {
    if (!typesToDetect.includes(pattern.type)) {
      continue;
    }

    const regex = new RegExp(pattern.regex.source, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const value = match[0];
      const isAllowlisted = allowlistRegexes.some((allowPattern) => {
        allowPattern.lastIndex = 0; // Ensure fresh test for global patterns
        return allowPattern.test(value);
      });

      if (isAllowlisted) {
        continue;
      }

      matches.push({
        type: pattern.type,
        value,
        startIndex: match.index,
        endIndex: match.index + value.length,
      });
    }
  }

  return matches;
}

export async function getGuardrailConfig(forceRefresh = false): Promise<GuardrailConfig> {
  const now = Date.now();
  if (!forceRefresh && cachedGuardrailConfig && now - cachedGuardrailFetchedAt < GUARDRAIL_CACHE_TTL_MS) {
    return cachedGuardrailConfig;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: guardrail, error } = await supabase
      .from('guardrails')
      .select('*')
      .eq('name', 'default')
      .single();

    // If table doesn't exist or no guardrail found, return default config
    if (error || !guardrail) {
      // Check if error is due to table not existing (PGRST error code 42P01)
      if (error && (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist'))) {
        console.warn('Guardrails table does not exist yet. Using default config.');
      }
      cachedGuardrailConfig = { ...defaultGuardrailConfig, pii_types: PII_PATTERNS.map((p) => p.type) };
      cachedGuardrailFetchedAt = now;
      return cachedGuardrailConfig;
    }

    cachedGuardrailConfig = {
      enabled: guardrail.enabled ?? false,
      pii_types: guardrail.pii_types || [],
      action: guardrail.action || 'redact',
      allowlist_patterns: guardrail.allowlist_patterns || [],
    };
    cachedGuardrailFetchedAt = now;
    return cachedGuardrailConfig;
  } catch (error: any) {
    console.error('Failed to fetch guardrail config:', error);
    // Return default config on error (enabled by default for security)
    cachedGuardrailConfig = { ...defaultGuardrailConfig, pii_types: PII_PATTERNS.map((p) => p.type) };
    cachedGuardrailFetchedAt = now;
    return cachedGuardrailConfig;
  }
}

export function redactPII(
  text: string,
  allowlist: string[] = [],
  piiTypes?: string[]
): { redactedText: string; detectedTypes: string[] } {
  if (!PII_ENABLED) {
    return { redactedText: text, detectedTypes: [] };
  }

  const matches = detectPII(text, piiTypes, allowlist);
  const detectedTypes = [...new Set(matches.map((m) => m.type))];

  // Sort matches by startIndex in reverse to avoid index shifting issues
  const sortedMatches = [...matches].sort((a, b) => b.startIndex - a.startIndex);

  let redactedText = text;
  for (const match of sortedMatches) {
    const redaction = `[${match.type.toUpperCase()} REDACTED]`;
    redactedText =
      redactedText.substring(0, match.startIndex) + redaction + redactedText.substring(match.endIndex);
  }

  return { redactedText, detectedTypes };
}
