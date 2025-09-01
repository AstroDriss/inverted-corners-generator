const InvertedTopRightCorner = ({ size = 15, rotation = 0 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M1 1H4.07143C5.13655 1 6 1.86345 6 2.92857V2.92857C6 4.34873 7.15127 5.5 8.57143 5.5H9.14286C10.4447 5.5 11.5 6.55533 11.5 7.85714V11"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default InvertedTopRightCorner;
