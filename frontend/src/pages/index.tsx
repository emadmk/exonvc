import { useState } from 'react'
import Layout from '../components/Layout'
import HeroSection from '../components/sections/HeroSection'
import FeaturesSection from '../components/sections/FeaturesSection'
import ProjectsSection from '../components/sections/ProjectsSection'
import StatsSection from '../components/sections/StatsSection'
import AboutSection from '../components/sections/AboutSection'
import ContactSection from '../components/sections/ContactSection'
import AuthModal from '../components/modals/AuthModal'
import ChatWidget from '../components/chat/ChatWidget'

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')

  const handleAuthModalOpen = (mode = 'login') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
  }

  const handleProjectSelect = (project: any) => {
    console.log('Project selected:', project)
  }

  return (
    <Layout onAuthModalOpen={handleAuthModalOpen}>
      <HeroSection onAuthModalOpen={handleAuthModalOpen} />
      <FeaturesSection />
      <ProjectsSection 
        onProjectSelect={handleProjectSelect}
        onAuthModalOpen={handleAuthModalOpen}
      />
      <StatsSection />
      <AboutSection />
      <ContactSection />
      
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleAuthModalClose}
        initialMode={authModalMode}
      />
      
      <ChatWidget />
    </Layout>
  )
}
