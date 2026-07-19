/** SVG inline mínimo para o PDF do manual (sem React). */

function svg(...ds: string[]) {
  const body = ds
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="#0ea5e9" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('')
  return `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${body}</svg>`
}

export const MANUAL_ICON_SVG_HTML: Record<string, string> = {
  building: svg('M6 22V4h10v18', 'M16 9h4v13', 'M9 8h2', 'M9 12h2', 'M9 16h2'),
  clipboard: svg(
    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2',
    'M9 3h6v4H9z',
  ),
  car: svg('M3 13h18', 'M5 13l2.5-5h9L19 13', 'M7.5 14.5a1.5 1.5 0 1 0 .01 0', 'M16.5 14.5a1.5 1.5 0 1 0 .01 0'),
  notes: svg(
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
    'M8 13h8',
    'M8 17h6',
  ),
  search: svg('M11 11a7 7 0 1 0 .01 0', 'M20 20l-3.5-3.5'),
  bolt: svg('M13 2L4 14h7l-1 8 9-12h-7z'),
  pen: svg('M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'),
  refresh: svg(
    'M3 12a9 9 0 0 1 15-6.7L21 8',
    'M21 3v5h-5',
    'M21 12a9 9 0 0 1-15 6.7L3 16',
    'M8 16H3v5',
  ),
  hand: svg(
    'M18 11V6a2 2 0 0 0-4 0',
    'M14 10V4a2 2 0 0 0-4 0v6',
    'M10 10.5V6a2 2 0 1 0-4 0v8',
    'M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.8-2.4L3 16',
  ),
  tag: svg('M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41z', 'M7 7h.01'),
  alert: svg(
    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    'M12 9v4',
    'M12 17h.01',
  ),
  camera: svg(
    'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z',
    'M12 13a3 3 0 1 0 .01 0',
  ),
  palette: svg('M12 22a10 10 0 1 1 10-10c0 2.2-1.3 3.5-3 3.5h-1.5a2.5 2.5 0 0 0-2.3 3.4A2.5 2.5 0 0 1 12 22z'),
  file: svg('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'),
  lock: svg('M4 11h16v10H4z', 'M8 11V7a4 4 0 0 1 8 0v4'),
  chat: svg('M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z'),
  save: svg(
    'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z',
    'M17 21v-8H7v8',
    'M7 3v5h8',
  ),
  signal: svg('M12 20h.01', 'M8.5 16.4a5 5 0 0 1 7 0', 'M5 12.8a10 10 0 0 1 14 0', 'M2 9a15 15 0 0 1 20 0'),
  cloud: svg('M17.5 19a4.5 4.5 0 0 0 0-9 5.5 5.5 0 0 0-10.7 1.5A3.5 3.5 0 0 0 6.5 19z'),
}
