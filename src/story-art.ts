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
  };
  return `<svg class="story-project-symbol" data-symbol="${kind}-${phase}" viewBox="0 0 84 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${drawings[kind][phase]}</svg>`;
}
