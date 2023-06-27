import { Row, Col } from "antd";
import React, { useState, useEffect } from "react";
import FooterLogo from "../assests/img/footer.png";

function Footer() {
  const [year, setYear] = useState("");

  useEffect(() => {
    let date = new Date();
    setYear(date.getFullYear());
  });
  return (
    <div className="bg-[#695A6B] text-white py-4 text-xs">
      <Row className="flex gap-x-4 justify-center items-center px-8">
        {/* <Col>
          <img src={FooterLogo.src} width={30} />
        </Col> */}
        <Col className="text-center">
          <p>© {year} Centre For Sustainability Intelligence Sdn. Bhd. All Rights Reserved.</p>
          <p>
            Your usage of this website indicates that you agree to be boundby our{" "}
            <a className="underline hover:underline focus:underline text-white" href="/tnc/Terms of Use Policy.pdf" target="_blank">
              Terms of Use Policy
            </a>
            ,{" "}
            <a className="underline hover:underline focus:underline text-white" href="/tnc/Privacy Policy.pdf" target="_blank">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a className="underline hover:underline focus:underline text-white" href="/tnc/Disclaimer.pdf" target="_blank">
              Disclaimer
            </a>
            .
          </p>
        </Col>
      </Row>
    </div>
  );
}

export default Footer;
