import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  ArrowLeft,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  UserCheck
} from 'lucide-react';

export default function AdminStudents() {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Student History Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchStudents();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students', {
        params: { search: search.trim() },
      });
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewStudentHistory = async (student) => {
    setSelectedStudent(student);
    try {
      setLoadingHistory(true);
      const res = await api.get(`/admin/students/${student.id}/history`);
      if (res.data.success) {
        setStudentHistory(res.data.exams || []);
      }
    } catch (err) {
      alert('Student tarixini yuklashda xatolik yuz berdi.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return d.toLocaleString('uz-UZ', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/dashboard"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Ro'yxatdan O'tgan Studentlar
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Jami studentlar soni: <span className="text-emerald-400 font-bold">{students.length}</span> nafar
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            placeholder="Ism yoki telefon raqam..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs">Studentlar ro'yxati yuklanmoqda...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Studentlar topilmadi</h3>
          <p className="text-xs text-slate-400">Hozircha hech kim ro'yxatdan o'tmagan.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Telefon</th>
                  <th className="px-6 py-4">Ro'yxatdan o'tgan</th>
                  <th className="px-6 py-4">Testlar soni</th>
                  <th className="px-6 py-4">O'rtacha ball</th>
                  <th className="px-6 py-4 text-right">Tarix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                          {student.name ? student.name[0].toUpperCase() : 'S'}
                        </div>
                        <span className="font-semibold text-white">{student.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                      {student.phone}
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {formatDate(student.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-white">{student.total_exams}</span>
                      <span className="text-slate-500 text-xs ml-1">
                        ({student.passed_exams} ta o'tgan)
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${
                          student.average_score >= 90
                            ? 'text-emerald-400'
                            : student.average_score >= 70
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {student.average_score}%
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewStudentHistory(student)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ko'rish</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: View Student's Exam History for Admin */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-2xl w-full my-8 p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedStudent.phone}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Imtihonlar tarixi yuklanmoqda...</p>
              </div>
            ) : studentHistory && studentHistory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Ushbu student hali hech qanday test topshirmagan.
              </p>
            ) : (
              <div className="space-y-3">
                {studentHistory?.map((exam, idx) => (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-slate-500">#{idx + 1}</span>
                      <div>
                        <p className="text-slate-300 font-medium">
                          {new Date(exam.created_at).toLocaleString('uz-UZ')}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {Math.floor(exam.time_spent_seconds / 60)} daq {exam.time_spent_seconds % 60} son
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-bold text-white">{exam.score_percentage}%</p>
                        <p className="text-[11px] text-slate-400">
                          {exam.correct_answers} / {exam.total_questions} to'g'ri
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          exam.passed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {exam.passed ? "O'TDI" : "YIQILDI"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
