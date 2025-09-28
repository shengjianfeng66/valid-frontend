"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import FAQ from "@/components/blocks/faq";
import Feature from "@/components/blocks/feature";
import Feature1 from "@/components/blocks/feature1";
import Feature2 from "@/components/blocks/feature2";
import Feature3 from "@/components/blocks/feature3";
import Hero from "@/components/blocks/hero";
import Pricing from "@/components/blocks/pricing";
import Showcase from "@/components/blocks/showcase";
import Stats from "@/components/blocks/stats";
import Testimonial from "@/components/blocks/testimonial";
import Footer from "@/components/blocks/footer";
import Header from "@/components/blocks/header";

interface LandingPageClientProps {
  page: any;
}

export default function LandingPageClient({ page }: LandingPageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Create different parallax speeds for different sections
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const brandingY = useTransform(scrollYProgress, [0.1, 0.4], [0, -50]);
  const featureY = useTransform(scrollYProgress, [0.2, 0.6], [0, -80]);
  const showcaseY = useTransform(scrollYProgress, [0.3, 0.7], [0, -60]);
  const statsY = useTransform(scrollYProgress, [0.4, 0.8], [0, -40]);
  const testimonialY = useTransform(scrollYProgress, [0.5, 0.9], [0, -70]);

  // Opacity transforms for fade effects
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8]);

  return (
    <div ref={containerRef}>
      {page.header && <Header header={page.header} />}
      
      {page.hero && (
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Hero hero={page.hero} />
        </motion.div>
      )}
      
      {page.branding && (
        <motion.div 
          style={{ y: brandingY, opacity: sectionOpacity }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Branding section={page.branding} />
        </motion.div>
      )}
      
      {page.introduce && (
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Feature1 section={page.introduce} />
        </motion.div>
      )}
      
      {page.benefit && (
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Feature2 section={page.benefit} />
        </motion.div>
      )}
      
      {page.usage && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Feature3 section={page.usage} />
        </motion.div>
      )}
      
      {page.feature && (
        <motion.div 
          style={{ y: featureY }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Feature section={page.feature} />
        </motion.div>
      )}
      
      {page.showcase && (
        <motion.div 
          style={{ y: showcaseY }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Showcase section={page.showcase} />
        </motion.div>
      )}
      
      {page.stats && (
        <motion.div 
          style={{ y: statsY }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Stats section={page.stats} />
        </motion.div>
      )}
      
      {page.pricing && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Pricing pricing={page.pricing} />
        </motion.div>
      )}
      
      {page.testimonial && (
        <motion.div 
          style={{ y: testimonialY }}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Testimonial section={page.testimonial} />
        </motion.div>
      )}
      
      {page.faq && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <FAQ section={page.faq} />
        </motion.div>
      )}
      
      {page.cta && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <CTA section={page.cta} />
        </motion.div>
      )}
      
      {page.footer && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Footer footer={page.footer} />
        </motion.div>
      )}
    </div>
  );
}