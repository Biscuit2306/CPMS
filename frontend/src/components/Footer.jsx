import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} College Campus Placement System.
        All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
