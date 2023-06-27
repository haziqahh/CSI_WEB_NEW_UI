import { Button, Layout, Modal, Form, Input, Checkbox, Upload, message, Select } from "antd";
import Header from "./header.js";
import Footer from "./footer.js";
import React, { useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import APIHelpers from "./api/apiHelper";
import { useRouter } from "next/router";
import { BUSINESSENTITY, DEPARTMENT, MSIC, POSITIONLEVEL, POSTCODE, STATE, SUSBSCRIPTIONPERIOD, SUSBSCRIPTIONPLAN, TITLE } from "../compenents/config.js";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const { Content } = Layout;
const { Option } = Select;

function HomePage() {
  const router = useRouter();
  const [registerForm] = Form.useForm();
  const [ssmFile, setSSMFile] = useState(null);
  const [selectState, setSelectState] = useState("");
  const [registerDisabled, setRegisterDisabled] = useState(false);
  const [msic, setMsic] = useState([]);
  const [selectEntity, setSelectEntity] = useState("");
  const [selectEducation, setSelectEducation] = useState("");
  const [selectEastMalaysia, setSelectEastMalaysia] = useState(null);
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    setMsic(MSIC.sort((a, b) => a.industry.localeCompare(b.industry)));
  }, []);

  useEffect(() => {
    if (selectEntity !== "") {
      if (selectEntity !== "EDUCATIONAL_INSTITUTION") {
        setSelectEducation("");
      }
      if (selectEntity === "GOVERNMENT") {
        registerForm.setFieldsValue({
          registered: null,
          educationType: null,
          newSsmNum: "",
          msic: null,
        });
      }
    }
  }, [selectEntity]);

  useEffect(() => {
    if ((selectEntity === "SOLE_PROPRIETORSHIP" || selectEntity === "PARTNERSHIP") && selectEastMalaysia === false) {
      setPlaceholder("201912345678");
    } else if (selectEntity === "NGO") {
      setPlaceholder("PPM0041020081986");
    } else if (selectEntity === "SENDIRIAN_BERHAD" || selectEntity === "PUBLIC_LIMITED" || selectEntity === "EDUCATIONAL_INSTITUTION") {
      setPlaceholder("A123456, AA1234567A, 1234567A, 201912345678");
    } else {
      setPlaceholder("A123456, AA1234567A, 1234567A");
    }
  }, [selectEntity, selectEastMalaysia]);

  const sendRegister = (values) => {
    setRegisterDisabled(true);
    let form = new FormData();
    form.append("companyName", values.companyName);
    values.newSsmNum !== undefined ? form.append("ssmNumber", values.newSsmNum) : null;
    form.append("businessEntity", values.businessEntity);
    form.append("registeredInEastMy", values.registered);
    ssmFile !== null ? form.append("ssmDoc", ssmFile) : null;
    values.educationType !== undefined ? form.append("educationType", values.educationType) : null;
    form.append("state", values.state);
    form.append("postCode", values.postcode);
    values.msic !== undefined ? form.append("msic", values.msic) : null;
    APIHelpers.POST("v1/smeRegister", form, {
      "Content-Type": "multipart/form-data",
    })
      .then((res) => {
        let data = {
          companyId: res.item.id,
          title: values.title,
          firstName: values.firstName,
          lastName: values.lastName,
          position: values.department + "_" + values.position,
          email: values.email,
          contact: values.contact.slice(1).trim(),
          mobile: values.mobile,
          password: values.password,
          status: "ACTIVE",
          role: "ADMIN",
        };
        APIHelpers.POST("v1/smeUser/register", data)
          .then(() => {
            let subscription = {
              corporateID: data.companyId,
              subscriptionPlan: "Single Business Plan",
              subscriptionPeriod: 1,
            };
            APIHelpers.POST("v1/smeSubscription", subscription)
              .then(() => {
                message.success({
                  content: "Your account has been created successfully. You may proceed to login.",
                  style: {
                    fontSize: "20px",
                    marginTop: "100px",
                  },
                  duration: 5,
                });
                registerForm.resetFields();
                setRegisterDisabled(false);
                router.push("/ESG-sustainability-login");
              })
              .catch(() => {
                setRegisterDisabled(false);
                message.error({
                  content: "Your account registration is unsuccessful.",
                  style: {
                    fontSize: "20px",
                    marginTop: "100px",
                  },
                  duration: 9,
                });
              });
          })
          .catch(() => {
            setRegisterDisabled(false);
            message.error({
              content: "Your account registration is unsuccessful.",
              style: {
                fontSize: "20px",
                marginTop: "100px",
              },
              duration: 9,
            });
          });
      })
      .catch((err) => {
        if ("response" in err) {
          if ("data" in err.response) {
            if ("error" in err.response.data) {
              if ("code" in err.response.data.error) {
                if (err.response.data.error.code.includes("ssm_number_found")) {
                  Modal.warning({
                    width: 700,
                    content: (
                      <div className="text-xl font-semibold">
                        <p>The business registration number already exists.</p>
                        <br />
                        <p>
                          Please click{" "}
                          <span
                            className="underline text-blue-500 hover:underline focus:underline cursor-pointer"
                            onClick={() => {
                              router.push("/ESG-sustainability-login");
                            }}
                          >
                            HERE
                          </span>{" "}
                          to login.
                        </p>
                      </div>
                    ),
                  });
                  setRegisterDisabled(false);
                } else {
                  setRegisterDisabled(false);
                  message.error({
                    content: "Your account registration is unsuccessful.",
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
          setRegisterDisabled(false);
          message.error({
            content: "Your account registration is unsuccessful.",
            style: {
              fontSize: "20px",
              marginTop: "100px",
            },
            duration: 8,
          });
        }
      });
  };

  const pdfProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
    beforeUpload: (file) => {
      if (file.type !== "application/pdf" && file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg") {
        message.error({
          content: `${file.name} is an invalid file format. Please change the file extension to either .pdf, .png, .jpg, .jpeg.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else if (file.size > 5242880) {
        message.error({
          content: `${file.name} is too large. Please upload another document that is smaller than 5MB.`,
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
        return Upload.LIST_IGNORE;
      } else {
        return true;
      }
    },
    onChange(info) {
      if (info.fileList.length > 0) {
        info.fileList[0].status = "done";
        setSSMFile(info.fileList[0].originFileObj);
      }
    },
  };

  const Register = () => (
    <div className="mx-[20%]">
      <div className="text-[#38273A] text-center">
        <p className="font-bold text-3xl">Registration</p>
      </div>
      <p className="text-formTitleGreen text-xl font-semibold px-8 mt-8">Company Information</p>
      <div className="px-8">
        <Form layout="vertical" onFinish={sendRegister} scrollToFirstError form={registerForm}>
          <Form.Item
            label={<p className="font-semibold">Company Name</p>}
            name="companyName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input company name!",
              },
            ]}
          >
            <Input maxLength={50} onInput={(value) => (value.target.value = value.target.value.toUpperCase())} />
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Business / Organisation Type</p>}
            name="businessEntity"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please select business/organisation type!",
              },
            ]}
          >
            <Select onChange={(value) => setSelectEntity(value)}>
              {BUSINESSENTITY.map((val) => (
                <Option value={val.key}>{val.data}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Business / Organisation registered in Sabah or Sarawak?</p>}
            name="registered"
            hasFeedback
            rules={[
              {
                required: selectEntity !== "GOVERNMENT" ? true : false,
                message: "Please select whether business / organisation registered in Sabah or Sarawak!",
              },
            ]}
          >
            <Select disabled={selectEntity === "GOVERNMENT" ? true : false} onChange={(value) => setSelectEastMalaysia(value)}>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Education Institution Type</p>}
            name="educationType"
            hasFeedback
            rules={[
              {
                required: selectEntity === "EDUCATIONAL_INSTITUTION" ? true : false,
                message: "Please select education institution type!",
              },
            ]}
          >
            <Select onChange={(value) => setSelectEducation(value)} disabled={selectEntity === "EDUCATIONAL_INSTITUTION" ? false : true}>
              <Option value={"public"}>Public</Option>
              <Option value={"private"}>Private</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Business / Organisation Registration Number (i.e. SSM / ROS number)</p>}
            name="newSsmNum"
            hasFeedback
            rules={[
              {
                required: selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? false : true,
                message: "Please input business / organisation registration number!",
              },
            ]}
          >
            <Input
              type={(selectEntity === "SOLE_PROPRIETORSHIP" || selectEntity === "PARTNERSHIP") && selectEastMalaysia === false ? "number" : ""}
              // type="number"
              maxLength={24}
              // placeholder={isSSM === 2 ? "A123456, AA1234567A, 1234567A, 201912345678" : isSSM === 1 ? "201912345678" : isSSM === 0 ? "A123456, AA1234567A, 1234567A" : ""}
              placeholder={placeholder}
              // disabled={selectEntity !== "" && selectRegistered !== null ? false : true}
              disabled={selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}
              onChange={(value) => {
                let val = value.target.value.replace(/[^0-9a-z]/gi, "");
                registerForm.setFieldsValue({
                  newSsmNum: val,
                });
              }}
            />
          </Form.Item>
          <Form.Item
            label={
              <div>
                <p className="font-semibold">Business / Organisation Registration File</p>
              </div>
            }
            name="ssmFile"
            hasFeedback
          >
            <Upload {...pdfProps}>
              <Button className="text-white flex items-center py-2 px-4 bg-assessmentNext hover:bg-assessmentNext focus:bg-assessmentNext hover:text-white focus:text-white">
                <UploadOutlined className="text-xl text-white" />
                Upload File
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">State</p>}
            name="state"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please select state!",
              },
            ]}
          >
            <Select
              onChange={(value) => {
                setSelectState(value.replace(/\s/g, ""));
                registerForm.setFieldsValue({ postcode: "" });
              }}
            >
              {STATE.map((val) => (
                <Option value={val}>{val}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Postcode</p>}
            name="postcode"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input postcode!",
              },
            ]}
          >
            <Select showSearch optionFilterProp="children" disabled={selectState === "" ? true : false}>
              {selectState !== "" ? POSTCODE[selectState].map((val) => <Option value={val}>{val}</Option>) : null}
            </Select>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">MSIC Code</p>}
            name="msic"
            hasFeedback
            rules={[
              {
                required: selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? false : true,
                message: "Please select MSIC code!",
              },
            ]}
          >
            <Select showSearch optionFilterProp="children" disabled={selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}>
              {msic.map((val) => (
                <Option value={val.code}>{val.industry + " (" + val.code + ")"}</Option>
              ))}
            </Select>
          </Form.Item>

          <p className="text-formTitleGreen text-xl font-semibold">Main User Information</p>
          <Form.Item
            label={<p className="font-semibold">Title</p>}
            name="title"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please select title!",
              },
            ]}
          >
            <Select>
              {TITLE.map((val) => (
                <Option value={val}>{val}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">First Name</p>}
            name="firstName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input first name!",
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Last Name</p>}
            name="lastName"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input last name!",
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Department</p>}
            name="department"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please select department!",
              },
            ]}
          >
            <Select>
              {DEPARTMENT.map((val) => (
                <Option value={val}>{val}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Designation Level</p>}
            name="position"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please select designation level!",
              },
            ]}
          >
            <Select>
              {POSITIONLEVEL.map((val) => (
                <Option value={val}>{val}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Contact No.</p>}
            name="contact"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input contact no!",
              },
              {
                validator(_, value) {
                  if (value && !isValidPhoneNumber(value)) {
                    return Promise.reject(new Error("Please input valid contact no!"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <PhoneInput defaultCountry="MY" international />
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Mobile No. (Optional)</p>}
            name="mobile"
            hasFeedback
            rules={[
              {
                validator(_, value) {
                  if (value && !isValidPhoneNumber(value)) {
                    return Promise.reject(new Error("Please input valid contact no!"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <PhoneInput defaultCountry="MY" international />
          </Form.Item>

          <p className="text-formTitleGreen text-xl font-semibold">Login Credentials</p>
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
                message: "Please input password!",
              },
              {
                validator(_, value) {
                  if (value) {
                    if (value.length < 8 || value.length > 12 || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[a-z]/.test(value)) {
                      return Promise.reject(new Error("Password must contain 8 to 12 characters with at least 1 uppercase letter, 1 lowercase letter and 1 number"));
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password minLength={8} maxLength={20} />
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Confirm Password</p>}
            name="confirmPassword"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please input password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error("The two passwords that you entered do not match!"));
                },
              }),
            ]}
          >
            <Input.Password minLength={8} maxLength={20} />
          </Form.Item>
          <p className="text-formTitleGreen text-xl font-semibold">Account Subscription Information</p>
          <Form.Item
            label={<p className="font-semibold">Subscription Plan</p>}
            name="subscriptionPlan"
            // hasFeedback
            // rules={[
            //   {
            //     required: true,
            //     message: "Please select subscription plan!",
            //   },
            // ]}
          >
            {/* <Select disabled={true}>
              {SUSBSCRIPTIONPLAN.map((val) => (
                <Option value={val}>{val}</Option>
              ))}
            </Select> */}
            <p className="py-1 px-2 border-2">{SUSBSCRIPTIONPLAN[0]}</p>
          </Form.Item>
          <Form.Item
            label={<p className="font-semibold">Subscription Period</p>}
            name="subscriptionPeriod"
            // hasFeedback
            // rules={[
            //   {
            //     required: true,
            //     message: "Please select subscription period!",
            //   },
            // ]}
          >
            {/* <Select disabled={true}>
              {SUSBSCRIPTIONPERIOD.map((val) => (
                <Option value={val.value}>{val.name}</Option>
              ))}
            </Select> */}
            <p className="py-1 px-2 border-2">{SUSBSCRIPTIONPERIOD[0].name}</p>
          </Form.Item>

          <Form.Item
            name="tnc"
            valuePropName="checked"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please agree with Terms of Use Policy, Privacy Policy and Disclaimer!",
              },
            ]}
          >
            <Checkbox>
              I accept and agree to the{" "}
              <a className="underline hover:underline focus:underline text-link" href="/tnc/Terms of Use Policy.pdf" target="_blank">
                Terms of Use Policy
              </a>
              ,{" "}
              <a className="underline hover:underline focus:underline text-link" href="/tnc/Privacy Policy.pdf" target="_blank">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a className="underline hover:underline focus:underline text-link" href="/tnc/Disclaimer.pdf" target="_blank">
                Disclaimer
              </a>
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <div className="text-center">
              <Button htmlType="submit" loading={registerDisabled} className="text-white w-[30%] py-2 bg-assessmentNext hover:bg-assessmentNext focus:bg-assessmentNext hover:text-white focus:text-white">
                Sign Up
              </Button>
              <p className="mt-4">
                Already have an account?{" "}
                <Button
                  type="link"
                  onClick={() => {
                    router.push("/ESG-sustainability-login");
                  }}
                  className="p-0 btn-transparent"
                >
                  Login
                </Button>
              </p>
            </div>
          </Form.Item>
        </Form>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-full">
      <Header />
      <Content className="bg-white py-8">{Register()}</Content>
      <Footer />
    </Layout>
  );
}

export default HomePage;
