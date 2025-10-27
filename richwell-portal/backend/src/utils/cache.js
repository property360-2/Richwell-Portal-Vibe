const DEFAULT_CACHE_TTL_SECONDS = (() => {
  const parsed = parseInt(process.env.ANALYTICS_CACHE_TTL_SECONDS || process.env.ANALYTICS_CACHE_TTL || '300', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
})();

const ANALYTICS_PREFIX = 'analytics:';
const DEFAULT_ANALYTICS_ROLES = ['registrar', 'dean', 'admission'];

const store = new Map();

const now = () => Date.now();

const normalizeToString = (value, fallback) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value);
};

const buildCacheKey = (role, termId, variant = 'default') => {
  const safeRole = normalizeToString(role, 'global').toLowerCase();
  const safeTerm = normalizeToString(termId, 'global');
  const safeVariant = normalizeToString(variant, 'default');
  return `${ANALYTICS_PREFIX}${safeRole}:${safeTerm}:${safeVariant}`;
};

const setCache = (key, value, ttlSeconds = DEFAULT_CACHE_TTL_SECONDS) => {
  const ttl = Number.isFinite(ttlSeconds) && ttlSeconds > 0
    ? ttlSeconds
    : DEFAULT_CACHE_TTL_SECONDS;
  store.set(key, {
    value,
    expiresAt: now() + ttl * 1000
  });
};

const getCache = (key) => {
  const cached = store.get(key);
  if (!cached) {
    return undefined;
  }

  if (cached.expiresAt && cached.expiresAt <= now()) {
    store.delete(key);
    return undefined;
  }

  return cached.value;
};

const deleteCache = (key) => {
  store.delete(key);
};

const matches = (key, { role, termId, variant }) => {
  if (!key.startsWith(ANALYTICS_PREFIX)) {
    return false;
  }

  const keyWithoutPrefix = key.slice(ANALYTICS_PREFIX.length);
  const [rolePart, termPart, ...variantParts] = keyWithoutPrefix.split(':');
  const variantPart = variantParts.length > 0 ? variantParts.join(':') : 'default';

  if (role && rolePart !== normalizeToString(role, '').toLowerCase()) {
    return false;
  }

  if (termId && termPart !== normalizeToString(termId, '')) {
    return false;
  }

  if (variant && variantPart !== normalizeToString(variant, '')) {
    return false;
  }

  return true;
};

export const getOrSetAnalyticsCache = async ({
  role,
  termId,
  variant = 'default',
  ttlSeconds = DEFAULT_CACHE_TTL_SECONDS,
  fetcher
}) => {
  if (typeof fetcher !== 'function') {
    throw new Error('getOrSetAnalyticsCache requires a fetcher function');
  }

  const key = buildCacheKey(role, termId, variant);
  const cached = getCache(key);

  if (cached !== undefined) {
    return cached;
  }

  const value = await fetcher();

  // Only cache non-undefined values to avoid caching failed computations.
  if (value !== undefined) {
    setCache(key, value, ttlSeconds);
  }

  return value;
};

export const invalidateAnalyticsCache = ({ role, termId, variant } = {}) => {
  for (const key of store.keys()) {
    if (matches(key, { role, termId, variant })) {
      deleteCache(key);
    }
  }
};

export const invalidateAnalyticsCacheForTerm = (termId, roles = DEFAULT_ANALYTICS_ROLES) => {
  if (termId === undefined || termId === null) {
    invalidateAnalyticsCache({ termId: 'global' });
    return;
  }

  const normalizedTerm = normalizeToString(termId, 'global');
  roles.forEach((role) => {
    invalidateAnalyticsCache({ role, termId: normalizedTerm });
    invalidateAnalyticsCache({ role, termId: 'global' });
  });
};

export const flushAnalyticsCache = () => {
  store.clear();
};

export const getAnalyticsCacheKey = (role, termId, variant = 'default') =>
  buildCacheKey(role, termId, variant);

export const ANALYTICS_CACHE_ROLES = DEFAULT_ANALYTICS_ROLES;
export const DEFAULT_ANALYTICS_CACHE_TTL_SECONDS = DEFAULT_CACHE_TTL_SECONDS;
