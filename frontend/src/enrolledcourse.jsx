import './App.css'

function EnrolledCourse({ course, onBack, isEnrolled, onEnrolled }) {
	if (!course) {
		return (
			<div className="empty-state">
				<h2>Course not found</h2>
				<p>This course may have been removed.</p>
				<button className="secondary-button" onClick={onBack}>Back to courses</button>
			</div>
		)
	}

	function handleEnroll() {
		if (!course) return
		onEnrolled(course.CID)
	}

	return (
		<div className="course-details">
			<button className="back-link" onClick={onBack}>← Back to courses</button>
			<div className="details-hero">
				<div className="details-thumb">
					{course.Thumbnail ? <img src={course.Thumbnail} alt={course.CName} /> : <span>{course.CName?.charAt(0) || 'C'}</span>}
				</div>
				<div>
					<p className="eyebrow">{isEnrolled ? 'Enrolled course' : 'Course details'}</p>
					<h1>{course.CName}</h1>
					<p className="course-code">COURSE ID: {course.CID}</p>
				</div>
			</div>
			<div className="details-content">
				<p className="course-status-detail">{isEnrolled ? 'You are enrolled' : course.isActive ? 'Active course' : 'Inactive course'}</p>
				<h2>About this course</h2>
				<p>{course.Description}</p>
				{!isEnrolled && (
					<button className="primary-button" onClick={handleEnroll} disabled={!course.isActive}>
						Enroll in this course <span>→</span>
					</button>
				)}
				{isEnrolled && (
					<div className="enrolled-confirmation">
						<span className="enrolled-check">✓</span>
						<p>You are successfully enrolled in this course!</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default EnrolledCourse
