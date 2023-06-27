import { Row, Menu, Col, Drawer } from "antd";
import { useRouter } from "next/router";
import SmeLogo from "../assests/logo/csi.png";
import { InfoCircleTwoTone, MenuOutlined } from "@ant-design/icons";
import React, { useState } from "react";

function Header() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const items = [
    {
      label: (
        <a href="https://www.csi-asean.com/esg-sustainability-assessment" className="hover:font-bold">
          Home
        </a>
      ),
      key: "Home",
    },
    // {
    //   label: (
    //     <a
    //       onClick={() => {
    //         router.push("/sme");
    //       }}
    //       className="hover:font-bold"
    //     >
    //       SME
    //     </a>
    //   ),
    //   key: "SME",
    // },
    // {
    //   label: (
    //     <a
    //       onClick={() => {
    //         router.push("/corporate");
    //       }}
    //       className="hover:font-bold"
    //     >
    //       Corporate
    //     </a>
    //   ),
    //   key: "Corporate",
    // },
    // {
    //   label: (
    //     <a
    //       onClick={() => {
    //         router.push("/news");
    //       }}
    //       className="hover:font-bold"
    //     >
    //       News
    //     </a>
    //   ),
    //   key: "News",
    // },
    // {
    //   label: (
    //     <a
    //       onClick={() => {
    //         router.push("/aboutUs");
    //       }}
    //       className="hover:font-bold"
    //     >
    //       About Us
    //     </a>
    //   ),
    //   key: "AboutUs",
    // },
    // {
    //   label: (
    //     <a
    //       onClick={() => {
    //         router.push("/contact");
    //       }}
    //       className="hover:font-bold"
    //     >
    //       Contact Us
    //     </a>
    //   ),
    //   key: "Contact",
    // },
    // {
    //   label: (
    //     <a
    //       onClick={() => {
    //         router.push("/FAQ");
    //       }}
    //       className="hover:font-bold"
    //     >
    //       FAQ
    //     </a>
    //   ),
    //   key: "FAQ",
    // },
  ];

  return (
    <div className="bg-gradient-to-t from-[#362843] to-[#554961] shadow-2xl flex items-end flex-col font-caudex">
      <Row className="1250:hidden w-full flex justify-center bg-yellow-200 text-smeBgColor items-center gap-x-2">
        <InfoCircleTwoTone twoToneColor="orange" />
        <p>For better view, please use desktop</p>
      </Row>
      <Row className="flex justify-between items-center py-0 px-8 w-full h-[80px]">
        <Col className="cursor-pointer 1000:w-auto ">
          <a href="https://www.csi-asean.com/esg-sustainability-assessment">
            <img src={SmeLogo.src} width={250} />
          </a>
        </Col>
        <Col className="flex gap-x-12 items-center">
          <MenuOutlined type="primary" onClick={showDrawer} className="1250:hidden text-white"></MenuOutlined>
          <Menu className="gap-x-12 text-base font-semibold Homepage-Header-Menu hidden 1250:flex border-r-0" items={items} />
          <Drawer title="" placement="right" onClose={onClose} visible={visible} className="Homepage-Drawer">
            <Menu items={items} mode="vertical" disabledOverflow={true} className="flex justify-between w-100% flex-col"></Menu>
          </Drawer>
        </Col>
      </Row>
    </div>
  );
}

export default Header;
