import { useEffect, useRef } from "react";
import { constraint } from "../utils";

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
        activeHandler.current = +circle.getAttribute("data-index")!;
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
        activeHandler.current = null;
        document.body.classList.remove("grabbing");
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
      <g stroke="dodgerblue" fill="none" strokeWidth=".5%">
        <path
          className={`${activeHandler.current !== 0 ? "hidden" : ""}`}
          d={`M${borderWidth} ${cornerRadius.tl + borderWidth} A${
            cornerRadius.tl
          } ${cornerRadius.tl} 0 0 1 ${
            cornerRadius.tl + borderWidth
          } ${borderWidth}`}
        />

        <path
          className={`${activeHandler.current !== 1 ? "hidden" : ""}`}
          d={`M${setup.width + borderWidth - cornerRadius.tr} ${borderWidth} A${
            cornerRadius.tr
          } ${cornerRadius.tr} 0 0 1 ${setup.width + borderWidth} ${
            cornerRadius.tr + borderWidth
          }`}
        />

        <path
          className={`${activeHandler.current !== 2 ? "hidden" : ""}`}
          d={`M${setup.width + borderWidth - cornerRadius.br} ${
            borderWidth + setup.height
          } A${cornerRadius.br} ${cornerRadius.br} 0 0 0 ${
            setup.width + borderWidth
          } ${setup.height - cornerRadius.br + borderWidth}`}
        />

        <path
          className={`${activeHandler.current !== 3 ? "hidden" : ""}`}
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

export default Handlers;
