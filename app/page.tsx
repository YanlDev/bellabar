"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Phone, ChevronLeft, ChevronRight, X, MapPin, Clock, CreditCard, Award, Users } from "lucide-react";

const testimonials = [
  { name: "María G.", text: "Excelente academia. Los profesores son muy dedicados y las instalaciones de primer nivel. Aprendí maquillaje profesional en tiempo récord.", course: "Maquillaje Profesional" },
  { name: "Lucía R.", text: "Gracias a Bella Barbara hoy tengo mi propio salón. Los horarios flexibles me permitieron estudiar mientras trabajaba.", course: "Peinados y Colorimetría" },
  { name: "Ana P.", text: "La mejor decisión que tomé. Los módulos son muy completos y el ambiente es súper acogedor. Recomiendo 100%.", course: "Uñas Acrílicas" },
  { name: "Carmen T.", text: "Me certifiqué en faciales y desde entonces no he parado de tener clientas. La enseñanza es práctica y real.", course: "Faciales y Spa" },
  { name: "Rosa M.", text: "Los pagos en cuotas me ayudaron muchísimo. Pude costear mi curso sin problemas y ahora tengo una carrera sólida.", course: "Maquillaje Social" },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80", title: "Maquillaje" },
  { src: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80", title: "Peinados" },
  { src: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&q=80", title: "Belleza" },
  { src: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80", title: "Uñas" },
  { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80", title: "Faciales" },
  { src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80", title: "Pestañas" },
  { src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80", title: "Spa" },
  { src: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800&q=80", title: "Cejas" },
  { src: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&q=80", title: "Colorimetría" },
  { src: "https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800&q=80", title: "Estética" },
  { src: "https://images.unsplash.com/photo-1526045478516-99145907023c?w=800&q=80", title: "Social" },
  { src: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80", title: "Profesional" },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: 2 + (i % 3),
  delay: (i * 0.7) % 4,
  duration: 4 + (i % 5),
}));

const orbs = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  x: 15 + i * 22,
  y: 20 + (i % 2) * 40,
  size: 80 + i * 30,
  delay: i * 1.5,
}));

const sparkles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (i * 47 + 19) % 95,
  y: (i * 73 + 11) % 90,
  delay: (i * 0.9) % 3,
  duration: 1.5 + (i % 3) * 0.5,
}));

const streaks = Array.from({ length: 3 }, (_, i) => ({
  id: i,
  x: 15 + i * 30,
  delay: i * 2.5,
}));

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>,
    offset: ["start start", "end end"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 1, 0]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const i = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(i);
  }, [mounted]);

  function scrollGallery(dir: "left" | "right") {
    if (!galleryRef.current) return;
    galleryRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  }

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="relative bg-black text-white overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Login link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-6 right-8 z-20"
        >
          <Link
            href="/login"
            className="text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-[oklch(0.82_0.12_85)] transition-colors duration-300"
          >
            Iniciar Sesión
          </Link>
        </motion.div>

        {/* Logo as watermark */}
        <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-0 flex items-center justify-center">
          <motion.img
            src="/Logo/logo2.png"
            alt=""
            className="object-contain max-h-[90vh] max-w-[90vw] select-none pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </motion.div>

        {/* Enhanced particles */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          {/* Blurry gold orbs */}
          {orbs.map(o => (
            <motion.div
              key={`orb-${o.id}`}
              className="absolute rounded-full bg-[oklch(0.82_0.12_85/0.06)] blur-3xl"
              style={{ width: o.size, height: o.size, left: `${o.x}%`, top: `${o.y}%` }}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -40, 20, 0],
                opacity: [0.3, 0.5, 0.2, 0.3],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{ duration: 8 + o.id * 2, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Floating dots */}
          {particles.map(p => (
            <motion.div
              key={`dot-${p.id}`}
              className="absolute rounded-full bg-[oklch(0.82_0.12_85/0.5)]"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{
                x: [0, (p.id % 2 === 0 ? 40 : -30), 0],
                y: [0, -35, 0],
                opacity: [0, 0.6, 0],
                scale: [1, 1.6, 1],
              }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          {/* Falling light lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute w-px"
              style={{
                left: `${5 + i * 12}%`,
                height: 40 + (i % 3) * 30,
                background: `linear-gradient(to bottom, transparent, oklch(0.82 0.12 85 / ${0.1 + (i % 3) * 0.1}), transparent)`,
              }}
              animate={{ top: ["-10%", "110%"] }}
              transition={{
                duration: 3 + (i % 4),
                delay: i * 0.6,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <h1 className="flex flex-col items-center gap-0 leading-[0.85]">
              <span className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white">
                BELLA
              </span>
              <span className="text-5xl md:text-7xl lg:text-8xl font-thin tracking-[0.25em] text-[oklch(0.82_0.12_85)]">
                BARBARA
              </span>
            </h1>
            <p className="text-sm uppercase tracking-[0.3em] text-[oklch(0.82_0.12_85)] mt-4">
              Escuela de Belleza y Cosmetología
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-9 border border-zinc-700 flex items-start justify-center p-1.5">
            <motion.div className="w-1 h-1.5 bg-[oklch(0.82_0.12_85)]"
              animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </section>

      {/* ── GALLERY ── */}
      <section className="relative z-10 py-24">
        <div className="mb-14 text-center px-6">
          <span className="text-xs uppercase tracking-[0.3em] text-[oklch(0.82_0.12_85)] mb-4 block">
            Portafolio
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">
            Nuestro <span className="text-[oklch(0.82_0.12_85)]">Trabajo</span>
          </h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Explora nuestro trabajo y déjate inspirar
          </p>
        </div>

        <div className="relative px-6">
          <button onClick={() => scrollGallery("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center bg-black/60 backdrop-blur-sm border border-zinc-800 text-white hover:border-[oklch(0.82_0.12_85/0.4)] hover:text-[oklch(0.82_0.12_85)] transition-all cursor-pointer">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={() => scrollGallery("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center bg-black/60 backdrop-blur-sm border border-zinc-800 text-white hover:border-[oklch(0.82_0.12_85/0.4)] hover:text-[oklch(0.82_0.12_85)] transition-all cursor-pointer">
            <ChevronRight className="h-6 w-6" />
          </button>

          <div ref={galleryRef}
            className="flex gap-4 overflow-x-auto pb-6 px-12 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex-shrink-0 snap-center group cursor-pointer border border-zinc-800 hover:border-[oklch(0.82_0.12_85/0.3)] transition-all duration-500"
                onClick={() => setSelectedImage(img.src)}
              >
                <div className="relative w-[300px] h-[400px] overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.title}
                    className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-110"
                    style={{ filter: "grayscale(100%)" }}
                    onMouseEnter={e => (e.currentTarget.style.filter = "grayscale(0%)")}
                    onMouseLeave={e => (e.currentTarget.style.filter = "grayscale(100%)")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-semibold text-white">{img.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center bg-zinc-900 border border-zinc-800 text-white hover:border-zinc-600 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                src={selectedImage} alt=""
                className="max-w-full max-h-[90vh] object-contain" onClick={e => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── QUIÉNES SOMOS ── */}
      <section className="relative z-10 py-24 px-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-shrink-0"
          >
            <img src="/Logo/logo2.png" alt="Bella Barbara" className="w-64 md:w-80 object-contain" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center md:text-left"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-[oklch(0.82_0.12_85)] mb-4 block">
              Quiénes Somos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Formamos <span className="text-[oklch(0.82_0.12_85)]">Profesionales</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-6 text-sm">
              En Bella Barbara nos dedicamos a la enseñanza de la belleza con los más altos estándares.
              Nuestra escuela combina técnicas tradicionales con las últimas tendencias para formar
              profesionales competitivos y preparados para el mundo laboral.
            </p>
            <p className="text-zinc-500 text-sm">
              Más de 5 años de experiencia formando talento en Juliaca, Puno.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── ÚNETE ── */}
      <section className="relative z-10 py-24 px-6 bg-zinc-950/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-[oklch(0.82_0.12_85)] mb-4 block">
              Únete
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              ¿Por qué elegir <span className="text-[oklch(0.82_0.12_85)]">Bella Barbara</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, title: "Cursos Especializados", desc: "Maquillaje, peinados, uñas, faciales, colorimetría y más." },
              { icon: CreditCard, title: "Pagos Flexibles", desc: "Paga en cuotas o al contado. Nos ajustamos a tu medida." },
              { icon: Clock, title: "Horarios Adaptables", desc: "Turnos mañana y tarde para que estudies sin complicaciones." },
              { icon: Award, title: "Certificación", desc: "Al finalizar obtienes un certificado que avala tu formación." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-zinc-800 bg-black p-6 hover:border-[oklch(0.82_0.12_85/0.3)] transition-all duration-300 group"
              >
                <div className="flex h-10 w-10 items-center justify-center bg-[oklch(0.72_0.12_85/0.08)] mb-4 group-hover:bg-[oklch(0.72_0.12_85/0.15)] transition-colors">
                  <item.icon className="h-5 w-5 text-[oklch(0.82_0.12_85)]" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{item.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[oklch(0.82_0.12_85)] mb-4 block">
            Testimonios
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Lo que dicen nuestras <span className="text-[oklch(0.82_0.12_85)]">Alumnas</span>
          </h2>

          <div className="relative mt-14 min-h-[280px] flex items-center justify-center">
            {/* Arrows */}
            <button
              onClick={() => setActiveTestimonial(p => (p - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center border border-zinc-800 text-zinc-500 hover:border-[oklch(0.82_0.12_85/0.3)] hover:text-[oklch(0.82_0.12_85)] transition-all cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveTestimonial(p => (p + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center border border-zinc-800 text-zinc-500 hover:border-[oklch(0.82_0.12_85/0.3)] hover:text-[oklch(0.82_0.12_85)] transition-all cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="px-12"
              >
                <div className="flex justify-center gap-0.5 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-[oklch(0.82_0.12_85)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-zinc-300 text-lg leading-relaxed italic mb-6 max-w-xl mx-auto">
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-[oklch(0.72_0.12_85/0.12)] text-[oklch(0.82_0.12_85)] text-sm font-bold">
                    {testimonials[activeTestimonial].name[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{testimonials[activeTestimonial].name}</p>
                    <p className="text-xs text-[oklch(0.72_0.12_85)]">{testimonials[activeTestimonial].course}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2 transition-all cursor-pointer ${
                  i === activeTestimonial ? "w-6 bg-[oklch(0.82_0.12_85)]" : "w-2 bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── UBÍCANOS ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[oklch(0.82_0.12_85)] mb-4 block">
              Ubícanos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Visítanos en <span className="text-[oklch(0.82_0.12_85)]">Juliaca</span>
            </h2>
          </div>
          <div className="border border-zinc-800 overflow-hidden h-[350px] grayscale">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3843.6607840125736!2d-70.1367!3d-15.4900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDI5JzI0LjAiUyA3MMKwMDgnMTIuMSJX!5e0!3m2!1ses!2spe!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(100%) invert(92%) hue-rotate(180deg)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 text-xs text-zinc-500">
            <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[oklch(0.82_0.12_85)]" />Jr. Principal 123, Juliaca, Puno</span>
            <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[oklch(0.82_0.12_85)]" />+51 900 000 000</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-zinc-900 px-6 py-8 text-center">
        <p className="text-xs text-zinc-500">Demo creada por <span className="text-[oklch(0.82_0.12_85)]">Aveja Systems</span> — empresa de software.</p>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <motion.a
        href="https://wa.me/51900000000"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.82_0.12_85)] text-black cursor-pointer shadow-[0_0_30px_oklch(0.82_0.12_85/0.3)]"
      >
        <Phone className="h-6 w-6" />
      </motion.a>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: black; }
        ::-webkit-scrollbar-thumb { background: oklch(0.35 0.05 80); }
        ::-webkit-scrollbar-thumb:hover { background: oklch(0.72 0.12 85); }
      `}</style>
    </div>
  );
}
