export const gcd = (a: number, b: number): number =>
  b === 0 ? a : gcd(b, a % b); // greatest common divisor
const A = (r: number, x: number, y: number, sweep = 1) =>
  `A${r},${r} 0,0,${sweep} ${x},${y}`;
const L = (x: number, y: number) => `L${x},${y}`;
const H = (x: number) => `H${x}`;
const V = (y: number) => `V${y}`;
const M = (x: number, y: number) => `M${x},${y}`;

export const fixed = (value: number) =>
  value % 1 === 0 ? value : +value.toFixed(2);

export const constraint = (setup: Setup, value: number) =>
  fixed(Math.max(0, Math.min(value, setup.width / 2, setup.height / 2)));

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
  if (tr.inverted) {
    path += H(x + (width - tr.width - tr.roundness));
  } else path += H(x + width - topRight);

  //   top right corner
  if (tr.inverted) {
    path +=
      A(tr.roundness, x + width - tr.width, y + tr.roundness) +
      L(x + width - tr.width, y + tr.height - tr.roundness) +
      A(tr.roundness, x + width - tr.width + tr.roundness, y + tr.height, 0) +
      L(x + width - tr.roundness, y + tr.height) +
      A(tr.roundness, x + width, y + tr.height + tr.roundness);
  } else path += A(topRight, x + width, y + topRight);

  // Right Side
  if (br.inverted) {
    path += V(y + height - br.height - br.roundness);
  } else path += V(y + height - bottomRight);

  // Bottom right corner
  if (br.inverted) {
    path +=
      A(br.roundness, x + width - br.roundness, y + height - br.height) +
      L(x + width - br.width + br.roundness, y + height - br.height) +
      A(
        br.roundness,
        x + width - br.width,
        y + height - br.height + br.roundness,
        0
      ) +
      L(x + width - br.width, y + height - br.roundness) +
      A(br.roundness, x + width - br.width - br.roundness, y + height);
  } else path += A(bottomRight, x + width - bottomRight, y + height);

  // Bottom Side
  if (bl.inverted) path += H(x + bl.width + bl.roundness);
  else path += H(x + bottomLeft);

  // Bottom Left corner
  if (bl.inverted) {
    path +=
      A(bl.roundness, x + bl.width, y + height - bl.roundness) +
      L(x + bl.width, y + height - bl.height + bl.roundness) +
      A(bl.roundness, x + bl.width - bl.roundness, y + height - bl.height, 0) +
      L(x + bl.roundness, y + height - bl.height) +
      A(bl.roundness, x, y + height - bl.height - bl.roundness);
  } else path += A(bottomLeft, x, y + height - bottomLeft);

  // Left Side
  if (tl.inverted) path += V(y + tl.height + tl.roundness);
  else path += V(y + topLeft);

  // top left corner
  if (tl.inverted) {
    path +=
      A(tl.roundness, x + tl.roundness, y + tl.height) +
      L(x + tl.width - tl.roundness, y + tl.height) +
      A(tl.roundness, x + tl.width, y + tl.height - tl.roundness, 0) +
      L(x + tl.width, y + tl.roundness) +
      A(tl.roundness, x + tl.width + tl.roundness, y);
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

  let path = `M${topLeft + borderWidth},0`;

  // Top Side
  if (tr.inverted) {
    path += `H${outerWidth - tr.width - tr.roundness}`;
  } else path += `H${outerWidth - topRight}`;

  // Top Right Corner
  if (tr.inverted) {
    path +=
      A(
        tr.roundness + borderWidth,
        outerWidth - tr.width + borderWidth,
        tr.roundness + borderWidth
      ) +
      L(
        outerWidth - tr.width + borderWidth,
        tr.height - tr.roundness + borderWidth
      ) +
      A(
        tr.roundness - borderWidth,
        outerWidth - tr.width + tr.roundness,
        tr.height,
        0
      ) +
      L(outerWidth - tr.roundness, tr.height) +
      A(
        tr.roundness + borderWidth,
        outerWidth + borderWidth,
        tr.height + tr.roundness + borderWidth
      );
  } else
    path += A(
      topRight + borderWidth,
      outerWidth + borderWidth,
      topRight + borderWidth
    );

  // Right Side
  if (br.inverted) {
    path += V(outerHeight - br.height - br.roundness);
  } else path += V(outerHeight - bottomRight);

  // Bottom Right Corner
  if (br.inverted) {
    path +=
      A(
        br.roundness + borderWidth,
        outerWidth - br.roundness,
        outerHeight - br.height + borderWidth
      ) +
      L(
        outerWidth - br.width + br.roundness,
        outerHeight - br.height + borderWidth
      ) +
      A(
        br.roundness - borderWidth,
        outerWidth - br.width + borderWidth,
        outerHeight - br.height + br.roundness,
        0
      ) +
      L(outerWidth - br.width + borderWidth, outerHeight - br.roundness) +
      A(
        br.roundness + borderWidth,
        outerWidth - br.width - br.roundness,
        outerHeight + borderWidth
      );
  } else
    path += A(
      bottomRight + borderWidth,
      outerWidth - bottomRight,
      outerHeight + borderWidth
    );

  // Bottom Side
  if (bl.inverted) path += H(bl.width + bl.roundness + borderWidth);
  else path += H(bottomLeft + borderWidth);

  // Bottom Left Corner
  if (bl.inverted) {
    path +=
      A(bl.roundness + borderWidth, bl.width, outerHeight - bl.roundness) +
      L(bl.width, outerHeight - bl.height + bl.roundness) +
      A(
        bl.roundness - borderWidth,
        bl.width - bl.roundness + borderWidth,
        outerHeight - bl.height + borderWidth,
        0
      ) +
      L(bl.roundness + borderWidth, outerHeight - bl.height + borderWidth) +
      A(bl.roundness + borderWidth, 0, outerHeight - bl.height - bl.roundness);
  } else path += A(bottomLeft + borderWidth, 0, outerHeight - bottomLeft);

  // Left Side
  if (tl.inverted) path += V(tl.height + tl.roundness + borderWidth);
  else path += V(topLeft + borderWidth);

  // Top Left Corner
  if (tl.inverted) {
    path +=
      A(tl.roundness + borderWidth, tl.roundness + borderWidth, tl.height) +
      L(tl.width - tl.roundness + borderWidth, tl.height) +
      A(
        tl.roundness - borderWidth,
        tl.width,
        tl.height - tl.roundness + borderWidth,
        0
      ) +
      L(tl.width, tl.roundness + borderWidth) +
      A(tl.roundness + borderWidth, tl.width + tl.roundness + borderWidth, 0);
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
