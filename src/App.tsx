import { useState, useRef, useEffect } from "react";
import Header from "./components/Header.tsx";
import Controllers from "./components/Controllers.tsx";
import Handlers from "./components/Handlers.tsx";
import { generateBorderPath, generatePath } from "./utils/index.ts";
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_BORDER_COLOR,
  DEFAULT_BORDER_WIDTH,
  DEFAULT_CORNER_RADIUS,
  DEFAULT_INVERTED_CORNERS,
  DEFAULT_SETUP,
  getInitialCornerRadius,
  getInitialInvertedCornersValues,
} from "./utils/config.ts";

// TODO: support Gradient
function App() {
  const [setup, setSetup] = useState(DEFAULT_SETUP);
  const [cornerRadius, setCornerRadius] = useState(DEFAULT_CORNER_RADIUS);
  const [invertedCorners, setInvertedCorners] = useState(
    DEFAULT_INVERTED_CORNERS
  );
  const [borderWidth, setBorderWidth] = useState(DEFAULT_BORDER_WIDTH);
  const [borderColor, setBorderColor] = useState(DEFAULT_BORDER_COLOR);
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND_COLOR
  );
  const [pathCode, setPathCode] = useState("");
  const [outerPathCode, setOuterPathCode] = useState("");

  const pathRef = useRef(null);
  const outerPathRef = useRef(null);

  useEffect(() => {
    if (!location.search) return;

    setCornerRadius(getInitialCornerRadius());
    setInvertedCorners(getInitialInvertedCornersValues());
  }, []);

  useEffect(() => {
    setPathCode(
      generatePath(setup, cornerRadius, invertedCorners, {
        x: borderWidth,
        y: borderWidth,
      })
    );
    setOuterPathCode(
      generateBorderPath(setup, cornerRadius, invertedCorners, borderWidth)
    );
  }, [setup, cornerRadius, invertedCorners, borderWidth]);

  return (
    <>
      <Header
        pathConfig={{
          setup,
          cornerRadius,
          invertedCorners,
          borderWidth,
          borderColor,
          backgroundColor,
        }}
      />
      <main
        id="tool"
        className="grid md:grid-cols-[1fr_min(100%,300px)] gap-4 p-4 pt-1"
      >
        <div className="relative border-2 border-coffee p-4 flex overflow-hidden rounded-2xl justify-center items-center">
          <svg
            viewBox={`0 0 ${setup.width + borderWidth * 2} ${
              setup.height + borderWidth * 2
            }`}
            id="preview"
            xmlns="http://www.w3.org/2000/svg"
            className="max-h-[70vh] overflow-visible"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="#513d34"
                  opacity={0.2}
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>

            <rect
              width={90000}
              height={90000}
              className="-translate-[45000px]"
              fill="url(#grid)"
            />

            <path ref={outerPathRef} d={outerPathCode} fill={borderColor} />
            <path ref={pathRef} d={pathCode} fill={backgroundColor} />

            <Handlers
              cornerRadius={cornerRadius}
              setCornerRadius={setCornerRadius}
              invertedCorners={invertedCorners}
              setup={setup}
              borderWidth={borderWidth}
            />
          </svg>
        </div>

        {/* <a
          href="#content"
          className="absolute left-0 top-0 -translate-y-full focus:translate-0 bg-bg p-2"
        >
          Skip the tool and jump to the content.
        </a> */}

        <Controllers
          setup={setup}
          setSetup={setSetup}
          cornerRadius={cornerRadius}
          setCornerRadius={setCornerRadius}
          invertedCorners={invertedCorners}
          setInvertedCorners={setInvertedCorners}
          borderWidth={borderWidth}
          setBorderWidth={setBorderWidth}
          borderColor={borderColor}
          setBorderColor={setBorderColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
        />
      </main>
    </>
  );
}

export default App;
