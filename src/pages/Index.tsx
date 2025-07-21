import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StoragePlans } from "@/components/StoragePlans";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <StoragePlans />
    </div>
  );
};

export default Index;
