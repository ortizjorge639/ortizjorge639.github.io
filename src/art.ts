import type { Project } from './projects';

export const icons = {
  home: '<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>',
  book: '<path d="M12 5C8 2 4 3 2 4v15c3-2 7-1 10 1 3-2 7-3 10-1V4c-2-1-6-2-10 1Zm0 0v15"/>',
  folder: '<path d="M2 6h8l2 3h10v12H2zM2 6V3h8l2 3h8v3"/>',
  page: '<path d="M5 2h10l5 5v15H5zM15 2v6h5M8 12h9M8 16h7"/>',
  person: '<path d="M8 3h8v9H8zM8 12v3H4v7h16v-7h-4v-3M8 6h8"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  external: '<path d="M14 4h6v6m0-6L10 14M10 4H4v16h16v-6"/>',
  pen: '<path d="m5 15 10-10 4 4L9 19l-5 1zM13 7l4 4"/>',
  brush: '<path d="m10 14 8-11 3 3-10 10M10 14c-7-3-2 6-7 6 7 3 12-2 7-6Z"/>',
  eraser: '<path d="m3 14 10-11 8 8-9 10H9zM8 9l8 8M12 21h9"/>',
  undo: '<path d="M8 5 3 10l5 5M3 10h10a6 6 0 0 1 0 12" transform="translate(0 -2)"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4zM17 8q5 4 0 8"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6m0-6-5 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
};
export const icon = (name: keyof typeof icons, className = '') =>
  `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">${icons[name]}</svg>`;

export function illustration(kind: Project['illustration']): string {
  const art: Record<Project['illustration'], string> = {
    memory: '<path d="M65 45h125v145H65zM85 70h85M85 90h60M85 110h75M85 150h32M215 75v90m-15-15 15 15 15-15"/><circle cx="214" cy="195" r="17"/><path d="M208 195h12"/>',
    decks: '<path d="M55 65h75v120H55zM115 45h75v120h-60M180 80h65v120h-65zM70 90h44m-44 18h32M143 70h28M195 110h34m-34 18h23"/>',
    broker: '<path d="M35 90h60v60H35zM205 90h60v60h-60M95 120h25m60 0h25M125 95h50v60h-50zM135 95V75a15 15 0 0 1 30 0v20M150 115v18"/>',
    prompt: '<path d="M45 45h120v100H45zM65 70l15 15-15 15m30 0h45M180 95h65v100h-65zM195 115h35M195 135h25M65 170h85m-85 20h60"/>',
    tree: '<path d="M145 54v40m0 38v35M145 95H75v48m70-48h75v48"/><rect x="115" y="25" width="60" height="32" rx="5"/><rect x="45" y="145" width="60" height="32" rx="5"/><rect x="190" y="145" width="60" height="32" rx="5"/><rect x="115" y="168" width="60" height="32" rx="5"/><circle cx="145" cy="112" r="17"/><path d="m137 112 6 6 10-12M128 41h33M57 161h33M202 161h32M128 184h32"/>',
    inbox: '<path d="m62 100 20-48h131l22 48v91H62zM62 105h48l13 22h50l14-22h48"/><path d="M92 84V33h106v51M106 50h76M106 65h51M111 155h71M129 170h35"/><path d="m223 34 6-12m7 22 15-5M48 73l-11-8"/><circle cx="214" cy="161" r="24"/><path d="m202 161 9 8 15-18"/>',
    bot: '<rect x="72" y="58" width="154" height="118" rx="24"/><path d="M149 58V33m-13 0h26M72 99H52v40h20m154-40h20v40h-20M109 178v21m79-21v21"/><rect x="97" y="88" width="25" height="27" rx="5"/><rect x="176" y="88" width="25" height="27" rx="5"/><path d="M115 141q34 25 68 0M242 48h27m-13-13v26M33 167h20m-10-10v20"/>',
    blocks: '<path d="m149 27 58 30-58 31-59-31zM90 57v65l59 31 58-31V57M149 88v65M88 124l-56 30 59 31 58-31M32 154v43l59 30 58-29v-44M91 185v42M207 124l57 30-58 31-57-31M264 154v43l-58 30-57-29M206 185v42"/><path d="m230 43 9-10m-4 30h16M52 99H37m10-9v19"/>',
    canvas: '<rect x="54" y="36" width="193" height="161" rx="6"/><path d="M54 59h193M66 48h2m8 0h2m8 0h2"/><path d="m78 87 61-6 5 46-61 6zM170 89l50 7-6 39-50-7zM112 151l59-5 3 30-60 5zM141 105l24 5M114 133l16 15M187 138l-22 12"/><path d="m88 101 29-3m-28 14 20-2m91-2 20 3m-73 54 20-2"/>',
    game: '<path d="M92 82h116q20 0 27 24l19 61q7 29-16 25l-41-31h-94l-41 31q-25 4-17-25l19-61q7-24 28-24Z"/><path d="M92 106v38m-19-19h38M133 134h33M150 82V57l31-17"/><circle cx="193" cy="113" r="8"/><circle cx="214" cy="136" r="8"/><path d="m68 45 5-15 5 15 15 5-15 5-5 15-5-15-15-5zM230 58l7-12m5 23 14-3"/>',
    film: '<rect x="49" y="48" width="203" height="143" rx="5"/><path d="M49 78h203M49 163h203M74 48v30m30-30v30m30-30v30m30-30v30m30-30v30m30-30v30M74 163v28m30-28v28m30-28v28m30-28v28m30-28v28m30-28v28"/><path d="m133 99 38 23-38 23zM82 211h141m-112 9h76M33 98l-12-6m254 45 13 7"/>',
  };
  return `<svg class="project-art" viewBox="0 0 300 240" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${art[kind]}</svg>`;
}
