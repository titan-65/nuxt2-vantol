export type BoxSize = {
  size: number;
  label: string;
  priceCents: number;
  note: string;
};

export const BOX_SIZES: BoxSize[] = [
  {
    size: 4,
    label: "4-pack",
    priceCents: 1600,
    note: "A small box for a quiet afternoon.",
  },
  {
    size: 6,
    label: "6-pack",
    priceCents: 2250,
    note: "The table box.",
  },
  {
    size: 12,
    label: "12-pack",
    priceCents: 4200,
    note: "The party box.",
  },
];
