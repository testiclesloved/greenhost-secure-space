import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { StoragePlans } from "@/components/StoragePlans";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <section id="pricing">
        <StoragePlans />
      </section>
    </div>
  );
};

export default Index;
