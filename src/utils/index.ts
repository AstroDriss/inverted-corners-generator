export const gcd = (a: number, b: number): number =>
  b === 0 ? a : gcd(b, a % b); // greatest common divisor
const A = (r: number, x: number, y: number, sweep = 1) =>
  `A${r},${r} 0,0,${sweep} ${x},${y}`;
const H = (x: number) => `H${x}`;
const V = (y: number) => `V${y}`;
const M = (x: number, y: number) => `M${x},${y}`;

export const fixed = (value: number) =>
  value % 1 === 0 ? value : +value.toFixed(2);

export const constraint = (setup: Setup, value: number) =>
  fixed(Math.max(0, Math.min(value, setup.width / 2, setup.height / 2)));

function drawInvertedCorner(
  {
    width,
    height,
    corners,
  }: { width: number; height: number; corners: number[] },
  origin: { x: number; y: number },
  direction: "tr" | "br" | "bl" | "tl"
) {
  const [c0, c1, c2] = corners;
  const { x, y } = origin;

  switch (direction) {
    case "tr":
      return (
        A(c0, x, y + c0) +
        V(y + height - c1) +
        A(c1, x + c1, y + height, 0) +
        H(x + width - c2) +
        A(c2, x + width, y + height + c2)
      );

    case "br":
      return (
        A(c0, x - c0, y) +
        H(x - width + c1) +
        A(c1, x - width, y + c1, 0) +
        V(y + height - c2) +
        A(c2, x - width - c2, y + height)
      );

    case "bl":
      return (
        A(c0, x, y - c0) +
        V(y - height + c1) +
        A(c1, x - c1, y - height, 0) +
        H(x - width + c2) +
        A(c2, x - width, y - height - c2)
      );

    case "tl":
      return (
        A(c0, x + c0, y) +
        H(x + width - c1) +
        A(c1, x + width, y - c1, 0) +
        V(y - height + c2) +
        A(c2, x + width + c2, y - height)
      );
  }
}

export const generatePath = (
  setup: Setup,
  cornerRadius: CornerRadius,
  invertedCorners: InvertedCorners,
  position = { x: 0, y: 0 }
) => {
  const { width, height } = setup;
  const {
    tl: topLeft,
    tr: topRight,
    bl: bottomLeft,
    br: bottomRight,
  } = cornerRadius;
  const { tl, tr, bl, br } = invertedCorners;
  const { x, y } = position;

  let path = M(x + topLeft, y);

  // Top Side
  path += tr.inverted
    ? H(x + width - tr.width - tr.corners[0])
    : H(x + width - topRight);

  //   top right corner
  if (tr.inverted) {
    path += drawInvertedCorner(tr, { x: x + width - tr.width, y }, "tr");
  } else path += A(topRight, x + width, y + topRight);

  // Right Side
  path += br.inverted
    ? V(y + height - br.height - br.corners[0])
    : V(y + height - bottomRight);

  // Bottom right corner
  if (br.inverted) {
    path += drawInvertedCorner(
      br,
      { x: x + width, y: y + height - br.height },
      "br"
    );
  } else path += A(bottomRight, x + width - bottomRight, y + height);

  // Bottom Side
  path += bl.inverted ? H(x + bl.width + bl.corners[0]) : H(x + bottomLeft);

  // Bottom Left corner
  if (bl.inverted) {
    path += drawInvertedCorner(bl, { x: x + bl.width, y: y + height }, "bl");
  } else path += A(bottomLeft, x, y + height - bottomLeft);

  // Left Side
  path += tl.inverted ? V(y + tl.height + tl.corners[0]) : V(y + topLeft);

  // top left corner
  if (tl.inverted) {
    path += drawInvertedCorner(tl, { x: x, y: y + tl.height }, "tl");
  } else path += A(topLeft, x + topLeft, y) + `Z`;

  return path;
};

