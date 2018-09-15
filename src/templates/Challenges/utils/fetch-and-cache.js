import { of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { ajax$ } from './ajax-stream';

// value used to break browser ajax caching
const cacheBreakerValue = Math.random();

export function _fetchScript({
  src,
  cacheBreaker = false,
  crossDomain = true
} = {}) {
  if (!src) {
    throw new Error('No source provided for script');
  }
  if (this.cache.has(src)) {
    return this.cache.get(src);
  }
  const url = cacheBreaker ? `${src}?cacheBreaker=${cacheBreakerValue}` : src;
  const script = ajax$({ url, crossDomain }).pipe(
    tap(res => {
      if (res.status !== 200) {
        throw new Error('Request errror: ' + res.status);
      }
    }),
    map(({ response }) => response),
    map(script => `<script>${script}</script>`),
    shareReplay()
  );

  this.cache.set(src, script);
  return script;
}
export const fetchScript = _fetchScript.bind({ cache: new Map() });

export function _fetchLink({
  link: href,
  raw = false,
  crossDomain = true
} = {}) {
  if (!href) {
    return throwError(new Error('No source provided for link'));
  }
  if (this.cache.has(href)) {
    return this.cache.get(href);
  }
  // css files with `url(...` may not work in style tags
  // so we put them in raw links
  if (raw) {
    const link = of(
      `<link href=${href} rel='stylesheet' />`
    ).pipe(shareReplay());
    this.cache.set(href, link);
    return link;
  }
  const link = ajax$({ url: href, crossDomain }).pipe(
    tap(res => {
      if (res.status !== 200) {
        throw new Error('Request error: ' + res.status);
      }
    }),
    map(({ response }) => response),
    map(script => `<style>${script}</style>`),
    catchError(() => of('')),
    shareReplay()
  );

  this.cache.set(href, link);
  return link;
}

export const fetchLink = _fetchLink.bind({ cache: new Map() });
