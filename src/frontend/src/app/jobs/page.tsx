'use client';

import { useEffect, useState } from 'react';
import { jobsAPI } from '@/lib/api';
import { Job, JobStatus } from '@/types';
import AppLayout from '@/components/AppLayout';

const statusLabels: Record<string, { text: string; color: string }> = {
  DRAFT: { text: '草稿', color: 'bg-gray-100 text-gray-600' },
  PUBLISHED: { text: '在招', color: 'bg-green-100 text-green-700' },
  PAUSED: { text: '暂停', color: 'bg-yellow-100 text-yellow-700' },
  CLOSED: { text: '关闭', color: 'bg-red-100 text-red-700' },
  EXPIRED: { text: '过期', color: 'bg-gray-100 text-gray-500' },
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [form, setForm] = useState({
    title: '', description: '', salaryMin: '', salaryMax: '',
    location: '', remoteAllowed: false, status: JobStatus.DRAFT,
  });

  const loadJobs = async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (filter) params.status = filter;
      const data = await jobsAPI.getAll(params);
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('加载职位失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await jobsAPI.create({
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      });
      setShowForm(false);
      setForm({ title: '', description: '', salaryMin: '', salaryMax: '', location: '', remoteAllowed: false, status: JobStatus.DRAFT });
      loadJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || '创建失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该职位？')) return;
    try {
      await jobsAPI.delete(id);
      loadJobs();
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await jobsAPI.update(id, { status: status as JobStatus });
      loadJobs();
    } catch (err) {
      alert('状态更新失败');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">职位管理</h1>
            <p className="text-gray-500 mt-1">管理所有招聘职位</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {showForm ? '取消' : '+ 创建职位'}
          </button>
        </div>

        {/* 创建表单 */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900">创建新职位</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">职位名称 *</label>
                <input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="如：高级前端工程师" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">工作地点</label>
                <input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="如：深圳" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最低薪资</label>
                <input type="number" value={form.salaryMin} onChange={(e) => setForm({...form, salaryMin: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="如：15000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最高薪资</label>
                <input type="number" value={form.salaryMax} onChange={(e) => setForm({...form, salaryMax: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="如：25000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">职位描述 *</label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="详细描述职位要求..." />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.remoteAllowed} onChange={(e) => setForm({...form, remoteAllowed: e.target.checked})} className="rounded" />
                <span className="text-sm text-gray-700">支持远程</span>
              </label>
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">
                创建
              </button>
            </div>
          </form>
        )}

        {/* 筛选 */}
        <div className="flex gap-2 flex-wrap">
          {['', 'PUBLISHED', 'PAUSED', 'CLOSED'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === s ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s ? statusLabels[s]?.text : '全部'}
            </button>
          ))}
        </div>

        {/* 职位列表 */}
        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">暂无职位数据</div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const st = statusLabels[job.status] || statusLabels.DRAFT;
              return (
                <div key={job.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.text}</span>
                        {job.remoteAllowed && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">远程</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {job.location && <span>📍 {job.location}</span>}
                        {job.salaryMin && job.salaryMax && <span>💰 {job.salaryMin}-{job.salaryMax}</span>}
                        {job._count?.applications !== undefined && <span>📋 {job._count.applications} 份申请</span>}
                        <span>🕐 {new Date(job.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {job.status === JobStatus.DRAFT && (
                        <button onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                          className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">发布</button>
                      )}
                      {job.status === JobStatus.PUBLISHED && (
                        <button onClick={() => handleStatusChange(job.id, 'PAUSED')}
                          className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition">暂停</button>
                      )}
                      {job.status === JobStatus.PAUSED && (
                        <button onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                          className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">恢复</button>
                      )}
                      <button onClick={() => handleDelete(job.id)}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">删除</button>
                    </div>
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
