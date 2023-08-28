import { type NextPage } from "next";

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
        T3 Clerk Drizzle{" "}
        <span className="bg-gradient-to-br from-pink-600 to-cyan-400 bg-clip-text text-transparent box-decoration-clone">
          Starter
        </span>
      </h1>

      <h2 className="my-4 text-xl sm:text-3xl font-bold">
        A{" "}
        <span className="bg-gradient-to-br from-pink-600 to-pink-400 bg-clip-text text-transparent box-decoration-clone">
          simple{" "}
        </span>{" "}
        template that helps{" "}
        <span className="bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent box-decoration-clone">
          full-stack developers{" "}
        </span>{" "}
        build cool things in{" "}
        <span className="bg-gradient-to-br from-cyan-600 to-cyan-400 bg-clip-text text-transparent box-decoration-clone">
          record time
        </span>
        .
      </h2>

      <div className="card card-compact bg-secondary text-black font-bold text-left">
        <div className="card-body">
          <h2 className="card-title">Features:</h2>
          <ul>
            <li>🚀 Easy to use!</li>
            <li>🚀 Auth and Orgs!</li>
            <li>🚀 Fast queries with Drizzle!</li>
            <li>🚀 App Router!</li>
            <li>🚀 100% free and open-source... forever!</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <a
          className="btn btn-primary"
          href="https://github.com/new?template_name=t3-clerk-drizzle-starter&template_owner=atridadl"
          target="_blank"
          rel="noreferrer"
        >
          Use Template!
        </a>
      </div>
    </>
  );
};
