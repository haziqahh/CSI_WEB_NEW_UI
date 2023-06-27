import { Button, Layout, Row, Col, Progress, Tag, Table, Card, Modal, Input, Form, Tooltip, Checkbox, message, Upload, Select, Spin } from "antd";
import Header from "./header";
import UserImage from "../../assests/img/companyLogo.png";
import Footer from "../footer";
import DashPage from "./top";
import APIHelpers from "../api/apiHelper";
import { CheckOutlined, CloseOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, ExclamationCircleOutlined, EyeOutlined, InfoCircleOutlined, LoadingOutlined, PlusOutlined, ShareAltOutlined, UploadOutlined, UserAddOutlined, UserDeleteOutlined, UserOutlined, UserSwitchOutlined } from "@ant-design/icons";
import Search from "antd/lib/input/Search";
import React, { useState, useEffect } from "react";
import { SearchFilter } from "../api/searchHelper";
import { useRouter } from "next/router";
import { ESGCalculation, IndexCalculation } from "../api/calculationHelper";
import moment from "moment";
// import { LogoSignedUrl } from "../api/signedUrlHelper";
import { MSIC, POSTCODE, REPORTURL, STATE, WEBURL, DEPARTMENT, POSITIONLEVEL, TITLE, BUSINESSENTITY, PORTFOLIOREPORTURL, SUSBSCRIPTIONPLAN } from "../../compenents/config";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const { Content } = Layout;
const { Column } = Table;
const { Option } = Select;

const LearningList = ["ESG", "Environment", "Social", "Governance", "Sustainable Procurement"];

