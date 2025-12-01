import SubmitForm from "../SubmitForm";

const SubmitReport = () => {
  return (
    <div className="min-h-screen w-full">
      {/* Header section */}
      <div className="max-w-5xl mx-auto flex flex-col justify-center items-center py-12 lg:py-12">
        <h2 className="md:text-5xl font-bold text-center">
          Speak Up, Stay Safe
        </h2>
        <p className="text-center text-gray-500 mt-2 text-base max-w-xl">
          Every report matters. We use end-to-end encryption to protect your
          identity and ensure your privacy at every step.
        </p>
      </div>
      {/* Form Section */}
      <div className="max-w-3xl mx-auto">
        <SubmitForm />
      </div>
    </div>
  );
};

export default SubmitReport;
