import { Button, Layout, Modal, Form, Input, Checkbox, message } from "antd";
import Header from "./header.js";
import Footer from "./footer.js";
import React, { useState } from "react";
import APIHelpers from "./api/apiHelper";
import { useRouter } from "next/router";

const { Content } = Layout;

function HomePage() {
  const router = useRouter();
  const [loginForm] = Form.useForm();
  const [ForgotPasswordModalVisible, setForgotPasswordModalVisible] =
    useState(false);

  const sendLogin = (values) => {
    let data = {
      email: values.email,
      password: values.password,
    };
    APIHelpers.POST("v1/smeUser/login", data)
      .then((res) => {
        sessionStorage.setItem("accessToken", res.item.accessToken);
        router.push("/esg/dashboard?login=true");
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
      .catch((err) => {
        if ("response" in err) {
          if ("data" in err.response) {
            if ("error" in err.response.data) {
              if ("code" in err.response.data.error) {
                if (err.response.data.error.code.includes("inactive")) {
                  message.error({
                    content: "Your account is not active.",
                    style: {
                      fontSize: "20px",
                      marginTop: "100px",
                    },
                    duration: 8,
                  });
                } else if (
                  err.response.data.error.code.includes("user_not_found")
                ) {
                  message.error({
                    content: "Your email has not been registered.",
                    style: {
                      fontSize: "20px",
                      marginTop: "100px",
                    },
                    duration: 8,
                  });
                } else {
                  message.error({
                    content:
                      "You have entered your email or password incorrectly. Passwords are case sensitive, so ensure your 'Caps Lock' key is not enabled.",
                    style: {
                      fontSize: "20px",
                      marginTop: "100px",
                    },
                    duration: 8,
                  });
                }
              }
            }
          }
        } else {
          data.role = "SME_VENDOR";
          APIHelpers.POST("v1/vendor/login", data)
            .then((res) => {
              sessionStorage.setItem("accessToken", res.item.accessToken);
              sessionStorage.setItem("role", "VENDOR");
              router.push("/esg/dashboard");
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
                content:
                  "You have entered your email or password incorrectly. Passwords are case sensitive, so ensure your 'Caps Lock' key is not enabled.",
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 8,
              });
            });
        }
      });
  };

  const Login = () => {
    return (
      <div className="mx-[25%] mt-[5%] border-2 shadow-xl p-8">
        <div className="text-[#38273A]">
          <p className="font-bold text-2xl text-center">
            Welcome to Centre for Sustainability Intelligence Platform
          </p>
        </div>
        <div className="py-8 px-8">
          <Form layout="vertical" onFinish={sendLogin} form={loginForm}>
            <Form.Item
              label={<p className="font-semibold">Please enter your email</p>}
              name="email"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please enter email!",
                },
                {
                  type: "email",
                  message: "Please enter valid email!",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item
              label={
                <p className="font-semibold">Please enter your password</p>
              }
              name="password"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please enter password!",
                },
                {
                  validator(_, value) {
                    if (value) {
                      if (
                        value.length < 8 ||
                        value.length > 12 ||
                        !/[A-Z]/.test(value) ||
                        !/[0-9]/.test(value) ||
                        !/[a-z]/.test(value)
                      ) {
                        return Promise.reject(
                          new Error(
                            "Password must contain 8 to 12 characters with at least 1 uppercase letter, lowercase letter and 1 number"
                          )
                        );
                      }
                    }
                    return Promise.resolve();
                  },
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
                <Button
                  htmlType="submit"
                  className="w-[30%] py-2 bg-assessmentNext text-white hover:bg-assessmentNext focus:bg-assessmentNext hover:text-white focus:text-white"
                >
                  Login
                </Button>
              </div>
            </Form.Item>
            <div className="flex justify-center mt-4">
              <Button
                type="link"
                className="p-0 pl-2 btn-transparent"
                onClick={() => {
                  setForgotPasswordModalVisible(true);
                }}
              >
                Forget Your Password?
              </Button>
            </div>
            <div className="flex justify-center">
              <p>Not a user yet? </p>
              <Button
                type="link"
                className="p-0 pl-2 btn-transparent"
                onClick={() => {
                  router.push("/ESG-sustainability-registration");
                }}
              >
                Sign Up here.
              </Button>
            </div>
          </Form>
        </div>
      </div>
    );
  };

  const ForgotPassword = () => {
    return (
      <Modal
        visible={ForgotPasswordModalVisible}
        footer={null}
        closable={false}
        onCancel={() => setForgotPasswordModalVisible(false)}
        className="mt-60"
      >
        <p className="text-formTitleGreen font-semibold py-6 text-lg">
          If you have forgotten your password and need to reset, please email{" "}
          <a
            href="mailto:enquiry@sdmsb.com"
            className="underline hover:underline focus:underline text-blue-500"
          >
            support@csi-asean.com
          </a>
          .
        </p>
      </Modal>
    );
  };

  return (
    <Layout className="min-h-full">
      <Header />
      <Content className="bg-white py-8 min-h-9/10">
        {Login()}
        {ForgotPassword()}
      </Content>
      <Footer />
    </Layout>
  );
}

export default HomePage;
