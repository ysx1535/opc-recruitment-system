'use client';

import { useEffect, useState } from 'react';
import { applicationsAPI } from '@/lib/api';
import { Application, ApplicationStatus } from '@/types';
import AppLayout from '@/components/AppLayout';

const statusLabels: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待处理', color: 'bg-yellow-100 text-yellow-700' },
  SCREENING: { text: '筛选中', color: 'bg-blue-100 text-blue-700' },
  INTERVIEW: { text: '面试中', color: 'bg-purple-100 text-purple-700' },
  OFFER: { text: 'Offer', color: 'bg-orange-100 text-orange-700' },
  HIRED: { text: '已入职', color: 'bg-green-100 text-green-700' },
  REJECTED: { text: '已拒绝', color: 'bg-red-100 text-red-700' },
  WITHDRAWN: { text: '已撤回', color: 'bg-gray-100 text-gray-500' },
};

const nextStatuses: Record<string, ApplicationStatus[]> = {
  PENDING: [ApplicationStatus.SCREENING, ApplicationStatus.REJECTED],
  SCREENING: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
  INTERVIEW: [ApplicationStatus.OFFER, ApplicationStatus.REJECTED],
  OFFER: [ApplicationStatus.HIRED, ApplicationStatus.REJECTED],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  const loadApplications = async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (filter) params.status = filter;
      const data = await applicationsAPI.getAll(params);
      setApplications(data.applications || []);
    } catch (err) {
      console.error('加载申请失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApplications(); }, [filter]);

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    try {
      await applicationsAPI.updateStatus(id, { status });
      loadApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || '状态更新失败');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">申请管理</h1>
          <p className="text-gray-500 mt-1">管理职位申请和审批流程</p>
        </div>

        {/* 筛选 */}
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDING', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === s ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s ? statusLabels[s]?.text : '全部'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">暂无申请数据</div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const st = statusLabels[app.status] || statusLabels.PENDING;
              const nexts = nextStatuses[app.status] || [];
              return (
                <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{app.candidate?.name || '候选人'}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.text}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>💼 {app.job?.title || '职位'}</span>
                        <span>🕐 {new Date(app.appliedAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                    {nexts.length > 0 && (
                      <div className="flex gap-2 shrink-0">
                        {nexts.map((ns) => {
                          const nsLabel = statusLabels[ns];
                          return (
                            <button key={ns} onClick={() => handleStatusChange(app.id, ns)}
                              className={`px-3 py-1.5 text-xs rounded-lg transition ${nsLabel?.color || 'bg-gray-100'}`}>
                              {nsLabel?.text || ns}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
