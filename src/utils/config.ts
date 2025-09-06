import { getCorners } from ".";

const p = new URL(location.href).searchParams;

export const DEFAULT_SETUP = {
  width: Number(p.get("w")) || 100,
  height: Number(p.get("h")) || 100,
  lockAspectRatio: null,
} as Setup;

export const DEFAULT_BORDER_WIDTH = Number(p.get("b")) || 0;

export const DEFAULT_BORDER_COLOR = "#" + (p.get("bc") || "FF2056");
export const DEFAULT_BACKGROUND_COLOR = "#" + (p.get("bg") || "513D34");

export const DEFAULT_CORNER_RADIUS = {
  tl: 20,
  tr: 0,
  br: 10,
  bl: 10,
} as CornerRadius;

// prettier-ignore
export const DEFAULT_INVERTED_CORNERS = {
  tl: { width: 20, height: 30, roundness: 10, inverted: false, corners: [10, 10, 10] },
  tr: { width: 60, height: 30, roundness: 10, inverted: true, corners: [10, 10, 10] },
  br: { width: 30, height: 20, roundness: 10, inverted: false, corners: [10, 10, 10] },
  bl: { width: 20, height: 20, roundness: 10, inverted: true, corners: [10, 10, 10] },
} as InvertedCorners;

export const getInitialCornerRadius = () => {
  const cornerRadius = DEFAULT_CORNER_RADIUS;

  const r = p.get("r");

  if (r) {
    const [tl, tr, br, bl] = r.split(",");

    cornerRadius.tl = Number(tl) ?? cornerRadius.tl;
    cornerRadius.tr = Number(tr ?? tl) ?? cornerRadius.tr;
    cornerRadius.br = Number(br ?? tl) ?? cornerRadius.br;
    cornerRadius.bl = Number(bl ?? tl) ?? cornerRadius.bl;
  }

  return cornerRadius;
};

export const getInitialInvertedCornersValues = () => {
  const ic = p.get("ic");

  const invertedCorners = DEFAULT_INVERTED_CORNERS;

  const keys = ["tl", "tr", "br", "bl"] as const;

  const corners = ic?.split(",");
  keys?.forEach((key, i) => {
    const corner = corners?.[i];

    if (corner) {
      const [values, inverted] = corner.split(":");

      const [w, h, r] = values.split("x");
      const rList = r && r.split("-").map(Number);

      invertedCorners[key].width = Number(w) ?? invertedCorners[key].width;
      invertedCorners[key].height = Number(h) ?? invertedCorners[key].height;
      invertedCorners[key].corners = rList
        ? getCorners(rList)
        : invertedCorners[key].corners;
      invertedCorners[key].inverted = inverted == "1";
    }
  });

  return invertedCorners;
};
