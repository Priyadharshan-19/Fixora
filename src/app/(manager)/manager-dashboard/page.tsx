import React from 'react';
import { getDatabase } from '@/lib/mongodb';
import { Badge } from '@/components/ui/Badge';
import { dispatchJob, verifyWarranty } from './actions';
import { ObjectId } from 'mongodb';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  Send, 
  UserCheck, 
  Wrench, 
  Activity,
  AlertCircle
} from 'lucide-react';

export const revalidate = 0;

export default async function ManagerDashboardPage() {
  const db = await getDatabase();

  const technicians = await db.collection('users').find({ role: 'TECHNICIAN' }).toArray();

  const rawPendingJobs = await db
    .collection('jobs')
    .find({ status: 'PENDING', serviceOption: 'AUTHORIZED_SERVICE_CENTER' })
    .sort({ createdAt: -1 })
    .toArray();

  // Batch-fetch customers & appliances for pending jobs (avoids N+1 queries)
  const pendingCustomerIds = [...new Set(rawPendingJobs.map(j => j.customerId?.toString()).filter(Boolean))]
    .map(id => new ObjectId(id));
  const pendingApplianceIds = [...new Set(rawPendingJobs.map(j => j.applianceId?.toString()).filter(Boolean))]
    .map(id => new ObjectId(id));

  const [pendingCustomers, pendingAppliances] = await Promise.all([
    pendingCustomerIds.length
      ? db.collection('users').find({ _id: { $in: pendingCustomerIds } }).toArray()
      : Promise.resolve([]),
    pendingApplianceIds.length
      ? db.collection('appliances').find({ _id: { $in: pendingApplianceIds } }).toArray()
      : Promise.resolve([])
  ]);

  const pendingCustomerMap = new Map(pendingCustomers.map(c => [c._id.toString(), c]));
  const pendingApplianceMap = new Map(pendingAppliances.map(a => [a._id.toString(), a]));

  const pendingJobs = rawPendingJobs.map((job) => {
    const customer = pendingCustomerMap.get(job.customerId?.toString());
    const appliance = job.applianceId ? pendingApplianceMap.get(job.applianceId.toString()) : null;

    return {
      _id: job._id.toString(),
      customerName: customer?.name || 'Customer',
      customerPhone: customer?.phone || 'N/A',
      applianceName: appliance?.brand || 'Standard Appliance',
      issueDescription: job.issueDescription || 'No issue description',
      createdAt: job.createdAt as Date,
      hasWarranty: job.hasWarranty ?? true,
      warrantyDocUrl: job.warrantyDocUrl || null,
      warrantyVerified: job.warrantyVerified ?? false
    };
  });

  const rawActiveJobs = await db
    .collection('jobs')
    .find({ status: { $in: ['ASSIGNED', 'TRAVELING', 'IN_PROGRESS'] } })
    .sort({ updatedAt: -1 })
    .toArray();

  // Batch-fetch customers, technicians & appliances for active jobs
  const activeCustomerIds = [...new Set(rawActiveJobs.map(j => j.customerId?.toString()).filter(Boolean))]
    .map(id => new ObjectId(id));
  const activeTechnicianIds = [...new Set(rawActiveJobs.map(j => j.technicianId?.toString()).filter(Boolean))]
    .map(id => new ObjectId(id));
  const activeApplianceIds = [...new Set(rawActiveJobs.map(j => j.applianceId?.toString()).filter(Boolean))]
    .map(id => new ObjectId(id));

  const [activeCustomers, activeTechnicians, activeAppliances] = await Promise.all([
    activeCustomerIds.length
      ? db.collection('users').find({ _id: { $in: activeCustomerIds } }).toArray()
      : Promise.resolve([]),
    activeTechnicianIds.length
      ? db.collection('users').find({ _id: { $in: activeTechnicianIds } }).toArray()
      : Promise.resolve([]),
    activeApplianceIds.length
      ? db.collection('appliances').find({ _id: { $in: activeApplianceIds } }).toArray()
      : Promise.resolve([])
  ]);

  const activeCustomerMap = new Map(activeCustomers.map(c => [c._id.toString(), c]));
  const activeTechnicianMap = new Map(activeTechnicians.map(t => [t._id.toString(), t]));
  const activeApplianceMap = new Map(activeAppliances.map(a => [a._id.toString(), a]));

  const activeJobs = rawActiveJobs.map((job) => {
    const customer = activeCustomerMap.get(job.customerId?.toString());
    const tech = job.technicianId ? activeTechnicianMap.get(job.technicianId.toString()) : null;
    const appliance = job.applianceId ? activeApplianceMap.get(job.applianceId.toString()) : null;

    return {
      _id: job._id.toString(),
      customerName: customer?.name || 'Customer',
      techName: tech?.name || 'Unassigned Tech',
      applianceName: appliance?.brand || 'Appliance',
      status: job.status as string,
      updatedAt: job.updatedAt as Date
    };
  });

  const completedCount = await db.collection('jobs').countDocuments({ status: 'COMPLETED' });

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* SaaS-Style Header */}
        <header className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-inner">
              FX
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Service Operations</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Authorized Warranty Dispatch & Live Routing</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl self-start md:self-auto">
            <Activity size={16} className="text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800">Live Console Active</span>
          </div>
        </header>

        {/* Responsive KPI Metrics (2 cols mobile, 4 cols desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-amber-50 opacity-50"><Clock size={100} /></div>
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 mb-3">
                <Clock size={16} className="text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Queue</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{pendingJobs.length}</p>
              <p className="text-xs text-amber-600 font-bold mt-1">Requires Assignment</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-blue-50 opacity-50"><Wrench size={100} /></div>
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 mb-3">
                <Wrench size={16} className="text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Active</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{activeJobs.length}</p>
              <p className="text-xs text-blue-600 font-bold mt-1">In Transit / Progress</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-emerald-50 opacity-50"><Users size={100} /></div>
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 mb-3">
                <Users size={16} className="text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Techs</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{technicians.length}</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">Available On Field</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-slate-50 opacity-50"><CheckCircle2 size={100} /></div>
            <div className="relative">
              <div className="flex items-center gap-2 text-slate-500 mb-3">
                <CheckCircle2 size={16} className="text-slate-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{completedCount}</p>
              <p className="text-xs text-slate-500 font-bold mt-1">Total Completed</p>
            </div>
          </div>
        </div>

        {/* Dispatch Queue Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" /> 
              Action Required: Dispatch Queue
            </h2>
            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
              {pendingJobs.length} Unassigned
            </span>
          </div>

          {pendingJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Queue is Clear</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                All incoming warranty requests have been successfully dispatched to field technicians.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingJobs.map((job) => (
                <div key={job._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Job #{job._id.slice(-4).toUpperCase()}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {job.customerName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {job.applianceName}
                      </p>
                    </div>
                    <div className="shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                      <ShieldCheck size={12} /> IN-WARRANTY
                    </div>
                  </div>

                  {/* Issue Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 flex-1">
                    <p className="text-xs text-slate-700 font-medium leading-relaxed italic line-clamp-3">
                      "{job.issueDescription}"
                    </p>
                  </div>

                  {/* Warranty Verification */}
                  <div className="mb-4">
                    {job.warrantyDocUrl ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 mb-2">
                        <img src={job.warrantyDocUrl} alt="Warranty document" className="w-full h-24 object-cover" />
                      </div>
                    ) : (
                      <p className="text-[10px] text-red-600 font-bold mb-2">No warranty document attached</p>
                    )}
                    
                    {job.warrantyVerified ? (
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-[10px] font-bold">
                        <CheckCircle2 size={12} /> Warranty Verified
                      </div>
                    ) : (
                      <form action={async (formData: FormData) => {
                        "use server";
                        await verifyWarranty(formData);
                      }}>
                        <input type="hidden" name="jobId" value={job._id} />
                        <button
                          type="submit"
                          disabled={!job.warrantyDocUrl}
                          className="w-full bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <ShieldCheck size={14} />
                          Verify Warranty Doc
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Dispatch Form with TypeScript Fix */}
                  <form action={async (formData: FormData) => {
                    "use server";
                    await dispatchJob(formData);
                  }} className="mt-auto space-y-3">
                    <input type="hidden" name="jobId" value={job._id} />
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 ml-1">
                        Assign Technician
                      </label>
                      <div className="relative">
                        <select
                          name="technicianId"
                          required
                          disabled={!job.warrantyVerified}
                          className="w-full appearance-none bg-white border border-slate-300 rounded-xl py-3 pl-4 pr-10 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-50"
                        >
                          <option value="">Select Field Tech...</option>
                          {technicians.map((tech) => (
                            <option key={tech._id.toString()} value={tech._id.toString()}>
                              {tech.name} ({tech.rating || '4.8'}★)
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <UserCheck size={16} />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!job.warrantyVerified}
                      className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-xs font-bold shadow-md hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
                    >
                      <Send size={14} />
                      {job.warrantyVerified ? 'Dispatch Job' : 'Verify Warranty First'}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Field Operations */}
        <section className="space-y-4 pt-8">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Activity size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Active Field Operations</h2>
          </div>

          {activeJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 shadow-sm">
              No technicians currently active in the field.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
              {activeJobs.map((job) => (
                <div key={job._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                      {job.techName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {job.techName} 
                        <span className="text-slate-300">→</span> 
                        <span className="text-slate-600">{job.customerName}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Service: {job.applianceName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Updated {new Date(job.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}