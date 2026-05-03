import React from "react";
import maingate from "@/public/maingate.jpg";
function HeroSection() {
  return (
    <section
      className="flex items-center overflow-hidden relative"
      style={{
        backgroundImage: `url(${maingate.src})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#00C2FF,#00C2FF_10%,transparent,transparent)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,black,black_10%,transparent,transparent)]"></div>
      <div className="flex flex-col justify-center items-center text-white h-167.5 z-10 gap-3">
        <h1 className="text-4xl md:text-[88px] w-full md:leading-none font-semibold tracking-tighter bg-white bg-[linear-gradient(to_bottom,white,#00C2FF)] text-transparent bg-clip-text text-center">
          Modernizing Democracy at Visayas State University
        </h1>
        <p className="text-lg md:text-2xl mt-4 text-center max-w-2xl">
          The official digital election management system of the VSU Student
          Electoral Board
        </p>
        <button className="bg-white text-[#00C2FF] hover:bg-[#00C2FF] hover:text-white py-2 px-6 rounded-md transition duration-300 mt-3">
          Go to Active Elections
        </button>
      </div>
    </section>
  );
}

export default HeroSection;
