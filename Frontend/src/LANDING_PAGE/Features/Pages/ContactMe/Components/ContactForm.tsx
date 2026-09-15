// [Layer: LANDING_PAGE/Features/Pages/ContactMe/Components]
// ContactForm.tsx -- Public contact form UI component.
// Renders form fields, handles local state, calls Endpoints/contactApi.ts on submit.
// DO NOT put validation business logic here -- that belongs in the backend service.
// DO NOT put direct fetch/axios calls here -- use Endpoints/contactApi.ts only.
import { FC, useState } from 'react';
import { submitContactMessage } from '../../../../../Endpoints/contactApi';

export const ContactForm: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Stack Hold & Reserve Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await submitContactMessage({ name, email, subject, message });
      if (res.success) {
        setSuccessNotice(`Thank you! Your inquiry #${res.referenceId || 'KP-INQ-482'} has been routed to the chief archivist desk.`);
        setName('');
        setEmail('');
        setMessage('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full py-space-3xl px-gutter relative bg-surface-container-low/50" id="contact">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl">
          {/* Contact Information */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="font-caption text-caption tracking-widest uppercase text-primary font-semibold">
                DESK ASSISTANCE
              </span>
              <h2 className="font-headline-2 text-headline-2 text-text-primary mt-1 mb-space-md">
                Connect with Our Archival Curators
              </h2>
              <p className="font-body text-body text-text-secondary mb-space-xl">
                Have questions regarding physical stack accessioning, special reserve requests, or inter-library academic
                loans? Visit us or drop an inquiry below.
              </p>

              <div className="space-y-space-md">
                <div className="flex items-start gap-4 p-space-md rounded-2xl bg-white/70 backdrop-blur-md shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-body-medium text-body-medium text-text-primary font-semibold">
                      Physical Location
                    </h4>
                    <p className="font-small text-small text-text-secondary">
                      Katipunan Heritage Hall, Loyola Heights, Quezon City, Philippines
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-space-md rounded-2xl bg-white/70 backdrop-blur-md shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div>
                    <h4 className="font-body-medium text-body-medium text-text-primary font-semibold">
                      Direct Inquiries
                    </h4>
                    <p className="font-small text-small text-text-secondary">
                      curator@katipuneros-library.edu.ph
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-space-md rounded-2xl bg-white/70 backdrop-blur-md shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                  <div>
                    <h4 className="font-body-medium text-body-medium text-text-primary font-semibold">
                      Reading Hours
                    </h4>
                    <p className="font-small text-small text-text-secondary">
                      Monday – Saturday: 08:00 – 20:00 PHT
                      <br />
                      Sunday: 10:00 – 16:00 PHT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-lg p-space-md rounded-2xl bg-primary text-on-primary shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-action-green text-[28px]">support_agent</span>
                <div>
                  <p className="font-caption text-caption text-white/80">Reference Desk Hotline</p>
                  <p className="font-body-medium text-body-medium font-semibold text-white">
                    +63 (2) 8981-8500 ext. 402
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white font-caption text-caption">Live</span>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-space-xl md:p-space-2xl rounded-3xl bg-white/85 backdrop-blur-xl shadow-xl">
              <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold mb-2">Send an Inquiry</h3>
              <p className="font-small text-small text-text-secondary mb-space-lg">
                Our curatorial staff responds to research reservations within 2 hours during desk hours.
              </p>

              <form className="space-y-space-md" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div>
                    <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                      Full Name
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small placeholder:text-text-secondary/50 focus:outline-none focus:bg-white shadow-inner"
                      placeholder="Dr. Sofia Morales"
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                      Institutional Email
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small placeholder:text-text-secondary/50 focus:outline-none focus:bg-white shadow-inner"
                      placeholder="smorales@university.edu"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                    Subject / Scholastic Category
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small focus:outline-none focus:bg-white shadow-inner"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option>Stack Hold &amp; Reserve Inquiry</option>
                    <option>Archival Manuscript Access</option>
                    <option>Faculty Course Reserve</option>
                    <option>General Patron Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-caption text-caption font-semibold text-text-primary mb-1">
                    Message
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-text-primary font-body text-small placeholder:text-text-secondary/50 focus:outline-none focus:bg-white shadow-inner resize-none"
                    placeholder="Please outline book titles, accession codes, or research topics you require holds for..."
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                {successNotice && (
                  <div className="p-3 rounded-xl bg-action-green/20 text-text-primary font-small text-small flex items-center gap-2">
                    <span className="material-symbols-outlined text-action-green-hover text-[20px]">
                      check_circle
                    </span>
                    <span>{successNotice}</span>
                  </div>
                )}

                <button
                  className="w-full py-3.5 px-6 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  disabled={isSubmitting}
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
