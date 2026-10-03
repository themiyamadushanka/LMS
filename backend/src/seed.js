const express = require('express');
const router = express.Router();
const conn = require('./connectDB');

const courses = [
    {
        CName: "Mastering React 18 & Next.js",
        Thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
        isActive: 1,
        Description: "Learn how to build scalable, high-performance web applications using React 18 and Next.js from scratch."
    },
    {
        CName: "Python for Data Science Bootcamp",
        Thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
        isActive: 1,
        Description: "Dive into data analysis, visualization, and machine learning with Python, Pandas, and Scikit-Learn."
    },
    {
        CName: "Complete Node.js Backend Mastery",
        Thumbnail: "https://images.unsplash.com/photo-1627398240309-089a144099b9?w=800&q=80",
        isActive: 1,
        Description: "Become an expert in building secure, scalable backend APIs using Node.js, Express, and databases."
    },
    {
        CName: "UI/UX Design with Figma",
        Thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
        isActive: 1,
        Description: "Master modern UI/UX principles and learn how to design beautiful, user-friendly interfaces in Figma."
    },
    {
        CName: "The Complete Web Developer Guide",
        Thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
        isActive: 1,
        Description: "The ultimate full-stack web development course covering HTML, CSS, JavaScript, and modern frameworks."
    },
    {
        CName: "Advanced Artificial Intelligence",
        Thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
        isActive: 1,
        Description: "Explore the fascinating world of AI, Neural Networks, Deep Learning, and generative models."
    },
    {
        CName: "Cybersecurity Fundamentals",
        Thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
        isActive: 1,
        Description: "Learn how to secure networks, defend against cyber attacks, and understand modern security protocols."
    },
    {
        CName: "AWS Cloud Architect Certification",
        Thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        isActive: 1,
        Description: "Master Amazon Web Services and prepare for your AWS Solutions Architect exam with hands-on labs."
    },
    {
        CName: "Modern CSS & Tailwind Deep Dive",
        Thumbnail: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80",
        isActive: 1,
        Description: "Level up your styling game by mastering Grid, Flexbox, and the Tailwind CSS utility-first framework."
    },
    {
        CName: "Mobile App Dev with React Native",
        Thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
        isActive: 1,
        Description: "Build powerful, native mobile applications for iOS and Android using a single React codebase."
    }
];

router.get('/', (req, res) => {
    const sql = "INSERT INTO courses (CName, Thumbnail, isActive, Description) VALUES (?, ?, ?, ?)";
    let completed = 0;
    let errors = [];

    courses.forEach(course => {
        conn.query(sql, [course.CName, course.Thumbnail, course.isActive, course.Description], (err) => {
            if (err) errors.push(err.message);
            completed++;
            if (completed === courses.length) {
                if (errors.length > 0) return res.status(500).json({ errors });
                res.status(200).json({ message: "Successfully seeded 10 courses!" });
            }
        });
    });
});

module.exports = router;
