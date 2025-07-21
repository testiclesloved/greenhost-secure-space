import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { StoragePlans } from "@/components/StoragePlans";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <StoragePlans />
    </div>
  );
};

export default Index;
