import React from 'react';
import { DEVELOPER_INFO } from '../config/constants';
import { Mail, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Tentang Pengembang</h2>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-48 h-48 rounded-full overflow-hidden">
          <img
            src={DEVELOPER_INFO.photo}
            alt={DEVELOPER_INFO.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-semibold mb-2">{DEVELOPER_INFO.name}</h3>
          <div className="space-y-2">
            <a
              href={`mailto:${DEVELOPER_INFO.email}`}
              className="flex items-center justify-center md:justify-start gap-2 text-gray-600 hover:text-blue-600"
            >
              <Mail size={18} />
              <span>{DEVELOPER_INFO.email}</span>
            </a>
            <a
              href={DEVELOPER_INFO.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center md:justify-start gap-2 text-gray-600 hover:text-blue-600"
            >
              <Globe size={18} />
              <span>Portfolio</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}