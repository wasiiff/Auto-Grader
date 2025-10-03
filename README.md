# 📘 Auto-Grader

An AI-powered assignment grading system built with **Next.js (frontend)** and **NestJS (backend)**.  
It allows teachers to create assignments, upload student submissions (PDFs), automatically extract and analyze text, evaluate quality using heuristics or **Google Gemini AI**, and export scores as CSV.

🔗 **Live Demo**: [Auto-Grader](https://auto-grader-gui.vercel.app)  

---

## 🚀 Features

- ✅ Create and manage assignments (title, min word count, mode: strict/loose).  
- ✅ Upload multiple student **PDF submissions**.  
- ✅ Auto-extract student **name & roll number** from filename or PDF content.  
- ✅ Evaluate submissions via:
  - **Gemini AI** (structured grading with remarks).
  - **Fallback heuristic model** (word count, topic relevance, structure).  
- ✅ Display each student’s **score & remarks**.  
- ✅ Export results as **CSV file** (downloadable).  
- ✅ Responsive UI with **mobile navigation (hamburger menu)**.  
- ✅ Deployed on **Vercel** with runtime-safe temporary file handling (`os.tmpdir()`).

---

## 🛠️ Tech Stack

### Frontend
- [Next.js 15 (Turbopack)](https://nextjs.org/)  
- [TailwindCSS](https://tailwindcss.com/)  
- [Lucide Icons](https://lucide.dev/)  
- [Shadcn/ui](https://ui.shadcn.com/)  

### Backend
- [NestJS](https://nestjs.com/)  
- [Mongoose](https://mongoosejs.com/) (MongoDB ODM)  
- [Multer](https://github.com/expressjs/multer) for PDF uploads  
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) for text extraction  
- [csv-writer](https://www.npmjs.com/package/csv-writer) for CSV export  
- [Gemini API](https://ai.google.dev/) integration  

---

## ⚙️ Installation & Setup

### 1. Clone Repo
```bash
git clone https://github.com/your-username/auto-grader.git
cd auto-grader
