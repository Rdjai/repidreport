import Hero from "../Hero";
import CTASection from "../CTASection";
import FeaturesSection from "../FeaturesSection";
import FAQSection from "../FAQSection";
import { SOSButton } from "@/addon/component/SOSButton";
import { SOSProvider, useSOS } from "@/context/SOSContext";
import { useEffect } from "react";
import ActiveSOSScreen from "@/addon/component/ActiveSOSScreen";

const Home = () => {

  const { currentAlert, isConnected } = useSOS();

  // Debug logs to see what's happening
  useEffect(() => {
    console.log('🏠 Home Component - Current Alert:', currentAlert);
    console.log('🏠 Home Component - Is Connected:', isConnected);
  }, [currentAlert, isConnected]);

  // Show ActiveSOSScreen when there's an active or accepted alert
  if (currentAlert && (currentAlert.status === 'active' || currentAlert.status === 'accepted')) {
    console.log('📍 Redirecting to ActiveSOSScreen - Alert Status:', currentAlert.status);
    return <ActiveSOSScreen />;
  }
  return (

    <div className="min-h-screen bg-[#FBF9FA] relative">
      <Hero />
      <FeaturesSection />
      <CTASection />
      <FAQSection />
      <SOSButton />
    </div>

  );
};

export default Home;