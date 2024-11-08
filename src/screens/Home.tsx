import React, { useState } from 'react';
import Navbar1 from '../components/NavBar1';
import Hero from '../components/Hero';
import AuthCard from '../components/AuthCard';
// import { UserData } from '../types';
export interface UserData {
    name: string;
    email: string;
    password: string;
  }

function HomePage() {
  const [activePanel, setActivePanel] = useState<'none' | 'login' | 'signup'>('none');
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    password: '',
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('User registered:', formData);
    setActivePanel('login');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempted with:', { email: formData.email, password: formData.password });
  };

  return (
    <div className="min-h-screen bg-indigo-950">
      <Navbar1
        onLoginClick={() => setActivePanel(activePanel === 'login' ? 'none' : 'login')}
        onSignupClick={() => setActivePanel(activePanel === 'signup' ? 'none' : 'signup')}
      />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Hero />
          <AuthCard
            activePanel={activePanel}
            formData={formData}
            onFormChange={(data) => setFormData({ ...formData, ...data })}
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;