/**
 * Shared error class for API services
 */
const APP_CODE_RE = /^\[([A-Z_]+)(?:\|([a-zA-Z_]+))?\]\s*/;

type JsonLike = Record<string, unknown>;

export interface ParsedStructuredError {
  appCode?: string;
  field?: string;
  message: string;
}

export function parseStructuredErrorMessage(rawMessage: string): ParsedStructuredError {
  const match = rawMessage.match(APP_CODE_RE);
  if (!match) {
    return { message: rawMessage };
  }

  return {
    appCode: match[1],
    field: match[2] || undefined,
    message: rawMessage.replace(APP_CODE_RE, '').trim(),
  };
}

export function stripStructuredErrorPrefix(rawMessage?: string | null): string {
  if (!rawMessage) return '';
  return parseStructuredErrorMessage(rawMessage).message;
}

function isObject(value: unknown): value is JsonLike {
  return typeof value === 'object' && value !== null;
}

function pickString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function getNestedString(obj: JsonLike, key: string): string | null {
  const value = obj[key];
  if (typeof value === 'string' && value.trim()) return value;
  if (isObject(value)) {
    const nestedMessage = pickString(value.message);
    if (nestedMessage) return nestedMessage;
    const nestedError = pickString(value.error);
    if (nestedError) return nestedError;
  }
  return null;
}

export function extractApiErrorMessage(errorData: unknown, status: number, statusText: string): string {
  if (typeof errorData === 'string' && errorData.trim()) {
    return errorData;
  }

  if (isObject(errorData)) {
    const directMessage = pickString(errorData.message);
    if (directMessage) return directMessage;

    const detailsMessage = getNestedString(errorData, 'details');
    if (detailsMessage) return detailsMessage;

    const directError = pickString(errorData.error);
    if (directError) return directError;
  }

  return `HTTP ${status}: ${statusText}`;
}

const APP_CODE_TO_I18N_KEY: Record<string, keyof import('../i18n/types').Translations['errors']> = {
  VALIDATION_ERROR: 'validationError',
  NOT_FOUND: 'notFound',
  FORBIDDEN: 'forbidden',
  CONFLICT: 'conflict',
  INTERNAL_ERROR: 'internalError',
  ORDER_NOT_FOUND: 'orderNotFound',
  ORDER_DATE_CONFLICT: 'orderDateConflict',
  ORDER_BLOCKED_DATE: 'orderBlockedDate',
  ORDER_NO_PRICING: 'orderNoPricing',
  ORDER_INVALID_STATUS: 'orderInvalidStatus',
  ORDER_PAYMENT_EXPIRED: 'orderPaymentExpired',
  ORDER_PROMO_FAILED: 'orderPromoFailed',
  PROMO_NOT_FOUND: 'promoNotFound',
  PROMO_INACTIVE: 'promoInactive',
  PROMO_EXPIRED: 'promoExpired',
  PROMO_MAX_USAGE: 'promoMaxUsage',
  PROMO_ALREADY_EXISTS: 'promoAlreadyExists',
  PROMO_DAY_MISMATCH: 'promoDayMismatch',
  PROMO_TRIGGER_NOT_MET: 'promoTriggerNotMet',
};

export function getAppCodeI18nKey(appCode?: string): keyof import('../i18n/types').Translations['errors'] | null {
  if (!appCode) return null;
  return APP_CODE_TO_I18N_KEY[appCode] ?? null;
}

export class ApiError extends Error {
  status?: number;
  details?: unknown;
  appCode?: string;
  field?: string;
  rawMessage: string;
  encoreCode?: string;

  constructor(
    message: string,
    status?: number,
    details?: unknown
  ) {
    const parsed = parseStructuredErrorMessage(message);
    super(parsed.message || message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.appCode = parsed.appCode;
    this.field = parsed.field;
    this.rawMessage = message;
    if (isObject(details) && typeof details.code === 'string') {
      this.encoreCode = details.code;
    }
  }
}
