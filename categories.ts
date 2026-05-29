export type CategoryKey = 'economy' | 'fuel' | 'electricity' | 'crypto' | 'gold' | 'local' | 'analysis' | string;

export interface CategoryMeta {
  label: string;
  color: string;
  icon?: string;
}

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  economy: { label: 'اقتصادي', color: 'bg-blue-500/10 text-blue-400', icon: '📊' },
  fuel: { label: 'محروقات', color: 'bg-orange-500/10 text-orange-400', icon: '⛽' },
  electricity: { label: 'كهرباء', color: 'bg-yellow-500/10 text-yellow-400', icon: '⚡' },
  crypto: { label: 'كريبتو', color: 'bg-purple-500/10 text-purple-400', icon: '₿' },
  gold: { label: 'ذهب', color: 'bg-amber-500/10 text-amber-400', icon: '🥇' },
  local: { label: 'محلي', color: 'bg-green-500/10 text-green-400', icon: '🏠' },
  analysis: { label: 'تحليلات', color: 'bg-pink-500/10 text-pink-400', icon: '🔍' },
};

export const getCategoryMeta = (key: CategoryKey): CategoryMeta => {
  return CATEGORY_META[key] || { label: key, color: 'bg-muted text-muted-foreground', icon: '📄' };
};