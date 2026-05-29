'use client';

import { useEffect, useState } from 'react';
import { candidatesAPI } from '@/lib/api';
import { Candidate } from '@/types';
import AppLayout from '@/components/AppLayout';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '',
    experienceYears: '', educationLevel: '', skills: '', source: 'MANUAL',
  });

  const loadCandidates = async () => {
    try {
      const params: any = { page: 1, limit: 50 };
      if (search) params.search = search;
      const data = await candidatesAPI.getAll(params);
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error('加载候选人失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCandidates(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loadCandidates();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await candidatesAPI.create({
        ...form,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', location: '', experienceYears: '', educationLevel: '', skills: '', source: 'MANUAL' });
      loadCandidates();
    } catch (err: any) {
      alert(err.response?.data?.message || '添加失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该候选人？')) return;
    try {
      await candidatesAPI.delete(id);
      loadCandidates();
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">候选人管理</h1>
            <p className="text-gray-500 mt-1">管理候选人信息</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">
            {showForm ? '取消' : '+ 添加候选人'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900">添加候选人</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所在城市</label>
                <input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">工作年限</label>
                <input type="number" value={form.experienceYears} onChange={(e) => setForm({...form, experienceYears: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">学历</label>
                <select value={form.educationLevel} onChange={(e) => setForm({...form, educationLevel: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">请选择</option>
                  <option value="HIGH_SCHOOL">高中</option>
                  <option value="COLLEGE">大专</option>
                  <option value="BACHELOR">本科</option>
                  <option value="MASTER">硕士</option>
                  <option value="PHD">博士</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">技能（逗号分隔）</label>
              <input value={form.skills} onChange={(e) => setForm({...form, skills: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="如：React, TypeScript, Node.js" />
            </div>
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">添加</button>
          </form>
        )}

        {/* 搜索 */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="搜索候选人姓名、技能..." />
          <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">搜索</button>
        </form>

        {loading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-10 text-gray-400">暂无候选人数据</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c) => (
              <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                      {c.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-500 transition">✕</button>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  {c.phone && <p>📱 {c.phone}</p>}
                  {c.location && <p>📍 {c.location}</p>}
                  {c.experienceYears !== undefined && <p>⏳ {c.experienceYears}年经验</p>}
                  {c.educationLevel && <p>🎓 {c.educationLevel}</p>}
                </div>
                {c.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-400">来源：{c.source} · 添加于 {new Date(c.createdAt).toLocaleDateString('zh-CN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
