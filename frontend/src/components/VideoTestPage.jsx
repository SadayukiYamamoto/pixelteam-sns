import Header from "../components/Header";
import Navigation from "../components/Navigation";
import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useParams, useNavigate } from "react-router-dom";
import "./VideoTestPage.css";

export default function VideoTestPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos'); // ナビゲーション用

  // 回答状態
  const [answers, setAnswers] = useState({});
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);


  // 🔥 データ取得
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Token ${token}` };

        // テスト＆アンケート取得
        const res = await axiosClient.get(`/videos/${videoId}/test/`);
        setTest(res.data);

        if (res.data && res.data.questions) {
          const initial = {};
          res.data.questions.forEach((q) => { initial[q.id] = null; });
          setAnswers(initial);
        }

        const surveyRes = await axiosClient.get(`/videos/${videoId}/survey/`);
        setSurvey(surveyRes.data);

        if (surveyRes.data && surveyRes.data.questions) {
          const initialSurvey = {};
          surveyRes.data.questions.forEach((q) => {
            initialSurvey[q.id] = q.question_type === "choice" ? null : "";
          });
          setSurveyAnswers(initialSurvey);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [videoId]);


  // 🔥 テスト回答選択
  const selectAnswer = (questionId, choiceId) => {
    setAnswers({ ...answers, [questionId]: choiceId });
  };

  // 🔥 回答を Django に送信（採点API呼び出し）
  const submitAnswers = async () => {
    // バリデーション
    if (!test || !test.questions) return;
    const unansweredTest = test.questions.some((q) => answers[q.id] === null);
    if (unansweredTest) return alert("すべてのテスト問題に回答してください！");

    const unansweredSurvey = survey && survey.questions.some((q) => {
      const v = surveyAnswers[q.id];
      return q.question_type === "choice" ? v === null : v === "";
    });
    if (unansweredSurvey) return alert("アンケートにすべて回答してください！");

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Token ${token}` };

      // 1. テスト送信
      const testRes = await axiosClient.post(
        `/videos/${videoId}/test/submit/`,
        { answers }
      );

      // 2. アンケート送信
      if (survey) {
        await axiosClient.post(
          `/videos/${videoId}/survey/submit/`,
          { answers: surveyAnswers }
        );
      }

      // 結果表示
      setResult(testRes.data);
      console.log("採点結果:", testRes.data);

    } catch (err) {
      console.error("送信エラー:", err);
      alert("回答送信中にエラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 リトライ
  const handleRetry = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔥 完了（動画へ戻る）
  const handleComplete = () => {
    navigate(`/video/${videoId}`);
  };

  if (loading) return <div className="loading">問題読み込み中...</div>;
  if (!test) return <div className="error">テストが見つかりません</div>;

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />

        <div className="test-page-container" style={{ paddingTop: 'calc(76px + env(safe-area-inset-top, 0px))', paddingBottom: '100px', flex: 1, overflowY: 'auto' }}>
          {/* --- 結果モーダル --- */}
          {result && (
            <div className="result-overlay">
              <div className={`result-card ${result.is_passed ? "passed" : "failed"}`}>
                <h1>{result.is_passed ? "合格！🎉" : "残念..."}</h1>

                {/* 📊 円グラフ & パーセント表示 */}
                <div className="score-graph-container">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path className={`circle ${result.is_passed ? "pass" : "fail"}`}
                      strokeDasharray={`${(result.score / result.max_score) * 100}, 100`}
                      d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="percentage">
                      {Math.round((result.score / result.max_score) * 100)}%
                    </text>
                  </svg>
                  <p className="score-label">理解度</p>
                </div>

                <p className="message">
                  {result.is_passed
                    ? "おめでとうございます！理解度が認められました。"
                    : "合格ライン（80%）に届きませんでした。動画を見直して再挑戦しましょう！"}
                </p>

                <div className="result-actions">
                  {result.is_passed ? (
                    <button className="btn-primary" onClick={handleComplete}>詳細画面へ戻る</button>
                  ) : (
                    <button className="btn-retry" onClick={handleRetry}>もう一度挑戦する</button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="test-header">
            <h2>{test.title || "確認テスト"}</h2>
            <p>全問正解を目指して頑張りましょう！</p>
          </div>

          <div className="questions-container">
            {test?.questions?.map((q, index) => (
              <div key={q.id} className="question-card">
                <div className="question-title">
                  <span className="q-num">Q{index + 1}</span> {q.text}
                </div>
                {q.description && (
                  <div className="question-description">{q.description}</div>
                )}
                <div className="choices-grid">
                  {q.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className={`choice-item ${answers[q.id] === choice.id ? "selected" : ""}`}
                      onClick={() => selectAnswer(q.id, choice.id)}
                    >
                      <div className="radio-circle"></div>
                      <span>{choice.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ▼ アンケート（Survey） */}
          {survey && (
            <div className="survey-container">
              <h3>📝 アンケート</h3>
              <p className="survey-desc">今後の改善のため、ご協力をお願いします。</p>

              {survey?.questions?.map((q) => (
                <div key={q.id} className="survey-item">
                  <p className="survey-q">{q.text}</p>
                  {q.description && (
                    <div className="question-description" style={{ marginTop: '-8px', marginBottom: '12px', borderLeftColor: '#cbd5e1' }}>
                      {q.description}
                    </div>
                  )}

                  {q.question_type === "choice" ? (
                    <div className="survey-choices">
                      {q.choices.map((choice) => (
                        <button
                          key={choice.id}
                          className={`survey-choice-btn ${surveyAnswers[q.id] === choice.id ? "active" : ""}`}
                          onClick={() => setSurveyAnswers({ ...surveyAnswers, [q.id]: choice.id })}
                        >
                          {choice.text}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      className="survey-text-input"
                      placeholder="自由にご記入ください..."
                      value={surveyAnswers[q.id] || ""}
                      onChange={(e) => setSurveyAnswers({ ...surveyAnswers, [q.id]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="footer-actions">
            <button className="back-link" onClick={() => navigate(-1)}>キャンセル</button>
            <button
              className="submit-main-btn"
              onClick={submitAnswers}
              disabled={submitting}
            >
              {submitting ? "送信中..." : "回答を送信する"}
            </button>
          </div>
        </div>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
