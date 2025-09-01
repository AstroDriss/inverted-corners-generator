import { useEffect, useRef, useState } from "react";
import { BsDownload } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { MdLink, MdOutlineContentCopy } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import {
  gcd,
  generateBorderPath,
  generatePath,
  normalizeSVGPath,
} from "../utils";
import CodeBlock from "./CodeBlock";

interface Props {
  pathConfig: {
    setup: Setup;
    cornerRadius: CornerRadius;
    invertedCorners: InvertedCorners;
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
  };
  setShowModal: (val: boolean) => void;
}

const ExportModal = ({ pathConfig, setShowModal }: Props) => {
  const {
    setup,
    invertedCorners,
    cornerRadius,
    borderWidth,
    borderColor,
    backgroundColor,
  } = pathConfig;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerPath = useRef("");
  const outerPath = useRef("");
  const svgCode = useRef("");
  const [outputType, setOutputType] = useState("clipPath");

  const [maskCode, setMaskCode] = useState("");
  const [clipPathCode, setClipPathCode] = useState("");

  const getCSSAspectRatio = () => {
    const cd = gcd(setup.width, setup.height);
    return setup.width / cd + " / " + setup.height / cd;
  };

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    innerPath.current = generatePath(setup, cornerRadius, invertedCorners, {
      x: borderWidth,
      y: borderWidth,
    });

    outerPath.current = generateBorderPath(
      setup,
      cornerRadius,
      invertedCorners,
      borderWidth
    );

    svgCode.current = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${
      setup.width + borderWidth * 2
    } ${setup.height + borderWidth * 2}" width="${
      setup.width + borderWidth * 2
    }" height="${setup.height + borderWidth * 2}">${
      borderWidth > 0
        ? `<path fill="${borderColor}" d="${outerPath.current}" />`
        : ""
    }<path d="${innerPath.current}" fill="${backgroundColor}" /></svg>`;

    setMaskCode(
      `.inverted {
\t${getMaskCode()}
\twidth: ${setup.width + borderWidth * 2}px;
\tbackground-color: ${
        borderWidth > 0
          ? `${borderColor}; /* border-color */`
          : backgroundColor + ";"
      }
\taspect-ratio: ${getCSSAspectRatio()};${
        borderWidth > 0
          ? `
\tbackground-image: ${getInnerPathImage()};
\tbox-sizing: border-box;`
          : ""
      }
}`
    );

    setClipPathCode(
      `.inverted {
\tclip-path: path("${outerPath.current}");
\twidth: ${setup.width + borderWidth * 2}px;
\theight: ${setup.height + borderWidth * 2}px;
\tbackground-color: ${
        borderWidth > 0
          ? `${borderColor}; /* border-color */`
          : backgroundColor + ";"
      }
\taspect-ratio: ${getCSSAspectRatio()};${
        borderWidth > 0
          ? `
\tbackground-image: ${getInnerPathImage()};
\tbox-sizing: border-box;`
          : ""
      }
}`
    );
  }, [pathConfig]);

  const downloadSVG = () => {
    const blob = new Blob(
      [`<?xml version="1.0" encoding="UTF-8"?>${svgCode.current}`],
      { type: "image/svg+xml" }
    );
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "path-douiri.org.svg";
    a.click();
  };

  const copySVG = () => {
    navigator.clipboard
      .writeText(svgCode.current)
      .then(() => toast.success("SVG Copied Successfully"))
      .catch(() => toast.error("Error Writing to the Clipboard"));
  };

  const getInnerPathImage = () => {
    const encodedSVG = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${
        setup.width + borderWidth * 2
      } ${setup.height + borderWidth * 2}"><path d="${
        innerPath.current
      }" fill="${backgroundColor}" /></svg>`
    );
    return `url('data:image/svg+xml,${encodedSVG}')`;
  };

  const getMaskCode = () => {
    const encodedSVG = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${
        setup.width + borderWidth * 2
      } ${setup.height + borderWidth * 2}"><path d="${
        outerPath.current
      }" fill="#fff" /></svg>`
    );
    return `-webkit-mask: url('data:image/svg+xml,${encodedSVG}') no-repeat center / contain;
    \tmask: url('data:image/svg+xml,${encodedSVG}') no-repeat center / contain;`;
  };

  const getSVGClipPathHTMLCode =
    () => `<svg xmlns="http://www.w3.org/2000/svg" style="display: block;position: absolute" width="0" height="0">
  <defs><clipPath id="clip" clipPathUnits="objectBoundingBox">
  <path d="${normalizeSVGPath(
    outerPath.current,
    setup.width + borderWidth * 2,
    setup.height + borderWidth * 2
  )}"/>
  </clipPath></defs>
</svg>`;

  const getSVGClipPathCSSCode = () => `.inverted {
\tclip-path: url("#clip");
\twidth: ${setup.width + borderWidth * 2}px;
\theight: ${setup.height + borderWidth * 2}px;
\tbackground-color: ${
    borderWidth > 0
      ? `${borderColor}; /* border-color */`
      : backgroundColor + ";"
  }
\taspect-ratio: ${getCSSAspectRatio()};${
    borderWidth > 0
      ? `
