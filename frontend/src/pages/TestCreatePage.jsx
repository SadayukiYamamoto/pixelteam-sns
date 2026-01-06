import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlusCircle, FaTrash, FaVideo, FaGamepad, FaClipboardList, FaSave, FaArrowLeft } from "react-icons/fa";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

export default function TestCreatePage() {
  const { videoId: paramVideoId } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [videoId, setVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // テスト問題（デフォルト1問）
  const [questions, setQuestions] = useState([
    {
      text: "",
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
    { type: "choice", text: "この動画の満足度を教えてください", choices: ["とても満足", "満足", "普通", "不満"] },
    { type: "text", text: "感想やご意見があればご記入ください", choices: [] }
  ]);

  // 🔥 動画リスト取得 & 編集時のデータ取得
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Token ${token}` };

        // 1. 動画リスト取得
        const res = await axios.get("/api/videos/");
        setVideos(res.data);

        // 2. 編集モードならデータ取得
        if (paramVideoId) {
          setVideoId(paramVideoId);
          setLoading(true);

          // テスト取得
          try {
            const testRes = await axios.get(`/api/videos/${paramVideoId}/test/`, { headers });
            if (testRes.data) {
              setTitle(testRes.data.title);
              setQuestions(testRes.data.questions);
            }
          } catch (e) {
            if (e.response && e.response.status === 404) {
              console.log("既存のテストはありません。新規作成します。");
            } else {
              console.error("テスト取得エラー", e);
            }
          }

          // アンケート取得
          try {
            const surveyRes = await axios.get(`/api/videos/${paramVideoId}/survey/`, { headers });
            if (surveyRes.data && surveyRes.data.questions) {
              setSurveyQuestions(surveyRes.data.questions.map(q => ({
                type: q.question_type,
                text: q.text,
                choices: q.choices.map(c => c.text)
              })));
            }
          } catch (e) {
            if (e.response && e.response.status === 404) {
              console.log("既存のアンケートはありません。デフォルトを表示します。");
            } else {
              console.error("アンケート取得エラー", e);
            }
          }

          setLoading(false);
        }

      } catch (e) {
        console.error("初期化エラー", e);
      }
    };
    init();
  }, [paramVideoId]);

  // --- テスト問題操作 ---
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        choices: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return alert("少なくとも1つの問題が必要です");
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestionText = (index, text) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const updateChoice = (qIndex, cIndex, value) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex].text = value;
    setQuestions(updated);
  };

  const setCorrectChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.forEach((c, idx) => {
      c.is_correct = idx === cIndex;
    });
    setQuestions(updated);
  };

  const addChoice = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.push({ text: "", is_correct: false });
    setQuestions(updated);
  };

  const removeChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    if (updated[qIndex].choices.length <= 2) return alert("選択肢は最低2つ必要です");
    updated[qIndex].choices.splice(cIndex, 1);
    setQuestions(updated);
  };

  // --- アンケート質問操作 ---
  const addSurveyQuestion = (type) => {
    setSurveyQuestions([
      ...surveyQuestions,
      {
        type: type, // "text" or "choice"
        text: "",
        choices: type === "choice" ? ["選択肢1", "選択肢2"] : []
      }
    ]);
  };

  const removeSurveyQuestion = (index) => {
    const updated = [...surveyQuestions];
    updated.splice(index, 1);
    setSurveyQuestions(updated);
  };

  const updateSurveyQuestion = (index, field, value) => {
    const updated = [...surveyQuestions];
    updated[index][field] = value;
    setSurveyQuestions(updated);
  };

  const updateSurveyChoice = (qIndex, cIndex, value) => {
    const updated = [...surveyQuestions];
    updated[qIndex].choices[cIndex] = value;
    setSurveyQuestions(updated);
  };

  const addSurveyChoice = (qIndex) => {
    const updated = [...surveyQuestions];
    updated[qIndex].choices.push("新しい選択肢");
    setSurveyQuestions(updated);
  };

  const removeSurveyChoice = (qIndex, cIndex) => {
    const updated = [...surveyQuestions];
    if (updated[qIndex].choices.length <= 1) return alert("選択肢は最低1つ必要です");
    updated[qIndex].choices.splice(cIndex, 1);
    setSurveyQuestions(updated);
  };

  // 🔥 保存処理
  const saveTest = async () => {
    if (!videoId) return alert("動画を選択してください");
    if (!title.trim()) return alert("テストタイトルを入力してください");

    const invalidQuestion = questions.some((q) => !q.choices.some((c) => c.is_correct));
    if (invalidQuestion) return alert("すべてのテスト問題に「正解」を設定してください");

    // ペイロード作成
    const payload = {
      video_id: videoId,
      title,
      questions: questions.map((q, qIndex) => ({
        order: qIndex + 1,
        text: q.text,
        choices: q.choices,
      })),
      survey_questions: surveyQuestions.map((q, qIndex) => ({
        order: qIndex + 1,
        type: q.type,
        text: q.text,
        choices: q.choices
      }))
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/tests/create/",
        payload,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      alert("テストとアンケートを保存しました！");
      navigate("/admin/tests"); // 一覧に戻る

    } catch (err) {
      console.error("テスト作成エラー:", err);
      alert("保存に失敗しました");
    }
  };

  return (
    <div className="home-container">
      <div className="admin-wrapper">
        <Header />
        <div className="max-w-4xl mx-auto p-4 md:p-10">
          <button
            onClick={() => navigate("/admin/tests")}
            className="mb-8 bg-white text-gray-400 hover:text-gray-600 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2 text-sm border-none"
          >
            <FaArrowLeft /> テスト一覧に戻る
          </button>

          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="p-3 bg-lime-100 text-[#84cc16] rounded-2xl shadow-inner">
                <FaGamepad size={28} />
              </span>
              {paramVideoId ? "テストの編集" : "テスト新規作成"}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-32 text-gray-400 font-bold">読み込み中...</div>
          ) : (
            <div className="space-y-12">

              {/* 1. 基本設定 */}
              <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-10 hover:shadow-2xl transition-all duration-500 border-none">
                <div className="flex items-center gap-3 text-2xl font-black text-gray-800 mb-8 pb-4 border-b border-gray-50">
                  <span className="text-[#84cc16]">01.</span> 基本設定
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">対象動画</label>
                    <select
                      value={videoId}
                      onChange={(e) => setVideoId(e.target.value)}
                      className="w-full bg-gray-50/50 rounded-2xl p-4 border-none shadow-inner focus:ring-2 focus:ring-[#84cc16] focus:bg-white outline-none transition-all cursor-pointer font-bold text-gray-700"
                      disabled={!!paramVideoId}
                    >
                      <option value="">動画を選択してください</option>
                      {videos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">テスト名</label>
                    <input
                      type="text"
                      placeholder="例: 接客マナー 初級編"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-gray-50/50 rounded-2xl p-4 border-none shadow-inner focus:ring-2 focus:ring-[#84cc16] focus:bg-white outline-none transition-all font-bold text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* 2. テスト問題 */}
              <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-10 hover:shadow-2xl transition-all duration-500 border-none">
                <div className="flex items-center gap-3 text-2xl font-black text-gray-800 mb-10 pb-4 border-b border-gray-50">
                  <span className="text-[#84cc16]">02.</span> テスト問題 ({questions.length})
                </div>

                <div className="space-y-16">
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="relative group">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                          <span className="bg-[#84cc16] text-white font-black w-10 h-10 flex items-center justify-center rounded-xl text-lg shadow-lg shadow-lime-200">
                            {qIndex + 1}
                          </span>
                          <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Question Content</span>
                        </div>
                        <button
                          onClick={() => removeQuestion(qIndex)}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm hover:shadow-md border-none"
                          title="問題を削除"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <input
                          type="text"
                          placeholder="例：お客様が入店された時の最初の挨拶は？"
                          value={q.text}
                          onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                          className="w-full bg-gray-50/50 rounded-[20px] p-5 border-none shadow-inner focus:ring-2 focus:ring-[#84cc16] focus:bg-white outline-none font-bold text-xl transition-all text-gray-800"
                        />

                        <div className="space-y-4 pl-4 pt-2">
                          {q.choices.map((choice, cIndex) => (
                            <div key={cIndex} className="flex items-center gap-4 group/choice">
                              <div className="relative">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={choice.is_correct}
                                  onChange={() => setCorrectChoice(qIndex, cIndex)}
                                  className="peer sr-only"
                                  id={`q${qIndex}-c${cIndex}`}
                                />
                                <label
                                  htmlFor={`q${qIndex}-c${cIndex}`}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${choice.is_correct ? 'bg-[#84cc16] text-white shadow-lg shadow-lime-300/50 transform scale-110' : 'bg-gray-100 text-transparent hover:bg-gray-200'}`}
                                >
                                  ✔
                                </label>
                              </div>

                              <input
                                type="text"
                                placeholder={`選択肢 ${cIndex + 1}`}
                                value={choice.text}
                                onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                                className={`flex-1 rounded-2xl p-4 text-sm border-none shadow-sm outline-none transition-all font-bold ${choice.is_correct ? 'bg-lime-50 text-lime-900 ring-2 ring-lime-100' : 'bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-100'}`}
                              />

                              <button
                                onClick={() => removeChoice(qIndex, cIndex)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-200 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover/choice:opacity-100 border-none"
                                title="選択肢を削除"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          ))}

                          <button
                            onClick={() => addChoice(qIndex)}
                            className="text-xs font-black text-[#84cc16] hover:text-[#a3e635] bg-lime-50/50 hover:bg-lime-50 px-6 py-3 rounded-2xl transition-all flex items-center gap-2 mt-4 mx-auto shadow-sm uppercase tracking-widest border-none"
                          >
                            <FaPlusCircle /> Add Choice
                          </button>
                        </div>
                      </div>
                      <div className="h-px bg-gray-50 my-12 mx-auto w-1/2"></div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addQuestion}
                  className="mt-8 w-full py-5 bg-white border-none text-gray-400 hover:text-[#84cc16] hover:bg-lime-50/30 rounded-[24px] font-black transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm shadow-md hover:shadow-xl hover:shadow-lime-100/50 active:scale-95"
                >
                  <FaPlusCircle className="text-xl" /> Add New Question
                </button>
              </div>

              {/* 3. アンケート設定 */}
              <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-10 hover:shadow-2xl transition-all duration-500 border-none">
                <div className="flex items-center gap-3 text-2xl font-black text-gray-800 mb-10 pb-4 border-b border-gray-50">
                  <span className="text-blue-400">03.</span> アンケート設定 <span className="text-xs font-bold text-gray-300 ml-2">(Optional)</span>
                </div>

                <div className="space-y-12">
                  {surveyQuestions.map((sq, index) => (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                          <span className="bg-gray-800 text-white font-black w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                            S{index + 1}
                          </span>
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${sq.type === 'text' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            {sq.type === 'text' ? 'Text Box' : 'Multiple Choice'}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSurveyQuestion(index)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all border-none"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="アンケートの質問文を入力"
                        value={sq.text}
                        onChange={(e) => updateSurveyQuestion(index, 'text', e.target.value)}
                        className="w-full bg-gray-50/50 rounded-[20px] p-5 mb-6 border-none shadow-inner focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none font-bold transition-all text-gray-700"
                      />

                      {sq.type === 'choice' && (
                        <div className="pl-6 space-y-3">
                          <div className="space-y-3">
                            {sq.choices.map((choice, cIndex) => (
                              <div key={cIndex} className="flex items-center gap-3 group/survey">
                                <span className="w-2 h-2 rounded-full bg-orange-300"></span>
                                <input
                                  type="text"
                                  value={choice}
                                  onChange={(e) => updateSurveyChoice(index, cIndex, e.target.value)}
                                  className="flex-1 bg-white rounded-xl p-3 text-sm border-none shadow-sm focus:ring-2 focus:ring-orange-100 outline-none transition-all font-bold text-gray-600"
                                />
                                <button
                                  onClick={() => removeSurveyChoice(index, cIndex)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-200 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover/survey:opacity-100 border-none"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => addSurveyChoice(index)}
                            className="mt-6 mx-auto px-6 py-2.5 bg-orange-50/50 text-orange-600 rounded-full hover:bg-orange-100 font-black transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest border-none"
                          >
                            <FaPlusCircle /> Add Option
                          </button>
                        </div>
                      )}
                      <div className="h-px bg-gray-50 my-12 mx-auto w-1/3"></div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-6 mt-10">
                  <button
                    onClick={() => addSurveyQuestion('choice')}
                    className="flex-1 py-4 bg-orange-50/50 text-orange-600 rounded-2xl hover:bg-orange-100 font-bold transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md border-none text-sm"
                  >
                    <FaPlusCircle /> 選択式を追加
                  </button>
                  <button
                    onClick={() => addSurveyQuestion('text')}
                    className="flex-1 py-4 bg-blue-50/30 text-blue-500 rounded-2xl hover:bg-blue-100/40 font-bold transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md border-none text-sm"
                  >
                    <FaPlusCircle /> 記述式を追加
                  </button>
                </div>
              </div>

              {/* 保存ボタン */}
              <div className="sticky bottom-10 z-10 mx-auto max-w-sm pt-10">
                <button
                  onClick={saveTest}
                  className="w-full bg-gradient-to-r from-[#84cc16] to-emerald-500 hover:from-[#a3e635] hover:to-emerald-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-lime-200/50 hover:shadow-lime-300/50 transition-all transform hover:-translate-y-2 flex items-center justify-center gap-4 text-xl border-none tracking-widest"
                >
                  <FaSave /> 保存して公開する
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
