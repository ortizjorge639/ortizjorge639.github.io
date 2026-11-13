import type { Project } from './projects';

// Paired drawings show each project's subject before and after its workflow.
export function storyArt(kind: Project['illustration'], phase: 'before' | 'after' = 'after') {
  const drawings: Record<Project['illustration'], { before: string; after: string }> = {
    memory: {
      before: '<path d="m4 8 24-4 5 31-24 4zM43 8h32v38H43M49 17h19m-19 8h14M14 48h23m-23 8h15"/>',
      after: '<path d="M8 5h32v47H8zM15 15h18m-18 9h12M53 10v27m-6-6 6 6 6-6M49 51h25"/><circle cx="65" cy="16" r="7"/>',
    },
    decks: {
      before: '<path d="M5 8h15v45H5zm20-4h15v49H25zm20 9h15v40H45zm20-6h14v46H65zM8 18h9m11-4h9m11 10h9m11-7h8"/>',
      after: '<path d="M5 15h20v42H5zM32 5h20v42H32zM59 15h20v42H59zM10 24h10m17-10h10m17 10h10M10 43h10m17-10h10m17 10h10"/>',
    },
    broker: {
      before: '<path d="M5 12h26v35H5zM53 12h26v35H53M31 29h22"/><circle cx="39" cy="13" r="5"/><path d="M44 13h8m-3 0v4"/>',
      after: '<path d="M3 19h19v27H3zM62 19h19v27H62M22 33h10m20 0h10M32 24h20v23H32zM36 24v-8a6 6 0 0 1 12 0v8M42 32v7"/>',
    },
    prompt: {
      before: '<path d="M7 8h47v44H7zM14 18l7 6-7 6m14 0h17M62 10v24m0 7v4"/>',
      after: '<path d="M4 5h31v35H4zM10 14h19m-19 8h12M47 16h31v40H47zM54 25h17m-17 8h10M35 23h12m-5-5 5 5-5 5"/>',
    },
    inbox: {
      before: '<path d="M5 15h32v24H5zm0 0 16 13 16-13M55 5h17v31l-8-6-9 6zM47 46h24v12H47M8 54h25"/>',
      after: '<path d="M18 6h48v52H18zM18 16h48M24 11h3m6 0h3m6 0h3"/><path d="M25 23h7v7h-7zm0 16h7v7h-7zM39 25h19M39 29h12M39 41h19M39 45h15"/>',
    },
    tree: {
      before: '<path d="M8 7h31v12H8zm0 21h31v12H8zm0 21h31v12H8zM23 19v9m0 12v9M51 23h24v19H51M52 54l7-7m4-34 8-5"/>',
      after: '<path d="M7 5h28v12H7zm0 42h28v12H7zm43-15h28v12H50zM21 17v30m0-21h43v6"/><circle cx="21" cy="26" r="3"/><path d="M12 11h17m-17 42h17m26-15h18"/>',
    },
    bot: {
      before: '<path d="M15 5h39v47H15zM22 14h23m-23 8h23m-23 8h18m-18 8h14"/><circle cx="58" cy="43" r="12"/><path d="m66 52 9 9"/>',
      after: '<path d="M4 7h29v40H4zM10 15h17m-17 8h17m-17 8h11M40 19h37v30H57l-9 8v-8h-8zM47 27h22m-22 8h16"/><path d="M60 41h8" stroke="var(--red)"/>',
    },
    blocks: {
      before: '<path d="M17 7h45v49H17zM23 17h30m-30 7h21m-11 8-6 6 6 6m16-12 6 6-6 6"/><path d="M6 48V29l7 6M75 16v19l-7-6" stroke="var(--red)"/>',
      after: '<path d="M3 19h20v27H3zM30 9h22v27H30zM59 26h21v27H59zM23 32h7m22-8h8v8"/><path d="M8 27h10m-10 6h6M35 17h12m-12 6h7M64 35h11m-11 6h7M35 50h14m-9-5-5 5 5 5"/>',
    },
    canvas: {
      before: '<path d="m8 10 22-4 4 17-22 4zM50 5l22 5-4 18-22-5zM28 39l23-3 3 19-23 3zM4 44l11 7m52-6 10-8"/>',
      after: '<path d="M5 6h72v51H5zM5 16h72M29 16v41m24-41v41"/><path d="M11 24h12v12H11zm24 0h12v19H35zm24 0h12v9H59zM11 43h12"/>',
    },
    game: {
      before: '<path d="M7 10h18v39H7zm26-4h18v39H33zm26 9h18v39H59zM12 18h8m18-4h8m18 9h8M12 39h8m18-4h8m18 9h8"/>',
      after: '<path d="M4 8h17v33H4zm23 0h17v33H27zm23 0h17v33H50M9 15h7m16 0h7m16 0h7M16 52h31"/><circle cx="67" cy="49" r="10"/><path d="M67 42v7l5 3"/>',
    },
    film: {
      before: '<path d="M5 13h19v35H5zm26-9h20v35H31zm28 12h19v35H59zM10 21h9m-9 7h9m-9 7h6M36 12h10m-10 7h7M64 24h9m-9 8h9"/>',
      after: '<path d="M5 7h72v50H5zM5 17h72M13 12h3m6 0h3"/><path d="m35 24 14 9-14 9zM12 49h9m4 0h9m4 0h9m4 0h9m4 0h7"/>',
    },
    inventory: {
      before: '<path d="M4 8h32v46H4zM4 20h32M15 8v46M4 31h32M4 42h32M47 6h32v46H47zM47 18h32M58 6v46M47 29h32M47 40h32M9 25h2m10 11h7M52 23h2m10 11h7"/>',
      after: '<path d="M3 16h27v34H3zM3 27h27M12 16v34M30 33h12M43 7h37v31H61l-8 8v-8H43zM49 16h24m-24 8h16M48 56l6-9 6 9zM68 47h10v10H68z"/>',
    },
    evidence: {
      before: '<path d="M8 5h43v53H8zM15 16h29M15 27h29M15 38h24M15 49h17M14 30l29-7M59 13h17v18H59zM60 44h16m-16 8h10"/><rect x="12" y="22" width="34" height="12" stroke-dasharray="3 3"/>',
      after: '<path d="M3 6h28v48H3zM8 16h18M8 26h18m-18 2 17-5M8 38h13M31 26h12V7h36v22H43M43 40h36v17H43zM38 26v22h5M49 15h24m-24 7h15M49 47h24m-24 5h15"/>',
    },
    'auth-probe': {
      before: '<path d="M4 18h23v28H4zM9 26l5 5-5 5m10 0h3M27 32h18m-10-6 7 12m-7 0 7-12M59 12l18 7v17q0 12-18 19-18-7-18-19V19M59 23v12m0 7v2"/>',
      after: '<path d="M3 24h18v23H3zM21 35h10M31 26h17v18H31zM39 26V9h23m-6-4 6 4-6 4M48 35h11M68 22l12 5v15q0 9-12 14-12-5-12-14V27M64 35v-4a4 4 0 0 1 8 0v4M62 35h12v10H62z"/><circle cx="39" cy="9" r="3"/>',
    },
    gestures: {
      before: '<path d="M6 7h48v37H6zM13 33q4-27 13-11t20-7M13 55h34m-34 0v-4m11 4v-8m12 8v-4m11 4V43M66 12q14 0 8 10l-6 4v7m0 7v2"/>',
      after: '<path d="M3 5h34v27H16l-7 7v-7H3zM9 24q3-18 9-8t13-4M46 25h35v27H70v8l-9-8H46zM51 44q6-19 12-7t12-6M37 18h14m-5-5 5 5-5 5M8 49h27m-27 0v-4m9 4v-7m9 7v-3m9 3v-9"/>',
    },
    'session-dj': {
      before: '<path d="M3 7h35v27H3zM9 15l6 6-6 6m12 0h10M8 48h25m-19-6v12M54 10h22v28m-22-28v28"/><ellipse cx="49" cy="40" rx="6" ry="4"/><ellipse cx="71" cy="40" rx="6" ry="4"/><path d="M45 54h32m-10-5 5 10m0-10-5 10"/>',
      after: '<path d="M3 7h31v25H3zM8 14l5 5-5 5m11 0h9M34 20h12v20h5M10 44v13m-5-6h10M25 42v17m-5-5h10"/><circle cx="65" cy="40" r="17"/><circle cx="65" cy="40" r="4"/><path d="M65 28a12 12 0 0 1 12 12M65 52a12 12 0 0 1-12-12M58 7h20m-15-3v6m9-6v6"/>',
    },
    recurrence: {
      before: '<path d="m4 8 18-3 4 23-18 3zM35 6h20v24H35zM61 10h19v24H61zM11 43h20v16H11zM42 42h25v18H42zM10 16l9-1m21 0h10m16 4h9M16 50h10m21 0h15"/>',
      after: '<path d="M3 6h17v18H3zM3 40h17v18H3zM7 12h9M7 46h9M20 15h11v17m-11 17h11V32h12M43 10v43m8-43v43M43 19h8m-8 13h8m-8 13h8M51 32h10M61 8h20v48H61zM66 17h10m-10 9h10m-10 17h10"/><circle cx="31" cy="32" r="3"/>',
    },
    recall: {
      before: '<path d="M10 4h44v49H10zM17 14h30m-30 9h30m-30 9h24m-24 9h19M18 53v7h44V12h-8M62 21h10v39H28"/>',
      after: '<path d="M3 14h20v37H3zM7 23h12m-12 8h12M23 33h10m-4-4 4 4-4 4M35 18h27v36H35zM44 30q0-7 6-7t6 7q0 4-6 7v5m0 4v1M40 59h22"/><circle cx="71" cy="12" r="10"/><path d="M71 6v6l5 3"/>',
    },
    migration: {
      before: '<ellipse cx="19" cy="14" rx="14" ry="6"/><path d="M5 14v31c0 8 28 8 28 0V14M5 28c0 8 28 8 28 0M38 26h12m-5-5 5 5-5 5M55 8h25v43H55zM60 19h15m-15 9h9M60 42h15M10 58h18m32 0h15"/>',
      after: '<ellipse cx="16" cy="13" rx="12" ry="5"/><ellipse cx="68" cy="13" rx="12" ry="5"/><path d="M4 13v29c0 7 24 7 24 0V13M56 13v29c0 7 24 7 24 0V13M4 27c0 7 24 7 24 0M56 27c0 7 24 7 24 0M29 19h25m-5-4 5 4-5 4M28 40h7m14 0h7M35 31h14v18H35zM38 37h8m-8 6h8M16 57h52"/>',
    },
    connections: {
      before: '<path d="M4 7h27v45H4zM53 7h27v45H53M9 17h17M9 27h17M9 37h12M58 17h17M58 27h17M58 37h12M34 20l5 4m6 11 5 4M36 42l4-5m5-12 5-5"/>',
      after: '<path d="M3 5h24v39H3zM57 5h24v39H57M8 14h14M62 14h14"/><rect x="7" y="23" width="16" height="9"/><rect x="61" y="23" width="16" height="9"/><path d="M23 27h38M36 22h-3v10h3m12-10h3v10h-3M42 32v13M28 45h28v15H28zM33 51h18m-18 5h11"/>',
    },
  };
  return `<svg class="story-project-symbol" data-symbol="${kind}-${phase}" viewBox="0 0 84 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${drawings[kind][phase]}</svg>`;
}
