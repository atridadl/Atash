import { HeartIcon } from "lucide-react";
import packagejson from "../../package.json";

const Footer = () => {
  return (
    <footer className="footer footer-center h-12 p-2 bg-base-100 text-base-content">
      <div className="block">
        Made with <HeartIcon className="inline-block text-primary text-lg" /> by{" "}
        <a
          className="link link-primary link-hover"
          href="https://atri.dad"
          rel="noreferrer"
          target="_blank"
        >
          Atridad Lahiji
        </a>{" "}
        -{" "}
        <a
          className="link link-primary link-hover"
          href={`https://github.com/atridadl/atash/releases/tag/${packagejson.version}`}
          rel="noreferrer"
          target="_blank"
        >
          v{packagejson.version}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
