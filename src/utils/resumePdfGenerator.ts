import { jsPDF } from 'jspdf';
import { CandidateResumeData, ResumeTemplateType } from '../types';

export function generateResumePdf(
  resume: CandidateResumeData,
  template: ResumeTemplateType = 'google'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210mm x 297mm
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const marginTop = 16;
  const marginBottom = 16;
  const contentWidth = pageWidth - marginX * 2;
  const maxY = pageHeight - marginBottom;

  let currentY = marginTop;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > maxY) {
      doc.addPage();
      currentY = marginTop;
    }
  };

  const personal = resume.personalData || {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  };

  if (template === 'latex') {
    // ==========================================
    // CLASSIC LATEX / OVERLEAF TEMPLATE
    // ==========================================
    doc.setFont('times', 'normal');
    doc.setTextColor(20, 20, 20);

    // 1. Header (Centered)
    const name = (personal.fullName || 'YOUR NAME').trim();
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    const nameWidth = doc.getTextWidth(name);
    doc.text(name, (pageWidth - nameWidth) / 2, currentY);
    currentY += 5.5;

    // Contact line
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    const contactParts: { text: string; link?: string }[] = [];
    if (personal.email) contactParts.push({ text: personal.email, link: `mailto:${personal.email}` });
    if (personal.phone) contactParts.push({ text: personal.phone });
    if (personal.linkedin) {
      const cleanLi = personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '');
      contactParts.push({ text: `linkedin.com/in/${cleanLi}`, link: personal.linkedin });
    }
    if (personal.github) {
      const cleanGh = personal.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '');
      contactParts.push({ text: `github.com/${cleanGh}`, link: personal.github });
    }
    if (personal.portfolio) {
      const cleanPf = personal.portfolio.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
      contactParts.push({ text: cleanPf, link: personal.portfolio });
    }
    if (personal.location) contactParts.push({ text: personal.location });

    const contactStr = contactParts.map((c) => c.text).join('  |  ');
    const contactWidth = doc.getTextWidth(contactStr);
    const contactStartX = Math.max(marginX, (pageWidth - contactWidth) / 2);
    
    // Draw contact string
    doc.text(contactStr, contactStartX, currentY);
    currentY += 6;

    // Section drawer helper for LaTeX
    const drawLatexSectionHeader = (title: string) => {
      checkPageBreak(12);
      currentY += 1.5;
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.text(title.toUpperCase(), marginX, currentY);
      currentY += 1.5;
      doc.setDrawColor(40, 40, 40);
      doc.setLineWidth(0.3);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);
      currentY += 4;
    };

    // Summary Section
    if (resume.summary && resume.summary.trim()) {
      drawLatexSectionHeader('Professional Summary');
      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      const summaryLines = doc.splitTextToSize(resume.summary.trim(), contentWidth);
      checkPageBreak(summaryLines.length * 4.2);
      doc.text(summaryLines, marginX, currentY);
      currentY += summaryLines.length * 4.2 + 2;
    }

    // Education Section
    if (resume.education && resume.education.length > 0) {
      drawLatexSectionHeader('Education');
      for (const edu of resume.education) {
        if (!edu.institution && !edu.degree) continue;
        checkPageBreak(10);
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text(edu.institution || 'University', marginX, currentY);

        const eduLocation = edu.location || '';
        if (eduLocation) {
          const locWidth = doc.getTextWidth(eduLocation);
          doc.setFont('times', 'normal');
          doc.text(eduLocation, pageWidth - marginX - locWidth, currentY);
        }
        currentY += 4;

        doc.setFont('times', 'italic');
        doc.setFontSize(9.5);
        const degreeField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
        doc.text(degreeField || 'Degree Program', marginX, currentY);

        const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
        if (dateStr) {
          const dateWidth = doc.getTextWidth(dateStr);
          doc.setFont('times', 'normal');
          doc.text(dateStr, pageWidth - marginX - dateWidth, currentY);
        }
        currentY += 3.8;

        if (edu.grade || edu.details) {
          doc.setFont('times', 'normal');
          doc.setFontSize(9);
          const extra = [edu.grade ? `CGPA/Grade: ${edu.grade}` : '', edu.details].filter(Boolean).join(' • ');
          const extraLines = doc.splitTextToSize(extra, contentWidth - 4);
          doc.text(extraLines, marginX + 3, currentY);
          currentY += extraLines.length * 3.8;
        }
        currentY += 1.5;
      }
    }

    // Experience Section
    if (resume.experience && resume.experience.length > 0) {
      drawLatexSectionHeader('Experience');
      for (const exp of resume.experience) {
        if (!exp.company && !exp.role) continue;
        checkPageBreak(12);

        // Row 1: Company + Location
        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        doc.text(exp.company || 'Company', marginX, currentY);

        if (exp.location) {
          doc.setFont('times', 'normal');
          const locWidth = doc.getTextWidth(exp.location);
          doc.text(exp.location, pageWidth - marginX - locWidth, currentY);
        }
        currentY += 4;

        // Row 2: Role + Dates
        doc.setFont('times', 'italic');
        doc.setFontSize(9.5);
        doc.text(exp.role || 'Role', marginX, currentY);

        const dateStr = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
        if (dateStr) {
          doc.setFont('times', 'normal');
          const dateWidth = doc.getTextWidth(dateStr);
          doc.text(dateStr, pageWidth - marginX - dateWidth, currentY);
        }
        currentY += 4;

        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          doc.setFont('times', 'normal');
          doc.setFontSize(9.2);
          for (const bullet of exp.bullets) {
            if (!bullet || !bullet.trim()) continue;
            const bulletLines = doc.splitTextToSize(bullet.trim(), contentWidth - 5);
            checkPageBreak(bulletLines.length * 3.8 + 1);
            doc.text('•', marginX + 1, currentY);
            doc.text(bulletLines, marginX + 5, currentY);
            currentY += bulletLines.length * 3.8 + 0.8;
          }
        }
        currentY += 2;
      }
    }

    // Projects Section
    if (resume.projects && resume.projects.length > 0) {
      drawLatexSectionHeader('Projects');
      for (const proj of resume.projects) {
        if (!proj.name) continue;
        checkPageBreak(10);

        doc.setFont('times', 'bold');
        doc.setFontSize(10);
        const nameText = proj.name.trim();
        doc.text(nameText, marginX, currentY);
        let projHeaderOffset = doc.getTextWidth(nameText) + 2;

        if (proj.technologies) {
          doc.setFont('times', 'italic');
          doc.setFontSize(9);
          const techText = `| ${proj.technologies.trim()}`;
          doc.text(techText, marginX + projHeaderOffset, currentY);
        }

        // Links on right
        const links: string[] = [];
        if (proj.githubUrl) links.push('GitHub');
        if (proj.liveUrl) links.push('Live Demo');
        if (links.length > 0) {
          doc.setFont('times', 'normal');
          doc.setFontSize(8.5);
          const linksStr = links.join(' | ');
          const linksWidth = doc.getTextWidth(linksStr);
          doc.text(linksStr, pageWidth - marginX - linksWidth, currentY);
        }
        currentY += 4;

        // Bullets
        if (proj.bullets && proj.bullets.length > 0) {
          doc.setFont('times', 'normal');
          doc.setFontSize(9.2);
          for (const bullet of proj.bullets) {
            if (!bullet || !bullet.trim()) continue;
            const bulletLines = doc.splitTextToSize(bullet.trim(), contentWidth - 5);
            checkPageBreak(bulletLines.length * 3.8 + 1);
            doc.text('•', marginX + 1, currentY);
            doc.text(bulletLines, marginX + 5, currentY);
            currentY += bulletLines.length * 3.8 + 0.8;
          }
        }
        currentY += 2;
      }
    }

    // Technical Skills Section
    const skills = resume.skills || { languages: [], frameworks: [], databases: [], tools: [], aiMl: [], other: [] };
    const skillCategories = [
      { label: 'Languages', items: skills.languages },
      { label: 'Frameworks', items: skills.frameworks },
      { label: 'Databases', items: skills.databases },
      { label: 'Tools & DevOps', items: skills.tools },
      { label: 'AI & Machine Learning', items: skills.aiMl },
      { label: 'Other Skills', items: skills.other },
    ].filter((cat) => Array.isArray(cat.items) && cat.items.length > 0);

    if (skillCategories.length > 0) {
      drawLatexSectionHeader('Technical Skills');
      doc.setFontSize(9.2);
      for (const cat of skillCategories) {
        checkPageBreak(5);
        doc.setFont('times', 'bold');
        const catLabel = `${cat.label}: `;
        doc.text(catLabel, marginX, currentY);
        const labelWidth = doc.getTextWidth(catLabel);

        doc.setFont('times', 'normal');
        const itemsStr = cat.items.join(', ');
        const itemLines = doc.splitTextToSize(itemsStr, contentWidth - labelWidth);
        doc.text(itemLines, marginX + labelWidth, currentY);
        currentY += itemLines.length * 4.0;
      }
      currentY += 1.5;
    }

    // Certifications Section
    if (resume.certifications && resume.certifications.length > 0) {
      drawLatexSectionHeader('Certifications');
      doc.setFontSize(9.2);
      for (const cert of resume.certifications) {
        if (!cert.name) continue;
        checkPageBreak(5);
        doc.setFont('times', 'bold');
        doc.text(cert.name, marginX, currentY);
        const nameWidth = doc.getTextWidth(cert.name);

        doc.setFont('times', 'normal');
        const issuerPart = cert.issuer ? ` – ${cert.issuer}` : '';
        doc.text(issuerPart, marginX + nameWidth, currentY);

        if (cert.date) {
          const dateWidth = doc.getTextWidth(cert.date);
          doc.text(cert.date, pageWidth - marginX - dateWidth, currentY);
        }
        currentY += 4.0;
      }
      currentY += 1.5;
    }

    // Achievements Section
    if (resume.achievements && resume.achievements.length > 0) {
      drawLatexSectionHeader('Achievements & Honors');
      doc.setFont('times', 'normal');
      doc.setFontSize(9.2);
      for (const ach of resume.achievements) {
        if (!ach.text || !ach.text.trim()) continue;
        const achLines = doc.splitTextToSize(ach.text.trim(), contentWidth - 5);
        checkPageBreak(achLines.length * 3.8 + 1);
        doc.text('•', marginX + 1, currentY);
        doc.text(achLines, marginX + 5, currentY);
        currentY += achLines.length * 3.8 + 0.8;
      }
    }

  } else {
    // ==========================================
    // GOOGLE PROFESSIONAL TEMPLATE
    // ==========================================
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);

    // 1. Header (Clean Left-Aligned or High-Contrast Centered)
    const name = (personal.fullName || 'YOUR NAME').toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(name, marginX, currentY);
    currentY += 5.5;

    if (personal.professionalTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(75, 85, 99);
      doc.text(personal.professionalTitle, marginX, currentY);
      currentY += 5;
    }

    // Contact line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    const contactParts: string[] = [];
    if (personal.email) contactParts.push(personal.email);
    if (personal.phone) contactParts.push(personal.phone);
    if (personal.location) contactParts.push(personal.location);
    if (personal.linkedin) {
      const cleanLi = personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '');
      contactParts.push(`linkedin.com/in/${cleanLi}`);
    }
    if (personal.github) {
      const cleanGh = personal.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '');
      contactParts.push(`github.com/${cleanGh}`);
    }
    if (personal.portfolio) {
      const cleanPf = personal.portfolio.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
      contactParts.push(cleanPf);
    }

    const contactStr = contactParts.join('  •  ');
    doc.text(contactStr, marginX, currentY);
    currentY += 6;

    // Section drawer helper for Google Professional
    const drawGoogleSectionHeader = (title: string) => {
      checkPageBreak(14);
      currentY += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(17, 24, 39);
      doc.text(title.toUpperCase(), marginX, currentY);
      currentY += 1.8;
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.4);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);
      currentY += 4.5;
    };

    // Summary Section
    if (resume.summary && resume.summary.trim()) {
      drawGoogleSectionHeader('Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(31, 41, 55);
      const summaryLines = doc.splitTextToSize(resume.summary.trim(), contentWidth);
      checkPageBreak(summaryLines.length * 4.4);
      doc.text(summaryLines, marginX, currentY);
      currentY += summaryLines.length * 4.4 + 2;
    }

    // Experience Section
    if (resume.experience && resume.experience.length > 0) {
      drawGoogleSectionHeader('Experience');
      for (const exp of resume.experience) {
        if (!exp.company && !exp.role) continue;
        checkPageBreak(12);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(exp.role || 'Role', marginX, currentY);

        const dateStr = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
        if (dateStr) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(75, 85, 99);
          const dateWidth = doc.getTextWidth(dateStr);
          doc.text(dateStr, pageWidth - marginX - dateWidth, currentY);
        }
        currentY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(55, 65, 81);
        const compLoc = [exp.company, exp.location].filter(Boolean).join(' | ');
        doc.text(compLoc || 'Company', marginX, currentY);
        currentY += 4;

        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          doc.setFontSize(9.2);
          doc.setTextColor(31, 41, 55);
          for (const bullet of exp.bullets) {
            if (!bullet || !bullet.trim()) continue;
            const bulletLines = doc.splitTextToSize(bullet.trim(), contentWidth - 5);
            checkPageBreak(bulletLines.length * 4.0 + 1);
            doc.text('•', marginX + 1, currentY);
            doc.text(bulletLines, marginX + 5, currentY);
            currentY += bulletLines.length * 4.0 + 0.8;
          }
        }
        currentY += 2;
      }
    }

    // Projects Section
    if (resume.projects && resume.projects.length > 0) {
      drawGoogleSectionHeader('Projects');
      for (const proj of resume.projects) {
        if (!proj.name) continue;
        checkPageBreak(10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(proj.name.trim(), marginX, currentY);

        const links: string[] = [];
        if (proj.githubUrl) links.push('GitHub');
        if (proj.liveUrl) links.push('Live');
        if (links.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(37, 99, 235);
          const linksStr = links.join(' • ');
          const linksWidth = doc.getTextWidth(linksStr);
          doc.text(linksStr, pageWidth - marginX - linksWidth, currentY);
        }
        currentY += 4;

        if (proj.technologies) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(75, 85, 99);
          doc.text(proj.technologies.trim(), marginX, currentY);
          currentY += 4;
        }

        // Bullets
        if (proj.bullets && proj.bullets.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.2);
          doc.setTextColor(31, 41, 55);
          for (const bullet of proj.bullets) {
            if (!bullet || !bullet.trim()) continue;
            const bulletLines = doc.splitTextToSize(bullet.trim(), contentWidth - 5);
            checkPageBreak(bulletLines.length * 4.0 + 1);
            doc.text('•', marginX + 1, currentY);
            doc.text(bulletLines, marginX + 5, currentY);
            currentY += bulletLines.length * 4.0 + 0.8;
          }
        }
        currentY += 2;
      }
    }

    // Education Section
    if (resume.education && resume.education.length > 0) {
      drawGoogleSectionHeader('Education');
      for (const edu of resume.education) {
        if (!edu.institution && !edu.degree) continue;
        checkPageBreak(10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(edu.institution || 'University', marginX, currentY);

        const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
        if (dateStr) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(75, 85, 99);
          const dateWidth = doc.getTextWidth(dateStr);
          doc.text(dateStr, pageWidth - marginX - dateWidth, currentY);
        }
        currentY += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(55, 65, 81);
        const degreeField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ');
        doc.text(degreeField || 'Degree Program', marginX, currentY);
        currentY += 3.8;

        if (edu.grade || edu.details) {
          doc.setFontSize(9);
          doc.setTextColor(107, 114, 128);
          const extra = [edu.grade ? `Grade/CGPA: ${edu.grade}` : '', edu.details].filter(Boolean).join(' • ');
          doc.text(extra, marginX, currentY);
          currentY += 3.8;
        }
        currentY += 1.5;
      }
    }

    // Skills Section
    const skills = resume.skills || { languages: [], frameworks: [], databases: [], tools: [], aiMl: [], other: [] };
    const skillCategories = [
      { label: 'Languages', items: skills.languages },
      { label: 'Frameworks & Libraries', items: skills.frameworks },
      { label: 'Databases & Storage', items: skills.databases },
      { label: 'Tools & Platforms', items: skills.tools },
      { label: 'AI & Data Engineering', items: skills.aiMl },
      { label: 'Other Competencies', items: skills.other },
    ].filter((cat) => Array.isArray(cat.items) && cat.items.length > 0);

    if (skillCategories.length > 0) {
      drawGoogleSectionHeader('Skills');
      doc.setFontSize(9.2);
      for (const cat of skillCategories) {
        checkPageBreak(5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        const catLabel = `${cat.label}: `;
        doc.text(catLabel, marginX, currentY);
        const labelWidth = doc.getTextWidth(catLabel);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        const itemsStr = cat.items.join(', ');
        const itemLines = doc.splitTextToSize(itemsStr, contentWidth - labelWidth);
        doc.text(itemLines, marginX + labelWidth, currentY);
        currentY += itemLines.length * 4.2;
      }
      currentY += 1.5;
    }

    // Certifications Section
    if (resume.certifications && resume.certifications.length > 0) {
      drawGoogleSectionHeader('Certifications');
      doc.setFontSize(9.2);
      for (const cert of resume.certifications) {
        if (!cert.name) continue;
        checkPageBreak(5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(cert.name, marginX, currentY);
        const nameWidth = doc.getTextWidth(cert.name);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        const issuerPart = cert.issuer ? ` – ${cert.issuer}` : '';
        doc.text(issuerPart, marginX + nameWidth, currentY);

        if (cert.date) {
          const dateWidth = doc.getTextWidth(cert.date);
          doc.text(cert.date, pageWidth - marginX - dateWidth, currentY);
        }
        currentY += 4.2;
      }
      currentY += 1.5;
    }

    // Achievements Section
    if (resume.achievements && resume.achievements.length > 0) {
      drawGoogleSectionHeader('Achievements');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.2);
      doc.setTextColor(31, 41, 55);
      for (const ach of resume.achievements) {
        if (!ach.text || !ach.text.trim()) continue;
        const achLines = doc.splitTextToSize(ach.text.trim(), contentWidth - 5);
        checkPageBreak(achLines.length * 4.0 + 1);
        doc.text('•', marginX + 1, currentY);
        doc.text(achLines, marginX + 5, currentY);
        currentY += achLines.length * 4.0 + 0.8;
      }
    }
  }

  return doc;
}

export function downloadResumeAsPdf(
  resume: CandidateResumeData,
  template: ResumeTemplateType = 'google'
) {
  const doc = generateResumePdf(resume, template);
  const rawName = (resume.personalData?.fullName || '').trim() || 'Candidate';
  const cleanName = rawName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  
  const rawTitle = (resume.title || '').trim();
  const cleanTitle = rawTitle && rawTitle !== 'My Resume'
    ? rawTitle.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
    : '';

  const templateLabel = template === 'latex' ? 'LaTeX' : 'Google';
  const parts = [cleanName, cleanTitle, templateLabel, 'Resume'].filter(Boolean);
  const filename = `${parts.join('_')}.pdf`;

  doc.save(filename);
}
