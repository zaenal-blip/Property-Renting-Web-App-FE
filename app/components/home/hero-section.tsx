import { motion } from "framer-motion";
import heroBg from "~/assets/hero-bg.jpg";
import { SearchForm } from "./search-form";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[600px] items-center w-full mx-auto md:min-h-[700px]">
      <img
        src={heroBg}
        alt="Luxury resort with infinity pool"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="hero-gradient absolute inset-0" />

      <div className="container relative z-10 mx-auto px-4 py-20 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
            Find Your Perfect Stay
          </h1>
          <p className="mb-8 text-lg font-light text-primary-foreground/80 md:text-xl">
            Discover and book the best hotels, villas, and resorts across
            Indonesia
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-4xl"
        >
          <SearchForm />
        </motion.div>
      </div>
    </section>
  );
}
