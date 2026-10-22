/** The copy for a language. */
import { en, type Copy } from './en';
import { ja } from './ja';
import type { Lang } from '../lib/site';

export type { Copy };
export const copyFor = (lang: Lang): Copy => (lang === 'ja' ? ja : en);
