export const flipnotes = [
  { image: '/images/flipnotes/01-circa-2014.png', date: 'circa 2014' },
  { image: '/images/flipnotes/02-circa-2015.png', date: 'circa 2015' },
  { image: '/images/flipnotes/03-circa-2015.png', date: 'circa 2015' },
  { image: '/images/flipnotes/04-circa-2015.png', date: 'circa 2015' },
] as const;

export function aboutHash(page = 0) {
  return page === 0 ? '#about' : `#about/flipnotes/${page}`;
}
