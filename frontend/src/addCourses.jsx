import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import './App.css'
import EnrolledCourse from './enrolledcourse'

// Helper: read a cookie by name
function getCookie(name) {
	const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
	return match ? match[2] : null
}

// Helper: delete a cookie
function deleteCookie(name) {
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}

// Helper: decode JWT from cookie and return the student ID (SID)
function getSIDFromToken() {
	const token = getCookie('auth_token')
	if (!token) return null
	try {
		const base64Url = token.split('.')[1]
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
		const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
		}).join(''))
		const payload = JSON.parse(jsonPayload)
		return payload.id || null
	} catch {
		return null
	}
}

function AddCourses({ onAuthError }) {
	const navigate = useNavigate()
	const location = useLocation()
	const params = useParams()

	// Derive current view from the URL
	const path = location.pathname
	const showMyEnrolled = path === '/mycourses'
	const selectedCourseId = params.id || null
	const isEnrolled = path.startsWith('/enrolled-course/')

	const [courses, setCourses] = useState([])
	const [enrolledCourses, setEnrolledCourses] = useState([])
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [progress, setProgress] = useState(0)
	const [enrollLoading, setEnrollLoading] = useState(false)
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	// GET all courses from backend
	async function getCourses() {
		setLoading(true)
		setProgress(15)
		setError('')
		const token = getCookie('auth_token')
		try {
			setProgress(45)
			const response = await fetch(`${import.meta.env.PROD ? '' : 'http://localhost:8890'}/seeuser`, {
				headers: { 'Authorization': token || '' },
			})
			setProgress(75)
			if (response.status === 401 || response.status === 403) {
				onAuthError()
				return
			}
			const data = await response.json()
			setCourses(data.result || [])
			setProgress(100)
			setTimeout(() => { setLoading(false); setProgress(0) }, 400)
		} catch {
			setError('Could not connect to the backend.')
			setLoading(false)
			setProgress(0)
		}
	}

	// GET enrolled courses for this student — sends SID as query param
	async function getEnrolledCourses() {
		const sid = getSIDFromToken()
		if (!sid) {
			setError('Could not identify your student ID. Please log in again.')
			return
		}
		setLoading(true)
		setError('')
		const token = getCookie('auth_token')
		try {
			const url = `${import.meta.env.PROD ? '' : 'http://localhost:8890'}/encrollcourse/mycourses?SID=${encodeURIComponent(sid)}`
			const response = await fetch(url, {
				headers: { 'Authorization': token || '' },
			})
			if (response.status === 401 || response.status === 403) {
				onAuthError()
				return
			}
			const data = await response.json()
			if (!response.ok) {
				setError(data.message || 'Server error fetching courses.')
				return
			}
			setEnrolledCourses(data.result || [])
		} catch (err) {
			console.error('[MyCourses] Fetch error:', err)
			setError(`Fetch error: ${err.message}`)
		} finally {
			setLoading(false)
		}
	}

	// Fetch all courses + enrolled courses on mount
	useEffect(() => {
		getCourses()
		getEnrolledCourses()
	}, [])

	// Re-fetch enrolled courses when navigating to /mycourses
	useEffect(() => {
		if (showMyEnrolled) {
			getEnrolledCourses()
		}
	}, [showMyEnrolled])

	// ── Navigation helpers ──────────────────────────────────────────────
	function openCourse(courseId) {
		setMessage('')
		setError('')
		navigate('/enroll/' + courseId)
	}

	function openEnrolledCourse(courseId) {
		setMessage('')
		setError('')
		navigate('/enrolled-course/' + courseId)
	}

	function closeCourse() {
		setMessage('')
		setError('')
		navigate('/allcourses')
	}

	function openMyEnrolled() {
		setMessage('')
		setError('')
		navigate('/mycourses')
	}

	function handleLogout() {
		deleteCookie('auth_token');
		window.location.reload(); // Auto refresh as requested, App.jsx routing handles redirect to login
	}

	// ── Enroll: POST CID + SID to backend, then go to /mycourses ───────
	async function handleEnroll(courseId) {
		const sid = getSIDFromToken()
		if (!sid) {
			setError('Could not identify your student ID. Please log in again.')
			return
		}
		setEnrollLoading(true)
		setError('')
		const token = getCookie('auth_token')
		try {
			const response = await fetch(`${import.meta.env.PROD ? '' : 'http://localhost:8890'}/encrollcourse/addcourse`, {
				method: 'POST',
				headers: {
					'Authorization': token || '',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ CID: courseId, SID: sid }),
			})
			if (response.status === 401 || response.status === 403) {
				onAuthError()
				return
			}
			if (!response.ok) {
				const data = await response.json()
				setError(data.message || 'Enrolment failed.')
				return
			}
			navigate('/mycourses')
		} catch {
			setError('Could not enrol. Please try again.')
		} finally {
			setEnrollLoading(false)
		}
	}

	function handleCardEnroll(event, courseId) {
		event.stopPropagation()
		handleEnroll(courseId)
	}

	return (
		<main className="omixelo-shell">
			{/* Top progress bar */}
			{loading && (
				<div className="top-progress-track">
					<div className="top-progress-fill" style={{ width: `${progress}%` }} />
				</div>
			)}
			
			<div className="dashboard-header">
				<div className="dashboard-tabs">
					<button 
						className={!showMyEnrolled && !selectedCourseId ? 'dashboard-tab active' : 'dashboard-tab'} 
						onClick={closeCourse}
					>
						All Courses
					</button>
					<button 
						className={showMyEnrolled ? 'dashboard-tab active' : 'dashboard-tab'} 
						onClick={openMyEnrolled}
					>
						My Courses
					</button>
				</div>
				<button className="nav-contact-btn" onClick={handleLogout}>Logout</button>
			</div>

			<div className="dashboard-layout" id="top">
				<section className="dashboard-main">
					{selectedCourseId ? (
						<EnrolledCourse
							course={courses.find((item) => String(item.CID) === selectedCourseId)}
							onBack={closeCourse}
							isEnrolled={isEnrolled}
							onEnrolled={handleEnroll}
						/>
					) : showMyEnrolled ? (
						<MyEnrolledCourses
							enrolledCourses={enrolledCourses}
							loading={loading}
							error={error}
							onOpenCourse={openEnrolledCourse}
							onRefresh={getEnrolledCourses}
						/>
					) : (
						<AllCourses
							courses={courses}
							loading={loading}
							enrollLoading={enrollLoading}
							message={message}
							error={error}
							onRefresh={getCourses}
							onOpenCourse={openCourse}
							onEnroll={handleCardEnroll}
							enrolledCidSet={new Set(enrolledCourses.map(c => String(c.CID)))}
						/>
					)}
				</section>
			</div>
		</main>
	)
}

