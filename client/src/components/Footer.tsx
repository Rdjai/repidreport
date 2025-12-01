const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-black">
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex  justify-center items-center space-y-4 md:space-y-0">
            <div className="text-gray-400">
              © {currentYear} RapidReport | build by
              <a href="https://x.com/rdjkashyap" className="ml-1 text-red-500 ">
                {" "}
                @Rdj Kashyap{" "}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