function ProfilePage() {
  const router = useRouter();

  const [addSmeUserModalVisible, setSmeUserModalVisible] = useState(false);
  const [editSmeUserModalVisible, setEditSmeUserModalVisible] = useState(false);
  const [company, setCompany] = useState({});
  const [profile, setProfile] = useState({});
  const [smeUsers, setSmeUsers] = useState([]);


  const [completedAssessment, setCompletedAssessment] = useState([]);

  const [continueAssessment, setContinueAssessment] = useState({});

  const [logo, setLogo] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [uploadLogoVisible, setUploadLogoVisible] = useState(false);
  const [editCompanyProfileVisible, setEditCompanyProfileVisible] = useState(false);
  const [edit] = Form.useForm();
  const [ssmFile, setSSMFile] = useState(null);
  const [selectState, setSelectState] = useState("");
  const [addUser] = Form.useForm();
  const [editUser] = Form.useForm();
  const [editUserData, setEditUserData] = useState({});
  const [selectEntity, setSelectEntity] = useState("");
  const [selectRegistered, setSelectRegistered] = useState(null);
  const [isSSM, setIsSSM] = useState(null);
  const [isDownload, setIsDownload] = useState(false);
  const [pendingShare, setPendingShare] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(false);
  const [pendingVisible, setPendingVisible] = useState(false);
  const [selectEducation, setSelectEducation] = useState("");
  const [newConnectionVisible, setNewConnectionVisible] = useState(false);
  const [reqConnection, setReqConnection] = useState([]);
  const [recConnection, setRecConnection] = useState([]);
  const [linkedCompany, setLinkCompany] = useState([]);
  const [linkedCompanyId, setLinkCompanyId] = useState([]);
  const [fullLinkedCompany, setFullLinkedCompany] = useState([]);
  const [newCompany, setNewCompany] = useState([]);
  const [filteredCompany, setFilteredCompany] = useState([]);
  const [fullCompany, setFullCompany] = useState([]);
  const [allPortfolioScore, setAllPortfolioScore] = useState([]);
  const [fullPortfolioScore, setFullPortfolioScore] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [portfolioDataReady, setPortfolioDataReady] = useState(0);
  const [sharedAssessment, setSharedAssessment] = useState([]);
  const [fullSharedAssessment, setFullSharedAssessment] = useState([]);
  const [reportTabList, setReportTabList] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");
  const [connectedCompany, setConnectedCompany] = useState([]);
  const [connectedCompanyDetails, setConnectedCompanyDetails] = useState([]);
  const [esgLevel, setEsgLevel] = useState(-1);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (sessionStorage.getItem("role") === "VENDOR") {
      getVendorProfile();
    } else {
      getProfile();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(profile).length > 0) {
      getSubscription();
      getCompany();
    }
  }, [profile]);

  useEffect(() => {
    if (Object.keys(company).length > 0) {

      getSMEUsers();
      getSME();
   
      edit.setFieldsValue({
        name: company.companyName,
        businessEntity: company.businessEntity,
        educationType: company.educationType,
        ssmNum: company.ssmNumber,
        smeCorpRegistrationNumber: company.ssmCorpRegistrationNumber,
        postCode: company.postCode,
        msic: company.msic,
        state: company.state,
      });
    }
  }, [company]);

  useEffect(() => {
    if (selectEntity !== "") {
      if (selectEntity !== "EDUCATIONAL_INSTITUTION") {
        setSelectEducation("");
      }
      if (selectEntity === "GOVERNMENT") {
        edit.setFieldsValue({
          registered: null,
          educationType: null,
          ssmNum: "",
          msic: null,
        });
      }
    }
  }, [selectEntity]);

  useEffect(() => {
    if ((pendingShare === true || pendingConnection === true) && router.query.login) {
      setPendingVisible(true);
    }
  }, [pendingShare, pendingConnection]);
  useEffect(() => {
    if (connectedCompany.length > 0 && Object.keys(company).length > 0) {
      getAllAssessment();
    }
  }, [connectedCompany, company]);

  const getSME = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items) {
          let filter = res.items.filter((item) => item.id !== company.id && !linkedCompany.includes(item.id));
          filter.map((val) => {
            val.industry = MSIC.filter((item) => item.code === val.msic)[0].industry;
          });
          setFullCompany(filter);
        }
      })
      .catch(() => {});
  };

  const getSubscription = () => {
    APIHelpers.GET("v1/subscriptions?corporateId=" + profile.companyID).then((res) => {
      if (res.items) {
        setSubscriptionPlan(res.items.at(-1).subscriptionPlan);
      }
    });
  };

  const getCompany = () => {
    APIHelpers.GET("v1/smes?id=" + profile.companyID)
      .then((res) => {
        setSelectEntity(res.items[0].businessEntity);
        setSelectRegistered(res.items[0].registeredInEastMY);
        setSelectState(res.items[0].state.replace(/\s/g, ""));
        setSelectEntity(res.items[0].businessEntity);
        setSelectEducation(res.items[0].educationTypea);
        // if (res.items[0].profilePicture !== "") {
        //   LogoSignedUrl(res.items[0].profilePicture)
        //     .then((res) => {
        //       setCompanyLogo(res);
        //     })
        //     .catch(() => {});
        // }
        setCompanyLogo(WEBURL + "/storage/" + res.items[0].profilePicture);
        setCompany(res.items[0]);
      })
      .catch(() => {});
  };


 

  const getSMEUsers = () => {
    APIHelpers.GET("v1/smeUsers?companyId=" + company.id)
      .then((res) => {
        if (res.items) {
          let data = res.items.filter((item) => item.id !== profile.id && item.status === "ACTIVE");
          if (data.length > 0) {
            data.map((val) => {
              val.contact = "+" + val.contact;
              if (val.mobileContact !== "") {
                val.mobileContact = "+" + val.mobileContact;
              } else {
                val.mobileContact = "-";
              }
              let position = val.position.split("_");
              val.department = position[0];
              val.position = position[1];
            });
          }
          setSmeUsers(data);
        }
      })
      .catch(() => {});
  };



  const getProfile = () => {
    APIHelpers.GET("v1/smeUser")
      .then((res) => {
        res.item.contact = "+" + res.item.contact;
        if (res.item.mobileContact !== "") {
          res.item.mobileContact = "+" + res.item.mobileContact;
        } else {
          res.item.mobileContact = "-";
        }
        let position = res.item.position.split("_");
        res.item.department = position[0];
        res.item.position = position[1];
        setProfile(res.item);
      })
      .catch(() => {});
  };

  const getVendorProfile = () => {
    APIHelpers.GET("v1/admin")
      .then((res) => {
        res.item.companyID = res.item.companyName;
        setProfile(res.item);
      })
      .catch(() => {});
  };

  const submitAddSmeUser = (values) => {
    let data = {
      companyID: company.id,
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      position: values.department + "_" + values.position,
      contact: values.contact.slice(1).trim(),
      email: values.email,
      status: "ACTIVE",
      password: values.password,
      role: "USER",
    };

    values.mobile !== undefined ? (data.mobileContact = values.mobile.slice(1).trim()) : null;

    APIHelpers.POST("v1/smeUser", data)
      .then(() => {
        setSmeUserModalVisible(false);
        addUser.resetFields();
        message.success({
          content: "Authorised User added successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getSMEUsers();
      })
      .catch(() => {
        message.error({
          content: "Fail to add authorised User.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const submitEditSmeUser = (values) => {
    let data = {
      companyID: company.id,
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      position: values.department + "_" + values.position,
      contact: values.contact.slice(1).trim(),
      email: values.email,
    };

    values.mobile !== undefined ? (data.mobileContact = values.mobile.slice(1).trim()) : null;
    values.password !== undefined ? (data.password = values.password) : null;

    APIHelpers.PUT("v1/smeUser?id=" + editUserData.id, data)
      .then(() => {
        setEditSmeUserModalVisible(false);
        editUser.resetFields();
        message.success({
          content: "Edit Authorised User successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        if (sessionStorage.getItem("role") === "VENDOR") {
          getVendorProfile();
        } else {
          getProfile();
        }
        getSMEUsers();
      })
      .catch(() => {
        message.error({
          content: "Fail to edit Authorised User.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const addSmeUser = () => {
    return (
      <Modal visible={addSmeUserModalVisible} className="Modal-rounded" footer={null} onCancel={() => setSmeUserModalVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-base 1000:text-lg">Add Authorised User</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-sm 1000:text-base px-8 mt-8">Personal Information</p>
        <div className="px-8 py-4">
          <Form layout="vertical" onFinish={submitAddSmeUser} form={addUser}>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Title</p>}
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
              label={<p className="font-semibold text-xs 1000:text-sm">First Name</p>}
              name="firstName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the first name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Last Name</p>}
              name="lastName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the last name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>

            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Department</p>}
              name="department"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select department",
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
              label={<p className="font-semibold text-xs 1000:text-sm">Designation Level</p>}
              name="position"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select designation level",
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
              label={<p className="font-semibold text-xs 1000:text-sm">Contact No</p>}
              name="contact"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Contact no",
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
              label={<p className="font-semibold text-xs 1000:text-sm">Mobile No (Optional)</p>}
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

            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Email</p>}
              name="email"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Email!",
                },
                {
                  type: "email",
                  message: "Please input valid Email!",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <p className="text-formTitleGreen font-semibold text-sm 1000:text-base mt-2">Login Credentials</p>
            <div className="flex justify-between mt-4">
              <Form.Item
                label={<p className="font-semibold text-xs 1000:text-sm">Password</p>}
                name="password"
                className="w-49%"
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
                          return Promise.reject(new Error("Password must contain 8 to 12 characters with at least 1 uppercase letter, lowercase letter and 1 number"));
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password minLength={8} maxLength={12} />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold text-xs 1000:text-sm">Confirm Password</p>}
                name="confirmPassword"
                className="w-49%"
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
                <Input.Password minLength={6} maxLength={20} />
              </Form.Item>
            </div>
            <Form.Item className="mb-2 text-right">
              <Button htmlType="submit" className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
                SAVE
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };

  const editSmeUser = () => {
    return (
      <Modal visible={editSmeUserModalVisible} className="Modal-rounded" footer={null} onCancel={() => setEditSmeUserModalVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-base 1000:text-lg">Edit Authorised User</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-sm 1000:text-base px-8 mt-8">Personal Information</p>
        <div className="px-8 py-4">
          <Form layout="vertical" onFinish={submitEditSmeUser} form={editUser}>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Title</p>}
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
              label={<p className="font-semibold text-xs 1000:text-sm">First Name</p>}
              name="firstName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the first name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Last Name</p>}
              name="lastName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the last name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>

            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Department</p>}
              name="department"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select department",
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
              label={<p className="font-semibold text-xs 1000:text-sm">Designation Level</p>}
              name="position"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select designation level",
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
              label={<p className="font-semibold text-xs 1000:text-sm">Contact No</p>}
              name="contact"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Contact no",
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
              label={<p className="font-semibold text-xs 1000:text-sm">Mobile No (Optional)</p>}
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

            <Form.Item
              label={<p className="font-semibold text-xs 1000:text-sm">Email</p>}
              name="email"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Email!",
                },
                {
                  type: "email",
                  message: "Please input valid Email!",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <p className={editUserData.id === profile.id || profile.role === "ADMIN" ? "text-formTitleGreen font-semibold text-sm 1000:text-base mt-2" : "hidden"}>Login Credentials</p>
            <div className={editUserData.id === profile.id || profile.role === "ADMIN" ? "flex justify-between mt-4" : "hidden"}>
              <Form.Item
                label={<p className="font-semibold text-xs 1000:text-sm">Password</p>}
                name="password"
                className="w-49%"
                hasFeedback
                rules={[
                  {
                    validator(_, value) {
                      if (value) {
                        if (value.length < 8 || value.length > 12 || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[a-z]/.test(value)) {
                          return Promise.reject(new Error("Password must contain 8 to 12 characters with at least 1 uppercase letter, lowercase letter and 1 number"));
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password minLength={8} maxLength={12} />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold text-xs 1000:text-sm">Confirm Password</p>}
                name="confirmPassword"
                className="w-49%"
                hasFeedback
                rules={[
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
                <Input.Password minLength={6} maxLength={20} />
              </Form.Item>
            </div>
            <Form.Item className="mb-2 text-right ">
              <Button htmlType="submit" className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
                SAVE
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };


  const docProps = {
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

  const imgProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
    beforeUpload: (file) => {
      if (file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg") {
        message.error({
          content: `${file.name} is an invalid file format. Please change the file extension to either .png, .jpg, .jpeg.`,
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
        setLogo(info.fileList[0].originFileObj);
      }
    },
  };

  



  const updateCompanyProfile = (values) => {
    let form = new FormData();
    if (company) {
      ssmFile !== null ? form.append("ssmDoc", ssmFile) : null;
      form.append("state", values.state);
      form.append("postCode", values.postCode);
      form.append("msic", values.msic);
      form.append("companyName", values.name);
      form.append("businessEntity", values.businessEntity);
      form.append("registeredInEastMy", selectRegistered);
      values.smeCorpRegistrationNumber !== undefined ? form.append("smeCorpRegistrationNumber", values.smeCorpRegistrationNumber) : null;
      company.ssmNumber !== values.ssmNum ? form.append("ssmNumber", values.ssmNum) : null;
      company.oldSSMNumber !== values.oldSsmNum ? form.append("oldSSMNumber", values.oldSsmNum) : null;
      APIHelpers.PUT("v1/sme?id=" + company.id, form, {
        "Content-Type": "multipart/form-data",
      })
        .then(() => {
          let data = {
            linkedWiths: company.linkedWiths,
            participatedLearning: company.participatedLearning,
          };
          APIHelpers.PUT("v1/sme?id=" + company.id, data)
            .then(() => {
              setEditCompanyProfileVisible(false);
              message.success({
                content: "Your Company Profile has been updated.",
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 5,
              });
              edit.resetFields();
              setCompany([]);
              getCompany();
            })
            .catch(() => {
              message.error({
                content: "Your Company Profile was not updated.",
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 8,
              });
            });
        })
        .catch((err) => {
          if ("response" in err) {
            if ("data" in err.response) {
              if ("error" in err.response.data) {
                if ("code" in err.response.data.error) {
                  if (err.response.data.error.code.includes("ssm_number_found")) {
                    message.error({
                      content: "Your Company Profile was not updated. Business Registration Number has been used.",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 8,
                    });
                  } else if (err.response.data.error.code.includes("company_name_found")) {
                    message.error({
                      content: "Your Company Profile was not updated. Company Name has been used.",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 8,
                    });
                  } else {
                    message.error({
                      content: "Your Company Profile was not updated.",
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
            message.error({
              content: "Your Company Profile was not updated.",
              style: {
                fontSize: "20px",
                marginTop: "100px",
              },
              duration: 8,
            });
          }
        });
    }
  };

  const showEditCompanyProfile = () => {
    return (
      <Modal visible={editCompanyProfileVisible} className="Modal-rounded" footer={null} onCancel={() => setEditCompanyProfileVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-base 1000:text-lg">Edit Company Profile</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-sm 1000:text-base px-8 mt-8">Company Information</p>
        <div className="px-8 py-4">
          <Form layout="vertical" onFinish={updateCompanyProfile} form={edit}>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Company Name</p>} name="name" hasFeedback>
              <Input maxLength={100} disabled={company.approvedBy !== null ? true : false} />
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Type</p>} name="businessEntity" hasFeedback>
              <Select onChange={(value) => setSelectEntity(value)} disabled={company.approvedBy !== null ? true : false}>
                {BUSINESSENTITY.map((val) => (
                  <Option value={val.key}>{val.data}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation registered in Sabah or Sarawak?</p>} name="registeredInEastMY" hasFeedback>
              <Select onChange={(value) => setSelectRegistered(value)} disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" ? true : false}>
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Education Institution Type</p>} name="educationType" hasFeedback>
              <Select onChange={(value) => setSelectEducation(value)} disabled={company.approvedBy !== null ? true : selectEntity === "EDUCATIONAL_INSTITUTION" ? false : true}>
                <Option value={"public"}>Public</Option>
                <Option value={"private"}>Private</Option>
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Registration Number (i.e. SSM / ROS number)</p>} name="ssmNum" hasFeedback>
              <Input
                type={isSSM === 1 ? "number" : ""}
                maxLength={24}
                disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}
                onChange={(value) => {
                  let val = value.target.value.replace(/[^0-9a-z]/gi, "");
                  edit.setFieldsValue({
                    ssmNum: val,
                  });
                }}
              />
            </Form.Item>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Business / Organisation Registration File</p>} name="ssmFile" hasFeedback className={company.approvedBy !== null ? "hidden" : "visible"}>
              <Upload {...docProps}>
                <Button className="text-white flex items-center py-2 px-4 bg-gradient-to-t from-#DF3B57 to-#DF3B57CC hover:bg-gradient-to-t focus:bg-gradient-to-tC hover:text-white focus:text-white">
                  <UploadOutlined className="text-xl text-white" />
                  Upload File
                </Button>
              </Upload>
            </Form.Item>
            <div className="flex justify-between">
              <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">State</p>} name="state" hasFeedback className="w-49%">
                <Select
                  onChange={(value) => {
                    setSelectState(value.replace(/\s/g, ""));
                    edit.setFieldsValue({ postCode: "" });
                  }}
                  disabled={company.approvedBy !== null ? true : false}
                >
                  {STATE.map((val) => (
                    <Option value={val}>{val}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">Postcode</p>} name="postCode" hasFeedback className="w-49%">
                <Select showSearch optionFilterProp="children" disabled={company.approvedBy !== null ? true : selectState === "" ? true : false}>
                  {selectState !== "" ? POSTCODE[selectState].map((val) => <Option value={val}>{val}</Option>) : null}
                </Select>
              </Form.Item>
            </div>
            <Form.Item label={<p className="font-semibold text-xs 1000:text-sm">MSIC</p>} name="msic" hasFeedback>
              <Select style={{ width: "100%" }} disabled={company.approvedBy !== null ? true : selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}>
                {shopMSIC}
              </Select>
            </Form.Item>
            <Form.Item className="mb-2 text-right ">
              <Button htmlType="submit" disabled={company.approvedBy !== null ? true : false} className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white">
                SAVE
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };

  const shopMSIC = MSIC.map((row) => {
    return (
      <Option value={row.code}>
        {row.code} - {row.industry}
      </Option>
    );
  });

  const confirmToDelete = (values, name) => {
    Modal.confirm({
      okText: "Confirm",
      cancelText: "Cancel",
      title: "Confirm to delete " + name + " from authorised users?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deactivateUser(values);
      },
    });
  };

  const deactivateUser = (values) => {
    let data = {
      status: "INACTIVE",
    };
    APIHelpers.PUT("v1/smeUser?id=" + values, data)
      .then(() => {
        message.success({
          content: "Authorised User has been deleted.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getSMEUsers();
      })
      .catch(() => {
        message.error({
          content: "Authorised User was not deleted.",
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
      <Content className="bg-white 1150:px-12 px-8 min-h-9/10 w-full pb-16">
      <DashPage></DashPage>
        <Row className="flex mt-8 min-h-8/10 gap-x-8 justify-between ">
          <Col className="w-full 1150:w-9/12 block 1150:hidden mb-4">
          </Col>
          <Col className="w-full 1150:w-5/5">
          <Row className="flex mt-4 gap-x-4 justify-between verticalGap">
          <Col className="bg-white p-4 w-full 1150:w-80% flex shadow-md rounded-lg relative border-2">
  <div className="w-full flex items-center justify-between">
    <p className="font-bold text-sm 1000:text-base">Company Profile</p>
    <div className="flex gap-x-4 ">
      <EditOutlined className="text-base cursor-pointer" onClick={() => setEditCompanyProfileVisible(true)} />
    </div>
  </div>
</Col>


           </Row>
            <div className="bg-white p-4 shadow-md rounded-lg mt-4 border-2">
              <p className="font-semibold text-sm 1000:text-base text-#21324E">Authorised Users</p>
              <div className="flex gap-x-4 items-center py-4 border-b-4 ">
                <div className="flex flex-col grow">
                  <p className="text-#21324E font-semibold text-xs">{profile.firstName + " " + profile.lastName}</p>
                  <p className="text-#21324E font-semibold text-xs">{profile.department}</p>
                  <p className="text-#21324E font-semibold text-xs">{profile.position}</p>
                </div>
                <div className="grow-0 flex gap-x-4 ">
                  <EditOutlined
                    className="text-base cursor-pointer"
                    onClick={() => {
                      setEditUserData(profile);
                      editUser.setFieldsValue({
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        contact: profile.contact,
                        mobile: profile.mobileContact !== "-" ? profile.mobileContact : "",
                        email: profile.email,
                        title: profile.title,
                        department: profile.department,
                        position: profile.position,
                      });
                      setEditSmeUserModalVisible(true);
                    }}
                  />
                </div>
              </div>
              {smeUsers.map((val) => (
                <div className="flex gap-x-4 items-center py-4 border-b-4 ">
                  <div className="flex flex-col grow">
                    <p className="text-#21324E font-semibold text-xs">{val.firstName + " " + val.lastName}</p>
                    <p className="text-#21324E font-semibold text-xs">{val.department}</p>
                    <p className="text-#21324E font-semibold text-xs">{val.position}</p>
                  </div>
                  <div className="grow-0 flex gap-x-4 ">
                    {val.role !== "ADMIN" ? (
                      <EditOutlined
                        className="text-base cursor-pointer"
                        onClick={() => {
                          setEditUserData(val);
                          editUser.setFieldsValue({
                            firstName: val.firstName,
                            lastName: val.lastName,
                            contact: val.contact,
                            mobile: val.mobileContact !== "-" ? val.mobileContact : "",
                            email: val.email,
                            title: val.title,
                            department: val.department,
                            position: val.position,
                          });
                          setEditSmeUserModalVisible(true);
                        }}
                      />
                    ) : null}
                    {val.role !== "ADMIN" ? <DeleteOutlined className="text-base cursor-pointer" onClick={() => confirmToDelete(val.id, val.firstName + " " + val.lastName)} /> : null}
                  </div>
                </div>
              ))}
              {(subscriptionPlan === SUSBSCRIPTIONPLAN[0] && smeUsers.length < 2) || (subscriptionPlan === SUSBSCRIPTIONPLAN[1] && smeUsers.length < 4) || ((subscriptionPlan === SUSBSCRIPTIONPLAN[2] || subscriptionPlan === SUSBSCRIPTIONPLAN[3]) && smeUsers.length < 9) ? (
                <div className="flex gap-x-4 items-center py-4 border-b-4">
                  <div className="flex flex-col grow"></div>
                  <div className="grow-0 flex gap-x-4 ">
                    <PlusOutlined className="text-base cursor-pointer" onClick={() => setSmeUserModalVisible(true)} />
                  </div>
                </div>
              ) : null}
            </div>
          </Col>
         
             
            <Row className="mt-8 rounded-lg">
             
              {addSmeUser()}
              {editSmeUser()}
              {showEditCompanyProfile()}

            </Row>
          {/* </Col> */}
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
}

export default ProfilePage;
