import { useRef, useState } from "react";
import { constraint, fixed, gcd } from "../utils";
import {
  TbBorderCorners,
  TbRectangle,
  TbRectangleVertical,
  TbSquare,
} from "react-icons/tb";
import {
  RxCornerBottomLeft,
  RxCornerBottomRight,
  RxCornerTopLeft,
  RxCornerTopRight,
} from "react-icons/rx";
import InvertedTopRightCorner from "../assets/InvertedTopRightCorner";
import ColorInput from "./ui/ColorInput";
import Input from "./ui/Input";
import CheckBox from "./ui/CheckBox";
import Stroke from "../assets/Stroke";
import { FiLink2 } from "react-icons/fi";

interface Props {
  setup: Setup;
  setSetup: React.Dispatch<React.SetStateAction<Setup>>;
  cornerRadius: CornerRadius;
  setCornerRadius: React.Dispatch<React.SetStateAction<CornerRadius>>;
  invertedCorners: InvertedCorners;
  setInvertedCorners: React.Dispatch<React.SetStateAction<InvertedCorners>>;
  borderWidth: number;
  setBorderWidth: React.Dispatch<React.SetStateAction<number>>;
  borderColor: string;
  setBorderColor: React.Dispatch<React.SetStateAction<string>>;
  backgroundColor: string;
  setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
}

