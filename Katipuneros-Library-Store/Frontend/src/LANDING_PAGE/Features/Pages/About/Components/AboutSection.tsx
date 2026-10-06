// [Layer: LANDING_PAGE/Features/Pages/About/Components]
// AboutSection.tsx -- Public Landing Page About & Institutional Heritage Section.
// Embedded directly into the landing page flow with id="about" for single-page ScrollSpy.
// DO NOT put business logic or direct API calls here.

import React, { FC } from 'react';

export const AboutSection: FC = () => {
  return (
    <section className="w-full py-space-3xl px-gutter relative bg-surface-container-low/30" id="about">
      <div className="max-w-7xl mx-auto flex flex-col gap-space-3xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-space-md">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-soft-blue text-primary font-caption text-caption uppercase tracking-wider font-semibold shadow-sm">
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            <span>Institutional Heritage &amp; Scholastic Stacks</span>
          </div>

          <h2 className="font-display-hero text-headline-1 md:text-display-hero text-text-primary tracking-tight font-extrabold leading-[1.15]">
            Preserving History, Catalyzing{' '}
            <span className="text-primary underline decoration-action-green decoration-4 underline-offset-8">
              Scholarship.
            </span>
          </h2>

          <p className="font-body-large text-body-large text-text-secondary leading-relaxed">
            Founded as the central academic repository of Jose Rizal Memorial State University (JRMSU) Katipunan Campus,
            the Katipuneros Library Store serves over 18,000 archival volumes, academic theses, government serials, and
            cutting-edge digital monographs.
          </p>
        </div>

        {/* 3 Pillars of Library Mission */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          <div className="p-space-xl rounded-3xl bg-white/80 backdrop-blur-md shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[28px]">local_library</span>
              </div>
              <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">
                Open Archival Stacks
              </h3>
              <p className="font-small text-small text-text-secondary leading-relaxed">
                Direct physical and digital access to university holdings across 18 scholastic categories, structured by
                Dewey Decimal classifications and rapid counter accession bays.
              </p>
            </div>
            <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex items-center gap-2 text-primary font-small font-semibold">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>18,000+ Cataloged Titles</span>
            </div>
          </div>

          <div className="p-space-xl rounded-3xl bg-white/80 backdrop-blur-md shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-action-green/20 text-text-primary flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
              </div>
              <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">
                Rapid Barcode Circulation
              </h3>
              <p className="font-small text-small text-text-secondary leading-relaxed">
                Streamlined desk circulation utilizing high-density optical barcodes and verified digital member passes,
                guaranteeing 10-second checkout speed and transparent ledger tracking.
              </p>
            </div>
            <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex items-center gap-2 text-primary font-small font-semibold">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Physical Staging Bays A &amp; B</span>
            </div>
          </div>

          <div className="p-space-xl rounded-3xl bg-white/80 backdrop-blur-md shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-soft-blue text-primary flex items-center justify-center mb-space-md">
                <span className="material-symbols-outlined text-[28px]">security</span>
              </div>
              <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">
                Tamper-Evident Integrity
              </h3>
              <p className="font-small text-small text-text-secondary leading-relaxed">
                Every borrowing, return, and catalog modification is recorded in our SHA-256 cryptographic audit chain,
                ensuring institutional transparency and zero data loss.
              </p>
            </div>
            <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex items-center gap-2 text-primary font-small font-semibold">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>SHA-256 Audit Trail</span>
            </div>
          </div>
        </div>

        {/* Physical Facility Architecture & Bento Circulation Limits */}
        <div className="p-space-2xl rounded-3xl bg-white/80 backdrop-blur-2xl shadow-lg border border-outline-variant/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              <div className="inline-flex items-center gap-2 text-primary font-caption text-caption uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-[18px]">apartment</span>
                <span>Facility Architecture</span>
              </div>
              <h3 className="font-headline-1 text-headline-2 md:text-headline-1 text-text-primary font-bold">
                Two Floors of Scholastic Focus
              </h3>
              <p className="font-body text-body text-text-secondary leading-relaxed">
                Katipunan Heritage Hall is designed for quiet study, rapid materials retrieval, and scholarly collaboration.
              </p>

              <div className="flex flex-col gap-space-sm mt-2">
                <div className="p-space-md rounded-2xl bg-surface-container-low/80 shadow-sm flex items-start gap-4 border border-outline-variant/10">
                  <div className="w-10 h-10 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center shrink-0">
                    1F
                  </div>
                  <div>
                    <h4 className="font-body-medium text-body-medium font-bold text-text-primary">
                      Floor 1: Main Circulation, Serials &amp; Pickup Bays
                    </h4>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Houses the Central Circulation Desk, Barcode Intake Bay-B4 and Bay A-04, Newspaper Archives,
                      Reference Collections, and Collaborative Reading Zones.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-2xl bg-surface-container-low/80 shadow-sm flex items-start gap-4 border border-outline-variant/10">
                  <div className="w-10 h-10 rounded-xl bg-action-green text-text-primary font-bold flex items-center justify-center shrink-0">
                    2F
                  </div>
                  <div>
                    <h4 className="font-body-medium text-body-medium font-bold text-text-primary">
                      Floor 2: Academic Stacks, Filipiniana &amp; Quiet Pods
                    </h4>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Houses General Stacks (Dewey 000–999), Rare Filipiniana Folios, Undergraduate Theses Repository,
                      and individual scholar carrels with power docks.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Circulation Stats Bento */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-space-md">
              <div className="p-space-lg rounded-2xl bg-white shadow-sm border border-outline-variant/15 flex flex-col justify-between">
                <span className="font-caption text-caption uppercase text-text-secondary font-semibold">Max Allowance</span>
                <div className="my-2">
                  <span className="font-display-hero text-headline-1 text-primary font-bold">4</span>
                  <span className="font-small text-text-secondary ml-1">Volumes</span>
                </div>
                <p className="font-caption text-caption text-text-secondary">Concurrent physical loans per patron.</p>
              </div>

              <div className="p-space-lg rounded-2xl bg-white shadow-sm border border-outline-variant/15 flex flex-col justify-between">
                <span className="font-caption text-caption uppercase text-text-secondary font-semibold">Reserve Quota</span>
                <div className="my-2">
                  <span className="font-display-hero text-headline-1 text-action-green-hover font-bold">5</span>
                  <span className="font-small text-text-secondary ml-1">Holds</span>
                </div>
                <p className="font-caption text-caption text-text-secondary">Active counter staging holds.</p>
              </div>

              <div className="p-space-lg rounded-2xl bg-white shadow-sm border border-outline-variant/15 flex flex-col justify-between">
                <span className="font-caption text-caption uppercase text-text-secondary font-semibold">Loan Term</span>
                <div className="my-2">
                  <span className="font-display-hero text-headline-1 text-secondary font-bold">14</span>
                  <span className="font-small text-text-secondary ml-1">Days</span>
                </div>
                <p className="font-caption text-caption text-text-secondary">Standard circulation with 7d extensions.</p>
              </div>

              <div className="p-space-lg rounded-2xl bg-white shadow-sm border border-outline-variant/15 flex flex-col justify-between">
                <span className="font-caption text-caption uppercase text-text-secondary font-semibold">Daily Late Fee</span>
                <div className="my-2">
                  <span className="font-display-hero text-headline-1 text-text-primary font-bold">₱15</span>
                  <span className="font-small text-text-secondary ml-1">/ day</span>
                </div>
                <p className="font-caption text-caption text-text-secondary">Statutory overdue rate after 1-day grace.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
