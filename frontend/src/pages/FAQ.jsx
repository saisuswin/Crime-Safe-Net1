import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import './FAQ.css';

export function FAQ() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqs = [
    {
      id: 1,
      question: 'How do I report a crime?',
      answer: 'To report a crime, log in to your citizen account and navigate to "Report Crime". Fill in the required information including the crime type, location, and detailed description. Submit the form, and your report will be reviewed by law enforcement.'
    },
    {
      id: 2,
      question: 'Is my report confidential?',
      answer: 'Yes, all reports are treated with the utmost confidentiality. Your personal information is protected and only accessible to authorized law enforcement personnel. We never share your details with third parties without your consent.'
    },
    {
      id: 3,
      question: 'How can I track my report status?',
      answer: 'After submitting a report, go to "My Reports" in your citizen dashboard. You can view the status of all your submitted reports, from "Reported" to "Under Investigation" to "Resolved".'
    },
    {
      id: 4,
      question: 'What should I include in my crime report?',
      answer: 'Include as much detail as possible: the exact location, date and time of the incident, a description of what happened, any persons involved, vehicles involved, and any other relevant information that might help with the investigation.'
    },
    {
      id: 5,
      question: 'Is there an emergency hotline?',
      answer: 'For emergencies, always call 911 immediately. CrimeSafeNet is designed for non-emergency crime reporting and should not delay emergency calls for serious incidents in progress.'
    },
    {
      id: 6,
      question: 'Can I edit my report after submission?',
      answer: 'You can view your submitted reports and contact law enforcement to add additional information. Updates should be made within 24 hours of the initial report for best results.'
    },
    {
      id: 7,
      question: 'How is the crime map data used?',
      answer: 'The crime map visualization helps law enforcement identify patterns and allocate resources more effectively. It also helps citizens stay informed about safety in their neighborhoods. Only aggregated, anonymized data is displayed.'
    },
    {
      id: 8,
      question: 'What happens after I report a crime?',
      answer: 'Your report is immediately reviewed by law enforcement. They will assess the urgency and severity, then begin their investigation. You will receive updates on the status of your case through your dashboard.'
    }
  ];

  return (
    <div className="faq-container">
      <div className="faq-header">
        <HelpCircle size={40} />
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about CrimeSafeNet</p>
      </div>

      <div className="faq-content">
        <div className="faq-list">
          {faqs.map(faq => (
            <div key={faq.id} className="faq-item">
              <button
                className={`faq-question ${openItems[faq.id] ? 'open' : ''}`}
                onClick={() => toggleItem(faq.id)}
              >
                <span>{faq.question}</span>
                <ChevronDown size={20} className="chevron" />
              </button>
              {openItems[faq.id] && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-sidebar">
          <div className="sidebar-card">
            <h3>🚔 Police Officers</h3>
            <p>Access the police dashboard to review and manage crime reports from your department.</p>
            <a href="/police-dashboard" className="btn btn-small">
              Go to Dashboard
            </a>
          </div>

          <div className="sidebar-card">
            <h3>🛡️ Safety Tips</h3>
            <ul className="tips-list">
              <li>Report crimes immediately</li>
              <li>Provide detailed descriptions</li>
              <li>Include witness information</li>
              <li>Document incident photos (if safe)</li>
              <li>Call 911 for emergencies</li>
            </ul>
          </div>

          <div className="sidebar-card contact">
            <h3>📞 Need Help?</h3>
            <p>Contact our support team for assistance</p>
            <div className="contact-info">
              <div><strong>Email:</strong> support@crimesafenet.com</div>
              <div><strong>Phone:</strong> 1-800-SAFE-NET</div>
              <div><strong>Hours:</strong> 24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
