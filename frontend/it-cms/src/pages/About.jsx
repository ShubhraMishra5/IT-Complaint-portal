import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <main className="flex-1">
        <div className="bg-white rounded p-4 m-6 shadow-inner" id="hero-section">
          <h1 className="text-[#f37021] text-3xl font-bold">About This System</h1>
          <h2 className="text-[#00164f] text-2xl font-semibold mt-2">IT Complaint Management System (CMS)</h2>
        </div>
        <div className="px-6 md:px-12 lg:px-24 mb-8 space-y-8" id="about">
          <section>
            <h3 className="text-[#00164f] text-xl font-bold">🌐 Key Features:</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Easy complaint registration by employees</li>
              <li>Role-based dashboards for Admins, Engineers, and Users</li>
              <li>Real-time status tracking and notifications</li>
              <li>Efficient engineer assignment and resolution logging</li>
              <li>Built-in feedback mechanism for quality improvement</li>
            </ul>
          </section>
          <section>
            <h3 className="text-[#00164f] text-xl font-bold">👥 Who Can Use This System?</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Employees: Raise and track complaints related to hardware, software, or network issues.</li>
              <li>Engineers: View and manage assigned tickets, update status, and add remarks.</li>
              <li>Admins: Assign engineers, monitor complaint progress, and manage system records.</li>
              <li>Management: View summary reports and status insights (read-only).</li>
            </ul>
          </section>
          <section>
            <h3 className="text-[#00164f] text-xl font-bold">⚙️ Version</h3>
            <p className="mt-2">
              CMS Version: <strong>1.0.0</strong><br />
              Developed by: <strong>IT Intern Project Team, IOCL 2025</strong>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}