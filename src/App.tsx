import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import { forceMotion } from './lib/scroll'
import { ShopProvider } from './lib/shop'
import { AboutBrand } from './components/sections/AboutBrand'
import { AtelierCraft } from './components/sections/AtelierCraft'
import { BagDrawer, BagToast } from './components/sections/BagDrawer'
import { BenefitStrip } from './components/sections/BenefitStrip'
import { Categories } from './components/sections/Categories'
import { CustomStylingSection } from './components/sections/CustomStylingSection'
import { FAQ } from './components/sections/FAQ'
import { FinalCTA } from './components/sections/FinalCTA'
import { Footer } from './components/sections/Footer'
import { Hero } from './components/sections/Hero'
import { Navbar } from './components/sections/Navbar'
import { ProductDetail } from './components/sections/ProductDetail'
import { ProductGrid } from './components/sections/ProductGrid'
import { ShopTheLook } from './components/sections/ShopTheLook'
import { Testimonials } from './components/sections/Testimonials'
import { WhatsAppButton } from './components/sections/WhatsAppButton'

export default function App() {
  useEffect(() => {
    if (forceMotion()) document.documentElement.classList.add('force-motion')
  }, [])

  return (
    <MotionConfig reducedMotion={forceMotion() ? 'never' : 'user'}>
      <ShopProvider>
        <a href="#conteudo" className="sr-only z-[100] rounded-full bg-espresso px-4 py-2 text-linen focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Pular para o conteúdo
        </a>
        <Navbar />
        <main id="conteudo" className="overflow-x-clip">
          <Hero />
          <BenefitStrip />
          <Categories />
          <ProductGrid />
          <ShopTheLook />
          <AtelierCraft />
          <CustomStylingSection />
          <AboutBrand />
          <Testimonials />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
        <ProductDetail />
        <BagDrawer />
        <BagToast />
        <WhatsAppButton />
      </ShopProvider>
    </MotionConfig>
  )
}
