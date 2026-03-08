import { useCallback, useEffect, useRef, useState } from "react";
import { constraint, debounce } from "../utils";
import InvertedTopRightCorner from "../assets/InvertedTopRightCorner";

interface Props {
  cornerRadius: CornerRadius;
  setCornerRadius: React.Dispatch<React.SetStateAction<CornerRadius>>;
  setup: Setup;
  invertedCorners: InvertedCorners;
  borderWidth: number;
  svgRef: React.RefObject<SVGElement | null>; // Passed from parent
}

const GRAB_CLASS = "grab";
const GRABBING_CLASS = "grabbing";

const CornerPath = ({
  visibleHandle,
  index,
  d,
}: {
  visibleHandle: number | null;
  index: number;
  d: string;
}) => <path className={`${visibleHandle !== index ? "hidden" : ""}`} d={d} />;

const Handles = ({
  cornerRadius,
  setCornerRadius,
  setup,
  invertedCorners,
  borderWidth,
  svgRef,
}: Props) => {
  const activeHandle = useRef<number>(null);
  const [visibleHandle, setVisibleHandle] = useState<number | null>(null); // https://stackoverflow.com/questions/62806541/how-to-solve-the-react-hook-closure-issue
  const circlesRef = useRef<SVGGElement>(null);

  const handlePointerOver = useCallback(() => {
    document.body.classList.add(GRAB_CLASS);
  }, []);

  const handlePointerOut = useCallback((e: PointerEvent) => {
    document.body.classList.remove(GRAB_CLASS);

    if ((e.target as SVGCircleElement).hasPointerCapture(e.pointerId)) {
      (e.target as SVGCircleElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      (e.target as SVGCircleElement).setPointerCapture(e.pointerId);
      if (!e.target) return;
      document.body.classList.add(GRABBING_CLASS);
      const circle = e.target as SVGCircleElement;
      const index = +circle.getAttribute("data-index")!;
      activeHandle.current = index;
      setVisibleHandle(index);
    },
    [svgRef],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      svgRef.current?.releasePointerCapture(e.pointerId);
      document.body.classList.remove(GRABBING_CLASS);
      activeHandle.current = null;
      setVisibleHandle(null);
    },
    [svgRef],
  );

  const handlePointerCancel = useCallback(
    (e: PointerEvent) => {
      if ((e.target as SVGCircleElement).hasPointerCapture(e.pointerId)) {
        (e.target as SVGCircleElement).releasePointerCapture(e.pointerId);
      }
    },
    [svgRef],
  );

  useEffect(() => {
    if (!circlesRef.current) return;
    const controller = new AbortController();

    circlesRef.current.addEventListener("pointerover", handlePointerOver, {
      signal: controller.signal,
    });
    circlesRef.current.addEventListener("pointerout", handlePointerOut, {
      signal: controller.signal,
    });
    circlesRef.current.addEventListener("pointerdown", handlePointerDown, {
      signal: controller.signal,
    });

    document.addEventListener(
      "pointermove",
      (e) => {
        if (activeHandle.current === null || svgRef.current === null) return;

        const box = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - box.left) * setup.width) / box.width; // Get relative x and Scale it
        const y = ((e.clientY - box.top) * setup.height) / box.height;

        switch (activeHandle.current) {
          case 0: // Top Left
            setCornerRadius((prev) => ({
              ...prev,
              tl: constraint(setup, Math.min(x, y)),
            }));
            break;
          case 1: // Top Right
            setCornerRadius((prev) => ({
              ...prev,
              tr: constraint(setup, Math.min(setup.width - x, y)),
            }));
            break;
          case 2: // Bottom Right
            setCornerRadius((prev) => ({
              ...prev,
              br: constraint(
                setup,
                Math.min(setup.width - x, setup.height - y),
              ),
            }));
            break;
          case 3: // Bottom Left
            setCornerRadius((prev) => ({
              ...prev,
              bl: constraint(setup, Math.min(x, setup.height - y)),
            }));
            break;
        }
      },
      { signal: controller.signal },
    );
    document.addEventListener("pointerup", handlePointerUp, {
      signal: controller.signal,
    });
    document.addEventListener("pointercancel", handlePointerCancel, {
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [setup, svgRef]);

  const { tl, tr, br, bl } = cornerRadius;

  return (
    <>
      <g
        stroke="dodgerblue"
        fill="none"
        strokeWidth=".5%"
        strokeLinecap="round"
      >
        <CornerPath
          visibleHandle={visibleHandle}
          index={0}
          d={`M${borderWidth} ${tl + borderWidth} A${tl} ${tl} 0 0 1 ${
            tl + borderWidth
          } ${borderWidth}`}
        />
        <CornerPath
          visibleHandle={visibleHandle}
          index={1}
          d={`M${setup.width + borderWidth - tr} ${borderWidth} A${tr} ${tr} 0 0 1 ${
            setup.width + borderWidth
          } ${tr + borderWidth}`}
        />
        <CornerPath
          visibleHandle={visibleHandle}
          index={2}
          d={`M${setup.width + borderWidth - br} ${
            borderWidth + setup.height
          } A${br} ${br} 0 0 0 ${setup.width + borderWidth} ${
            setup.height - br + borderWidth
          }`}
        />
        <CornerPath
          visibleHandle={visibleHandle}
          index={3}
          d={`M${borderWidth + bl} ${borderWidth + setup.height} A${bl} ${bl} 0 0 1 ${
            borderWidth
          } ${setup.height + borderWidth - bl}`}
        />
      </g>

      <g
        ref={circlesRef}
        className={`fill-coffee stroke-gray-300 handles`}
        strokeWidth=".3%"
      >
        {!invertedCorners.tl.inverted && (
          <circle
            data-index={0}
            cx={cornerRadius.tl + borderWidth}
            cy={cornerRadius.tl + borderWidth}
          />
        )}
        {!invertedCorners.tr.inverted && (
          <circle
            data-index={1}
            cx={setup.width - cornerRadius.tr + borderWidth}
            cy={cornerRadius.tr + borderWidth}
          />
        )}
        {!invertedCorners.br.inverted && (
          <circle
            data-index={2}
            cx={setup.width - cornerRadius.br + borderWidth}
            cy={setup.height - cornerRadius.br + borderWidth}
          />
        )}
        {!invertedCorners.bl.inverted && (
          <circle
            data-index={3}
            cx={cornerRadius.bl + borderWidth}
            cy={setup.height - cornerRadius.bl + borderWidth}
          />
        )}
      </g>
    </>
  );
};

export const CornerInvertedHandles = ({
  pathRef,
  setup,
  invertedCorners,
  setInvertedCorners,
}: {
  pathRef: React.RefObject<SVGPathElement | null>;
  setup: Setup;
  invertedCorners: InvertedCorners;
  setInvertedCorners: React.Dispatch<React.SetStateAction<InvertedCorners>>;
}) => {
  const [box, setBox] = useState<null | DOMRect>(null);
  const elementRef = useRef<null | SVGRectElement>(null);

  const updateBoundingBox = () => {
    if (!elementRef.current)
      elementRef.current = document.querySelector(
        "svg#preview .inner-path",
      ) as SVGRectElement;

    if (!elementRef.current) return;
    setBox(elementRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    const dUpdateBoundingBox = debounce(updateBoundingBox, 50);
    const id = setTimeout(updateBoundingBox, 0);
    updateBoundingBox();
    addEventListener("resize", dUpdateBoundingBox);
    addEventListener("scroll", dUpdateBoundingBox);
    return () => {
      clearTimeout(id);
      removeEventListener("resize", dUpdateBoundingBox);
      removeEventListener("scroll", dUpdateBoundingBox);
    };
  }, [setup, pathRef.current]);

  if (!box) return null;

  const cellSize = 40;

  return (
    <div className="hidden md:contents">
      <button
        style={{
          left: box.left + "px",
          top: box.top - cellSize + scrollY + "px",
        }}
        className={`absolute p-1 rounded-full border border-coffee ${
          invertedCorners.tl.inverted
            ? "bg-coffee text-bg"
            : "bg-bg hover:bg-coffee/10"
        }`}
        onClick={() =>
          setInvertedCorners((prev) => ({
            ...prev,
            tl: { ...prev.tl, inverted: !prev.tl.inverted },
          }))
        }
      >
        <InvertedTopRightCorner rotation={-90} />
      </button>

      <button
        style={{
          left: box.left + box.width - cellSize / 2 + "px",
          top: box.top - cellSize + scrollY + "px",
        }}
        className={`absolute p-1 rounded-full border border-coffee ${
          invertedCorners.tr.inverted
            ? "bg-coffee text-bg"
            : "bg-bg hover:bg-coffee/10"
        }`}
        onClick={() =>
          setInvertedCorners((prev) => ({
            ...prev,
            tr: { ...prev.tr, inverted: !prev.tr.inverted },
          }))
        }
      >
        <InvertedTopRightCorner rotation={0} />
      </button>

      <button
        style={{
          left: box.left + box.width - cellSize / 2 + "px",
          top: box.top + box.height + cellSize / 2 + scrollY + "px",
        }}
        className={`absolute p-1 rounded-full border border-coffee ${
          invertedCorners.br.inverted
            ? "bg-coffee text-bg"
            : "bg-bg hover:bg-coffee/10"
        }`}
        onClick={() =>
          setInvertedCorners((prev) => ({
            ...prev,
            br: { ...prev.br, inverted: !prev.br.inverted },
          }))
        }
      >
        <InvertedTopRightCorner rotation={90} />
      </button>

      <button
        style={{
          left: box.left + "px",
          top: box.top + box.height + cellSize / 2 + scrollY + "px",
        }}
        className={`absolute p-1 rounded-full border border-coffee ${
          invertedCorners.bl.inverted
            ? "bg-coffee text-bg"
            : "bg-bg hover:bg-coffee/10"
        }`}
        onClick={() =>
          setInvertedCorners((prev) => ({
            ...prev,
            bl: { ...prev.bl, inverted: !prev.bl.inverted },
          }))
        }
      >
        <InvertedTopRightCorner rotation={180} />
      </button>
    </div>
  );
};

export default Handles;
