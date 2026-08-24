import React from 'react';
import { CandidateResumeData } from '../../../types';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

interface GoogleProfessionalTemplateProps {
  data: CandidateResumeData;
}

export const GoogleProfessionalTemplate: React.FC<GoogleProfessionalTemplateProps> = ({ data }) => {
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
    { label: 'Tools & DevOps', items: skills.tools },
    { label: 'AI & Data Science', items: skills.aiMl },
    { label: 'Other Skills', items: skills.other },
  ].filter((cat) => Array.isArray(cat.items) && cat.items.length > 0);

  const cleanUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');

  return (
    <div
      id="resume-google-template"
      className="bg-white text-gray-900 font-sans text-[11px] leading-[1.45] w-full p-[28px] sm:p-[36px] box-border selection:bg-blue-100"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Header */}
      <header className="border-b border-gray-300 pb-3 mb-3">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase">
          {personal.fullName || 'Your Full Name'}
        </h1>
        {personal.professionalTitle && (
          <p className="text-[13px] font-medium text-gray-700 mt-0.5">
            {personal.professionalTitle}
          </p>
        )}

        {/* Contact info row */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] text-gray-600 mt-2">
          {personal.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3 h-3 text-gray-400" />
              <a href={`mailto:${personal.email}`} className="hover:underline text-gray-700">
                {personal.email}
              </a>
            </span>
          )}

          {personal.phone && (
            <span className="inline-flex items-center gap-1">
              <span className="text-gray-300">•</span>
              <Phone className="w-3 h-3 text-gray-400" />
              <span>{personal.phone}</span>
            </span>
          )}

          {personal.location && (
            <span className="inline-flex items-center gap-1">
              <span className="text-gray-300">•</span>
              <MapPin className="w-3 h-3 text-gray-400" />
              <span>{personal.location}</span>
            </span>
          )}

          {personal.linkedin && (
            <span className="inline-flex items-center gap-1">
              <span className="text-gray-300">•</span>
              <Linkedin className="w-3 h-3 text-gray-400" />
              <a
                href={personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-blue-700 font-medium inline-flex items-center gap-0.5"
              >
                {cleanUrl(personal.linkedin)}
              </a>
            </span>
          )}

          {personal.github && (
            <span className="inline-flex items-center gap-1">
              <span className="text-gray-300">•</span>
              <Github className="w-3 h-3 text-gray-400" />
              <a
                href={personal.github.startsWith('http') ? personal.github : `https://${personal.github}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-gray-800 inline-flex items-center gap-0.5"
              >
                {cleanUrl(personal.github)}
              </a>
            </span>
          )}

          {personal.portfolio && (
            <span className="inline-flex items-center gap-1">
              <span className="text-gray-300">•</span>
              <Globe className="w-3 h-3 text-gray-400" />
              <a
                href={personal.portfolio.startsWith('http') ? personal.portfolio : `https://${personal.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-blue-700 inline-flex items-center gap-0.5"
              >
                {cleanUrl(personal.portfolio)}
              </a>
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && data.summary.trim() && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold tracking-wider text-gray-900 uppercase border-b border-gray-200 pb-0.5 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-[11px] text-gray-700 leading-relaxed text-justify">
            {data.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold tracking-wider text-gray-900 uppercase border-b border-gray-200 pb-0.5 mb-2">
            Experience
          </h2>
          <div className="space-y-2.5">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[11.5px] text-gray-900">{exp.role || 'Role'}</span>
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-gray-700 text-[10.5px] mb-1">
                  <span className="font-medium text-gray-800">{exp.company || 'Company'}</span>
                  {exp.location && <span className="text-gray-500 text-[10px]">{exp.location}</span>}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-gray-700">
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
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold tracking-wider text-gray-900 uppercase border-b border-gray-200 pb-0.5 mb-2">
            Projects
          </h2>
          <div className="space-y-2">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-bold text-[11px] text-gray-900">{proj.name}</span>
                    {proj.technologies && (
                      <span className="text-[10px] text-gray-500 italic">
                        | {proj.technologies}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-blue-700">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center gap-0.5"
                      >
                        Code <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center gap-0.5"
                      >
                        Live Demo <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-gray-700 mt-0.5">
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

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold tracking-wider text-gray-900 uppercase border-b border-gray-200 pb-0.5 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[11px] text-gray-900">{edu.institution || 'University'}</span>
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[10.5px] text-gray-700">
                  <span>{[edu.degree, edu.fieldOfStudy].filter(Boolean).join(', ')}</span>
                  {edu.location && <span className="text-gray-500 text-[10px]">{edu.location}</span>}
                </div>
                {(edu.grade || edu.details) && (
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {[edu.grade ? `Grade/CGPA: ${edu.grade}` : '', edu.details].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skillCategories.length > 0 && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold tracking-wider text-gray-900 uppercase border-b border-gray-200 pb-0.5 mb-1.5">
            Technical Skills
          </h2>
          <div className="space-y-1 text-[10.5px]">
            {skillCategories.map((cat, i) => (
              <div key={i} className="flex items-baseline">
                <span className="font-semibold text-gray-900 w-36 shrink-0">{cat.label}:</span>
                <span className="text-gray-700">{cat.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold tracking-wider text-gray-900 uppercase border-b border-gray-200 pb-0.5 mb-1.5">
            Certifications
          </h2>
          <div className="space-y-1">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline text-[10.5px]">
                <div>
                  <span className="font-semibold text-gray-900">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-600"> – {cert.issuer}</span>}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl.startsWith('http') ? cert.credentialUrl : `https://${cert.credentialUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-blue-700 hover:underline text-[9.5px] inline-flex items-center gap-0.5"
                    >
                      Verify <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                {cert.date && <span className="text-[10px] text-gray-500 whitespace-nowrap">{cert.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section>
          <h2 className="text-[11px] font-bold tracking-wider text-gray-900 uppercase border-b border-gray-200 pb-0.5 mb-1.5">
            Achievements & Awards
          </h2>
          <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-gray-700">
            {data.achievements.filter(a => a && a.text && a.text.trim()).map((ach) => (
              <li key={ach.id} className="pl-0.5 leading-relaxed">{ach.text}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
