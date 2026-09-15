// [Layer: LANDING_PAGE/Features/Pages/ContactMe]
// ContactMe.tsx -- Route entry page for public inquiries and contact desk.
// Route-level composition ONLY -- no business logic.
// DO NOT put direct fetch/axios calls here.
import { FC } from 'react';
import ContactForm from './Components/ContactForm';

const ContactMe: FC = () => {
  return (
    <div className="pt-16">
      <ContactForm />
    </div>
  );
};

export default ContactMe;
