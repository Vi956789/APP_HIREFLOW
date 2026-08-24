import React from 'react';
import { CandidateResumeData } from '../../../types';
import { ExternalLink } from 'lucide-react';

interface ClassicLatexTemplateProps {
  data: CandidateResumeData;
}

export const ClassicLatexTemplate: React.FC<ClassicLatexTemplateProps> = ({ data }) => {
  const personal = data.personalData || {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  };

  const skills = data.skills || { languages: [], frameworks: [], databases: [], tools: [], aiMl: [], other: [] };
  const skillCategories = [
    { label: 'Languages', items: skills.languages },
    { label: 'Frameworks & Libraries', items: skills.frameworks },
    { label: 'Databases & Storage', items: skills.databases },
    { label: 'Developer Tools', items: skills.tools },
    { label: 'AI / Machine Learning', items: skills.aiMl },
    { label: 'Core Competencies', items: skills.other },
  ].filter((cat) => Array.isArray(cat.items) && cat.items.length > 0);

  const cleanUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');

  return (
    <div
      id="resume-latex-template"
      className="bg-white text-gray-900 font-serif text-[11px] leading-[1.4] w-full p-[28px] sm:p-[36px] box-border selection:bg-amber-100"
      style={{ fontFamily: '"Times New Roman", Times, Georgia, "Liberation Serif", serif' }}
    >
      {/* Centered LaTeX Header */}
      <header className="text-center pb-2 mb-2">
        <h1 className="text-2xl font-bold tracking-normal text-gray-950 capitalize">
          {personal.fullName || 'Your Full Name'}
        </h1>
        {personal.professionalTitle && (
          <p className="text-[12px] italic text-gray-800 mt-0.5 font-normal">
            {personal.professionalTitle}
          </p>
        )}

        {/* Contact info row */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-gray-700 mt-1">
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="hover:underline text-gray-900">
              {personal.email}
            </a>
          )}
          {personal.phone && (
            <>
              <span className="text-gray-400">|</span>
              <span>{personal.phone}</span>
            </>
          )}
          {personal.location && (
            <>
              <span className="text-gray-400">|</span>
              <span>{personal.location}</span>
            </>
          )}
          {personal.linkedin && (
            <>
              <span className="text-gray-400">|</span>
              <a
                href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-gray-900 font-medium"
              >
                {cleanUrl(personal.linkedin)}
              </a>
            </>
          )}
          {personal.github && (
            <>
              <span className="text-gray-400">|</span>
              <a
                href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-gray-900"
              >
                {cleanUrl(personal.github)}
              </a>
            </>
          )}
          {personal.portfolio && (
            <>
              <span className="text-gray-400">|</span>
              <a
                href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-gray-900"
              >
                {cleanUrl(personal.portfolio)}
              </a>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && data.summary.trim() && (
        <section className="mb-3">
          <div className="border-b border-gray-800 pb-0.5 mb-1.5">
            <h2 className="text-[11.5px] font-bold tracking-wide text-gray-950 uppercase">
              Summary
            </h2>
          </div>
          <p className="text-[10.5px] text-gray-800 leading-relaxed text-justify">
            {data.summary}
          </p>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-3">
          <div className="border-b border-gray-800 pb-0.5 mb-1.5">
            <h2 className="text-[11.5px] font-bold tracking-wide text-gray-950 uppercase">
              Education
            </h2>
          </div>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[11px] text-gray-950">{edu.institution || 'University'}</span>
                  {edu.location && <span className="text-[10.5px] text-gray-800 italic">{edu.location}</span>}
                </div>
                <div className="flex justify-between items-baseline text-[10.5px] text-gray-800">
                  <span className="italic">{[edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ')}</span>
                  <span className="text-[10px] text-gray-700 whitespace-nowrap">
                    {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                {(edu.grade || edu.details) && (
                  <p className="text-[10px] text-gray-700 mt-0.5">
                    {[edu.grade ? `CGPA: ${edu.grade}` : '', edu.details].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-3">
          <div className="border-b border-gray-800 pb-0.5 mb-1.5">
            <h2 className="text-[11.5px] font-bold tracking-wide text-gray-950 uppercase">
              Experience
            </h2>
          </div>
          <div className="space-y-2.5">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[11px] text-gray-950">{exp.company || 'Company'}</span>
                  {exp.location && <span className="text-[10.5px] text-gray-800 italic">{exp.location}</span>}
                </div>
                <div className="flex justify-between items-baseline text-[10.5px] text-gray-800 mb-0.5">
                  <span className="italic">{exp.role || 'Role'}</span>
                  <span className="text-[10px] text-gray-700 whitespace-nowrap">
                    {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-gray-800">
                    {exp.bullets.filter(b => b && b.trim()).map((b, i) => (
                      <li key={i} className="pl-0.5 leading-relaxed">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-3">
          <div className="border-b border-gray-800 pb-0.5 mb-1.5">
            <h2 className="text-[11.5px] font-bold tracking-wide text-gray-950 uppercase">
              Projects
            </h2>
          </div>
          <div className="space-y-2">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-bold text-[11px] text-gray-950">{proj.name}</span>
                    {proj.technologies && (
                      <span className="text-[10px] text-gray-700 italic">
                        | {proj.technologies}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[9.5px] text-gray-700">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center gap-0.5 text-gray-900 font-medium"
                      >
                        [Code <ExternalLink className="w-2.5 h-2.5 inline" />]
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center gap-0.5 text-gray-900 font-medium"
                      >
                        [Demo <ExternalLink className="w-2.5 h-2.5 inline" />]
                      </a>
                    )}
                  </div>
                </div>
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-gray-800 mt-0.5">
                    {proj.bullets.filter(b => b && b.trim()).map((b, i) => (
                      <li key={i} className="pl-0.5 leading-relaxed">{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {skillCategories.length > 0 && (
        <section className="mb-3">
          <div className="border-b border-gray-800 pb-0.5 mb-1.5">
            <h2 className="text-[11.5px] font-bold tracking-wide text-gray-950 uppercase">
              Technical Skills
            </h2>
          </div>
          <div className="space-y-0.5 text-[10.5px]">
            {skillCategories.map((cat, i) => (
              <div key={i} className="flex items-baseline">
                <span className="font-bold text-gray-950 mr-1.5">{cat.label}:</span>
                <span className="text-gray-800">{cat.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-3">
          <div className="border-b border-gray-800 pb-0.5 mb-1.5">
            <h2 className="text-[11.5px] font-bold tracking-wide text-gray-950 uppercase">
              Certifications
            </h2>
          </div>
          <div className="space-y-1">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline text-[10.5px]">
                <div>
                  <span className="font-bold text-gray-950">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-800"> – {cert.issuer}</span>}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl.startsWith('http') ? cert.credentialUrl : `https://${cert.credentialUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-gray-700 hover:underline text-[9.5px]"
                    >
                      [Verify]
                    </a>
                  )}
                </div>
                {cert.date && <span className="text-[10px] text-gray-700 whitespace-nowrap">{cert.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section>
          <div className="border-b border-gray-800 pb-0.5 mb-1.5">
            <h2 className="text-[11.5px] font-bold tracking-wide text-gray-950 uppercase">
              Achievements & Honors
            </h2>
          </div>
          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-gray-800">
            {data.achievements.filter(a => a && a.text && a.text.trim()).map((ach) => (
              <li key={ach.id} className="pl-0.5 leading-relaxed">{ach.text}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
