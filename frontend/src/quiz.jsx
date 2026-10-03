import { useState,useEffect } from 'react'
import './App.css'

const questions = [
	{ question: 'What is the main purpose of HTML?', choices: ['Styling a web page', 'Structuring page content', 'Storing user data', 'Running a server'] },
	{ question: 'Which tag creates the largest heading?', choices: ['<heading>', '<head>', '<h6>', '<h1>'] },
	{ question: 'Which attribute provides alternative text for an image?', choices: ['src', 'title', 'alt', 'href'] },
	{ question: 'Which element creates a link to another page?', choices: ['<link>', '<a>', '<url>', '<navigate>'] },
	{ question: 'Where should visible page content be placed?', choices: ['Inside <body>', 'Inside <meta>', 'Inside <style>', 'Inside <title>'] },
]

function getYoutubeEmbedUrl(videoUrl) {
	if (!videoUrl) return 'https://www.youtube.com/embed/tsbCSkvHhMo'

	try {
		const url = new URL(videoUrl)
		const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v')
		return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl
	} catch {
		return videoUrl
	}
}

function Quiz() {
    const [data, setData] = useState([]);

	useEffect(() => {
		fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8890'}/course/1/1`)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Course request failed: ${response.status}`)
				}
				return response.json()
			})
			.then((course) => {
				setData(course)
				console.log('Course data:', course)
			})
			.catch((error) => {
				console.error('Could not load course data:', error)
			})
	}, []);



	const [answers, setAnswers] = useState({})
	const [complete, setComplete] = useState(false)
	const answeredQuestions = Object.keys(answers).length
	const progress = complete ? 100 : (answeredQuestions / questions.length) * 100

	function handleSubmit(event) {
		event.preventDefault()
		if (answeredQuestions !== questions.length) return
		setComplete(true)
	}

	function restartQuiz() {
		setAnswers({})
		setComplete(false)
	}

	return (
		<main className="lesson-shell">
			<header className="topbar">
				<a className="brand" href="#top" aria-label="Learn home"><span className="brand-mark">&lt;/&gt;</span><span>learn<span className="brand-accent">lab</span></span></a>
				<div className="lesson-meta"><span className="eyebrow">Frontend foundations</span><span className="lesson-count">Lesson 01 <span aria-hidden="true">/</span> 05</span></div>
			</header>
			<div className="progress-wrap" aria-label={`Course progress: ${Math.round(progress)} percent`}><div className="progress-label"><span>Your progress</span><strong>{Math.round(progress)}%</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div></div>
			<div className="lesson-layout" id="top">
				<section className="lesson-content">
					<div className="lesson-heading"><p className="kicker">Module {data.courseId} <span>•</span> {data.courseId}</p><h1>{data.title}</h1><p className="intro">Learn the building blo</p></div>
					<div className="video-frame"><iframe title="HTML essentials lesson video" src={getYoutubeEmbedUrl(data.url)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
					<div className="resource-row"><div><p className="kicker">Watch, then explore</p><h2>How the web reads HTML</h2><p className="caption">A short introduction to tags, elements, and the structure of a document.</p></div><a className="download-button" href="https://example.com/lecture-presentation.pdf" target="_blank" rel="noreferrer"><span aria-hidden="true">↓</span> Download slides</a></div>
					<div className="quiz-panel"><div className="quiz-topline"><span>Knowledge check</span><span>{questions.length} questions</span></div>{complete ? <div className="completion-state"><div className="completion-icon">✓</div><h2>Lesson complete</h2><p>You made it through all five questions. Ready for the next lesson?</p><button className="next-button" onClick={restartQuiz}>Review again <span>↻</span></button></div> : <form onSubmit={handleSubmit}><div className="question-list">{questions.map((item, questionIndex) => <fieldset className="question-block" key={item.question}><legend><span className="question-number">{String(questionIndex + 1).padStart(2, '0')}</span>{item.question}</legend><div className="choices">{item.choices.map((choice, choiceIndex) => <label className={`choice ${answers[questionIndex] === choiceIndex ? 'selected' : ''}`} key={choice}><input type="radio" name={`question-${questionIndex}`} value={choiceIndex} checked={answers[questionIndex] === choiceIndex} onChange={() => setAnswers((current) => ({ ...current, [questionIndex]: choiceIndex }))} /><span className="choice-letter">{String.fromCharCode(65 + choiceIndex)}</span><span>{choice}</span><span className="choice-check">✓</span></label>)}</div></fieldset>)}</div><div className="quiz-footer"><span className="hint">{answeredQuestions} of {questions.length} answered</span><button className="next-button" type="submit" disabled={answeredQuestions !== questions.length}>Next <span>→</span></button></div></form>}</div>
				</section>
			</div>
		</main>
	)
}

export default Quiz
