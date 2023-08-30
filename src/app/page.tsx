import { type NextPage } from "next";

export const dynamic = "force-static";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col text-center items-center justify-center px-4 py-16 gap-4">
      <HomePageBody />
    </div>
  );
};

export default Home;

const HomePageBody = () => {
  return (
    <>
      <h1 className="text-3xl sm:text-6xl font-bold">
        🔥
        <span className="bg-gradient-to-br from-red-600 to-orange-400 bg-clip-text text-transparent box-decoration-clone">
          Atash{" "}
        </span>{" "}
        (آتش) 🔥{" "}
      </h1>

      <h2 className="my-4 text-xl sm:text-3xl font-bold">
        The 🔥{" "}
        <span className="bg-gradient-to-br from-red-600 to-orange-400 bg-clip-text text-transparent box-decoration-clone">
          hottest{" "}
        </span>{" "}
        🔥 full-stack Next.js template!
      </h2>
      <div className="card card-compact bg-secondary text-black font-bold text-left">
        <div className="card-body">
          <h2 className="card-title">Features:</h2>
          <ul>
            <li>🔥 User Auth and Orgs!</li>
            <li>🔥 API Key Auth</li>
            <li>🔥 Caching and Rate Limiting!</li>
            <li>🔥 Fast queries with Drizzle!</li>
            <li>🔥 App Router!</li>
            <li>🔥 100% free and open-source... forever!</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <a
          className="btn btn-sm sm:btn-md md:btn-lg btn-primary"
          href="https://github.com/new?template_name=Atash&template_owner=atridadl"
          target="_blank"
          rel="noreferrer"
        >
          Use Template!
        </a>

        <a
          className="btn btn-sm sm:btn-md md:btn-lg btn-primary"
          href="https://github.com/atridadl/Atash"
          target="_blank"
          rel="noreferrer"
        >
          View Repo!
        </a>
      </div>
    </>
  );
};
