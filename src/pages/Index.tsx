import { Header } from '@/components/Header';
import { SizeLegend } from '@/components/SizeLegend';
import { SizeSelector } from '@/components/SizeSelector';
import { FeatureCard } from '@/components/FeatureCard';
import { FeatureList } from '@/components/FeatureList';
import { SummaryBar } from '@/components/SummaryBar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <Header />
      <SizeLegend />
      <SizeSelector />
      <FeatureCard />
      <FeatureList />
      <SummaryBar />
    </div>
  );
};

export default Index;
