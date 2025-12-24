import { CiExport, CiStar } from "react-icons/ci";
import ExportModal from "./ExportModal";
import { useState } from "react";
import { BsGithub } from "react-icons/bs";
import useGitHubStars from "../hooks/useGithubStars";

interface Props {
  pathConfig: {
    setup: Setup;
    cornerRadius: CornerRadius;
    invertedCorners: InvertedCorners;
    borderWidth: number;
    borderColor: string;
    backgroundColor: string;
  };
}

const Header = ({ pathConfig }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const starCount = useGitHubStars("AstroDriss", "inverted-corners-generator");

  return (
    <>
      <header className="flex relative bg-bg items-center justify-between p-4">
        <a href="#" className="text-coffee">
          <img src="/logo.svg" width={40} height={40} />
        </a>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/AstroDriss/inverted-corners-generator"
            title="Corner Inverter on github"
            aria-label="Visit this project at github"
            target="_blank"
            className="flex items-center border border-coffee p-1 rounded-full hover:bg-white/25"
          >
            {starCount && (
              <>
                <CiStar />
                <span className="ms-1 me-3">{starCount}</span>
              </>
            )}
            <BsGithub size={25} />
          </a>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-frappe text-gray-50 hover:brightness-110 transition-all py-2 px-4 rounded-2xl"
          >
            <CiExport size={25} /> Export
          </button>
        </div>
      </header>

      {showModal && (
        <ExportModal setShowModal={setShowModal} pathConfig={pathConfig} />
      )}
    </>
  );
};

export default Header;
