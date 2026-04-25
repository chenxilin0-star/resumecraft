import { FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <span className="text-lg font-bold text-gray-900">ResumeCraft</span>
          </div>
          <p className="text-sm text-gray-500">
            让每一份简历，都值得被看见
          </p>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} ResumeCraft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