const Controllers = ({
  setup,
  setSetup,
  setCornerRadius,
  cornerRadius,
  invertedCorners,
  setInvertedCorners,
  borderWidth,
  setBorderWidth,
  borderColor,
  setBorderColor,
  backgroundColor,
  setBackgroundColor,
}: Props) => {
  const [aspectRatio, setAspectRatio] = useState(
    gcd(setup.width, setup.height)
  );
  const dimensionsFormRef = useRef<HTMLFormElement>(null);
  const cornerRadiusFormRef = useRef(null);

  const updateDimensions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dimensionsFormRef.current) return;

    const data = new FormData(dimensionsFormRef.current);
    let width = Math.round(+data.get("width")!);
    let height = Math.round(+data.get("height")!);

    if (isNaN(width) || isNaN(height))
      return alert("Dimension values must be a number");

    if (setup.width === width && setup.height === height) return;

    if (setup.lockAspectRatio) {
      if (width !== setup.width) {
        height = Math.round(width / setup.lockAspectRatio);

        (
          dimensionsFormRef.current.querySelector(
            "[name='height']"
          )! as HTMLInputElement
        ).value = String(height);
      } else if (height !== setup.height) {
        width = Math.round(height * setup.lockAspectRatio);

        (
          dimensionsFormRef.current.querySelector(
            "[name='width']"
          )! as HTMLInputElement
        ).value = String(width);
      }
    } else {
      (
        dimensionsFormRef.current.querySelector(
          "[name='width']"
        ) as HTMLInputElement
      ).value = String(width);
      (
        dimensionsFormRef.current.querySelector(
          "[name='height']"
        ) as HTMLInputElement
      ).value = String(height);
    }

    updateCornerRadius({
      width,
      height,
      lockAspectRatio: setup.lockAspectRatio,
    });
    setSetup((prev) => ({ ...prev, width, height }));
    setAspectRatio(gcd(width, height));
  };

  const updateCornerRadius = (setup: Setup) => {
    if (!cornerRadiusFormRef.current) return;
    const formData = new FormData(cornerRadiusFormRef.current);
    const r = constraint(setup, +formData.get("radius")!);
    setCornerRadius({ tl: r, tr: r, br: r, bl: r });
  };

  const getCornerRadiusValue = () => {
    if (
      cornerRadius.bl === cornerRadius.br &&
      cornerRadius.br === cornerRadius.tl &&
      cornerRadius.tl === cornerRadius.tr
    )
      return cornerRadius.bl;
    return "";
  };

  const updateSpecificCornerRadius = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCornerRadius((prev) => ({
      ...prev,
      [e.target.name]: constraint(setup, +e.target.value),
    }));
  };

  const toggleInversion = (corner: keyof InvertedCorners) => {
    setInvertedCorners((prev) => ({
      ...prev,
      [corner]: { ...prev[corner], inverted: !prev[corner].inverted },
    }));
    updateInvertedCorners(corner, {});
  };

  const updateInvertedCorners = (
    corner: keyof typeof invertedCorners,
    newValues: Partial<typeof invertedCorners.tl>
  ) => {
    setInvertedCorners((prev) => {
      const { width, height } = setup;

      const { tl, tr, bl, br } = prev;

      const { tl: radTL, tr: radTR, bl: radBL, br: radBR } = cornerRadius;

      const maxWidth = {
        tl: tr.inverted
          ? width - tr.roundness - tl.roundness - tr.width
          : width - radTR - tl.roundness,

        tr: tl.inverted
          ? width - tr.roundness - tl.roundness - tl.width
          : width - radTL - tr.roundness,
        bl: br.inverted
          ? width - br.roundness - bl.roundness - br.width
          : width - radBR - bl.roundness,
        br: bl.inverted
          ? width - br.roundness - bl.roundness - bl.width
          : width - radBL - br.roundness,
      };

      const maxHeight = {
        tl: bl.inverted
          ? height - tl.roundness - bl.roundness - bl.height
          : height - radBL - tl.roundness,
        tr: br.inverted
          ? height - tr.roundness - br.roundness - br.height
          : height - radTR - br.roundness,
        bl: tl.inverted
          ? height - bl.roundness - tl.roundness - tl.height
          : height - radTL - bl.roundness,
        br: tr.inverted
          ? height - br.roundness - tr.roundness - tr.height
          : height - radBR - tr.roundness,
      };

      return {
        ...prev,
        [corner]: {
          ...prev[corner],
          width: fixed(
            Math.min(
              maxWidth[corner],
              Math.max(
                prev[corner].roundness * 2,
                newValues.width ?? prev[corner].width
              )
            )
          ),
          height: fixed(
            Math.min(
              maxHeight[corner],
              Math.max(
                prev[corner].roundness * 2,
                newValues.height ?? prev[corner].height
              )
            )
          ),
          roundness: fixed(newValues.roundness ?? prev[corner].roundness),
          inverted: newValues.inverted ?? prev[corner].inverted,
        },
      };
    });
  };

  return (
    <div className="rounded-2xl bg-bg overflow-auto flex flex-col gap-4 [scrollbar-width:thin] shadow-[0_0_9px_rgb(0_0_0_/_.1)] md:h-[85vh] p-4">
      <div>
        <div className="mb-2 flex items-center">
          <h2>Dimensions:</h2>
          <p className="flex ml-auto items-center gap-2">
            <span className="sr-only">Aspect ratio:</span>
            {setup.width / aspectRatio}:{setup.height / aspectRatio}
            {setup.width == setup.height ? (
              <TbSquare size={20} />
            ) : setup.width > setup.height ? (
              <TbRectangle size={20} />
            ) : (
              <TbRectangleVertical size={20} />
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form
            ref={dimensionsFormRef}
            className="flex items-center gap-3"
            onSubmit={updateDimensions}
          >
            <Input
              icon={<span>W</span>}
              name="width"
              aria-label="shape width"
              defaultValue={setup.width}
              onBlur={updateDimensions}
            />
            <button
              type="button"
              title="Lock Aspect Ratio"
              className={`border border-black p-[.4rem] rounded-md ${
                setup.lockAspectRatio
                  ? "bg-frappe text-white"
                  : "hover:bg-frappe/50"
              }`}
              onClick={() =>
                setSetup((prev) => ({
                  ...prev,
                  lockAspectRatio: prev.lockAspectRatio
                    ? null
                    : prev.width / prev.height,
                }))
              }
            >
              <FiLink2 />
            </button>
            <Input
              icon={<span>H</span>}
              name="height"
              aria-label="shape height"
              defaultValue={setup.height}
              onBlur={updateDimensions}
            />
            <button className="sr-only" />
          </form>
        </div>
      </div>

      <div>
        <h2 className="mb-2">Corner Radius</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateCornerRadius(setup);
          }}
          ref={cornerRadiusFormRef}
        >
          <Input
            icon={<TbBorderCorners />}
            name="radius"
            aria-label="ALl Corners Border Radius"
            value={getCornerRadiusValue()}
            onChange={() => updateCornerRadius(setup)}
          />

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input
              icon={<RxCornerTopLeft />}
              name="tl"
              aria-label="top left radius"
              onChange={updateSpecificCornerRadius}
              value={cornerRadius.tl}
            />
            <Input
              icon={<RxCornerTopRight />}
              name="tr"
              aria-label="top right radius"
              onChange={updateSpecificCornerRadius}
              value={cornerRadius.tr}
            />
            <Input
              icon={<RxCornerBottomLeft />}
              name="bl"
              aria-label="bottom left radius"
              onChange={updateSpecificCornerRadius}
              value={cornerRadius.bl}
            />
            <Input
              icon={<RxCornerBottomRight />}
              name="br"
              aria-label="bottom right radius"
              onChange={updateSpecificCornerRadius}
              value={cornerRadius.br}
            />
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-2">Inverted Corners</h2>
        <div className="border rounded-md p-1 mb-3">
          <CheckBox
            checked={invertedCorners.tl.inverted}
            onChange={() => toggleInversion("tl")}
            icon={<InvertedTopRightCorner rotation={-90} />}
          >
            Top Left
          </CheckBox>
          <div className="flex gap-2 mt-1">
            <Input
              icon={<span>W</span>}
              onChange={(e) =>
                updateInvertedCorners("tl", { width: +e.target.value! })
              }
              aria-label="top left inverted corner's width"
              blurValue={invertedCorners.tl.width}
              defaultValue={invertedCorners.tl.width}
            />
            <Input
              icon={<span>H</span>}
              onChange={(e) =>
                updateInvertedCorners("tl", { height: +e.target.value! })
              }
              aria-label="top left inverted corner's height"
              defaultValue={invertedCorners.tl.height}
              blurValue={invertedCorners.tl.height}
            />
            <Input
              icon={<RxCornerTopRight />}
              onChange={(e) =>
                updateInvertedCorners("tl", { roundness: +e.target.value! })
              }
              aria-label="top left inverted corner's roundness"
              defaultValue={invertedCorners.tl.roundness}
              blurValue={invertedCorners.tl.roundness}
            />
          </div>
        </div>

        <div className="border rounded-md p-1 mb-3">
          <CheckBox
            checked={invertedCorners.tr.inverted}
            onChange={() => toggleInversion("tr")}
            icon={<InvertedTopRightCorner />}
          >
            Top Right
          </CheckBox>
          <div className="flex gap-2 mt-1">
            <Input
              icon={<span>W</span>}
              onChange={(e) =>
                updateInvertedCorners("tr", { width: +e.target.value! })
              }
              aria-label="top right inverted corner's width"
              defaultValue={invertedCorners.tr.width}
              blurValue={invertedCorners.tr.width}
            />
            <Input
              icon={<span>H</span>}
              onChange={(e) =>
                updateInvertedCorners("tr", { height: +e.target.value! })
              }
              aria-label="top right inverted corner's height"
              defaultValue={invertedCorners.tr.height}
              blurValue={invertedCorners.tr.height}
            />
            <Input
              icon={<RxCornerTopRight />}
              onChange={(e) =>
                updateInvertedCorners("tr", { roundness: +e.target.value! })
              }
              aria-label="top right inverted corner's roundness"
              defaultValue={invertedCorners.tr.roundness}
              blurValue={invertedCorners.tr.roundness}
            />
          </div>
        </div>

        <div className="border rounded-md p-1 mb-3">
          <CheckBox
            checked={invertedCorners.br.inverted}
            onChange={() => toggleInversion("br")}
            icon={<InvertedTopRightCorner rotation={90} />}
          >
            Bottom Right
          </CheckBox>
          <div className="flex gap-2 mt-1">
            <Input
              icon={<span>W</span>}
              onChange={(e) =>
                updateInvertedCorners("br", { width: +e.target.value! })
              }
              aria-label="bottom right inverted corner's width"
              defaultValue={invertedCorners.br.width}
              blurValue={invertedCorners.br.width}
            />
            <Input
              icon={<span>H</span>}
              onChange={(e) =>
                updateInvertedCorners("br", { height: +e.target.value! })
              }
              aria-label="bottom right inverted corner's height"
              defaultValue={invertedCorners.br.height}
              blurValue={invertedCorners.br.height}
            />
            <Input
              icon={<RxCornerTopRight />}
              onChange={(e) =>
                updateInvertedCorners("br", { roundness: +e.target.value! })
              }
              aria-label="bottom right inverted corner's roundness"
              defaultValue={invertedCorners.br.roundness}
              blurValue={invertedCorners.br.roundness}
            />
          </div>
        </div>

        <div className="border rounded-md p-1 mb-3">
          <CheckBox
            checked={invertedCorners.bl.inverted}
            onChange={() => toggleInversion("bl")}
            icon={<InvertedTopRightCorner rotation={180} />}
          >
            Bottom Left
          </CheckBox>
          <div className="flex gap-2 mt-1">
            <Input
              icon={<span>W</span>}
              onChange={(e) =>
                updateInvertedCorners("bl", { width: +e.target.value! })
              }
              aria-label="bottom left inverted corner's width"
              defaultValue={invertedCorners.bl.width}
              blurValue={invertedCorners.bl.width}
            />
            <Input
              icon={<span>H</span>}
              onChange={(e) =>
                updateInvertedCorners("bl", { height: +e.target.value! })
              }
              aria-label="bottom left inverted corner's height"
              defaultValue={invertedCorners.bl.height}
              blurValue={invertedCorners.bl.height}
            />
            <Input
              icon={<RxCornerTopRight />}
              onChange={(e) =>
                updateInvertedCorners("bl", { roundness: +e.target.value! })
              }
              aria-label="bottom left inverted corner's roundness"
              defaultValue={invertedCorners.bl.roundness}
              blurValue={invertedCorners.bl.roundness}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-2">Border</h2>
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <Input
            name="border"
            aria-label="border width"
            onChange={(e) => setBorderWidth(Number(e.target.value))}
            value={borderWidth}
            icon={<Stroke />}
            gap="1.9em"
          />
          <ColorInput
            label="border color"
            value={borderColor}
            setValue={setBorderColor}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-2">Background</h2>
        <ColorInput
          value={backgroundColor}
          label="background color"
          setValue={setBackgroundColor}
        />
      </div>
    </div>
  );
};

export default Controllers;
