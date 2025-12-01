import {Link} from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-red-500 to-red-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to Make a Difference?
        </h2>
        <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
          Join thousands of citizens making their communities safer through
          effective incident reporting
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/submit-report"
            className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Submit Your First Report
          </Link>
          <Link
            to="/track-report"
            className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-white hover:text-red-600 transition-all duration-200"
          >
            Track Existing Report
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
