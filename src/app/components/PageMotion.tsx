import React, { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TEXT_SELECTOR = 'h1, h2, h3, p, [data-scroll-reveal="text"]';
const MEDIA_SELECTOR = 'img, [data-scroll-reveal="media"]';
const EXCLUDED_ANCESTORS = [
  '[data-no-scroll-trigger]',
  '[data-no-reveal]',
  '[aria-roledescription="carousel"]',
  '[role="dialog"]',
  'nav',
].join(',');

const canAnimate = (element: HTMLElement) => (
  !element.closest(EXCLUDED_ANCESTORS)
  && element.getAttribute('aria-hidden') !== 'true'
  && element.offsetParent !== null
);

/** Route-scoped GSAP effects shared by every customer-facing page. */
export const PageMotion = ({ children }: { children: React.ReactNode }) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const abortController = new AbortController();
    const animatedText = new WeakSet<HTMLElement>();
    const animatedMedia = new WeakSet<HTMLElement>();
    const animatedWobbles = new WeakSet<HTMLElement>();
    let mutationFrame = 0;

    const ctx = gsap.context(() => {
      const matchMedia = gsap.matchMedia();

      matchMedia.add('(prefers-reduced-motion: no-preference)', () => {
        const progress = root.querySelector<HTMLElement>('[data-scroll-progress]');

        gsap.fromTo(root, { autoAlpha: 0.9 }, {
          autoAlpha: 1,
          duration: 0.55,
          ease: 'power2.out',
        });

        if (progress) {
          gsap.fromTo(progress, { scaleX: 0 }, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.2,
            },
          });
        }

        const addTextReveals = (scope: ParentNode) => {
          const targets = Array.from(scope.querySelectorAll<HTMLElement>(TEXT_SELECTOR))
            .filter((element) => canAnimate(element) && !animatedText.has(element));

          targets.forEach((element) => {
            animatedText.add(element);
            gsap.fromTo(element, { autoAlpha: 0, y: 24, filter: 'blur(5px)' }, {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.75,
              ease: 'power3.out',
              clearProps: 'transform,filter',
              scrollTrigger: {
                trigger: element,
                start: 'top 90%',
                once: true,
              },
            });
          });
        };

        const addMediaReveals = (scope: ParentNode) => {
          const targets = Array.from(scope.querySelectorAll<HTMLElement>(MEDIA_SELECTOR))
            .filter((element) => (
              canAnimate(element)
              && !element.hasAttribute('data-wobble-reveal')
              && !animatedMedia.has(element)
            ));

          targets.forEach((element, index) => {
            animatedMedia.add(element);
            const fromLeft = index % 2 === 0;

            gsap.fromTo(element, {
              autoAlpha: 0,
              scale: 1.035,
              clipPath: fromLeft ? 'inset(0 10% 0 0)' : 'inset(0 0 0 10%)',
            }, {
              autoAlpha: 1,
              scale: 1,
              clipPath: 'inset(0 0 0 0)',
              duration: 1,
              ease: 'power3.out',
              clearProps: 'transform,clip-path',
              scrollTrigger: {
                trigger: element,
                start: 'top 92%',
                once: true,
              },
            });

            if (element instanceof HTMLImageElement && !element.complete) {
              element.addEventListener('load', () => ScrollTrigger.refresh(), {
                once: true,
                signal: abortController.signal,
              });
            }
          });
        };

        const addWobbleReveals = (scope: ParentNode) => {
          const targets = Array.from(scope.querySelectorAll<HTMLElement>('[data-wobble-reveal]'))
            .filter((element) => !animatedWobbles.has(element));

          targets.forEach((element) => {
            animatedWobbles.add(element);
            const section = element.closest('section') || element;
            const reveal = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: 'top 86%',
                once: true,
              },
            });

            reveal
              .fromTo(element, {
                autoAlpha: 0,
                y: -280,
                scale: 0.88,
                rotate: -9,
              }, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotate: 6,
                duration: 1.05,
                ease: 'bounce.out',
              })
              .to(element, { rotate: -5, duration: 0.13, ease: 'power2.inOut' })
              .to(element, { rotate: 3, duration: 0.11, ease: 'power2.inOut' })
              .to(element, { rotate: 0, duration: 0.1, ease: 'power2.out' });

            gsap.to(element, {
              x: () => -(window.innerWidth * 0.55 + element.offsetWidth),
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top 20%',
                end: 'center top',
                scrub: 0.45,
                invalidateOnRefresh: true,
              },
            });
          });
        };

        const addReveals = (scope: ParentNode = root) => {
          addWobbleReveals(scope);
          addTextReveals(scope);
          addMediaReveals(scope);
        };

        addReveals();

        // CMS pages, filters, and catalogue responses can add content after mount.
        const observer = new MutationObserver((records) => {
          if (!records.some((record) => record.addedNodes.length > 0)) return;

          window.cancelAnimationFrame(mutationFrame);
          mutationFrame = window.requestAnimationFrame(() => {
            ctx.add(() => addReveals());
            ScrollTrigger.refresh();
          });
        });

        observer.observe(root, { childList: true, subtree: true });

        window.addEventListener('load', () => ScrollTrigger.refresh(), {
          once: true,
          signal: abortController.signal,
        });

        return () => {
          observer.disconnect();
          window.cancelAnimationFrame(mutationFrame);
        };
      });

      return () => matchMedia.revert();
    }, root);

    return () => {
      abortController.abort();
      window.cancelAnimationFrame(mutationFrame);
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div ref={pageRef} data-page-motion>
      <div
        aria-hidden="true"
        data-scroll-progress
        data-no-scroll-trigger
        className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-gradient-to-r from-[#8a6819] via-[#efd36b] to-[#8a6819] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
      />
      {children}
    </div>
  );
};
