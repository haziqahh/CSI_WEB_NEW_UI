import { Row, Menu, Col, Drawer } from "antd";
import { useRouter } from "next/router";
import SmeLogo from "../../assests/logo/csi.png";
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
            router.push("/admin/admin");
          }}
        >
          <img src={SmeLogo.src} width={250} />
        </Col>
        <Col className="flex gap-x-12 items-center">
          <MenuOutlined type="primary" onClick={showDrawer} className="1250:hidden"></MenuOutlined>
          <Menu className="border-0 text-base font-semibold hidden 1250:flex Header-Menu" mode="horizontal" disabledOverflow={true}>
            <Menu.SubMenu title="Admin">
              <Menu.Item
                onClick={() => {
                  router.push("/admin/admin");
                }}
              >
                Super Admin
              </Menu.Item>
              {/* <Menu.Item
                onClick={() => {
                  router.push("/admin/adminUser");
                }}
              >
                Admin User
              </Menu.Item> */}
            </Menu.SubMenu>
            <Menu.SubMenu title="Company">
              <Menu.Item
                onClick={() => {
                  router.push("/admin/company");
                }}
              >
                Company
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  router.push("/admin/companyUser");
                }}
              >
                User
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu title="Report">
              <Menu.Item
                onClick={() => {
                  router.push("/admin/singleReport");
                }}
              >
                Single Business Report
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  router.push("/admin/corporateReport");
                }}
              >
                Portfolio Report
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>

          <Drawer title="" placement="right" onClose={onClose} visible={visible}>
            <Menu mode="inline" disabledOverflow={true} className="flex justify-between w-100% flex-col">
              <Menu.SubMenu title="Admin">
                <Menu.Item
                  onClick={() => {
                    router.push("/admin/admin");
                  }}
                >
                  Super Admin
                </Menu.Item>
                {/* <Menu.Item
                  onClick={() => {
                    router.push("/admin/adminUser");
                  }}
                >
                  Admin User
                </Menu.Item> */}
              </Menu.SubMenu>
              <Menu.SubMenu title="Company">
                <Menu.Item
                  onClick={() => {
                    router.push("/admin/company");
                  }}
                >
                  Company
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    router.push("/admin/companyUser");
                  }}
                >
                  User
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu title="Report">
                <Menu.Item
                  onClick={() => {
                    router.push("/admin/singleReport");
                  }}
                >
                  Single Business Report
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    router.push("/admin/corporateReport");
                  }}
                >
                  Portfolio Report
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
          </Drawer>
        </Col>
      </Row>
    </div>
  );
}

export default Header;
