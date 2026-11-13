import type { Project } from './projects';

// Paired drawings show each project's subject before and after its workflow.
export function storyArt(kind: Project['illustration'], phase: 'before' | 'after' = 'after') {
  const drawings: Record<Project['illustration'], { before: string; after: string }> = {
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
      after: '<path d="M41 59V29M9 26l32-20 32 20M17 24v25h48V24M41 49v10"/><path d="M23 28h10v15H23zm15 0h10v15H38zm15 0h6v15h-6zM8 53h65M41 6V2"/>',
    },
    film: {
      before: '<path d="M5 13h19v35H5zm26-9h20v35H31zm28 12h19v35H59zM10 21h9m-9 7h9m-9 7h6M36 12h10m-10 7h7M64 24h9m-9 8h9"/>',
      after: '<path d="M5 7h72v50H5zM5 17h72M13 12h3m6 0h3"/><path d="m35 24 14 9-14 9zM12 49h9m4 0h9m4 0h9m4 0h9m4 0h7"/>',
    },
  };
  return `<svg class="story-project-symbol" data-symbol="${kind}-${phase}" viewBox="0 0 84 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${drawings[kind][phase]}</svg>`;
}
