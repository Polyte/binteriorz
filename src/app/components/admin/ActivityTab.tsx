import React from 'react';
import { motion } from 'motion/react';
import {
  Package, ShoppingCart, Layers, Star, FileText, Image, Settings,
  Shield, Mail, MessageSquare, Activity, CircleDot
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export const ActivityTab = () => {
  const {
    activityLog, activityRoleFilter, setActivityRoleFilter,
    activityActionFilter, setActivityActionFilter,
  } = useAdmin();

  const actionTypes = [...new Set(activityLog.map((e: any) => e.action.split('.')[0]))];
  const filtered = activityLog.filter((e: any) => {
    if (activityRoleFilter !== 'all' && e.role !== activityRoleFilter) return false;
    if (activityActionFilter !== 'all' && !e.action.startsWith(activityActionFilter)) return false;
    return true;
  });

  const ACTION_ICONS: Record<string, any> = {
    product: Package, order: ShoppingCart, vendor: Layers, review: Star,
    page: FileText, media: Image, settings: Settings, team: Shield,
    subscriber: Mail, inquiry: MessageSquare,
  };
  const ACTION_COLORS: Record<string, string> = {
    create: 'text-emerald-600 bg-emerald-50', update: 'text-blue-600 bg-blue-50',
    delete: 'text-red-600 bg-red-50', remove: 'text-red-600 bg-red-50',
    bulk_import: 'text-purple-600 bg-purple-50',
  };
  const ROLE_COLORS: Record<string, string> = {
    owner: 'bg-amber-100 text-amber-800', admin: 'bg-blue-100 text-blue-800',
    editor: 'bg-neutral-100 text-neutral-600',
  };

  return (
    <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div>
        <h2 className="text-2xl font-serif text-neutral-900">Activity Log</h2>
        <p className="text-sm text-neutral-500">Audit trail of all admin actions, tracked by role</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={activityRoleFilter} onChange={(e) => setActivityRoleFilter(e.target.value)} className="bg-white border border-neutral-200 rounded-md py-1.5 px-3 text-xs font-medium outline-none focus:border-neutral-900">
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>
        <select value={activityActionFilter} onChange={(e) => setActivityActionFilter(e.target.value)} className="bg-white border border-neutral-200 rounded-md py-1.5 px-3 text-xs font-medium outline-none focus:border-neutral-900">
          <option value="all">All Actions</option>
          {actionTypes.map((t: any) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <span className="text-[10px] text-neutral-400 ml-auto">{filtered.length} entries (max 500)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <Activity className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">No activity recorded yet</p>
          <p className="text-xs text-neutral-400 mt-1">Actions will appear here as team members use the admin console</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {filtered.slice(0, 100).map((entry: any) => {
              const [category, verb] = entry.action.split('.');
              const Icon = ACTION_ICONS[category] || CircleDot;
              const colorClass = ACTION_COLORS[verb] || 'text-neutral-600 bg-neutral-50';
              const roleColor = ROLE_COLORS[entry.role] || 'bg-neutral-100 text-neutral-600';
              const ago = (() => {
                const diff = Date.now() - new Date(entry.timestamp).getTime();
                const mins = Math.floor(diff / 60000);
                if (mins < 1) return 'just now';
                if (mins < 60) return `${mins}m ago`;
                const hours = Math.floor(mins / 60);
                if (hours < 24) return `${hours}h ago`;
                const days = Math.floor(hours / 24);
                return `${days}d ago`;
              })();

              return (
                <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-neutral-900 leading-snug">{entry.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-neutral-400">{entry.email}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${roleColor}`}>{entry.role}</span>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-medium">{verb || category}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 flex-shrink-0 text-right">
                    <p>{ago}</p>
                    <p className="text-[9px] text-neutral-300">{new Date(entry.timestamp).toLocaleString('en-ZA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length > 100 && (
            <div className="py-2 px-4 bg-neutral-50 border-t border-neutral-200 text-center text-[10px] text-neutral-400">
              Showing first 100 of {filtered.length} entries
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
