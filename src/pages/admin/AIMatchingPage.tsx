import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Zap, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { ChartCard } from '../../components/ui/ChartCard';
import { DataTable } from '../../components/ui/DataTable';
import { bloodGroupColor } from '../../utils/helpers';
import { cn } from '../../utils/cn';
import { getAllRequests, runAIMatching } from '../../services/requestService';
import { manualMatch, getDonorMessage } from '../../services/aiService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function AIMatchingPage() {
  const [requests,       setRequests]       = useState<any[]>([]);
  const [selectedReq,    setSelectedReq]    = useState<any>(null);
  const [matchResult,    setMatchResult]    = useState<any>(null);
  const [previewResult,  setPreviewResult]  = useState<any>(null);
  const [loading,        setLoading]        = useState(true);
  const [matchLoading,   setMatchLoading]   = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [msgLoading,     setMsgLoading]     = useState<string | null>(null);
  const [donorMessage,   setDonorMessage]   = useState<{donor: string; message: string} | null>(null);
  const [error,          setError]          = useState('');

  // Manual match form
  const [previewBG,      setPreviewBG]      = useState('O+');
  const [previewUrgency, setPreviewUrgency] = useState('high');

  // ── Fetch pending requests ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getAllRequests();
        const active = data.filter((r: any) =>
          ['pending', 'matching', 'active'].includes(r.status)
        );
        setRequests(active);
        if (active.length > 0) setSelectedReq(active[0]);
      } catch (err: any) {
        setError('Failed to load requests: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // ── Run AI matching on selected request ─────────────────────────────────────
  const handleRunMatching = async () => {
    if (!selectedReq) return;
    setMatchLoading(true);
    setMatchResult(null);
    setError('');
    try {
      const result = await runAIMatching(selectedReq.request_id);
      setMatchResult(result);
    } catch (err: any) {
      setError('AI Matching failed: ' + err.message);
    } finally {
      setMatchLoading(false);
    }
  };

  // ── Preview match (no existing request) ────────────────────────────────────
  const handlePreviewMatch = async () => {
    setPreviewLoading(true);
    setPreviewResult(null);
    setError('');
    try {
      const result = await manualMatch({
        blood_group: previewBG,
        urgency:     previewUrgency,
        top_primary: 5,
        top_backup:  10,
      });
      setPreviewResult(result);
    } catch (err: any) {
      setError('Preview match failed: ' + err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Generate AI donor message ───────────────────────────────────────────────
  const handleGetMessage = async (donorId: string, donorName: string) => {
    if (!selectedReq) return;
    setMsgLoading(donorId);
    try {
      const res = await getDonorMessage(donorId, selectedReq.request_id);
      setDonorMessage({ donor: donorName, message: res.message });
    } catch {
      setDonorMessage({ donor: donorName, message: 'Could not generate message.' });
    } finally {
      setMsgLoading(null);
    }
  };

  // ── Score color ─────────────────────────────────────────────────────────────
  const scoreColor = (score: number) => {
    if (score >= 0.75) return '#10b981';
    if (score >= 0.50) return '#f59e0b';
    return '#ef4444';
  };

  const scoreLabel = (score: number) => {
    if (score >= 0.75) return 'Excellent';
    if (score >= 0.50) return 'Good';
    return 'Low';
  };

  const predictionColor = (pred: string) => {
    if (pred === 'high')   return { bg: '#f0fdf4', border: '#86efac', text: '#166534' };
    if (pred === 'medium') return { bg: '#fffbeb', border: '#fde68a', text: '#92400e' };
    return                        { bg: '#fff1f2', border: '#fda4af', text: '#9f1239' };
  };

  // ── Columns for matched donors ──────────────────────────────────────────────
  const matchColumns = [
    {
      key: 'rank', header: 'Rank',
      render: (_: any, i: number) => (
        <span className="font-bold text-gray-500">#{i + 1}</span>
      )
    },
    {
      key: 'name', header: 'Donor',
      render: (d: any) => (
        <div>
          <p className="font-semibold text-sm">{d.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{d.city || '—'}</p>
        </div>
      )
    },
    {
      key: 'blood_group', header: 'Blood Group',
      render: (d: any) => (
        <span className={cn('badge text-sm', bloodGroupColor(d.blood_group))}>
          {d.blood_group}
        </span>
      )
    },
    {
      key: 'priority_score', header: 'AI Score',
      render: (d: any) => {
        const score = parseFloat(d.priority_score) || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 rounded-full bg-gray-200">
              <div className="h-2 rounded-full" style={{
                width: `${score * 100}%`,
                backgroundColor: scoreColor(score),
              }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: scoreColor(score) }}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        );
      }
    },
    {
      key: 'score_label', header: 'Rating',
      render: (d: any) => {
        const score = parseFloat(d.priority_score) || 0;
        return (
          <span className="text-xs font-semibold" style={{ color: scoreColor(score) }}>
            {scoreLabel(score)}
          </span>
        );
      }
    },
    {
      key: 'match_type', header: 'Type',
      render: (d: any) => (
        <span className={cn(
          'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
          d.match_type === 'primary'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600'
        )}>
          {d.match_type === 'primary' ? '⭐ Primary' : '🔄 Backup'}
        </span>
      )
    },
    {
      key: 'donations', header: 'Donations',
      render: (d: any) => (
        <span className="text-sm font-semibold">{d.donations || 0}</span>
      )
    },
  ];

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#e11d48' }} />
          <p className="text-gray-500">Loading requests...</p>
        </div>
      </div>
    );
  }

  const allMatched = matchResult
    ? [...(matchResult.primary_donors || []), ...(matchResult.backup_donors || [])]
    : [];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Donor Matching</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Powered by Amazon Bedrock Claude — real-time donor scoring and ranking
        </p>
      </div>

      {error && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Section 1: Match for existing request */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5" style={{ color: '#e11d48' }} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Match Donors to Blood Request
          </h2>
        </div>

        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No active requests found. Create a blood request first.
          </p>
        ) : (
          <>
            {/* Request selector */}
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Request:
              </label>
              <select
                value={selectedReq?.request_id || ''}
                onChange={e => setSelectedReq(requests.find(r => r.request_id === e.target.value))}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                style={{ minWidth: '280px' }}
              >
                {requests.map(r => (
                  <option key={r.request_id} value={r.request_id}>
                    {r.blood_group} — {r.hospital} ({r.urgency})
                  </option>
                ))}
              </select>

              <button
                onClick={handleRunMatching}
                disabled={matchLoading || !selectedReq}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{
                  backgroundColor: matchLoading ? '#fda4af' : '#e11d48',
                  cursor: matchLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {matchLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Running AI...</>
                  : <><Zap className="h-4 w-4" /> Run AI Matching</>}
              </button>
            </div>

            {/* Selected request details */}
            {selectedReq && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl"
                style={{ backgroundColor: '#fff1f2', border: '1px solid #fda4af' }}>
                <div>
                  <p className="text-xs text-gray-500">Blood Group</p>
                  <p className="font-bold text-sm" style={{ color: '#e11d48' }}>{selectedReq.blood_group}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hospital</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{selectedReq.hospital}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Urgency</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white capitalize">{selectedReq.urgency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Units Required</p>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{selectedReq.units_required}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Match Results */}
        {matchResult && (
          <div className="space-y-4 mt-2">

            {/* Fulfillment prediction */}
            {(() => {
              const c = predictionColor(matchResult.fulfillment_prediction);
              return (
                <div className="rounded-xl p-4" style={{ backgroundColor: c.bg, border: `1.5px solid ${c.border}` }}>
                  <div className="flex items-center gap-2">
                    {matchResult.fulfillment_prediction === 'high'
                      ? <CheckCircle className="h-5 w-5" style={{ color: c.text }} />
                      : <AlertCircle className="h-5 w-5" style={{ color: c.text }} />}
                    <div>
                      <p className="font-bold text-sm" style={{ color: c.text }}>
                        Fulfillment Prediction: {matchResult.fulfillment_prediction?.toUpperCase()}
                      </p>
                      <p className="text-xs" style={{ color: c.text }}>
                        {matchResult.total_eligible} eligible donors found —
                        {matchResult.primary_donors?.length} primary,
                        {matchResult.backup_donors?.length} backup
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Top 3 primary donors */}
            <div className="grid gap-4 md:grid-cols-3">
              {matchResult.primary_donors?.slice(0, 3).map((donor: any, i: number) => {
                const score = parseFloat(donor.priority_score) || 0;
                return (
                  <div key={donor.donor_id}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Rank #{i + 1}</p>
                        <p className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
                          {donor.name || 'Unknown Donor'}
                        </p>
                        <p className="text-xs text-gray-500">{donor.city || '—'}</p>
                      </div>
                      <span className={cn('badge', bloodGroupColor(donor.blood_group))}>
                        {donor.blood_group}
                      </span>
                    </div>

                    {/* Score bar */}
                    {[
                      { label: 'AI Score', value: score * 100 },
                      { label: 'Donations', value: Math.min(100, (donor.donations || 0) * 5) },
                    ].map(bar => (
                      <div key={bar.label} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{bar.label}</span>
                          <span className="font-semibold" style={{ color: scoreColor(score) }}>
                            {bar.value.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-200">
                          <div className="h-1.5 rounded-full" style={{
                            width: `${bar.value}%`,
                            backgroundColor: scoreColor(score),
                          }} />
                        </div>
                      </div>
                    ))}

                    {/* Generate message button */}
                    <button
                      onClick={() => handleGetMessage(donor.donor_id, donor.name)}
                      disabled={msgLoading === donor.donor_id}
                      className="mt-3 w-full rounded-lg py-1.5 text-xs font-semibold text-white transition-colors"
                      style={{ backgroundColor: '#7c3aed' }}
                    >
                      {msgLoading === donor.donor_id
                        ? <span className="flex items-center justify-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Generating...</span>
                        : '🤖 Generate AI Message'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* AI generated message */}
            {donorMessage && (
              <div className="rounded-xl p-4" style={{
                backgroundColor: '#f5f3ff', border: '1.5px solid #a78bfa'
              }}>
                <p className="text-xs font-bold text-purple-700 mb-2">
                  🤖 AI-Generated Message for {donorMessage.donor}
                </p>
                <p className="text-sm text-purple-800 italic">"{donorMessage.message}"</p>
              </div>
            )}

            {/* Full leaderboard */}
            <ChartCard title="Full AI Rankings Leaderboard">
              <DataTable
                columns={matchColumns}
                data={allMatched}
                pageSize={15}
                searchable={true}
                searchPlaceholder="Search donors..."
                emptyMessage="No matched donors"
              />
            </ChartCard>
          </div>
        )}
      </div>

      {/* Section 2: Preview match without existing request */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Preview Match (No Request Needed)
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          Preview which donors would be matched for any blood group before creating a request.
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <select value={previewBG} onChange={e => setPreviewBG(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={previewUrgency} onChange={e => setPreviewUrgency(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
            {['low', 'medium', 'high', 'critical'].map(u => (
              <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handlePreviewMatch}
            disabled={previewLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: previewLoading ? '#93c5fd' : '#3b82f6', cursor: previewLoading ? 'not-allowed' : 'pointer' }}
          >
            {previewLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Scoring...</>
              : <><Brain className="h-4 w-4" /> Preview Match</>}
          </button>
        </div>

        {previewResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Blood Group: <strong>{previewResult.blood_group}</strong></span>
              <span className="text-gray-600">Compatible: <strong>{previewResult.compatible_groups?.join(', ')}</strong></span>
              <span className="text-gray-600">Eligible Donors: <strong>{previewResult.total_eligible}</strong></span>
              <span className="font-semibold capitalize" style={{
                color: predictionColor(previewResult.fulfillment_prediction).text
              }}>
                Prediction: {previewResult.fulfillment_prediction?.toUpperCase()}
              </span>
            </div>
            <ChartCard title="Preview — Top Matched Donors">
              <DataTable
                columns={matchColumns}
                data={[
                  ...(previewResult.primary_donors || []),
                  ...(previewResult.backup_donors  || []),
                ]}
                pageSize={10}
                searchable={false}
                emptyMessage="No eligible donors found"
              />
            </ChartCard>
          </div>
        )}
      </div>

      {/* AI Methodology */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
        <h3 className="font-semibold text-blue-900 dark:text-blue-400 flex items-center gap-2">
          <Brain className="h-4 w-4" /> AI Scoring Methodology
        </h3>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm text-blue-800 dark:text-blue-300">
          {[
            { factor: 'Response Rate',    weight: '40%', desc: 'calls_to_donations_ratio' },
            { factor: 'Donation Success', weight: '20%', desc: 'donations_till_date' },
            { factor: 'Availability',     weight: '20%', desc: 'eligibility + active status' },
            { factor: 'Distance',         weight: '10%', desc: 'GPS distance to hospital' },
            { factor: 'Recency',          weight: '10%', desc: 'last_donation_date' },
          ].map(f => (
            <div key={f.factor} className="rounded-lg bg-white dark:bg-blue-900/20 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{f.weight}</p>
              <p className="font-semibold text-xs mt-1">{f.factor}</p>
              <p className="text-xs text-blue-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}