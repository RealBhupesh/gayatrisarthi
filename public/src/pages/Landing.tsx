"use client"
import { ArrowRight, GraduationCap, Users2, BookOpen, PenSquare, LayoutDashboard } from "lucide-react"
import type React from "react"

import { Link } from "react-router-dom"
import { BackgroundGradient } from "@/components/aceternity/background-gradient"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { FloatingLines } from "@/components/floating-lines"
import { MobileNav } from "@/components/mobile-nav"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Quiz3DVisual, Leaderboard3DVisual, Enterprise3DVisual } from "@/components/landing-visuals";

const handleEmailClick = () => {
  window.location.href = "mailto:supportvidhyasarthi@gmail.com"
}

// Feature Card Component (replaces 3D models)
function FeatureCard({
  title,
  description,
  icon,
  gradient = "from-blue-500/20 via-purple-500/20 to-pink-500/20",
}: {
  title: string
  description: string
  icon: React.ReactNode
  gradient?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-xl border bg-card/50 backdrop-blur-lg p-8 shadow-lg overflow-hidden h-[300px]"
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl`} />

      {/* Card Content */}
      <div className="relative flex flex-col h-full">
        <div className="mb-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            }}
            className="p-3 rounded-full bg-white/10 w-fit"
          >
            {icon}
          </motion.div>
        </div>

        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}

export function Landing() {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  return (
    <div className="flex flex-col min-h-screen bg-background no-scrollbar overflow-x-hidden"> 
      {/* Navbar */}
      <nav className="fixed w-full z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Vidhyasarthi</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#about" className="text-foreground/80 hover:text-primary transition">
              About
            </a>
            <a href="#features" className="text-foreground/80 hover:text-primary transition">
              Features
            </a>
            <a href="#" onClick={handleEmailClick} className="text-foreground/80 hover:text-primary transition">
              Contact
            </a>
            <ModeToggle />
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dot-white/[0.2] bg-background">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <FloatingLines />

        <div className="container relative px-4 pt-20 md:pt-0">
          <div className="text-center space-y-8">
            {/* Heading & Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4">Vidhyasarthi</h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Master Any Subject with Fun and Engaging Quizzes!
              </p>
            </motion.div>

            {/* Centered Button with Gradient Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center"
            >
              <BackgroundGradient>
                <Link
                  to="/login"
                  className="relative dark:bg-black bg-white rounded-full w-fit dark:text-white text-black 
                       px-6 py-3 flex items-center gap-2 font-medium shadow-xl border border-gray-500 
                       transition duration-300"
                >
                  Start Quiz Today <ArrowRight className="h-5 w-5" />
                </Link>
              </BackgroundGradient>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About Vidhyasarthi</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're dedicated to revolutionizing online education through interactive quizzes and assessments. Our
              platform combines cutting-edge technology with engaging content to create an exceptional learning
              experience.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section - Added from old landing page with new styling */}
      <section className="py-24 border-t relative overflow-hidden">
        {/* Background Animated Floating Lines */}

        <div className="container px-4">
          {/* Section Heading */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Platform Insights & Statistics</h2>

            <p className="text-muted-foreground max-w-2xl mx-auto mt-2">
              Track your progress with real-time updates on quizzes, students, and test statistics.
            </p>
          </motion.div>

          {/* Stats Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              {
                icon: <Users2 className="h-6 w-6" />,
                label: "Total Quizzes",
                value: "35+",
                gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
              },
              {
                icon: <BookOpen className="h-6 w-6" />,
                label: "Students Registered",
                value: "100+",
                gradient: "from-green-500/20 via-blue-500/20 to-purple-500/20",
              },
              {
                icon: <PenSquare className="h-6 w-6" />,
                label: "Tests Taken",
                value: "250",
                gradient: "from-yellow-500/20 via-red-500/20 to-purple-500/20",
              },
              {
                icon: <LayoutDashboard className="h-6 w-6" />,
                label: "Questions",
                value: "2000",
                gradient: "from-purple-500/10 via-pink-500/20 to-blue-500/10",
              },
            ].map(({ icon, label, value, gradient }, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-xl border bg-card/50 backdrop-blur-lg p-6 shadow-lg overflow-hidden"
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl`} />

                {/* Card Content */}
                <div className="relative flex flex-col items-center text-center space-y-3">
                  {/* Animated Icon */}
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className="p-3 rounded-full bg-white/10"
                  >
                    {icon}
                  </motion.div>

                  {/* Label & Value */}
                  <h3 className="text-xl font-semibold">{label}</h3>
                  <p className="text-3xl font-bold text-primary">{value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      {/* What We Offer */}





      {/* Features Section */}
      <section id="features" className="py-24 border-t relative overflow-hidden">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight">What We Offer</h2>
            <p className="text-muted-foreground mt-2">
              Unlock a world of learning with AI-driven features, real-time analytics, and enterprise-ready solutions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 pr-8 lg:pr-16 mr-4 lg:mr-8"
            >
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                Interactive Learning
              </div>
              <h3 className="text-3xl font-bold tracking-tight">From preparation to perfection, in seconds.</h3>
              <p className="text-muted-foreground">
                Access unlimited tests for various competitive exams, with{" "}
                <strong>subject & topic-specific Expert-verified AI quizzes</strong> that provide{" "}
                <strong>proper questions for practice.</strong>
              </p>
            </motion.div>

            {/* Right Content - 3D Quiz Visual instead of Feature Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Quiz3DVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Performance & Leaderboard Analytics */}
      <section id="analytics" className="py-24 border-t relative">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left Content - Analytics Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 lg:order-2"
            >
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                Performance Analytics
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Track Your Progress & Rank.</h2>
              <p className="text-muted-foreground">
                Get detailed insights into your performance with real-time analytics. Compete with others through
                leaderboards—both <strong>specific</strong> and <strong>global</strong>—to see where you stand and how
                much you need to improve to achieve your goals.
              </p>
            </motion.div>

            {/* Right Content - 3D Leaderboard instead of Feature Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative lg:order-1"
            >
              <Leaderboard3DVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="py-24 border-t relative">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center pl-6">
            {/* Left Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                Enterprise Ready
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Scale your institution.</h2>
              <p className="text-muted-foreground">
                Enterprise-grade features for educational institutions of all sizes.
              </p>
            </motion.div>

            {/* Right Features Section - 3D Enterprise Visual instead of Feature Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Enterprise3DVisual />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Added from old landing page with new styling */}
      <section id="testimonials" className="py-24 border-t relative overflow-hidden">
        <FloatingLines />
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight">What Our Users Say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl" />
                <div className="relative">
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t relative overflow-hidden">
        <FloatingLines />
        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <h2 className="text-3xl font-bold tracking-tight">Ready to transform your learning?</h2>
            <p className="text-muted-foreground max-w-[600px]">
              Start with a free account or speak to our team about enterprise solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <BackgroundGradient>
                <Link
                  to="/login"
                  className="dark:bg-black bg-white rounded-full w-fit dark:text-white text-black px-6 py-3 flex items-center gap-2 font-medium"
                >
                  Start Quiz Today <ArrowRight className="h-5 w-5" />
                </Link>
              </BackgroundGradient>
            </div>
          </motion.div>
        </div>
      </section>

    
    </div>
  )
}

const testimonials = [
  {
    quote: "Vidhyasarthi has completely transformed my exam preparation journey. The AI-generated quizzes teacher verified are spot-on!",
    name: "Rahul Kumar",
    title: "Engineering Aspirant",
  },
  {
    quote: "As a teacher, this platform has saved me countless hours in creating and grading quizzes.",
    name: "Priya Sharma",
    title: "Professor",
  },
  {
    quote: "The practice tests helped me identify my weak areas and improve significantly.",
    name: "Amit Patel",
    title: "Medical Aspirant",
  },
]

