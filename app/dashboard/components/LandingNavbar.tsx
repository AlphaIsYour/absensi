// app/components/LandingNavbar.tsx  (Lokasi baru yang disarankan)

import Image from "next/image";

const LandingNavbar = () => {
  return (
    <nav className="bg-white border-b border-gray-700 w-full text-white p-2">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Image
              src="/background/bbt-logo.png"
              alt="Logo BBT"
              width={280}
              height={120}
              className="inline-block mr-2"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
