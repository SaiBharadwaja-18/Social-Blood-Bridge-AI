import { Link } from 'react-router-dom';
import {
  Heart,
  Users,
  Shield,
  Bell,
  Activity,
  UserRound,
  Building2,
  ClipboardList,
} from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: Heart,
      title: 'Intelligent Donor Selection',
      desc: 'Identify donors most likely to respond and successfully donate based on eligibility, availability, and history.',
    },
    {
      icon: Shield,
      title: 'Health Eligibility Tracking',
      desc: 'Maintain donor health information, donation history, and eligibility status.',
    },
    {
      icon: Users,
      title: 'Backup Donor Network',
      desc: 'Automatically activate backup donors when primary donors are unavailable.',
    },
    {
      icon: ClipboardList,
      title: 'Patient Request Management',
      desc: 'Manage blood requests, transfusion schedules, and fulfillment tracking.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      desc: 'Send timely updates to donors, patients, and coordinators.',
    },
    {
      icon: Activity,
      title: 'Community Engagement',
      desc: 'Keep donors connected through reminders, awareness messages, and updates.',
    },
  ];

  const workflow = [
    'Blood Request Created',
    'Eligible Donors Identified',
    'Donors Prioritized',
    'Notifications Sent',
    'Backup Donors Activated',
    'Donation Confirmed',
    'Request Fulfilled',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
<section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 px-6 lg:px-16 min-h-screen flex items-center">
  <div className="mx-auto max-w-screen-2xl w-full py-10">

    <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">

      {/* LEFT */}
      <div>
        <span className="inline-flex rounded-full bg-rose-100 px-5 py-2 text-sm font-semibold text-rose-700 mb-6">
  From Donor Identification to Successful Donation
</span>

        <h1 className="mt-5 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl xl:text-5xl">
          Building a Reliable
          <span className="block text-rose-600">
            Blood Support Network
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          Connecting donors, patients, and coordinators through intelligent
          donor matching, proactive engagement, health tracking, and
          streamlined blood request fulfillment for Thalassemia care.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-700"
          >
            Register Now
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Login
          </Link>
        </div>

        {/* STATS */}
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-2xl border-t border-rose-100 pt-8">

          <div>
            <p className="text-3xl font-bold text-rose-600">3</p>
            <p className="mt-1 text-sm text-gray-600">
              User Portals
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold text-rose-600">24/7</p>
            <p className="mt-1 text-sm text-gray-600">
              Request Tracking
            </p>
          </div>

          <div>
            <p className="text-3xl font-bold text-rose-600">AI</p>
            <p className="mt-1 text-sm text-gray-600">
              Assisted Coordination
            </p>
          </div>

        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-5 h-full">

        <div className="flex-1 rounded-2xl border border-rose-100 bg-white p-6 shadow-xl transition duration-300 hover:-translate-y-1">

          <div className="flex items-center gap-3">
            <Users className="h-9 w-9 text-rose-600" />

            <div>
              <p className="text-xs font-semibold tracking-wider text-rose-600">
                DONOR NETWORK
              </p>

              <h3 className="text-lg font-bold text-gray-900">
                Active Donor Community
              </h3>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            Keep donors engaged through reminders, eligibility tracking,
            donation history, and health awareness updates.
          </p>
        </div>

        <div className="flex-1 rounded-2xl border border-red-100 bg-white p-6 shadow-xl transition duration-300 hover:-translate-y-1">

          <div className="flex items-center gap-3">
            <Heart className="h-9 w-9 text-red-500" />

            <div>
              <p className="text-xs font-semibold tracking-wider text-red-500">
                PATIENT SUPPORT
              </p>

              <h3 className="text-lg font-bold text-gray-900">
                Timely Blood Availability
              </h3>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            Support recurring transfusions and emergency blood requests with
            faster donor outreach and fulfillment tracking.
          </p>
        </div>

        <div className="flex-1 rounded-2xl border border-pink-100 bg-white p-6 shadow-xl transition duration-300 hover:-translate-y-1">

          <div className="flex items-center gap-3">
            <Activity className="h-9 w-9 text-pink-600" />

            <div>
              <p className="text-xs font-semibold tracking-wider text-pink-600">
                SMART COORDINATION
              </p>

              <h3 className="text-lg font-bold text-gray-900">
                Faster Fulfillment
              </h3>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            Prioritize eligible donors, activate backups automatically,
            and improve successful donation outcomes.
          </p>
        </div>

      </div>

    </div>

  </div>
</section>

      {/* USERS */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Built for the Entire Blood Support Ecosystem
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              One platform connecting everyone involved in blood coordination.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-rose-100 p-8">
              <UserRound className="h-10 w-10 text-rose-600" />
              <h3 className="mt-4 text-xl font-bold">Donors</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Register and update availability</li>
                <li>• Receive blood requests</li>
                <li>• Track donation history</li>
                <li>• Stay engaged with the community</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-100 p-8">
              <Building2 className="h-10 w-10 text-rose-600" />
              <h3 className="mt-4 text-xl font-bold">Patients</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Create blood requests</li>
                <li>• Track fulfillment progress</li>
                <li>• Manage transfusion schedules</li>
                <li>• Receive status updates</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-100 p-8">
              <ClipboardList className="h-10 w-10 text-rose-600" />
              <h3 className="mt-4 text-xl font-bold">Coordinators</h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Monitor all requests</li>
                <li>• Manage donor network</li>
                <li>• Track fulfillment</li>
                <li>• Activate backup donors</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Key Features
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-rose-100 bg-white p-6"
              >
                <feature.icon className="h-8 w-8 text-rose-600" />

                <h3 className="mt-4 font-semibold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              How It Works
            </h2>
          </div>

         <div className="hidden lg:flex items-center justify-between relative mt-16">
  <div className="absolute left-12 right-12 top-6 h-1 bg-rose-200"></div>

  {workflow.map((step, index) => (
    <div
      key={index}
      className="relative z-10 flex flex-col items-center text-center w-32"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white font-bold shadow-md">
        {index + 1}
      </div>

      <p className="mt-4 text-sm font-medium text-gray-900">
        {step}
      </p>
    </div>
  ))}
</div>

<div className="grid gap-4 lg:hidden">
  {workflow.map((step, index) => (
    <div
      key={index}
      className="flex items-center gap-4 rounded-xl border border-rose-100 bg-white p-4"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white font-bold">
        {index + 1}
      </div>

      <p className="font-medium text-gray-900">
        {step}
      </p>
    </div>
  ))}
</div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-rose-600 to-rose-700 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-white">
            Join the Blood Bridge Community
          </h2>

          <p className="mt-4 text-lg text-rose-100">
            Together we can build a stronger and more reliable blood support
            network for patients who depend on regular transfusions.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-white px-8 py-3 font-semibold text-rose-600"
            >
              Register
            </Link>

            <Link
              to="/about"
              className="rounded-lg border border-white px-8 py-3 font-semibold text-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
