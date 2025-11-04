import { PIIMatch } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase/client';

const PII_ENABLED = process.env.PII_DETECTION_ENABLED !== 'false'; // Default to enabled

// PII Detection Patterns
const PII_PATTERNS: Array<{ type: string; regex: RegExp }> = [
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

export function detectPII(text: string, piiTypes?: string[]): PIIMatch[] {
  if (!PII_ENABLED) {
    return [];
  }

  const matches: PIIMatch[] = [];
  const typesToDetect = piiTypes && piiTypes.length > 0 ? piiTypes : PII_PATTERNS.map(p => p.type);

  for (const pattern of PII_PATTERNS) {
    if (!typesToDetect.includes(pattern.type)) {
      continue;
    }

    const regex = new RegExp(pattern.regex.source, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type: pattern.type,
        value: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  return matches;
}

export async function getGuardrailConfig() {
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
      // Return default config (enabled by default for security)
      return {
        enabled: true, // Enable by default for security
        pii_types: PII_PATTERNS.map(p => p.type),
        action: 'redact' as const,
        allowlist_patterns: [] as string[],
      };
    }

    return {
      enabled: guardrail.enabled ?? false,
      pii_types: guardrail.pii_types || [],
      action: guardrail.action || 'redact',
      allowlist_patterns: guardrail.allowlist_patterns || [],
    };
  } catch (error: any) {
    console.error('Failed to fetch guardrail config:', error);
    // Return default config on error (enabled by default for security)
    return {
      enabled: true,
      pii_types: PII_PATTERNS.map(p => p.type),
      action: 'redact' as const,
      allowlist_patterns: [] as string[],
    };
  }
}

export function redactPII(text: string, allowlist: string[] = [], piiTypes?: string[]): { redactedText: string; detectedTypes: string[] } {
  if (!PII_ENABLED) {
    return { redactedText: text, detectedTypes: [] };
  }

  const matches = detectPII(text, piiTypes);
  const detectedTypes = [...new Set(matches.map((m) => m.type))];

  // Filter out allowlisted patterns
  const filteredMatches = matches.filter((match) => {
    return !allowlist.some((pattern) => {
      try {
        const regex = new RegExp(pattern, 'gi');
        return regex.test(match.value);
      } catch (e) {
        // Invalid regex pattern, skip
        return false;
      }
    });
  });

  // Sort matches by startIndex in reverse to avoid index shifting issues
  const sortedMatches = [...filteredMatches].sort((a, b) => b.startIndex - a.startIndex);

  let redactedText = text;
  for (const match of sortedMatches) {
    const redaction = `[${match.type.toUpperCase()} REDACTED]`;
    redactedText =
      redactedText.substring(0, match.startIndex) + redaction + redactedText.substring(match.endIndex);
  }

  return { redactedText, detectedTypes };
}

