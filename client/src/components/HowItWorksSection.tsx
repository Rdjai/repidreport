const HowItWorksSection = () => {
  const steps = [
    {
      title: "Report",
      desc: "Submit your incident with details and location",
    },
    {
      title: "Process",
      desc: "Our system routes to appropriate authorities",
    },
    {
      title: "Track",
      desc: "Monitor progress with real-time updates",
    },
    {
      title: "Resolve",
      desc: "Get confirmation when issue is addressed",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple. Fast. Effective.
          </h2>
          <p className="text-lg text-gray-600">
            Get your reports to the right authorities in just a few clicks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold mb-4 mx-auto">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
