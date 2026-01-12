import { useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './Resume.css'

interface ResumeProps {
  profileImage: string | null
}

const Resume = ({ profileImage }: ResumeProps) => {
  const resumeRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return

    try {
      // Show loading state
      const button = document.querySelector('.download-button') as HTMLButtonElement
      const originalText = button?.textContent
      if (button) {
        button.textContent = 'Generating PDF...'
        button.disabled = true
      }

      // Wait a bit to ensure DOM is ready and images are loaded
      await new Promise(resolve => setTimeout(resolve, 200))

      // Ensure all images are loaded before capturing
      const images = resumeRef.current.querySelectorAll('img')
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(null)
              } else {
                img.onload = () => resolve(null)
                img.onerror = () => resolve(null)
                // Timeout after 2 seconds
                setTimeout(() => resolve(null), 2000)
              }
            })
        )
      )

      const canvas = await html2canvas(resumeRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: resumeRef.current.scrollWidth,
        height: resumeRef.current.scrollHeight,
        windowWidth: resumeRef.current.scrollWidth,
        windowHeight: resumeRef.current.scrollHeight,
        allowTaint: false,
        imageTimeout: 15000,
        removeContainer: true,
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 10 // 10mm margin on all sides
      const contentWidth = pdfWidth - (margin * 2)
      const contentHeight = pdfHeight - (margin * 2)

      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Convert pixels to mm (at scale 1.5: 1px = 0.264583mm / 1.5)
      const pxToMm = 0.264583
      const scaleFactor = 1.5
      const imgWidthMm = (imgWidth / scaleFactor) * pxToMm
      const imgHeightMm = (imgHeight / scaleFactor) * pxToMm
      
      // Calculate ratio to fit content width exactly
      const ratio = contentWidth / imgWidthMm
      const scaledHeight = imgHeightMm * ratio

      // Handle multi-page with proper alignment
      let remainingHeight = scaledHeight
      let pageNum = 1

      while (remainingHeight > 0) {
        if (pageNum > 1) {
          pdf.addPage()
        }

        const pageHeight = Math.min(contentHeight, remainingHeight)
        const sourceY = (scaledHeight - remainingHeight) / ratio / pxToMm * scaleFactor
        const sourceHeight = (pageHeight / ratio / pxToMm) * scaleFactor

        // Create canvas slice for this page
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = imgWidth
        pageCanvas.height = Math.min(Math.ceil(sourceHeight), imgHeight - Math.floor(sourceY))
        const ctx = pageCanvas.getContext('2d')
        
        if (ctx && pageCanvas.height > 0) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
          ctx.drawImage(
            canvas,
            0, Math.floor(sourceY),
            imgWidth, pageCanvas.height,
            0, 0,
            imgWidth, pageCanvas.height
          )
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85)
          pdf.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, pageHeight)
        }

        remainingHeight -= contentHeight
        pageNum++
      }

      pdf.save('Anish_Mahato_Resume.pdf')

      // Restore button state
      if (button) {
        button.textContent = originalText || 'Download PDF'
        button.disabled = false
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
      
      // Restore button state on error
      const button = document.querySelector('.download-button') as HTMLButtonElement
      if (button) {
        button.textContent = 'Download PDF'
        button.disabled = false
      }
    }
  }

  return (
    <div className="resume-container">
      <div className="download-button-container">
        <button onClick={handleDownloadPDF} className="download-button">
          Download PDF
        </button>
      </div>
      <div ref={resumeRef} className="resume" id="resume">
        {/* Header */}
        <header className="resume-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="name">ANISH MAHATO</h1>
              <h2 className="title">Full Stack Software Engineer</h2>
              <div className="contact-info">
                <span>Dubai, UAE</span>
                <span>|</span>
                <span>+971 50 857 2468</span>
                <span>|</span>
                <span>anishgithub890@gmail.com</span>
              </div>
              <div className="links">
                <span>LinkedIn: <a href="https://www.linkedin.com/in/anishpabe/" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/anishpabe/</a></span>
                <span>|</span>
                <span>GitHub: <a href="https://github.com/anishgithub890/" target="_blank" rel="noopener noreferrer">https://github.com/anishgithub890/</a></span>
                <span>|</span>
                <span>Portfolio: <a href="https://anishnp.vercel.app/" target="_blank" rel="noopener noreferrer">https://anishnp.vercel.app/</a></span>
              </div>
            </div>
            {profileImage && (
              <div className="profile-image-container">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="profile-image"
                  width="120"
                  height="120"
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="resume-section">
          <h2 className="section-title">SUMMARY</h2>
          <p className="section-content">
            Full Stack Developer with 4+ years of experience building scalable web applications and multi-tenant SaaS platforms. Strong in Next.js/React, TypeScript, Node.js/Express, MySQL, Prisma, Redis, REST APIs, RBAC/JWT security, and real-time systems using Socket.io. Experienced owning architecture end-to-end, building admin panels, dashboards, analytics, and performance-focused backends.
          </p>
        </section>

        {/* Skills */}
        <section className="resume-section">
          <h2 className="section-title">SKILLS</h2>
          <div className="section-content">
            <p><strong>Programming Languages:</strong> TypeScript, JavaScript, Python, Go (Golang), Java</p>
            <p><strong>Frontend:</strong> React, Next.js, Tailwind CSS, HTML/CSS, shadcn/ui, Zustand, Redux Toolkit, TanStack React Query</p>
            <p><strong>Backend:</strong> Node.js, Express.js, REST APIs, GraphQL (basic), Laravel (prior)</p>
            <p><strong>Databases/ORM:</strong> MySQL, MongoDB, Prisma, Mongoose, Redis</p>
            <p><strong>Real-time/Infra:</strong> Socket.io, Docker, Docker Compose</p>
            <p><strong>Auth/Security:</strong> JWT, RBAC/Permissions, OAuth, 2FA (implementation exposure), Rate limiting</p>
            <p><strong>Tools:</strong> Git, Postman, Figma, Prisma Studio, AWS (basic)</p>
            <p><strong>Other:</strong> System Design, Problem Solving, Critical Thinking</p>
          </div>
        </section>

        {/* Professional Experience */}
        <section className="resume-section">
          <h2 className="section-title">PROFESSIONAL EXPERIENCE</h2>
          <div className="section-content">
            {/* Experience 1 */}
            <div className="experience-item">
              <div className="experience-header">
                <h3 className="company-name">Chaturvedi Software House LLC</h3>
                <span className="job-title">— Full Stack Developer (HRMS & CRM System)</span>
                <span className="location">| Dubai, UAE</span>
                <span className="date">| 2025 – Present</span>
              </div>
              <ul className="experience-bullets">
                <li>Designed and implemented multi-tenant SaaS architecture with 3-tier hierarchy (Super Admin → Company Admin → Users) and tenant data isolation.</li>
                <li>Built HRMS modules covering employee lifecycle, recruitment, attendance, leave, payroll (multi-currency), performance management, and analytics.</li>
                <li>Built CRM modules including lead management, deal pipeline, sales forecasting, quotes, orders, invoicing, and campaign management.</li>
                <li>Implemented JWT authentication and RBAC with 100+ granular permissions; applied rate limiting patterns and 2FA-ready flows.</li>
                <li>Delivered 200+ REST API endpoints with consistent response formats, modular services/controllers, and centralized error handling.</li>
                <li>Designed and optimized MySQL schema (100+ tables) with indexing, query optimization, and Redis caching for performance.</li>
                <li>Built real-time features using Socket.io (e.g., notifications/updates) and implemented server-side pagination and reusable data-table patterns.</li>
              </ul>
              <p className="tech-stack"><strong>Tech:</strong> Next.js, React, TypeScript, Node.js, Express.js, MySQL, Prisma, Redis, Socket.io, Tailwind CSS, shadcn/ui, Docker</p>
            </div>

            {/* Experience 2 */}
            <div className="experience-item property-marketplace">
              <div className="experience-header">
                <h3 className="company-name">Chaturvedi Software House LLC</h3>
                <span className="job-title">— Full Stack Lead Developer (Property Marketplace)</span>
                <span className="location">| Dubai, UAE</span>
                <span className="date">| 2025 – Present</span>
              </div>
              <ul className="experience-bullets">
                <li>Led end-to-end architecture and development of a property marketplace connecting brokers with property listings and buyer requirements.</li>
                <li>Implemented AI-powered matching workflows and supported third-party integrations (Bayut, PropertyFinder).</li>
                <li>Built admin panel features including bulk actions, property imports, and collaboration workflows; owned backend delivery end-to-end.</li>
              </ul>
              <p className="tech-stack"><strong>Tech:</strong> React, Next.js, TypeScript, Node.js, MySQL, Prisma, Tailwind CSS, JWT/OAuth</p>
            </div>

            {/* Experience 3 */}
            <div className="experience-item">
              <div className="experience-header">
                <h3 className="company-name">Chaturvedi Software House LLC</h3>
                <span className="job-title">— Full Stack Developer (Real Estate Management System)</span>
                <span className="location">| Dubai, UAE</span>
                <span className="date">| 2024 – Present</span>
              </div>
              <ul className="experience-bullets">
                <li>Built a multi-tenant RMS web app with role-based authentication (Admin, Tenant, Landlord) and operational modules for contracts, payments, and maintenance workflows.</li>
                <li>Built reusable UI components and custom hooks (pagination, debouncing, authentication) and shipped responsive UI with dark/light theme.</li>
                <li>Implemented document workflows including PDF generation/capture to support contracts and reporting.</li>
              </ul>
              <p className="tech-stack"><strong>Tech:</strong> Next.js, React, TypeScript, Tailwind CSS, React Query, React Hook Form, Zod, Chart.js/Recharts, jsPDF/React-PDF, PDF.js, html2canvas</p>
            </div>

            {/* Experience 4 */}
            <div className="experience-item">
              <div className="experience-header">
                <h3 className="company-name">Channakya Software Private Limited</h3>
                <span className="job-title">— Full Stack Developer</span>
                <span className="location">| Kathmandu, Nepal</span>
                <span className="date">| Oct 2022 – Nov 2023</span>
              </div>
              <ul className="experience-bullets">
                <li>Built Banking Application Admin UI with responsive React + TypeScript components and role-based screens.</li>
                <li>Developed a Nepal Tourism backend project using Node.js and MongoDB, including REST APIs and data modeling.</li>
                <li>Built Full Stack Job Portal with React and React Native frontend, Node.js backend, and MySQL database for job listings and candidate management.</li>
                <li>Developed backend APIs using Node.js; integrated MySQL/MongoDB; delivered responsive frontend features using React and TypeScript.</li>
                <li>Supported a .NET eCommerce project and performed API testing across modules.</li>
              </ul>
              <p className="tech-stack"><strong>Tech:</strong> React, React Native, TypeScript, Node.js, MongoDB, MySQL, .NET Framework</p>
            </div>

            {/* Experience 5 */}
            <div className="experience-item">
              <div className="experience-header">
                <h3 className="company-name">Islington College</h3>
                <span className="job-title">— Full Stack Developer Intern</span>
                <span className="location">| Kathmandu, Nepal</span>
                <span className="date">| Nov 2020 – Oct 2021</span>
              </div>
              <ul className="experience-bullets">
                <li>Built cross-platform mobile applications using Flutter.</li>
                <li>Developed backend services using Laravel + MySQL, including API integrations.</li>
                <li>Contributed to Android (Java) modules and worked with Oracle Database during internship rotations.</li>
              </ul>
              <p className="tech-stack"><strong>Tech:</strong> Flutter, Laravel/PHP, MySQL, Android (Java), Oracle Database</p>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="resume-section">
          <h2 className="section-title">EDUCATION</h2>
          <div className="section-content">
            <p><strong>Bachelor's Degree</strong> — London Metropolitan University (Computer Science & Technology)</p>
            <p><strong>10+2 Science</strong> — Oxford Higher Secondary School</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Resume
