import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function VideoTest() {
  const { id } = useParams(); // videoId
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const loadQuestions = async () => {
      const qSnapshot = await getDocs(
        collection(db, "videoTests", id, "questions")
      );

      const qList = qSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setQuestions(qList);
    };

    loadQuestions();
  }, [id]);

  const submitTest = async () => {
    let score = 0;

    questions.forEach((q) => {
      if (answers[q.id] == q.answer) score += 1;
    });

    const user = auth.currentUser;
    if (!user) return alert("ログインしてください");

    await setDoc(doc(db, "userTestResults", user.uid, id), {
      score,
      total: questions.length,
      answers,
      createdAt: Timestamp.now(),
    });

    alert(`テスト完了！あなたの点数は ${score} / ${questions.length}`);
  };

  return (
    <div className="test-page">
      <h2>テスト：{id}</h2>

      {questions.map((q) => (
        <div key={q.id} className="question">
          <p>{q.text}</p>
          {q.options.map((op, idx) => (
            <label key={idx}>
              <input
                type="radio"
                name={q.id}
                value={idx}
                checked={answers[q.id] == idx}
                onChange={() =>
                  setAnswers({ ...answers, [q.id]: idx })
                }
              />
              {op}
            </label>
          ))}
        </div>
      ))}

      {/* ▼ アンケート（Survey） */}
{survey && (
  <div className="survey-card">
    <h3>アンケート</h3>

    {survey.questions.map((q) => (
      <div key={q.id} style={{ marginTop: "16px" }}>
        <p>{q.order}. {q.text}</p>

        {/* ▼ 選択式 */}
        {q.question_type === "choice" &&
          q.choices.map((choice) => (
            <div
              key={choice.id}
              className={
                "choice-card " +
                (surveyAnswers[q.id] === choice.id ? "selected" : "")
              }
              onClick={() =>
                setSurveyAnswers({
                  ...surveyAnswers,
                  [q.id]: choice.id,
                })
              }
            >
              <p className="choice-text">{choice.text}</p>
            </div>
          ))}

        {/* ▼ 自由記述 */}
        {q.question_type === "text" && (
          <textarea
            rows="3"
            className="choice-card"
            placeholder="ご意見をお聞かせください"
            value={surveyAnswers[q.id] || ""}
            onChange={(e) =>
              setSurveyAnswers({
                ...surveyAnswers,
                [q.id]: e.target.value,
              })
            }
          />
        )}
      </div>
    ))}
  </div>
)}


      <button onClick={submitTest}>回答を送信</button>
    </div>
  );
}
