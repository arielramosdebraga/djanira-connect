"use client";

import wordmark from "@assets/djanira-wordmark.png";
import curlsImage from "@assets/site-photos/salon-photo-01.webp";
import menuImage from "@assets/site-photos/salon-photo-02.webp";
import resultImage from "@assets/site-photos/salon-photo-03.webp";
import brunetteImage from "@assets/site-photos/salon-photo-04.webp";
import finishImage from "@assets/site-photos/salon-photo-05.webp";
import blondeImage from "@assets/site-photos/salon-photo-06.webp";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";

type HomeHeroSliderProps = { whatsappUrl: string | null };
type Slide = { image: StaticImageData; eyebrow: string; title: string; description: string };

const slides: Slide[] = [
  { image: resultImage, eyebrow: "Cabelos", title: "Resultados que valorizam sua beleza.", description: "Cortes, tratamentos e finalizações pensados para o seu estilo." },
  { image: finishImage, eyebrow: "Transformações", title: "Detalhes que fazem você se sentir ainda melhor.", description: "Técnica, acolhimento e acabamento para você sair se sentindo especial." },
  { image: brunetteImage, eyebrow: "Morena iluminada", title: "Luz e movimento na medida certa.", description: "Uma transformação personalizada para destacar a beleza dos seus fios." },
  { image: blondeImage, eyebrow: "Mechas e luzes", title: "Cor, brilho e leveza.", description: "Resultados luminosos com acabamento natural e cuidado profissional." },
  { image: curlsImage, eyebrow: "Cortes e finalizações", title: "Seu cabelo, do jeito que você gosta.", description: "Finalizações que valorizam textura, volume e movimento." },
];

const menuLinks = [
  { label: "Home", href: "#inicio" },
  { label: "Serviços", href: "#menu" },
  { label: "Agendamento", href: "/reservar" },
  { label: "Contato", href: "tel:+554892190607" },
  { label: "Redes sociais", href: "https://www.instagram.com/djanira_montclair/" },
];

export default function HomeHeroSlider({ whatsappUrl }: HomeHeroSliderProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) return;

    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const slide = slides[activeSlide];
  const moveSlide = (direction: number) => setActiveSlide((current) => (current + direction + slides.length) % slides.length);

  return (
    <>
      <section className="relative min-h-[min(100vh,860px)] overflow-hidden bg-[#2c241d] text-white">
        <div className="pointer-events-none absolute inset-0"><Image src={slide.image} alt="" fill priority sizes="100vw" className="object-cover transition-opacity duration-700" /></div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#241b16]/75 via-[#241b16]/25 to-[#241b16]/15" />
        <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-6 px-5 py-5 sm:px-10 lg:px-14">
          <a className="block max-w-[190px] rounded-full bg-white/90 px-5 py-3 shadow-lg backdrop-blur-sm" href="#inicio" aria-label="Djanira Montclair - início"><Image src={wordmark} alt="Djanira Montclair" width={210} height={70} className="h-auto w-full object-contain" priority /></a>
          <button className="group relative z-30 flex min-h-11 min-w-32 touch-manipulation select-none items-center justify-center gap-5 rounded-[1.7rem] bg-white px-6 py-3 text-base font-bold text-[#2c241d] shadow-lg transition-colors duration-200 hover:bg-[#f4e7d4] hover:text-[#75401f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a96532] focus-visible:ring-offset-2 active:scale-[0.98] sm:px-7" type="button" onClick={() => setIsMenuOpen((current) => !current)} aria-haspopup="dialog" aria-expanded={isMenuOpen}><span>Menu</span><span className="flex w-10 flex-col gap-2" aria-hidden="true"><span className="h-px w-10 bg-current transition-transform duration-200 group-hover:translate-y-0.5" /><span className="h-px w-10 bg-current transition-transform duration-200 group-hover:-translate-y-0.5" /></span></button>
        </div>
        <div className="relative z-10 mx-auto flex min-h-[min(100vh,860px)] max-w-7xl items-end px-6 pb-20 pt-40 sm:px-10 sm:pb-24 lg:px-14"><div className="w-full max-w-xl px-12 sm:px-12 lg:pr-0"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f4d6a3]">{slide.eyebrow}</p><h1 className="mt-5 text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-[1.02] tracking-tight lg:text-7xl">{slide.title}</h1><p className="mt-6 max-w-lg text-lg leading-8 text-white/85">{slide.description}</p><div className="mt-8 flex flex-wrap gap-3"><a className="rounded-full bg-[#b8733b] px-6 py-3.5 font-semibold text-white transition hover:bg-[#d08a4d]" href="/reservar">Agendar horário</a>{whatsappUrl ? <a className="rounded-full border border-white/60 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#75401f]" href={whatsappUrl} target="_blank" rel="noreferrer">Falar no WhatsApp</a> : null}</div></div></div>
        <button className="absolute left-5 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/10 text-3xl text-white backdrop-blur-sm transition hover:bg-white hover:text-[#75401f]" type="button" aria-label="Imagem anterior" onClick={() => moveSlide(-1)}>‹</button><button className="absolute right-5 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/10 text-3xl text-white backdrop-blur-sm transition hover:bg-white hover:text-[#75401f]" type="button" aria-label="Próxima imagem" onClick={() => moveSlide(1)}>›</button><div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 gap-2" aria-label="Selecionar imagem">{slides.map((item, index) => <button className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-10 bg-white" : "w-5 bg-white/50"}`} key={item.eyebrow} type="button" aria-label={`Mostrar slide ${index + 1}`} aria-current={index === activeSlide ? "true" : undefined} onClick={() => setActiveSlide(index)} />)}</div>
      </section>
      {isMenuOpen ? <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#eee9e1] text-[#2c241d]" role="dialog" aria-modal="true" aria-label="Menu principal"><div className="relative min-h-screen overflow-hidden"><div className="absolute inset-y-0 right-0 hidden w-[53%] md:block"><Image src={menuImage} alt="Mulher em um ambiente de beleza" fill sizes="53vw" className="object-cover object-center" priority /></div><div className="absolute inset-0 bg-gradient-to-r from-[#eee9e1] via-[#eee9e1]/95 to-[#eee9e1]/20 md:w-[68%]" /><div className="relative z-10 flex min-h-screen flex-col px-7 py-7 sm:px-12 sm:py-10 lg:px-16"><div className="flex items-start justify-between"><button className="flex size-11 items-center justify-center rounded-full text-3xl leading-none text-[#75401f] transition hover:bg-white" type="button" onClick={() => setIsMenuOpen(false)} aria-label="Voltar para a home">×</button><a className="block max-w-[190px] rounded-full bg-white/90 px-5 py-3 shadow-lg backdrop-blur-sm" href="#inicio" aria-label="Djanira Montclair - início" onClick={() => setIsMenuOpen(false)}><Image src={wordmark} alt="Djanira Montclair" width={210} height={70} className="h-auto w-full object-contain" priority /></a></div><nav className="mt-20 flex flex-col items-start gap-5 sm:mt-24 sm:gap-6" aria-label="Navegação principal">{menuLinks.map((link) => <a className="text-3xl font-light tracking-tight transition hover:translate-x-2 hover:text-[#a96532] sm:text-5xl" href={link.href} key={link.label} onClick={() => setIsMenuOpen(false)}>{link.label}</a>)}</nav><div className="mt-auto pt-16 text-sm text-[#76695c]"><p>Rua Antônio Scherer, nº 716 · Kobrasol</p><p className="mt-2">São José - SC · +55 48 9219-0607</p></div></div></div></div> : null}
    </>
  );
}
