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
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
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
        if (!e.target) return;
        document.body.classList.add("grabbing");
        const circle = e.target as SVGCircleElement;
        activeHandler.current = +circle.getAttribute("data-index")!;

        lastMouse.current.x = e.clientX;
        lastMouse.current.y = e.clientY;
      },
      { signal: controller.signal }
    );

    document.addEventListener(
      "pointermove",
      (e) => {
        if (activeHandler.current === null) return;

        const dx = (e.clientX - lastMouse.current.x) * 0.1;
        const dy = (e.clientY - lastMouse.current.y) * 0.1;
        lastMouse.current.x = e.clientX;
        lastMouse.current.y = e.clientY;

        switch (activeHandler.current) {
          case 0: // Top Left
            setCornerRadius((prev) => ({
              ...prev,
              tl: constraint(setup, prev.tl + dx + dy),
            }));
            break;
          case 1: // Top Right
            setCornerRadius((prev) => ({
              ...prev,
              tr: constraint(setup, prev.tr - dx + dy),
            }));
            break;
          case 2: // Bottom Right
            setCornerRadius((prev) => ({
              ...prev,
              br: constraint(setup, prev.br - dx - dy),
            }));
            break;
          case 3: // Bottom Left
            setCornerRadius((prev) => ({
              ...prev,
              bl: constraint(setup, prev.bl + dx - dy),
            }));
            break;
        }
      },
      { signal: controller.signal }
    );

    document.addEventListener(
      "pointerup",
      () => {
        document.body.classList.remove("grabbing");
        activeHandler.current = null;
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [setup]);

  return (
    <>
      <g
        ref={circlesRef}
        className={`fill-coffee stroke-gray-300 `}
        strokeWidth=".3%"
      >
        {!invertedCorners.tl.inverted && (
          <circle
            data-index={0}
            cx={cornerRadius.tl + borderWidth}
            cy={cornerRadius.tl + borderWidth}
            r="1%"
          />
        )}
        {!invertedCorners.tr.inverted && (
          <circle
            data-index={1}
            cx={setup.width - cornerRadius.tr + borderWidth}
            cy={cornerRadius.tr + borderWidth}
            r="1%"
          />
        )}
        {!invertedCorners.br.inverted && (
          <circle
            data-index={2}
            cx={setup.width - cornerRadius.br + borderWidth}
            cy={setup.height - cornerRadius.br + borderWidth}
            r="1%"
          />
        )}
        {!invertedCorners.bl.inverted && (
          <circle
            data-index={3}
            cx={cornerRadius.bl + borderWidth}
            cy={setup.height - cornerRadius.bl + borderWidth}
            r="1%"
          />
        )}
      </g>
    </>
  );
};

export default Handlers;
