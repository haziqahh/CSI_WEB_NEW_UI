import { Row, Menu, Col, Drawer } from "antd";
import { useRouter } from "next/router";
import SmeLogo from "../../assests/logo/csi.png";
import { InfoCircleTwoTone, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
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
        <a
          onClick={() => {
            router.push("/esg/dashboard");
          }}
          className="hover:font-bold text-xs 1000:text-sm"
        >
          Report
        </a>
      ),
      key: "Dashboard",
    },
    {
      label: (
        <a
          onClick={() => {
            router.push("/esg/questionnaire");
          }}
          className="hover:font-bold text-xs 1000:text-sm"
        >
          Assessment
        </a>
      ),
      key: "Assessment",
    },
    {
      label: (
        <a
          onClick={() => {
            router.push("/esg/learning");
          }}
          className="hover:font-bold text-xs 1000:text-sm"
        >
          Library
        </a>
      ),
      key: "Learning",
    },
    {
      label:(
        <a
          onClick={() =>{
           router.push("/esg/profile");
          }}
          className="hover:font-bold text-xs 1000:text-sm"
          >
          Profile
         </a>
       
      )
    },
    {
      label:(
        <a
          onClick={() =>{
           sessionStorage.clear();
           router.push("/ESG-sustainability-login");
          }}
          className="hover:font-bold text-xs 1000:text-sm"
          >
          Logout
         </a>
       
      )
    }
    
  ];


  return (
    <div className="bg-gradient-to-t from-[#362843] to-[#554961] shadow-2xl flex items-end flex-col font-caudex">
      <Row className="1250:hidden w-full flex justify-center bg-yellow-200 text-smeBgColor items-center gap-x-2">
        <InfoCircleTwoTone twoToneColor="orange" />
        <p>For better view, please use desktop</p>
      </Row>
      <Row className="flex justify-between items-center py-0 px-8 w-full h-[80px]">
        <Col
          className="cursor-pointer 1000:w-auto "
          onClick={() => {
            router.push("/esg/dashboard");
          }}
        >
          <img src={SmeLogo.src} width={250} />
        </Col>
        <Col className="flex gap-x-12 items-center">
          <MenuOutlined type="primary" onClick={showDrawer} className="1250:hidden"></MenuOutlined>
          <Menu className="text-base font-semibold Header-Menu hidden 1250:flex border-r-0" items={items} />
          <Drawer title="" placement="right" onClose={onClose} visible={visible}>
            <Menu items={items} mode="vertical" disabledOverflow={true} className="flex justify-between w-100% flex-col"></Menu>
          </Drawer>
        </Col>
      </Row>
    </div>
  );
}

export default Header;
