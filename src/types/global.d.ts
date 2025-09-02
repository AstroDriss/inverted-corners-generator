export {};

declare global {
  interface Setup {
    width: number;
    height: number;
    lockAspectRatio: number | null;
  }
  interface CornerRadius {
    tl: number;
    tr: number;
    br: number;
    bl: number;
  }
  interface InvertedCorners {
    tl: {
      width: number;
      height: number;
      roundness: number;
      inverted: boolean;
    };
    tr: {
      width: number;
      height: number;
      roundness: number;
      inverted: boolean;
    };
    br: {
      width: number;
      height: number;
      roundness: number;
      inverted: boolean;
    };
    bl: {
      width: number;
      height: number;
      roundness: number;
      inverted: boolean;
    };
  }
}
