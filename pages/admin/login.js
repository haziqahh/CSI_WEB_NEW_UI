import { Button, Layout, Row, Modal, Form, Input, Checkbox, message } from "antd";
import Header from "../header.js";
import Footer from "../footer.js";
import React, { useState } from "react";
import { WarningFilled } from "@ant-design/icons";
import APIHelpers from "../api/apiHelper";
import { useRouter } from "next/router";

const { Content } = Layout;

function AdminLogin() {
  const router = useRouter();
  const [loginForm] = Form.useForm();
  const [ForgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);

  const ForgotPassword = () => {
    return (
      <Modal visible={ForgotPasswordModalVisible} footer={null} closable={false} onCancel={() => setForgotPasswordModalVisible(false)} className="mt-60">
        <p className="text-formTitleGreen font-semibold py-6 text-lg flex items-center justify-center">
          <WarningFilled className="text-yellow-500 mr-2" />
          Please contact administrator to reset password.
        </p>
      </Modal>
    );
  };

  const sendLogin = (values) => {
    let data = {
      email: values.email,
      password: values.password,
    };
    APIHelpers.POST("v1/admin/login", data)
      .then((res) => {
        sessionStorage.setItem("accessToken", res.item.accessToken);
        router.push("/admin/admin");
        message.success({
          content: "You have signed in successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        loginForm.resetFields();
      })
      .catch(() => {
        message.error({
          content: "You have entered your email or password incorrectly. Passwords are case sensitive, so ensure your 'Caps Lock' key is not enabled.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  return (
    <Layout className="min-h-full">
      <Header></Header>
      <Content className="bg-white">
        <Row className="flex items-center gap-x-4 justify-center px-8 pt-8 pb-4 min-h-9/10 w-full">
          <div className="py-8 px-8 bg-white w-full 700:w-2/4 1000:w-2/5 1250:w-1/4 border-2 drop-shadow-xl">
            <Form layout="vertical" onFinish={sendLogin} form={loginForm}>
              <p className="text-center text-3xl font-bold">Log in</p>
              <Form.Item
                label={<p className="font-semibold">Email</p>}
                name="email"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please input email!",
                  },
                  {
                    type: "email",
                    message: "Please input valid email!",
                  },
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold">Password</p>}
                name="password"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Password must contain 8 to 12 characters with at least 1 uppercase letter, lowercase letter and 1 number",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Form.Item className="mb-2">
                <div className="text-center">
                  <Button htmlType="submit" className="w-[30%] py-2 bg-assessmentNext text-white hover:bg-assessmentNext focus:bg-assessmentNext hover:text-white focus:text-white">
                    Login
                  </Button>
                </div>
              </Form.Item>
              <div className="flex justify-center mt-4">
                <Button
                  type="link"
                  className="p-0 pl-2"
                  onClick={() => {
                    setForgotPasswordModalVisible(true);
                  }}
                >
                  Forget Your Password?
                </Button>
              </div>
            </Form>
          </div>
          {ForgotPassword()}
        </Row>
      </Content>

      <Footer />
    </Layout>
  );
}

export default AdminLogin;
