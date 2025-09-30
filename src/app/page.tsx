import FAQsTwo from "@/components/faq";
import ContentSection from "@/components/content-section";
import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import Features from "@/components/features";
import FooterSection from "@/components/footer";
// import { Footer } from "react-day-picker";


export default async function Home() {
  

  return (
    <div >
      <HeroHeader />
      <HeroSection />
      <Features />
      {/* <ContentSection /> */}
      <FAQsTwo />
      <FooterSection />
    </div>
  );
}
