import {Link} from "react-router-dom";
import HowItWorksSection from "../HowItWorksSection";
import FAQSection from "../FAQSection";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HowItWorksSection />
      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Report?
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Join thousands of citizens making their communities safer through
              effective incident reporting
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/submit-report"
                className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Submit a Report
              </Link>
              <Link
                to="/track-report"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-red-600 transition-colors duration-200"
              >
                Track Existing Report
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
};

export default HowItWorks;