// ─── My Enrolled Courses view ─────────────────────────────────────────
function MyEnrolledCourses({ enrolledCourses, loading, error, onOpenCourse, onRefresh }) {
	return (
		<div className="courses-container">
			<div className="page-heading">
				<div>
					<h1>My Courses</h1>
					<p className="page-intro">Continue where you left off.</p>
				</div>
				<button className="refresh-button" onClick={onRefresh} disabled={loading}>
					{loading ? <><span className="loader" />Refreshing…</> : '↻ Refresh'}
				</button>
			</div>

			{error && <div className="notice error">{error}</div>}

			{loading ? (
				<div className="skeleton-grid">
					{[1, 2, 3].map((n) => (
						<div className="skeleton-card" key={n}>
							<div className="skeleton-thumb" />
							<div className="skeleton-body">
								<div className="skeleton-line short" />
								<div className="skeleton-line title" />
								<div className="skeleton-line long" />
							</div>
						</div>
					))}
				</div>
			) : enrolledCourses.length === 0 ? (
				<div className="empty-state enrolled-empty">
					<div className="empty-icon">🎓</div>
					<h2>You are not enrolled in any courses</h2>
					<p>Browse the course library and click <strong>"Enroll"</strong> on a course to get started.</p>
				</div>
			) : (
				<div className="omixelo-grid">
					{enrolledCourses.map((course, index) => (
						<article
							className="omixelo-card"
							key={course.CID || index}
							onClick={() => onOpenCourse(course.CID)}
							onKeyDown={(e) => e.key === 'Enter' && onOpenCourse(course.CID)}
							tabIndex="0"
							role="link"
						>
							<div className="card-thumb">
								{course.Thumbnail ? (
									<img src={course.Thumbnail} alt={course.CName} />
								) : (
									<div className="placeholder-thumb"><span>{course.CName?.charAt(0) || 'C'}</span></div>
								)}
								<span className="course-status live">Enrolled</span>
							</div>
							<div className="card-body">
								<h2>{course.CName}</h2>
								<p>{course.Description}</p>
								<div className="card-footer">
									<span className="enrolled-badge">✓ Enrolled</span>
									<span className="arrow">→</span>
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</div>
	)
}

// ─── All Courses grid ────────────────────────────────────────────────
function AllCourses({ courses, loading, enrollLoading, message, error, onRefresh, onOpenCourse, onEnroll, enrolledCidSet = new Set() }) {
	return (
		<div className="courses-container">
			<div className="page-heading">
				<div>
					<h1>All courses</h1>
					<p className="page-intro">Real skills, real projects, and guided pathways.</p>
				</div>
			</div>

			{message && <div className="notice success">{message}</div>}
			{error && <div className="notice error">{error}</div>}

			<button className="refresh-button" onClick={onRefresh} disabled={loading}>
				{loading ? <><span className="loader" />Refreshing…</> : '↻ Refresh courses'}
			</button>

			{loading ? (
				<div className="skeleton-grid">
					{[1, 2, 3, 4].map((n) => (
						<div className="skeleton-card" key={n}>
							<div className="skeleton-thumb" />
							<div className="skeleton-body">
								<div className="skeleton-line short" />
								<div className="skeleton-line title" />
								<div className="skeleton-line long" />
								<div className="skeleton-line medium" />
							</div>
						</div>
					))}
				</div>
			) : courses.length === 0 ? (
				<div className="empty-state">
					<h2>No courses found</h2>
					<p>Check back later for new courses.</p>
				</div>
			) : (
				<div className="omixelo-grid">
					{courses.map((course, index) => (
						<CourseCard
							key={course.CID || index}
							course={course}
							onOpen={onOpenCourse}
							onEnroll={onEnroll}
							enrollLoading={enrollLoading}
							isAlreadyEnrolled={enrolledCidSet.has(String(course.CID))}
						/>
					))}
				</div>
			)}
		</div>
	)
}

// ─── Course Card ─────────────────────────────────────────────────────
function CourseCard({ course, onOpen, onEnroll, enrollLoading, isAlreadyEnrolled }) {
	return (
		<article
			className={`omixelo-card ${isAlreadyEnrolled ? 'enrolled' : ''}`}
			onClick={() => !isAlreadyEnrolled && onOpen(course.CID)}
			onKeyDown={(event) => event.key === 'Enter' && !isAlreadyEnrolled && onOpen(course.CID)}
			tabIndex={isAlreadyEnrolled ? '-1' : '0'}
			role={isAlreadyEnrolled ? 'article' : 'link'}
		>
			<div className="card-thumb">
				{course.Thumbnail ? (
					<img src={course.Thumbnail} alt={course.CName} />
				) : (
					<div className="placeholder-thumb"><span>{course.CName?.charAt(0) || 'C'}</span></div>
				)}
			</div>
			<div className="card-body">
				<h2>{course.CName}</h2>
				<p>{course.Description}</p>
				<div className="card-footer">
					{isAlreadyEnrolled ? (
						<span className="omixelo-enrolled-badge">✓ Enrolled</span>
					) : (
						<button
							className="omixelo-enroll-btn"
							onClick={(e) => onEnroll(e, course.CID)}
							disabled={!course.isActive || enrollLoading}
						>
							{enrollLoading ? 'Enrolling…' : 'Enroll →'}
						</button>
					)}
				</div>
			</div>
		</article>
	)
}

export default AddCourses
