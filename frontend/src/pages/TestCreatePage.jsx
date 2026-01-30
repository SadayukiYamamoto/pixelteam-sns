import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useParams, useNavigate } from "react-router-dom";
import { FiTrash2, FiSave, FiArrowLeft, FiPlus, FiCheck } from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "./TestCreatePage.css";

export default function TestCreatePage() {
  const { videoId: paramVideoId } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [videoId, setVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // テスト問題
  const [questions, setQuestions] = useState([
    {
      text: "",
      description: "",
      choices: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
    },
  ]);

  // アンケート質問
  const [surveyQuestions, setSurveyQuestions] = useState([
    { type: "choice", text: "この動画の満足度を教えてください", description: "", choices: ["とても満足", "満足", "普通", "不満"] },
    { type: "text", text: "感想やご意見があればご記入ください", description: "", choices: [] }
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axiosClient.get("videos/");
        setVideos(res.data);

        if (paramVideoId) {
          setVideoId(paramVideoId);
          setLoading(true);

          try {
            const testRes = await axiosClient.get(`videos/${paramVideoId}/test/`);
            if (testRes.data) {
              setTitle(testRes.data.title);
              setQuestions(testRes.data.questions);
            }
          } catch (e) {
            console.log("既存のテストなし");
          }

          try {
            const surveyRes = await axiosClient.get(`videos/${paramVideoId}/survey/`);
            setSurveyQuestions(surveyRes.data.questions.map(q => ({
              type: q.question_type,
              text: q.text,
              description: q.description || "",
              choices: q.choices.map(c => c.text)
            })));
          } catch (e) {
            console.log("既存のアンケートなし");
          }
          setLoading(false);
        }
      } catch (e) {
        console.error("初期化エラー", e);
      }
    };
    init();
  }, [paramVideoId]);

  // --- Handlers ---
  const addQuestion = () => setQuestions([...questions, { text: "", description: "", choices: [{ text: "", is_correct: false }, { text: "", is_correct: false }] }]);
  const removeQuestion = (idx) => {
    if (questions.length <= 1) return alert("最低1問必要です");
    setQuestions(questions.filter((_, i) => i !== idx));
  };
  const updateQuestionText = (idx, text) => {
    const q = [...questions]; q[idx].text = text; setQuestions(q);
  };
  const updateQuestionDescription = (idx, description) => {
    const q = [...questions]; q[idx].description = description; setQuestions(q);
  };
  const updateChoice = (qi, ci, text) => {
    const q = [...questions]; q[qi].choices[ci].text = text; setQuestions(q);
  };
  const setCorrectChoice = (qi, ci) => {
    const q = [...questions];
    q[qi].choices.forEach((c, i) => c.is_correct = (i === ci));
    setQuestions(q);
  };
  const addChoice = (qi) => {
    const q = [...questions]; q[qi].choices.push({ text: "", is_correct: false }); setQuestions(q);
  };
  const removeChoice = (qi, ci) => {
    const q = [...questions];
    if (q[qi].choices.length <= 1) return;
    q[qi].choices = q[qi].choices.filter((_, i) => i !== ci);
    setQuestions(q);
  };

  const addSurveyQuestion = (type) => setSurveyQuestions([...surveyQuestions, { type, text: "", description: "", choices: type === 'choice' ? ["選択肢1"] : [] }]);
  const removeSurveyQuestion = (idx) => setSurveyQuestions(surveyQuestions.filter((_, i) => i !== idx));
  const updateSurveyQuestion = (idx, field, val) => {
    const s = [...surveyQuestions]; s[idx][field] = val; setSurveyQuestions(s);
  };
  const updateSurveyChoice = (si, ci, val) => {
    const s = [...surveyQuestions]; s[si].choices[ci] = val; setSurveyQuestions(s);
  };
  const addSurveyChoice = (si) => {
    const s = [...surveyQuestions]; s[si].choices.push("新しい選択肢"); setSurveyQuestions(s);
  };
  const removeSurveyChoice = (si, ci) => {
    const s = [...surveyQuestions]; s[si].choices = s[si].choices.filter((_, i) => i !== ci); setSurveyQuestions(s);
  };

  const saveTest = async () => {
    if (!videoId) return alert("動画を選択してください");
    if (!title.trim()) return alert("テスト名を入力してください");
    if (questions.some(q => !q.choices.some(c => c.is_correct))) return alert("全ての設問に正解を設定してください");

    const payload = {
      video_id: videoId, title,
      questions: questions.map((q, i) => ({ order: i + 1, text: q.text, description: q.description, choices: q.choices })),
      survey_questions: surveyQuestions.map((s, i) => ({ order: i + 1, type: s.type, text: s.text, description: s.description, choices: s.choices }))
    };

    try {
      await axiosClient.post("tests/create/", payload);
      alert("保存しました！");
      navigate("/admin/tests");
    } catch (err) {
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="test-create-container">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="test-create-wrapper"
      >
        {/* Header Section */}
        <div className="test-create-header">
          <div className="header-left">
            <button onClick={() => navigate("/admin/tests")} className="back-btn">
              <FiArrowLeft size={18} /> テスト一覧に戻る
            </button>
            <div className="page-main-title">
              <div className="title-icon-box">
                <FaGamepad size={32} />
              </div>
              <h1>{paramVideoId ? "テストの編集" : "テスト新規作成"}</h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center font-black text-[#CBD5E1] uppercase tracking-[0.3em] text-xl">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* 01. 基本設定 */}
            <section className="test-section-card">
              <div className="section-label">
                <span className="label-number">01</span>
                <h2 className="label-text">基本設定</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="premium-input-group">
                  <label>対象動画</label>
                  <select
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                    disabled={!!paramVideoId}
                    className="premium-select"
                  >
                    <option value="">動画を選択してください</option>
                    {videos.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                  </select>
                </div>
                <div className="premium-input-group">
                  <label>テスト名</label>
                  <input
                    type="text"
                    placeholder="例: 接客マナー 初級編"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '18px 40px',
                      borderRadius: '18px',
                      fontSize: '15px',
                      fontWeight: '700',
                      backgroundColor: '#F8FAFC',
                      border: '1.5px solid #F1F5F9',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </section>

            {/* 02. テスト問題 */}
            <section className="test-section-card">
              <div className="section-label">
                <span className="label-number">02</span>
                <h2 className="label-text">テスト問題 ({questions.length})</h2>
              </div>

              <div className="space-y-12">
                <AnimatePresence>
                  {questions.map((q, qi) => (
                    <motion.div
                      key={qi}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="question-item"
                    >
                      <div className="question-header">
                        <div className="q-badge">
                          <div className="q-number">{qi + 1}</div>
                          <span className="q-meta">Question Content</span>
                        </div>
                        <button onClick={() => removeQuestion(qi)} className="trash-btn">
                          <FiTrash2 size={20} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <input
                          type="text"
                          placeholder="例：お客様が入店された時の最初の挨拶は？"
                          value={q.text}
                          onChange={(e) => updateQuestionText(qi, e.target.value)}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '24px 40px',
                            borderRadius: '20px',
                            fontSize: '18px',
                            fontWeight: '900',
                            backgroundColor: '#F8FAFC',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                          }}
                        />

                        <textarea
                          placeholder="問題の説明文（任意）"
                          value={q.description || ""}
                          onChange={(e) => updateQuestionDescription(qi, e.target.value)}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '16px 40px',
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            backgroundColor: '#F1F5F9',
                            border: 'none',
                            outline: 'none',
                            minHeight: '80px',
                            resize: 'none'
                          }}
                        />

                        <div className="choice-grid">
                          {q.choices.map((choice, ci) => (
                            <div key={ci} className={`choice-item ${choice.is_correct ? 'correct' : ''}`}>
                              <button
                                onClick={() => setCorrectChoice(qi, ci)}
                                className={`choice-radio ${choice.is_correct ? 'active' : ''}`}
                              >
                                <FiCheck size={16} className="stroke-[4]" />
                              </button>
                              <input
                                type="text"
                                placeholder={`選択肢 ${ci + 1}`}
                                value={choice.text}
                                onChange={(e) => updateChoice(qi, ci, e.target.value)}
                                className="choice-input"
                              />
                              <button onClick={() => removeChoice(qi, ci)} className="trash-btn !p-1 opacity-40 hover:opacity-100">
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => addChoice(qi)}
                          className="mx-auto flex items-center gap-2 px-10 py-4 bg-[#F8FAFC] hover:bg-[#F0FDF4] text-[#22C55E] rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-none"
                        >
                          <FiPlus /> その他の選択肢を追加
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button onClick={addQuestion} className="add-btn-v2">
                <FiPlus size={20} /> 新しい問題を追加
              </button>
            </section>

            {/* 03. アンケート設定 */}
            <section className="test-section-card">
              <div className="section-label">
                <span className="label-number">03</span>
                <h2 className="label-text">アンケート設定 (任意)</h2>
              </div>

              <div className="space-y-12">
                {surveyQuestions.map((sq, si) => (
                  <div key={si} className="question-item">
                    <div className="question-header">
                      <div className="q-badge">
                        <div className="q-number bg-[#475569]">S{si + 1}</div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${sq.type === 'choice' ? 'bg-[#FFF7ED] text-[#F97316]' : 'bg-[#F0F9FF] text-[#0EA5E9]'}`}>
                          {sq.type === 'choice' ? '複数選択式' : '自由記述式'}
                        </span>
                      </div>
                      <button onClick={() => removeSurveyQuestion(si)} className="trash-btn">
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <input
                        type="text"
                        placeholder="アンケートの項目内容を入力"
                        value={sq.text}
                        onChange={(e) => updateSurveyQuestion(si, 'text', e.target.value)}
                        className="!border-none !shadow-inner"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '24px 60px',
                          borderRadius: '24px',
                          fontSize: '18px',
                          fontWeight: '900',
                          backgroundColor: '#F8FAFC',
                          color: '#334155'
                        }}
                      />

                      <textarea
                        placeholder="アンケート項目の説明文（任意）"
                        value={sq.description || ""}
                        onChange={(e) => updateSurveyQuestion(si, 'description', e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '16px 40px',
                          borderRadius: '16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          backgroundColor: '#F1F5F9',
                          border: 'none',
                          outline: 'none',
                          minHeight: '60px',
                          resize: 'none'
                        }}
                      />

                      {sq.type === 'choice' && (
                        <div className="pl-6 space-y-4">
                          {sq.choices.map((choice, ci) => (
                            <div key={ci} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-[#FDBA74]" />
                              <input
                                type="text"
                                value={choice}
                                onChange={(e) => updateSurveyChoice(si, ci, e.target.value)}
                                className="flex-1 bg-white border border-[#F1F5F9] shadow-sm outline-none"
                                style={{ padding: '18px 40px', borderRadius: '16px', fontSize: '15px', fontWeight: '700' }}
                              />
                              <button onClick={() => removeSurveyChoice(si, ci)} className="trash-btn !p-1 opacity-40 hover:opacity-100">
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addSurveyChoice(si)}
                            className="mt-4 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#F97316] font-black uppercase tracking-widest transition-all border-none flex items-center gap-2"
                            style={{ padding: '16px 40px', borderRadius: '30px', fontSize: '12px' }}
                          >
                            <FiPlus /> 選択肢を追加
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4" style={{ marginTop: '100px' }}>
                <button
                  onClick={() => addSurveyQuestion('choice')}
                  className="flex-1 bg-[#FFF7ED] text-[#F97316] font-black text-xs uppercase tracking-widest hover:bg-[#FFEDD5] transition-all flex items-center justify-center gap-4 border-none"
                  style={{ padding: '24px 48px', borderRadius: '24px', minHeight: '80px' }}
                >
                  <FiPlus size={24} /> 選択式項目を追加
                </button>
                <button
                  onClick={() => addSurveyQuestion('text')}
                  className="flex-1 bg-[#F0F9FF] text-[#0EA5E9] font-black text-xs uppercase tracking-widest hover:bg-[#E0F2FE] transition-all flex items-center justify-center gap-4 border-none"
                  style={{ padding: '24px 48px', borderRadius: '24px', minHeight: '80px' }}
                >
                  <FiPlus size={24} /> 記述式項目を追加
                </button>
              </div>
            </section>

            {/* Footer Save Button */}
            <div className="flex justify-center pt-12 pb-20">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveTest}
                className="bg-[#22C55E] text-white font-black shadow-[0_20px_50px_-10px_rgba(34,197,94,0.4)] border-none whitespace-nowrap active:bg-[#16A34A] transition-all"
                style={{
                  padding: '24px 80px',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '20px',
                  letterSpacing: '0.05em'
                }}
              >
                <FiSave size={24} />
                <span>テストを保存して公開する</span>
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
      <Navigation activeTab="mypage" />
    </div>
  );
}
