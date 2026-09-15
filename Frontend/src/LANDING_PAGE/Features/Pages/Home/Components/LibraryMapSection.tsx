// [Layer: LANDING_PAGE/Features/Pages/Home/Components]
// LibraryMapSection.tsx -- Library location, maps embed, reading hours, and direct access information.
// DO NOT put business logic or API calls here.
import { FC } from 'react';

export const LibraryMapSection: FC = () => {
  return (
    <section className="w-full py-space-3xl px-gutter relative bg-surface-container-low/40" id="location">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <span className="font-caption text-caption tracking-widest uppercase text-primary font-semibold">
            CAMPUS LOCATION &amp; HOURS
          </span>
          <h2 className="font-headline-2 text-headline-2 text-text-primary mt-1 mb-space-sm">
            Visit the Katipuneros Library Center
          </h2>
          <p className="font-body text-body text-text-secondary">
            Conveniently situated in the main academic quadrangle of JRMSU Katipunan Campus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-stretch">
          {/* Map Embed Container */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-lg border border-outline-variant/30 min-h-[380px] bg-secondary-container">
            <iframe
              title="JRMSU Katipunan Campus Library Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3947.518621415053!2d123.28420657579695!3d8.511993491530263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32545bfad7ba2fbd%3A0xe54c7d0d3bf49aa2!2sJose%20Rizal%20Memorial%20State%20University%20-%20Katipunan%20Campus!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Guidelines & Hours Box */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-space-md p-space-xl rounded-3xl bg-white/80 backdrop-blur-md shadow-md border border-outline-variant/20">
            <div>
              <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-space-md">
                Circulation &amp; Reading Room Access
              </h3>
              <div className="space-y-space-md">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">location_on</span>
                  <div>
                    <span className="font-body-medium text-body-medium font-semibold text-text-primary block">
                      Main Campus Address
                    </span>
                    <span className="font-small text-small text-text-secondary">
                      Katipunan Heritage Hall, JRMSU Katipunan Campus, Zamboanga del Norte
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">schedule</span>
                  <div>
                    <span className="font-body-medium text-body-medium font-semibold text-text-primary block">
                      Operating Schedule
                    </span>
                    <span className="font-small text-small text-text-secondary block">
                      Mon – Fri: 7:30 AM – 8:00 PM (Continuous Desk)
                    </span>
                    <span className="font-small text-small text-text-secondary block">
                      Saturday: 8:00 AM – 5:00 PM
                    </span>
                    <span className="font-small text-small text-text-secondary block">
                      Sunday: Closed for Stack Maintenance
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-action-green text-xl mt-0.5">verified_user</span>
                  <div>
                    <span className="font-body-medium text-body-medium font-semibold text-text-primary block">
                      Entry Requirements
                    </span>
                    <span className="font-small text-small text-text-secondary">
                      Validated student/faculty RFID or Visitor Pass. Physical hold pickup vouchers require student badge.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-soft-blue/60 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-primary block">
                  Reference Desk Hotline
                </span>
                <span className="font-body-medium text-body-medium font-bold text-text-primary">
                  +63 (2) 8981-8500 ext. 402
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-action-green text-text-primary font-caption text-caption font-bold">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LibraryMapSection;