export const generateBorderPath = (
  setup: Setup,
  cornerRadius: CornerRadius,
  invertedCorners: InvertedCorners,
  borderWidth: number
) => {
  const { width, height } = setup;
  const {
    tl: topLeft,
    tr: topRight,
    bl: bottomLeft,
    br: bottomRight,
  } = cornerRadius;
  const { tl, tr, bl, br } = invertedCorners;

  // Not the real outer dims but makes work easier
  const outerWidth = width + borderWidth;
  const outerHeight = height + borderWidth;

  let path = M(topLeft + borderWidth, 0);

  // Top Side
  if (tr.inverted) {
    path += H(outerWidth - tr.width - tr.corners[0]);
  } else path += H(outerWidth - topRight);

  // Top Right Corner
  if (tr.inverted) {
    path +=
      A(
        tr.corners[0] + borderWidth,
        outerWidth - tr.width + borderWidth,
        tr.corners[0] + borderWidth
      ) +
      V(tr.height - tr.corners[1] + borderWidth) +
      A(
        tr.corners[1] - borderWidth,
        outerWidth - tr.width + tr.corners[1],
        tr.height,
        0
      ) +
      H(outerWidth - tr.corners[2]) +
      A(
        tr.corners[2] + borderWidth,
        outerWidth + borderWidth,
        tr.height + tr.corners[2] + borderWidth
      );
  } else
    path += A(
      topRight + borderWidth,
      outerWidth + borderWidth,
      topRight + borderWidth
    );

  // Right Side
  if (br.inverted) {
    path += V(outerHeight - br.height - br.corners[0]);
  } else path += V(outerHeight - bottomRight);

  // Bottom Right Corner
  if (br.inverted) {
    path +=
      A(
        br.corners[0] + borderWidth,
        outerWidth - br.corners[0],
        outerHeight - br.height + borderWidth
      ) +
      H(outerWidth - br.width + br.corners[1]) +
      A(
        br.corners[1] - borderWidth,
        outerWidth - br.width + borderWidth,
        outerHeight - br.height + br.corners[1],
        0
      ) +
      V(outerHeight - br.corners[2]) +
      A(
        br.corners[2] + borderWidth,
        outerWidth - br.width - br.corners[2],
        outerHeight + borderWidth
      );
  } else
    path += A(
      bottomRight + borderWidth,
      outerWidth - bottomRight,
      outerHeight + borderWidth
    );

  // Bottom Side
  if (bl.inverted) path += H(bl.width + bl.corners[0] + borderWidth);
  else path += H(bottomLeft + borderWidth);

  // Bottom Left Corner
  if (bl.inverted) {
    path +=
      A(bl.corners[0] + borderWidth, bl.width, outerHeight - bl.corners[0]) +
      V(outerHeight - bl.height + bl.corners[1]) +
      A(
        bl.corners[1] - borderWidth,
        bl.width - bl.corners[1] + borderWidth,
        outerHeight - bl.height + borderWidth,
        0
      ) +
      H(bl.corners[2] + borderWidth) +
      A(
        bl.corners[2] + borderWidth,
        0,
        outerHeight - bl.height - bl.corners[2]
      );
  } else path += A(bottomLeft + borderWidth, 0, outerHeight - bottomLeft);

  // Left Side
  if (tl.inverted) path += V(tl.height + tl.corners[0] + borderWidth);
  else path += V(topLeft + borderWidth);

  // Top Left Corner
  if (tl.inverted) {
    path +=
      A(tl.corners[0] + borderWidth, tl.corners[0] + borderWidth, tl.height) +
      H(tl.width - tl.corners[1] + borderWidth) +
      A(
        tl.corners[1] - borderWidth,
        tl.width,
        tl.height - tl.corners[1] + borderWidth,
        0
      ) +
      V(tl.corners[2] + borderWidth) +
      A(tl.corners[2] + borderWidth, tl.width + tl.corners[2] + borderWidth, 0);
  } else path += A(topLeft + borderWidth, topLeft + borderWidth, 0) + "Z";

  return path;
};

const round = (n: number) => parseFloat(n.toFixed(4));

// prettier-ignore
export function normalizeSVGPath(path: string, width: number, height: number): string {
  return path.replace(/([MLHVAC])([^MLHVACZ]*)/gi, (_, command, args) => {
    const values = args.trim().split(/[\s,]+/).map(parseFloat);

    switch (command.toUpperCase()) {
      case 'M':
      case 'L':
        return `${command}${round(values[0] / width)},${round(values[1] / height)}`;
      case 'H':
        return `${command}${round(values[0] / width)}`;
      case 'V':
        return `${command}${round(values[0] / height)}`;
      case 'A':
        return `${command}${[
          round(values[0] / width),  // rx
          round(values[1] / height), // ry
          values[2],                 // x-axis-rotation
          values[3],                 // large-arc-flag
          values[4],                 // sweep-flag
          round(values[5] / width),  // x
          round(values[6] / height)  // y
        ].join(',')}`;
      default:
        return command; // Z
    }
  });
}

export function debounce(func: Function, wait: number) {
  let timeout: number;
  const debounced = (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

export function areAllEqual(arr: number[]): boolean {
  return arr.every((val) => val === arr[0]);
}

export function getCorners(rList: number[]): [number, number, number] {
  if (rList.length === 1) return [rList[0], rList[0], rList[0]];
  if (rList.length === 2) return [rList[0], rList[1], 0];
  return rList as [number, number, number];
}
