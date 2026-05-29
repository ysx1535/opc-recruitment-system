'use client';

import { useEffect, useState } from 'react';
import { jobsAPI, candidatesAPI, applicationsAPI } from '@/lib/api';
import { JobStats, CandidateStats, ApplicationStats } from '@/types';
import AppLayout from '@/components/AppLayout';

export default function DashboardPage() {
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [candidateStats, setCandidateStats] = useState<CandidateStats | null>(null);
  const [appStats, setAppStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [j, c, a] = await Promise.all([
          jobsAPI.getStats(),
          candidatesAPI.getStats(),
          applicationsAPI.getStats(),
        ]);
        setJobStats(j);
        setCandidateStats(c);
        setAppStats(a);
      } catch (err) {
        console.error('加载统计数据失败', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: '在招职位', value: jobStats?.published ?? 0, total: jobStats?.total ?? 0, color: 'bg-blue-500', icon: '💼' },
    { label: '候选人总数', value: candidateStats?.total ?? 0, extra: `新候选人 ${candidateStats?.newCandidates ?? 0}`, color: 'bg-green-500', icon: '👥' },
    { label: '待处理申请', value: appStats?.pending ?? 0, total: appStats?.total ?? 0, color: 'bg-yellow-500', icon: '📋' },
    { label: '已入职', value: appStats?.hired ?? 0, extra: `录用率 ${appStats?.hireRate ?? '0%'}`, color: 'bg-purple-500', icon: '🎉' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-500 mt-1">招聘数据概览</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{card.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                      {card.total !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">共 {card.total} 个</p>
                      )}
                      {card.extra && (
                        <p className="text-xs text-gray-400 mt-1">{card.extra}</p>
                      )}
                    </div>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 快捷操作 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a href="/jobs" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition">
                  <span className="text-xl">💼</span>
                  <div>
                    <p className="font-medium text-gray-900">发布职位</p>
                    <p className="text-xs text-gray-500">创建新的招聘职位</p>
                  </div>
                </a>
                <a href="/candidates" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition">
                  <span className="text-xl">👥</span>
                  <div>
                    <p className="font-medium text-gray-900">添加候选人</p>
                    <p className="text-xs text-gray-500">录入候选人信息</p>
                  </div>
                </a>
                <a href="/applications" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="font-medium text-gray-900">处理申请</p>
                    <p className="text-xs text-gray-500">审核待处理申请</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
