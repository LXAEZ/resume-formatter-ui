import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@mui/material";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext"; // Import your auth context
import AuthModal from "./AuthModal";
import Login from "./Login";
import Register from "./Register";

export default function Home() {
  // Use actual auth context instead of mock state
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [authType, setAuthType] = useState("login");

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  // Smooth scroll function for anchor links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-file-stack-icon lucide-file-stack"
            >
              <path d="M21 7h-3a2 2 0 0 1-2-2V2" />
              <path d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17Z" />
              <path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15" />
              <path d="M3 12v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H11" />
            </svg>
            <span>ResumeParser</span>
          </div>

          <nav className="hidden gap-6 md:flex">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              How It Works
            </button>
            {user && (
              <Link
                to="/resume"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setAuthType("login");
                    setOpenModal(true);
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setAuthType("register");
                    setOpenModal(true);
                  }}
                >
                  Get Started
                </Button>

                {/* Auth Modal */}
                <AuthModal open={openModal} onClose={() => setOpenModal(false)}>
                  {authType === "login" ? (
                    <Login onSwitchToRegister={() => setAuthType("register")} />
                  ) : (
                    <Register onSwitchToLogin={() => setAuthType("login")} />
                  )}
                </AuthModal>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getInitials(user)}
                  </div>
                  <span className="text-gray-700 font-medium hidden sm:block">
                    {user}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {getInitials(user)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {user}
                            </p>
                            <p className="text-xs text-gray-500">
                              Account Settings
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Transform Your Resume in Seconds
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload your resume and our AI will parse, analyze, and
                    reformat it for better readability and ATS compatibility.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {!user ? (
                    <Link to="/register">
                      <Button variant="contained" size="large">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/resume">
                      <Button variant="contained" size="large">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="inline-flex items-center justify-center px-6 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </div>
              <img
                src="https://kzmkmsorx7n8f8vrzdbm.lite.vusercontent.net/placeholder.svg?height=550&width=450"
                width={550}
                height={450}
                alt="Resume parsing preview"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full bg-muted/50 py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything You Need
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers a comprehensive set of tools to help you
                  optimize your resume for job applications.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M9 9h1" />
                    <path d="M9 13h6" />
                    <path d="M9 17h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Smart Parsing</h3>
                <p className="text-center text-muted-foreground">
                  Our AI accurately extracts information from your resume,
                  including skills, experience, and education.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 7h10" />
                    <path d="M7 12h10" />
                    <path d="M7 17h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Multiple Formats</h3>
                <p className="text-center text-muted-foreground">
                  Export your parsed resume in JSON format for developers or as
                  a beautifully formatted PDF.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Reformatting</h3>
                <p className="text-center text-muted-foreground">
                  Improve the structure and presentation of your resume with our
                  professional templates.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
                    <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
                    <path d="M3 7v10a2 2 0 0 0 2 2h4" />
                    <path d="m8 22 4-4" />
                    <path d="m8 18 4 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">ATS Optimization</h3>
                <p className="text-center text-muted-foreground">
                  Ensure your resume passes through Applicant Tracking Systems
                  with our optimization tools.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">History Tracking</h3>
                <p className="text-center text-muted-foreground">
                  Keep track of all your parsed resumes and access them anytime
                  from your account.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Secure Storage</h3>
                <p className="text-center text-muted-foreground">
                  Your resume data is encrypted and securely stored in our
                  database for your privacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl grid items-center gap-6 px-4 sm:px-6 lg:px-8 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                How It Works
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our resume parsing process is simple, fast, and effective.
                Follow these steps to get started.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end">
              {!user ? (
                <Link to="/register">
                  <Button variant="contained">Get Started</Button>
                </Link>
              ) : (
                <Link to="/resume">
                  <Button variant="contained">Go to Dashboard</Button>
                </Link>
              )}
            </div>
            <div className="grid gap-6 lg:col-span-2">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white">
                    1
                  </div>

                  <h3 className="text-xl font-bold">
                    {!user ? "Create an Account" : "Upload Your Resume"}
                  </h3>
                  <p className="text-muted-foreground">
                    {!user
                      ? "Sign up for a free account to access all our resume parsing features."
                      : "Upload your resume in PDF, DOCX, or other common formats through our intuitive interface."}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white">
                    2
                  </div>
                  <h3 className="text-xl font-bold">
                    {!user ? "Upload Your Resume" : "Review Parsed Data"}
                  </h3>
                  <p className="text-muted-foreground">
                    {!user
                      ? "Upload your resume in PDF, DOCX, or other common formats through our intuitive interface."
                      : "Our AI will extract and organize your resume data, which you can review and edit if needed."}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white">
                    3
                  </div>
                  <h3 className="text-xl font-bold">
                    {!user ? "Review Parsed Data" : "Choose Output Format"}
                  </h3>
                  <p className="text-muted-foreground">
                    {!user
                      ? "Our AI will extract and organize your resume data, which you can review and edit if needed."
                      : "Select your preferred output format: JSON for developers or PDF for job applications."}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white">
                    4
                  </div>
                  <h3 className="text-xl font-bold">
                    {!user ? "Choose Output Format" : "Download or Share"}
                  </h3>
                  <p className="text-muted-foreground">
                    {!user
                      ? "Select your preferred output format: JSON for developers or PDF for job applications."
                      : "Download your reformatted resume or share it directly with potential employers."}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white">
                    5
                  </div>
                  <h3 className="text-xl font-bold">
                    {!user ? "Download or Share" : "Track Your History"}
                  </h3>
                  <p className="text-muted-foreground">
                    {!user
                      ? "Download your reformatted resume or share it directly with potential employers."
                      : "Access all your previously parsed resumes from your account dashboard."}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white">
                    6
                  </div>
                  <h3 className="text-xl font-bold">
                    {!user ? "Track Your History" : "Advanced Features"}
                  </h3>
                  <p className="text-muted-foreground">
                    {!user
                      ? "Access all your previously parsed resumes from your account dashboard."
                      : "Explore additional features like ATS optimization, template customization, and analytics."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background py-6">
        <div className="container mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M9 9h1" />
              <path d="M9 13h6" />
              <path d="M9 17h6" />
            </svg>
            <span>ResumeParser</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 ResumeParser. All rights reserved.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => scrollToSection("terms")}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Terms
            </button>
            <button
              onClick={() => scrollToSection("privacy")}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
