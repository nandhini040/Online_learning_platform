import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { ProgressBar, Loader } from '../../components/UI';
import api from '../../services/api';

export default function QuizPage() {
  const { id } = useParams(); // quiz id
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro'); // intro | taking | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/quizzes/${id}/`)
      .then(res => setQuiz(res.data))
      .catch(() => navigate('/student/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAnswer = (questionId, answerId) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        selected_answer_id: answerId,
      }));
      const res = await api.post(`/quizzes/${id}/submit/`, { answers: payload });
      setResult(res.data);
      setPhase('result');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;
  if (!quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQ];
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>

        {/* ─── INTRO PHASE ─── */}
        {phase === 'intro' && (
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: 'var(--shadow-glow)' }}>
              <Trophy size={36} color="white" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--text-primary)', marginBottom: 12 }}>
              {quiz.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
              {quiz.description || 'Test your knowledge on this topic. Answer all questions to earn XP!'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
              <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>{questions.length}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Questions</p>
              </div>
              <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>{quiz.passing_score || 70}%</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Pass Score</p>
              </div>
              <div className="card" style={{ padding: 20, textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--success)' }}>{quiz.xp_reward || 50}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>XP Reward</p>
              </div>
            </div>

            <button onClick={() => setPhase('taking')} className="btn-primary" style={{ padding: '14px 40px', fontSize: 16 }}>
              Start Quiz <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ─── TAKING PHASE ─── */}
        {phase === 'taking' && currentQuestion && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Question {currentQ + 1} of {questions.length}
                </p>
                <ProgressBar value={progress} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {answeredCount}/{questions.length} answered
              </span>
            </div>

            {/* Question Card */}
            <div className="card" style={{ padding: 36, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', marginBottom: 32, lineHeight: 1.4 }}>
                {currentQuestion.question_text}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {currentQuestion.answers?.map(answer => {
                  const selected = answers[currentQuestion.id] === answer.id;
                  return (
                    <button
                      key={answer.id}
                      onClick={() => handleAnswer(currentQuestion.id, answer.id)}
                      style={{
                        width: '100%', padding: '16px 20px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
                        background: selected ? 'rgba(99,102,241,0.08)' : 'var(--bg-elevated)',
                        color: selected ? 'var(--primary)' : 'var(--text-primary)',
                        fontWeight: selected ? 700 : 500, fontSize: 15,
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
                        background: selected ? 'var(--primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      {answer.answer_text}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
                disabled={currentQ === 0}
                className="btn-secondary"
                style={{ opacity: currentQ === 0 ? 0.4 : 1 }}
              >
                ← Previous
              </button>

              {currentQ < questions.length - 1 ? (
                <button onClick={() => setCurrentQ(p => p + 1)} className="btn-primary">
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answeredCount < questions.length}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, var(--success), #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}
                >
                  {submitting ? 'Submitting…' : 'Submit Quiz ✓'}
                </button>
              )}
            </div>
            {answeredCount < questions.length && currentQ === questions.length - 1 && (
              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#f59e0b' }}>
                ⚠️ Please answer all {questions.length} questions before submitting.
              </p>
            )}
          </div>
        )}

        {/* ─── RESULT PHASE ─── */}
        {phase === 'result' && result && (
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 24px',
              background: result.passed ? 'linear-gradient(135deg, var(--success), #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: result.passed ? '0 0 40px rgba(16,185,129,0.4)' : '0 0 40px rgba(239,68,68,0.4)',
            }}>
              {result.passed ? <CheckCircle size={48} color="white" /> : <XCircle size={48} color="white" />}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 36, color: 'var(--text-primary)', marginBottom: 8 }}>
              {result.passed ? '🎉 Congratulations!' : '😔 Not Quite'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 40 }}>
              {result.passed ? 'You passed! Keep up the great work.' : `You needed ${quiz.passing_score || 70}% to pass. Try again!`}
            </p>

            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
              <div className="card" style={{ padding: 24 }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: result.passed ? 'var(--success)' : '#ef4444' }}>
                  {result.score}%
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Score</p>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)' }}>
                  {result.correct_answers}/{result.total_questions}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Correct</p>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b' }}>+{result.xp_earned || 0}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>XP Earned</p>
              </div>
            </div>

            {/* Answer Review */}
            {result.answers_review && (
              <div className="card" style={{ padding: 24, marginBottom: 32, textAlign: 'left' }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Answer Review</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {result.answers_review.map((review, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 10, background: review.is_correct ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${review.is_correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        {review.is_correct ? <CheckCircle size={16} color="var(--success)" style={{ marginTop: 2 }} /> : <XCircle size={16} color="#ef4444" style={{ marginTop: 2 }} />}
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Q{i + 1}: {review.question}</p>
                          <p style={{ fontSize: 13, color: review.is_correct ? 'var(--success)' : '#ef4444' }}>
                            Your answer: {review.selected_answer}
                          </p>
                          {!review.is_correct && (
                            <p style={{ fontSize: 13, color: 'var(--success)' }}>
                              Correct: {review.correct_answer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {!result.passed && (
                <button onClick={() => { setPhase('intro'); setAnswers({}); setCurrentQ(0); }} className="btn-secondary" style={{ gap: 8 }}>
                  <RotateCcw size={15}/> Retry Quiz
                </button>
              )}
              <button onClick={() => navigate('/student/dashboard')} className="btn-primary">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
