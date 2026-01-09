import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/about.css";

function About() {
  return (
    <div className="about-page">
      <Navbar />

      <section className="about-section">
        <h1>About the System</h1>

        <p>
          The College Campus Placement Management System is designed to
          digitalize and automate the campus recruitment process. It acts as a
          centralized platform connecting students, placement officers, and
          recruiting companies.
        </p>

        <p>
          The system improves transparency, reduces manual effort, and enables
          efficient placement tracking through modern web technologies.
        </p>
      </section>

      <Footer />
    </div>
  );
}

export default About;
