import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HomePage.css';

gsap.registerPlugin(ScrollTrigger);

const HomePage: React.FC = () => {
  const component = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.panel');
      const totalPanels = panels.length;

      gsap.to(panels, {
        xPercent: -100 * (totalPanels - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: slider.current,
          pin: true,
          scrub: 1,
          snap: 1 / (totalPanels - 1),
          end: () => '+=' + slider.current!.offsetWidth,
        },
      });

      // Animate content within each panel
      panels.forEach((panel) => {
        gsap.from(panel.querySelectorAll('h2, p, .scroll-down'), {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: gsap.to(panels, {
              xPercent: -100 * (totalPanels - 1),
              ease: 'none',
            }),
            start: 'left center',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, component);
    return () => ctx.revert();
  }, []);

  return (
    <div className="homepage-container" ref={component}>
      <div className="slider-container" ref={slider}>
        <div className="panel hero-panel">
          <div className="content">
            <h1>Creative Services</h1>
            <p>We build unique and innovative digital experiences.</p>
            <div className="scroll-down">
              Scroll to explore
              <div className="arrow"></div>
            </div>
          </div>
        </div>

        <section className="panel section-one">
          <div className="content">
            <h2>Section One</h2>
            <p>This is the content for the first section. We can add more engaging text here.</p>
          </div>
        </section>
        <section className="panel section-two">
          <div className="content">
            <h2>Section Two</h2>
            <p>This is the content for the second section. Let's talk about our process.</p>
          </div>
        </section>
        <section className="panel section-three">
          <div className="content">
            <h2>Section Three</h2>
            <p>This is the content for the third section. Featuring testimonials from happy clients.</p>
          </div>
        </section>
        <section className="panel section-four">
          <div className="content">
            <h2>Section Four</h2>
            <p>This is the content for the fourth section. A call to action to get in touch.</p>
          </div>
        </section>
      </div>
      <footer className="homepage-footer">
        <p>&copy; 2026 Creative Services. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
