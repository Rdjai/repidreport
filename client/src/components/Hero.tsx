import {Link} from "react-router-dom";
import {Button} from "./ui/button";

const Hero = () => {
  const stats = [
    {
      value: "100+",
      label: "Reports Submitted",
    },
    {
      value: "98%",
      label: "Response Rate",
    },
    {
      value: "24/7",
      label: "Available Support",
    },
  ];
  return (
    <section className="bg-gradient-to-r from-red-500 to-red-600 text-white py-24">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Report. <span className="text-red-200">Track.</span>{" "}
          <span className="text-red-100">Resolve.</span>
        </h1>

        <p className="text-xl md:text-2xl text-red-100 mb-10 max-w-3xl mx-auto">
          Report emergencies instantly and securely with Rapid Report. Your
          safety comes first with fast response coordination and full anonymity
          when needed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/submit-report" className="lg:w-fit w-full">
            <Button className="bg-white text-red-600 px-8 py-6 rounded-lg font-semibold text-lg hover:bg-gray-100 w-full">
              Submit Report
            </Button>
          </Link>
          <Link to="/how-it-works" className="lg:w-fit w-full">
            <Button
              variant="outline"
              className="border-2 border-white text-white px-8 py-6 rounded-lg font-semibold text-lg hover:bg-white hover:text-red-600 w-full duration-100"
            >
              How It Works
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center bg-white/10 rounded-md px-5 py-8"
            >
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-red-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
