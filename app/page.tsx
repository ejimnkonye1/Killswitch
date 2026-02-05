import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { BentoGrid } from '@/components/BentoGrid'
import { DashboardPreview } from '@/components/DashboardPreview'
import { Stats } from '@/components/Stats'
import { PricingSection } from '@/components/PricingSection'
import { CTA } from '@/components/CTA'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <div className="bg-[#0a0a0a]">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <BentoGrid />
        <DashboardPreview />
        <Stats />
        <PricingSection />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
