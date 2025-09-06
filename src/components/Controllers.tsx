import { useRef, useState } from "react";
import { areAllEqual, constraint, fixed, gcd } from "../utils";
import {
  TbBorderCorners,
  TbRectangle,
  TbRectangleVertical,
  TbSquare,
} from "react-icons/tb";
import { RxCornerTopLeft, RxCornerTopRight } from "react-icons/rx";
import InvertedTopRightCorner from "../assets/InvertedTopRightCorner";
import ColorInput from "./ui/ColorInput";
import Input from "./ui/Input";
import CheckBox from "./ui/CheckBox";
import Stroke from "../assets/Stroke";
import { FiLink2 } from "react-icons/fi";
import { BsGear } from "react-icons/bs";

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

  const [expand, setExpand] = useState({
    tl: false,
    tr: false,
    br: false,
    bl: false,
  });

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
          ? width - tr.corners[0] - tl.corners[2] - tr.width
          : width - radTR - tl.corners[2],

        tr: tl.inverted
          ? width - tr.corners[0] - tl.corners[2] - tl.width
          : width - radTL - tr.corners[0],
        bl: br.inverted
          ? width - br.corners[2] - bl.corners[0] - br.width
          : width - radBR - bl.corners[0],
        br: bl.inverted
          ? width - br.corners[2] - bl.corners[0] - bl.width
          : width - radBL - br.corners[2],
      };

      const maxHeight = {
        tl: bl.inverted
          ? height - tl.corners[0] - bl.corners[2] - bl.height
          : height - radBL - tl.corners[0],
        tr: br.inverted
          ? height - tr.corners[2] - br.corners[0] - br.height
          : height - radTR - br.corners[0],
        bl: tl.inverted
          ? height - bl.corners[2] - tl.corners[0] - tl.height
          : height - radTL - bl.corners[2],
        br: tr.inverted
          ? height - br.corners[0] - tr.corners[2] - tr.height
          : height - radBR - tr.corners[2],
      };

      return {
        ...prev,
        [corner]: {
          ...prev[corner],
          width: fixed(
            Math.min(
              maxWidth[corner],
              Math.max(
                prev[corner].corners[0] * 2,
                newValues.width ?? prev[corner].width
              )
            )
          ),
          height: fixed(
            Math.min(
              maxHeight[corner],
              Math.max(
                prev[corner].corners[2] * 2,
                newValues.height ?? prev[corner].height
              )
            )
          ),
          inverted: newValues.inverted ?? prev[corner].inverted,
          corners: newValues.corners ?? prev[corner].corners,
        },
      };
    });
  };

  const updateInvertedCornerRadius = (
    cornerKey: keyof typeof invertedCorners,
    index: number,
    value: number
  ) => {
    const current = invertedCorners[cornerKey].corners;
    const updated: [number, number, number] = [...current] as [
      number,
      number,
      number
    ];
    updated[index] = value;

    updateInvertedCorners(cornerKey, { corners: updated });
  };

  function getInvertedCornerInputs(corner: keyof CornerRadius) {
    return (
      <>
        <div className="relative">
          <Input
            icon={<RxCornerTopRight />}
            onChange={(e) =>
              updateInvertedCorners(corner, {
                corners: [+e.target.value, +e.target.value, +e.target.value],
              })
            }
            aria-label="top left inverted corner's roundness"
            value={
              areAllEqual(invertedCorners[corner].corners)
                ? invertedCorners[corner].corners[0]
                : ""
            }
            placeholder="MIX"
            className="pr-5 placeholder:text-sm"
          />

          <button
            className="absolute right-1 bg-bg top-2"
            onClick={() =>
              setExpand((prev) => ({ ...prev, [corner]: !prev[corner] }))
            }
            title="Advanced"
          >
            <BsGear className={expand[corner] ? "" : "fill-gray-500"} />
          </button>
        </div>

        <div className={expand[corner] ? "contents" : "hidden"}>
          {[0, 1, 2].map((i) => (
            <Input
              key={i}
              icon={<span>R{i + 1}</span>}
              value={invertedCorners[corner].corners[i]}
              onChange={(e) =>
                updateInvertedCornerRadius(corner, i, +e.target.value)
              }
            />
          ))}
        </div>
      </>
    );
  }

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
            {(["tl", "tr", "bl", "br"] as (keyof CornerRadius)[]).map(
              (corner) => {
                const rotationMap = {
                  tl: 0,
                  tr: 90,
                  br: 180,
                  bl: 270,
                };
                return (
                  <Input
                    icon={
                      <RxCornerTopLeft
                        style={{
                          transform: `rotate(${rotationMap[corner]}deg)`,
                        }}
                      />
                    }
                    key={corner}
                    name={corner}
                    aria-label={`${corner} radius`}
                    onChange={updateSpecificCornerRadius}
                    value={cornerRadius[corner]}
                  />
                );
              }
            )}
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

          <div className="grid grid-cols-3 gap-2 mt-1">
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
            {getInvertedCornerInputs("tl")}
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
          <div className="grid grid-cols-3 gap-2 mt-1">
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

            {getInvertedCornerInputs("tr")}
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
          <div className="grid grid-cols-3 gap-2 mt-1">
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

            {getInvertedCornerInputs("br")}
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
          <div className="grid grid-cols-3 gap-2 mt-1">
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
            {getInvertedCornerInputs("bl")}
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