\tbackground-image: ${getInnerPathImage()};
\tbox-sizing: border-box;`
      : ""
  }
}`;

  const copyURL = () => {
    const r = `r=${cornerRadius.tl},${cornerRadius.tr},${cornerRadius.br},${cornerRadius.bl}`;

    const { tl, tr, br, bl } = invertedCorners;
    const ic = `ic=${tl.width}x${tl.height}x${tl.roundness}:${Number(
      tl.inverted
    )},${tr.width}x${tr.height}x${tr.roundness}:${Number(tr.inverted)},${
      br.width
    }x${br.height}x${br.roundness}:${Number(br.inverted)},${bl.width}x${
      bl.height
    }x${bl.roundness}:${Number(bl.inverted)}`;

    const tracking =
      "utm_source=copy&utm_medium=share&utm_campaign=code_export";

    const searchParam = `?w=${setup.width}&h=${
      setup.height
    }&b=${borderWidth}&${r}&${ic}&bc=${borderColor.replace(
      "#",
      ""
    )}&bg=${backgroundColor.replace("#", "")}&${tracking}`;
    const url = location.origin + location.pathname + searchParam;

    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("URL copied successfully"))
      .catch(() => toast.error("Error writing to the clipboard"));
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        className="@container fixed w-xl left-1/2 top-1/2 -translate-1/2 p-5 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl">Export Your Work</h2>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 rounded-full bg-bg"
          >
            <IoClose />
          </button>
        </div>

        <div className="grid gap-3">
          <form className="space-x-3 bg-bg flex p-1 rounded-full w-fit">
            <label className="has-focus-within:ring cursor-pointer text-coffee rounded-full px-3 py-1 has-checked:bg-coffee has-checked:text-bg">
              <input
                checked={outputType === "clipPath"}
                name="output-type"
                className="sr-only"
                type="radio"
                data-type="clipPath"
                onChange={() => setOutputType("clipPath")}
              />
              &lt;clipPath&gt;
            </label>
            <label className="has-focus-within:ring cursor-pointer text-coffee rounded-full px-3 py-1 has-checked:bg-coffee has-checked:text-bg">
              <input
                name="output-type"
                checked={outputType === "mask"}
                className="sr-only"
                type="radio"
                data-type={"mask"}
                onChange={() => setOutputType("mask")}
              />
              mask
            </label>
            <label className="has-focus-within:ring cursor-pointer text-coffee rounded-full px-3 py-1 has-checked:bg-coffee has-checked:text-bg">
              <input
                checked={outputType === "clip-path"}
                name="output-type"
                className="sr-only"
                type="radio"
                data-type="clip-path"
                onChange={() => setOutputType("clip-path")}
              />
              clip-path
            </label>
          </form>

          {outputType === "clipPath" && (
            <>
              <CodeBlock code={getSVGClipPathCSSCode()} lang="css" />
              <CodeBlock
                code={
                  getSVGClipPathHTMLCode() + '\n<div class="inverted"></div>'
                }
                lang="html"
              />
            </>
          )}

          {outputType === "mask" && (
            <>
              <CodeBlock code={maskCode} lang="css" />
              <CodeBlock code='<div class="inverted"></div>' lang="html" />
            </>
          )}

          {outputType === "clip-path" && (
            <>
              <CodeBlock code={clipPathCode} lang="css" />
              <CodeBlock code='<div class="inverted"></div>' lang="html" />
            </>
          )}

          <p className="flex flex-1 before:w-full after:w-full before:border before:border-inherit border-coffee/20 before:h-0 after:h-0 after:border after:border-inherit before:rounded-full after:rounded-full items-center gap-3">
            or
          </p>

          <button
            onClick={copyURL}
            className="flex items-center gap-2 border border-gray-300 transition-all hover:brightness-90 justify-center rounded-md px-3 py-2"
          >
            <MdLink />
            Copy this shape&apos;s URL
          </button>

          <div className="flex gap-1">
            <button
              className="grow flex items-center gap-2 bg-green text-white border transition-all border-gray-200 hover:brightness-110 justify-center rounded-md px-3 py-2"
              onClick={downloadSVG}
            >
              <BsDownload />
              Download as SVG
            </button>
            <button
              aria-label="copy svg"
              className="flex items-center gap-2 bg-green text-white border transition-all border-gray-200 hover:brightness-110 justify-center rounded-md px-3 py-2"
              onClick={copySVG}
            >
              <MdOutlineContentCopy />
            </button>
          </div>
        </div>
      </dialog>
      <ToastContainer theme="dark" autoClose={1000} position="top-center" />
    </>
  );
};

export default ExportModal;
