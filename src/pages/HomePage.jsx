import React from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import About from '../components/sections/About';
import Reviews from '../components/sections/Reviews';
import Contact from '../components/sections/Contact';
import Footer from '../components/layout/Footer';

const HomePage = () => {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;