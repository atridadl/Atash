import { GiTechnoHeart } from "react-icons/gi";

const Footer = () => {
  return (
    <footer className="footer footer-center h-12 p-2 bg-base-100 text-base-content">
      <div>
        <p>
          Made with{" "}
          <GiTechnoHeart className="inline-block text-primary text-lg animate-pulse" />{" "}
          by{" "}
          <a
            className="link link-primary link-hover"
            href="https://atri.dad"
            rel="noreferrer"
            target="_blank"
          >
            Atridad Lahiji
          </a>{" "}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
