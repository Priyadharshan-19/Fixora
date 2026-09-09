import React from 'react';
import { getDatabase } from '@/lib/mongodb';
import { Badge } from '@/components/ui/Badge';
import { dispatchJob } from './actions';

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  LayoutDashboard,
  Send,
  ShieldCheck,
  Users,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react';

export const revalidate = 0;

export default async function ManagerDashboardPage() {
  const db = await getDatabase();

  /* =====================================================
     DATA FETCHING
  ===================================================== */

  const technicians = await db
    .collection('users')
    .find({
      role: 'TECHNICIAN',
    })
    .toArray();

  const rawPendingJobs = await db
    .collection('jobs')
    .find({
      status: 'PENDING',
      serviceOption: 'AUTHORIZED_SERVICE_CENTER',
    })
    .sort({
      createdAt: -1,
    })
    .toArray();

  const pendingJobs = await Promise.all(
    rawPendingJobs.map(async (job) => {
      const customer = await db
        .collection('users')
        .findOne({
          _id: job.customerId,
        });

      const appliance = job.applianceId
        ? await db
            .collection('appliances')
            .findOne({
              _id: job.applianceId,
            })
        : null;

      return {
        _id: job._id.toString(),

        customerName:
          customer?.name || 'Customer',

        customerPhone:
          customer?.phone || 'N/A',

        applianceName:
          appliance?.brand ||
          'Standard Appliance',

        issueDescription:
          job.issueDescription ||
          'No issue description',

        createdAt:
          job.createdAt as Date,

        hasWarranty:
          job.hasWarranty ?? true,
      };
    })
  );

  const rawActiveJobs = await db
    .collection('jobs')
    .find({
      status: {
        $in: [
          'ASSIGNED',
          'TRAVELING',
          'IN_PROGRESS',
        ],
      },
    })
    .sort({
      updatedAt: -1,
    })
    .toArray();

  const activeJobs = await Promise.all(
    rawActiveJobs.map(async (job) => {
      const customer = await db
        .collection('users')
        .findOne({
          _id: job.customerId,
        });

      const technician = job.technicianId
        ? await db
            .collection('users')
            .findOne({
              _id: job.technicianId,
            })
        : null;

      const appliance = job.applianceId
        ? await db
            .collection('appliances')
            .findOne({
              _id: job.applianceId,
            })
        : null;

      return {
        _id:
          job._id.toString(),

        customerName:
          customer?.name || 'Customer',

        technicianName:
          technician?.name ||
          'Unassigned Technician',

        applianceName:
          appliance?.brand ||
          'Appliance',

        status:
          job.status as string,

        updatedAt:
          job.updatedAt as Date,
      };
    })
  );

  const completedCount =
    await db
      .collection('jobs')
      .countDocuments({
        status: 'COMPLETED',
      });

  /* =====================================================
     STATUS CONFIG
  ===================================================== */

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-50 text-blue-700 ring-blue-600/10';

      case 'TRAVELING':
        return 'bg-amber-50 text-amber-700 ring-amber-600/10';

      case 'IN_PROGRESS':
        return 'bg-violet-50 text-violet-700 ring-violet-600/10';

      default:
        return 'bg-slate-100 text-slate-600 ring-slate-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">

      {/* =====================================================
         APPLICATION HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* LEFT */}

          <div className="flex items-center gap-4">

            {/* LOGO */}

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17181C] text-xs font-black text-white shadow-sm">

              FX

            </div>


            <div className="hidden h-5 w-px bg-slate-200 sm:block" />


            {/* BREADCRUMB */}

            <div className="flex items-center gap-2">

              <span className="hidden text-sm font-medium text-slate-400 sm:block">

                Workspace

              </span>

              <span className="hidden text-slate-300 sm:block">

                /

              </span>

              <span className="text-sm font-semibold text-slate-900">

                Operations

              </span>

            </div>

          </div>


          {/* RIGHT */}

          <div className="flex items-center gap-3">

            {/* LIVE STATUS */}

            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5">

              <span className="relative flex h-2 w-2">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />

              </span>


              <span className="text-xs font-medium text-slate-600">

                System operational

              </span>

            </div>


            {/* USER */}

            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white sm:flex">

              MG

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
         MAIN
      ===================================================== */}

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">


        {/* =====================================================
           PAGE TITLE
        ===================================================== */}

        <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white">

                <LayoutDashboard size={13} />

              </div>


              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">

                Operations Console

              </span>

            </div>


            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">

              Service Operations

            </h1>


            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">

              Manage incoming service requests, assign field
              technicians, and monitor active operations.

            </p>

          </div>


          {/* DATE / LIVE */}

          <div className="flex items-center gap-3">

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">

                Console Status

              </p>

              <div className="mt-1 flex items-center gap-2">

                <Activity
                  size={14}
                  className="text-emerald-500"
                />

                <span className="text-sm font-semibold text-slate-700">

                  Live monitoring

                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
           KPI SECTION
        ===================================================== */}

        <section className="mb-10 grid grid-cols-2 border border-slate-200 bg-white lg:grid-cols-4">

          {/* QUEUE */}

          <div className="border-b border-r border-slate-200 p-5 lg:border-b-0">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600">

                <Clock3 size={16} />

              </div>


              {pendingJobs.length > 0 && (

                <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-600">

                  Attention

                </span>

              )}

            </div>


            <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">

              {pendingJobs.length}

            </p>


            <p className="mt-1 text-sm font-medium text-slate-700">

              Dispatch Queue

            </p>


            <p className="mt-1 text-xs text-slate-400">

              Awaiting assignment

            </p>

          </div>


          {/* ACTIVE */}

          <div className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">

            <div className="mb-5">

              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">

                <Activity size={16} />

              </div>

            </div>


            <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">

              {activeJobs.length}

            </p>


            <p className="mt-1 text-sm font-medium text-slate-700">

              Active Jobs

            </p>


            <p className="mt-1 text-xs text-slate-400">

              Field operations

            </p>

          </div>


          {/* TECHNICIANS */}

          <div className="border-r border-slate-200 p-5">

            <div className="mb-5">

              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-50 text-violet-600">

                <Users size={16} />

              </div>

            </div>


            <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">

              {technicians.length}

            </p>


            <p className="mt-1 text-sm font-medium text-slate-700">

              Technicians

            </p>


            <p className="mt-1 text-xs text-slate-400">

              Registered field team

            </p>

          </div>


          {/* RESOLVED */}

          <div className="p-5">

            <div className="mb-5">

              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">

                <CheckCircle2 size={16} />

              </div>

            </div>


            <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">

              {completedCount}

            </p>


            <p className="mt-1 text-sm font-medium text-slate-700">

              Resolved

            </p>


            <p className="mt-1 text-xs text-slate-400">

              Completed requests

            </p>

          </div>

        </section>


        {/* =====================================================
           DISPATCH QUEUE HEADER
        ===================================================== */}

        <section className="mb-12">

          <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <AlertTriangle
                  size={15}
                  className="text-amber-500"
                />

                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-600">

                  Action Required

                </span>

              </div>


              <h2 className="text-xl font-semibold tracking-tight text-slate-950">

                Dispatch Queue

              </h2>


              <p className="mt-1 text-sm text-slate-500">

                Assign service requests to available technicians.

              </p>

            </div>


            <div className="flex items-center gap-2 text-sm">

              <span className="font-semibold text-slate-900">

                {pendingJobs.length}

              </span>

              <span className="text-slate-400">

                unassigned requests

              </span>

            </div>

          </div>


          {/* =====================================================
             EMPTY STATE
          ===================================================== */}

          {pendingJobs.length === 0 ? (

            <div className="border border-slate-200 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">

                <CheckCircle2 size={22} />

              </div>


              <h3 className="mt-4 text-sm font-semibold text-slate-900">

                Dispatch queue is clear

              </h3>


              <p className="mt-2 text-sm text-slate-500">

                All incoming requests have been assigned.

              </p>

            </div>

          ) : (

            /* =====================================================
               DISPATCH TABLE
            ===================================================== */

            <div className="overflow-hidden border border-slate-200 bg-white">

              {/* TABLE HEADER */}

              <div className="hidden grid-cols-12 gap-5 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:grid">

                <div className="col-span-3">

                  Customer

                </div>


                <div className="col-span-3">

                  Appliance

                </div>


                <div className="col-span-3">

                  Reported Issue

                </div>


                <div className="col-span-3 text-right">

                  Assignment

                </div>

              </div>


              {/* JOB ROWS */}

              {pendingJobs.map((job) => (

                <div
                  key={job._id}
                  className="grid gap-5 border-b border-slate-100 px-5 py-6 last:border-0 transition-colors hover:bg-slate-50/60 md:grid-cols-12 md:items-center md:px-6"
                >

                  {/* CUSTOMER */}

                  <div className="md:col-span-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">

                        {job.customerName
                          .slice(0, 2)
                          .toUpperCase()}

                      </div>


                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-900">

                          {job.customerName}

                        </p>


                        <p className="mt-0.5 text-xs text-slate-400">

                          #{job._id
                            .slice(-6)
                            .toUpperCase()}

                        </p>

                      </div>

                    </div>

                  </div>


                  {/* APPLIANCE */}

                  <div className="md:col-span-3">

                    <div className="flex items-center gap-2">

                      <Wrench
                        size={14}
                        className="text-slate-400"
                      />


                      <div>

                        <p className="text-sm font-medium text-slate-700">

                          {job.applianceName}

                        </p>


                        <div className="mt-1">

                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold
                            ${
                              job.hasWarranty
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                          >

                            <ShieldCheck size={11} />

                            {job.hasWarranty
                              ? 'In warranty'
                              : 'Standard service'}

                          </span>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* ISSUE */}

                  <div className="md:col-span-3">

                    <p className="line-clamp-2 text-sm leading-5 text-slate-500">

                      {job.issueDescription}

                    </p>

                  </div>


                  {/* ASSIGNMENT */}

                  <div className="md:col-span-3">

                    <form
                      action={dispatchJob}
                      className="flex flex-col gap-2 sm:flex-row md:justify-end"
                    >

                      <input
                        type="hidden"
                        name="jobId"
                        value={job._id}
                      />


                      <div className="relative min-w-[180px]">

                        <UserRound
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />


                        <select
                          name="technicianId"
                          required
                          className="h-10 w-full appearance-none border border-slate-200 bg-white pl-9 pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        >

                          <option value="">

                            Assign technician

                          </option>


                          {technicians.map((tech) => (

                            <option
                              key={tech._id.toString()}
                              value={tech._id.toString()}
                            >

                              {tech.name}

                            </option>

                          ))}

                        </select>


                        <ChevronDown
                          size={14}
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                      </div>


                      <button
                        type="submit"
                        className="flex h-10 items-center justify-center gap-2 bg-[#17181C] px-4 text-xs font-semibold text-white transition hover:bg-black active:scale-[0.98]"
                      >

                        <Send size={13} />

                        Dispatch

                      </button>

                    </form>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* =====================================================
           ACTIVE OPERATIONS
        ===================================================== */}

        <section>

          <div className="mb-5 flex items-end justify-between border-b border-slate-200 pb-5">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <CircleDot
                  size={14}
                  className="text-blue-500"
                />

                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600">

                  Live Operations

                </span>

              </div>


              <h2 className="text-xl font-semibold tracking-tight text-slate-950">

                Active Field Operations

              </h2>


              <p className="mt-1 text-sm text-slate-500">

                Track technicians currently working on service requests.

              </p>

            </div>


            <span className="hidden text-sm text-slate-400 sm:block">

              {activeJobs.length} active

            </span>

          </div>


          {/* EMPTY */}

          {activeJobs.length === 0 ? (

            <div className="border border-slate-200 bg-white p-12 text-center">

              <Activity
                size={24}
                className="mx-auto text-slate-300"
              />


              <p className="mt-3 text-sm text-slate-500">

                No active field operations.

              </p>

            </div>

          ) : (

            <div className="overflow-hidden border border-slate-200 bg-white">

              {/* HEADER */}

              <div className="hidden grid-cols-12 gap-5 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 md:grid">

                <div className="col-span-4">

                  Technician

                </div>


                <div className="col-span-3">

                  Customer

                </div>


                <div className="col-span-2">

                  Updated

                </div>


                <div className="col-span-3 text-right">

                  Status

                </div>

              </div>


              {/* ACTIVE ROWS */}

              {activeJobs.map((job) => (

                <div
                  key={job._id}
                  className="grid gap-4 border-b border-slate-100 px-5 py-5 last:border-0 transition hover:bg-slate-50/50 md:grid-cols-12 md:items-center md:px-6"
                >

                  {/* TECH */}

                  <div className="flex items-center gap-3 md:col-span-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">

                      {job.technicianName
                        .slice(0, 2)
                        .toUpperCase()}

                    </div>


                    <div>

                      <p className="text-sm font-semibold text-slate-800">

                        {job.technicianName}

                      </p>


                      <p className="text-xs text-slate-400">

                        Field technician

                      </p>

                    </div>

                  </div>


                  {/* CUSTOMER */}

                  <div className="md:col-span-3">

                    <p className="text-sm font-medium text-slate-700">

                      {job.customerName}

                    </p>


                    <p className="mt-1 text-xs text-slate-400">

                      {job.applianceName}

                    </p>

                  </div>


                  {/* TIME */}

                  <div className="flex items-center gap-2 text-xs text-slate-400 md:col-span-2">

                    <Clock3 size={13} />

                    {new Date(
                      job.updatedAt
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}

                  </div>


                  {/* STATUS */}

                  <div className="md:col-span-3 md:text-right">

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ${getStatusColor(
                        job.status
                      )}`}
                    >

                      {job.status.replace(
                        '_',
                        ' '
                      )}

                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* =====================================================
           FOOTER
        ===================================================== */}

        <footer className="mt-12 border-t border-slate-200 py-6">

          <div className="flex flex-col justify-between gap-3 text-xs text-slate-400 sm:flex-row">

            <span>

              Fixora Operations Console

            </span>


            <div className="flex items-center gap-2">

              <Zap size={12} />

              <span>

                Real-time service monitoring

              </span>

            </div>

          </div>

        </footer>

      </main>

    </div>
  );
}