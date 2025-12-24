import { useEffect, useRef, useState } from "react";
import { constraint, debounce } from "../utils";
import InvertedTopRightCorner from "../assets/InvertedTopRightCorner";

interface Props {
  cornerRadius: CornerRadius;
  setCornerRadius: React.Dispatch<React.SetStateAction<CornerRadius>>;
  setup: Setup;
  invertedCorners: InvertedCorners;
  borderWidth: number;
}

const Handlers = ({
  cornerRadius,
  setCornerRadius,
  setup,
  invertedCorners,
  borderWidth,
}: Props) => {
  const activeHandler = useRef<number>(null);
  const [visibleHandler, setVisibleHandler] = useState<number | null>(null); // https://stackoverflow.com/questions/62806541/how-to-solve-the-react-hook-closure-issue
  const circlesRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGElement>(null);

  useEffect(() => {
    svgRef.current = document.querySelector("svg#preview");
    if (!circlesRef.current) return;
    const controller = new AbortController();

    circlesRef.current.addEventListener(
      "pointerover",
      () => {
        document.body.classList.add("grab");
      },
      { signal: controller.signal }
    );

    circlesRef.current.addEventListener(
      "pointerout",
      () => {
        document.body.classList.remove("grab");
      },
      { signal: controller.signal }
    );

    circlesRef.current.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
        svgRef.current?.setPointerCapture(e.pointerId);
        if (!e.target) return;
        document.body.classList.add("grabbing");
        const circle = e.target as SVGCircleElement;
        const index = +circle.getAttribute("data-index")!;
        activeHandler.current = index;
        setVisibleHandler(index);
      },
      { signal: controller.signal }
    );

    document.addEventListener(
      "pointermove",
      (e) => {
        if (activeHandler.current === null || svgRef.current === null) return;

        const box = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - box.left) * setup.width) / box.width; // Get relative x and Scale it
        const y = ((e.clientY - box.top) * setup.height) / box.height;

        switch (activeHandler.current) {
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
                Math.min(setup.width - x, setup.height - y)
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
      { signal: controller.signal }
    );

    document.addEventListener(
      "pointerup",
      (e) => {
        svgRef.current?.releasePointerCapture(e.pointerId);
        document.body.classList.remove("grabbing");

        activeHandler.current = null;
        setVisibleHandler(null);
      },
      { signal: controller.signal }
    );

    document.addEventListener(
      "pointercancel",
      (e) => svgRef.current?.releasePointerCapture(e.pointerId),
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [setup]);

  return (
    <>
      <g
        stroke="dodgerblue"
        fill="none"
        strokeWidth=".5%"
        strokeLinecap="round"
      >
        <path
          className={`${visibleHandler !== 0 ? "hidden" : ""}`}
          d={`M${borderWidth} ${cornerRadius.tl + borderWidth} A${
            cornerRadius.tl
          } ${cornerRadius.tl} 0 0 1 ${
            cornerRadius.tl + borderWidth
          } ${borderWidth}`}
        />

        <path
          className={`${visibleHandler !== 1 ? "hidden" : ""}`}
          d={`M${setup.width + borderWidth - cornerRadius.tr} ${borderWidth} A${
            cornerRadius.tr
          } ${cornerRadius.tr} 0 0 1 ${setup.width + borderWidth} ${
            cornerRadius.tr + borderWidth
          }`}
        />

        <path
          className={`${visibleHandler !== 2 ? "hidden" : ""}`}
          d={`M${setup.width + borderWidth - cornerRadius.br} ${
            borderWidth + setup.height
          } A${cornerRadius.br} ${cornerRadius.br} 0 0 0 ${
            setup.width + borderWidth
          } ${setup.height - cornerRadius.br + borderWidth}`}
        />

        <path
          className={`${visibleHandler !== 3 ? "hidden" : ""}`}
          d={`M${borderWidth + cornerRadius.bl} ${
            borderWidth + setup.height
          } A${cornerRadius.bl} ${cornerRadius.bl} 0 0 1 ${borderWidth} ${
            setup.height + borderWidth - cornerRadius.bl
          }`}
        />
      </g>

      <g
        ref={circlesRef}
        className={`fill-coffee stroke-gray-300 handlers`}
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

export const CornerInvertedHandler = ({
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
        "svg#preview .inner-path"
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

export default Handlers;
