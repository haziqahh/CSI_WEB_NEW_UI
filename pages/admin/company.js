import { Button, Layout, Row, Col, Table, Modal, Form, Input, Switch, Upload, Select, message, Dropdown, Menu } from "antd";
import Header from "./header";
// import SmeCorpLogo from "../../assests/logo/SmeCorp.png";
// import GlobalCompactLogo from "../../assests/logo/globalCompact.png";
import Footer from "../footer";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import APIHelpers from "../api/apiHelper";
import { MSIC } from "../../assests/components/config";
import { BUSINESSENTITY, POSTCODE, STATE, SUSBSCRIPTIONPERIOD, SUSBSCRIPTIONPLAN, WEBURL } from "../../compenents/config";
import { SearchFilter } from "../api/searchHelper";
import { SignedUrl } from "../api/signedUrlHelper";
import { useRouter } from "next/router";
import moment from "moment";

const { Content } = Layout;
const { Column } = Table;
const { Option } = Select;
const { Search } = Input;

function HomePage() {
  const router = useRouter();
  const [add] = Form.useForm();
  const [edit] = Form.useForm();
  const [addSmeVisible, setAddSmeVisible] = useState(false);
  const [editSmeVisible, setEditSmeVisible] = useState(false, "");
  const [ssmFile, setSSMFile] = useState(null);
  const [allSme, setAllSme] = useState([]);
  const [fullAllSme, setFullAllSme] = useState([]);
  const [editUserData, setEditUserData] = useState({});
  const [allAdminData, setAllAdminData] = useState([]);
  const [allSmeUser, setAllSmeUser] = useState([]);
  const [allAssessment, setAllAssessment] = useState([]);
  const [selectState, setSelectState] = useState("");
  const [msic, setMsic] = useState([]);
  const [selectEntity, setSelectEntity] = useState("");
  const [selectRegistered, setSelectRegistered] = useState(null);
  const [isSSM, setIsSSM] = useState(null);
  const [selectEducation, setSelectEducation] = useState("");
  const [addSubscriptionVisible, setAddSubscriptionVisible] = useState(false);
  const [editSubscriptionVisible, setEditSubscriptionVisible] = useState(false);
  const [editSubscriptionData, setEditSubscriptionData] = useState({});
  const [fullSubscription, setFullSubscription] = useState([]);
  const [corporate, setCorporate] = useState("");
  const [corporateSubscription, setCorporateSubscription] = useState([]);
  const [fullCorporateSubscription, setFullCorporateSubscription] = useState([]);
  const [subscriptionVisible, setSubscriptionVisible] = useState(false);
  const [editSubs] = Form.useForm();

  useEffect(() => {
    setMsic(MSIC.sort((a, b) => a.industry.localeCompare(b.industry)));
    getAllAdmin();
    getAllSmeUser();
    getAllAssessment();
    getAllSubscription();
  }, []);

  useEffect(() => {
    if (allAdminData.length > 0) {
      getAllSme();
    }
  }, [allAdminData, allSmeUser, allAssessment]);

  useEffect(() => {
    if (selectEntity !== "") {
      if (selectEntity !== "EDUCATIONAL_INSTITUTION") {
        setSelectEducation("");
      }
      if (selectEntity === "GOVERNMENT") {
        add.setFieldsValue({
          registered: null,
          educationType: null,
          newSsmNum: "",
          msic: null,
        });
        edit.setFieldsValue({
          registered: null,
          educationType: null,
          newSsmNum: "",
          msic: null,
        });
      }
    }
  }, [selectEntity]);

  const getAllAdmin = () => {
    APIHelpers.GET("v1/admins")
      .then((res) => {
        if (res.items !== null) {
          let data = res.items.filter((item) => item.role === "ADMIN" || item.role === "USER");
          data.map((val) => {
            val.contact = "+" + val.contact;
            val.approvedBy = val.approvedBy !== null ? (res.items.filter((item) => item.id === val.approvedBy).length > 0 ? res.items.filter((item) => item.id === val.approvedBy)[0].firstName + " " + res.items.filter((item) => item.id === val.approvedBy)[0].lastName : "-") : "-";
          });
          setAllAdminData(data);
        }
      })
      .catch(() => {});
  };

  const getAllSmeUser = () => {
    APIHelpers.GET("v1/smeUsers")
      .then((res) => {
        if (res.items !== null) {
          setAllSmeUser(res.items.filter((item) => item.role === "ADMIN"));
        }
      })
      .catch(() => {});
  };

  const getAllSme = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items !== null) {
          res.items.map((val) => {
            val.approvedBy = allAdminData.filter((item) => item.id === val.approvedBy).length > 0 ? allAdminData.filter((item) => item.id === val.approvedBy)[0].firstName + " " + allAdminData.filter((item) => item.id === val.approvedBy)[0].lastName : "-";
            let owner = allSmeUser.filter((item) => item.companyID === val.id)[0];
            if (owner !== undefined) {
              val.owner = owner.firstName + " " + owner.lastName;
            }
            val.businessEntity !== "" ? (val.businessEntity = BUSINESSENTITY.filter((item) => item.key === val.businessEntity)[0].data) : null;
            if (allAssessment.filter((item) => item.smeID === val.id).length > 0) {
              val.isoDoc = allAssessment.filter((item) => item.smeID === val.id)[0].isoDocs;
              val.isoList = allAssessment.filter((item) => item.smeID === val.id)[0].isoList;
            } else {
              val.isoDoc = [];
              val.isoList = [];
            }
          });
          setAllSme(res.items.sort((a, b) => a.companyName.localeCompare(b.companyName)));
          setFullAllSme(res.items.sort((a, b) => a.companyName.localeCompare(b.companyName)));
        }
      })
      .catch(() => {});
  };

  const getAllAssessment = () => {
    APIHelpers.GET("v1/assessments")
      .then((res) => {
        if (res.items !== null) {
          let data = res.items.filter((item) => item.completionDate !== "0001-01-01T00:00:00Z");
          data = data.sort((a, b) => new Date(a.completionDate) - new Date(b.completionDate));
          data.map((val, index) => {
            APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id).then((res) => {
              if (res.items !== null) {
                let doc = res.items.filter((item) => item.questionType === "UPLOAD");
                let list = [];
                doc.map((val) => {
                  if (val.answer.text !== null) {
                    list = [].concat(list, val.answer.text);
                  }
                });
                val.isoList = list;
                if (index === data.length - 1) {
                  setAllAssessment(data);
                }
              }
            });
          });
        }
      })
      .catch(() => {});
  };

  const getAllSubscription = () => {
    APIHelpers.GET("v1/subscriptions")
      .then((res) => {
        if (res.items !== null) {
          let data = res.items;
          data.map((row) => {
            row.Date = new Date(row.createdAt);
            let subscriptionStartDate = new Date(row.createdAt);
            row.subscriptionStartDate = row.createdAt !== "0001-01-01T00:00:00Z" ? ("0" + subscriptionStartDate.getDate()).slice(-2) + "/" + ("0" + (subscriptionStartDate.getMonth() + 1)).slice(-2) + "/" + subscriptionStartDate.getFullYear() : "-";
            let subscriptionEndDate = new Date(row.createdAt);
            row.subscriptionEndDate = row.createdAt !== "0001-01-01T00:00:00Z" ? ("0" + subscriptionEndDate.getDate()).slice(-2) + "/" + ("0" + (subscriptionEndDate.getMonth() + 1)).slice(-2) + "/" + (subscriptionEndDate.getFullYear() + parseInt(row.subscriptionPeriod)) : "-";
          });
          let sortData = data.sort((a, b) => {
            b.Date - a.Date;
          });
          if (corporate !== "") {
            setFullCorporateSubscription(fullSubscription.filter((item) => item.corporateID === corporate));
            setCorporateSubscription(fullSubscription.filter((item) => item.corporateID === corporate));
          }
          setFullSubscription(sortData);
        }
      })
      .catch(() => {});
  };

  //submit to api add sme
  const submitAddSmeCompany = (values) => {
    let form = new FormData();
    if (values.status === null || values.status === "") {
      values.status = "INACTIVE";
    } else {
      if (values.status === true || values.status === "true") {
        values.status = "ACTIVE";
      } else {
        values.status = "INACTIVE";
      }
    }

    form.append("companyName", values.companyName);
    form.append("ssmNumber", values.newSsmNum);
    form.append("businessEntity", values.businessEntity);
    form.append("registeredInEastMy", values.registered);
    ssmFile !== null ? form.append("ssmDoc", ssmFile) : null;
    form.append("smeCorpRegistrationNumber", values.smeCorpRegistrationNumber !== undefined ? values.smeCorpRegistrationNumber : "");
    form.append("state", values.state);
    form.append("postCode", values.postCode);
    form.append("msic", values.msic);
    form.append("status", values.status);
    form.append("approvedBy", values.approvedBy);
    APIHelpers.POST("v1/sme", form, {
      "Content-Type": "multipart/form-data",
    })
      .then(() => {
        setAddSmeVisible(false);
        setSelectEntity("");
        setSelectRegistered(null);
        setIsSSM(null);
        message.success({
          content: "New Company Account added successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getAllSme();
      })
      .catch((err) => {
        if ("response" in err) {
          if ("data" in err.response) {
            if ("error" in err.response.data) {
              if ("code" in err.response.data.error) {
                if (err.response.data.error.code.includes("ssm_number_found")) {
                  message.error({
                    content: "Fail to add new Company Account. Business Registration Number has been used.",
                    style: {
                      fontSize: "20px",
                      marginTop: "100px",
                    },
                    duration: 8,
                  });
                } else if (err.response.data.error.code.includes("company_name_found")) {
                  message.error({
                    content: "Fail to add new Company Account. Company Name has been used.",
                    style: {
                      fontSize: "20px",
                      marginTop: "100px",
                    },
                    duration: 8,
                  });
                } else {
                  message.error({
                    content: "Fail to add new Company Account.",
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
            content: "Fail to add new Company Account.",
            style: {
              fontSize: "20px",
            },
            duration: 8,
          });
        }
        // message.error({
        //   content: "Fail to add new Company Account.",
        //   style: {
        //     fontSize: "20px",
        //     marginTop: "100px",
        //   },
        //   duration: 8,
        // });
      });
  };

  //submit to api edit sme
  const submitEditSmeCompany = (values) => {
    let form = new FormData();
    if (values.status === null || values.status === "") {
      values.status = "INACTIVE";
    } else {
      if (values.status === true || values.status === "true") {
        values.status = "ACTIVE";
      } else {
        values.status = "INACTIVE";
      }
    }
    if (BUSINESSENTITY.filter((item) => item.data === values.businessEntity).length > 0) {
      values.businessEntity = BUSINESSENTITY.filter((item) => item.data === values.businessEntity)[0].key;
    }
    if (editUserData) {
      ssmFile !== null ? form.append("ssmDoc", ssmFile) : null;
      form.append("state", values.state);
      form.append("postCode", values.postCode);
      form.append("status", editUserData.status);
      form.append("msic", values.msic);
      form.append("companyName", values.name);
      form.append("businessEntity", values.businessEntity);
      form.append("registeredInEastMy", values.registered);
      values.ssmNum !== editUserData.ssmNumber ? form.append("ssmNumber", values.ssmNum) : null;
      values.smeCorpRegistrationNumber !== undefined ? form.append("smeCorpRegistrationNumber", values.smeCorpRegistrationNumber) : null;
      editUserData.approvedBy === "-" ? form.append("approvedBy", values.approvedBy) : null;
      APIHelpers.PUT("v1/sme?id=" + editUserData.id, form, {
        "Content-Type": "multipart/form-data",
      })
        .then(() => {
          let data = {
            linkedWiths: editUserData.linkedWiths,
            participatedLearning: editUserData.participatedLearning,
          };
          APIHelpers.PUT("v1/sme?id=" + editUserData.id, data)
            .then(() => {
              setEditSmeVisible(false);
              setSelectEntity("");
              setSelectRegistered(null);
              setIsSSM(null);
              message.success({
                content: "Edit Company details successfully.",
                style: {
                  fontSize: "20px",
                  marginTop: "100px",
                },
                duration: 5,
              });
              setAllSme([]);
              getAllSme();
            })
            .catch(() => {
              message.error({
                content: "Fail to edit Company details.",
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
                      content: "Fail to edit Company details. Business Registration Number has been used.",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 8,
                    });
                  } else if (err.response.data.error.code.includes("company_name_found")) {
                    message.error({
                      content: "Fail to edit Company details. Company Name has been used.",
                      style: {
                        fontSize: "20px",
                        marginTop: "100px",
                      },
                      duration: 8,
                    });
                  } else {
                    message.error({
                      content: "Fail to edit Company details.",
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
              content: "Fail to edit Company details.",
              style: {
                fontSize: "20px",
              },
              duration: 8,
            });
          }
        });
    }
  };

  const submitAddSubscription = (values) => {
    let data = {
      corporateID: corporate,
      subscriptionPlan: values.subscriptionPlan,
      subscriptionPeriod: values.subscriptionPeriod,
    };
    APIHelpers.POST("v1/subscription", data)
      .then(() => {
        message.success({
          content: "New subscription details added successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getAllSubscription();
        setAddSubscriptionVisible(false);
      })
      .catch(() => {
        message.error({
          content: "Fail to add new subscription details.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const submitEditSubscription = (values) => {
    let data = {
      corporateID: corporate,
      subscriptionPlan: values.subscriptionPlan,
      subscriptionPeriod: values.subscriptionPeriod,
    };
    APIHelpers.PUT("v1/subscription?id=" + editSubscriptionData.id, data)
      .then(() => {
        message.success({
          content: "Subscription details editted successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getAllSubscription();
        setEditSubscriptionVisible(false);
      })
      .catch(() => {
        message.error({
          content: "Fail to edit subscription details.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  //update status on table
  const updateStatus = (status, row) => {
    if (status === null || status === "") {
      status = "INACTIVE";
    } else {
      if (status === true || status === "true") {
        status = "ACTIVE";
      } else {
        status = "INACTIVE";
      }
    }
    let data = {
      id: row.id,
      status: status,
      linkedWiths: row.linkedWiths,
    };
    APIHelpers.PUT("v1/sme?id=" + row.id, data)
      .then(() => {
        getAllSme();
        message.success({
          content: "Status updated successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
      })
      .catch(() => {
        message.error({
          content: "Fail to update status.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 8,
        });
      });
  };

  const addSme = () => {
    return (
      <Modal visible={addSmeVisible} className="Modal-rounded" footer={null} onCancel={() => setAddSmeVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Add Company</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-xl px-8 mt-8">Company Information</p>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitAddSmeCompany} form={add}>
            <Form.Item
              label={<p className="font-semibold">Company Name</p>}
              name="companyName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the full Company Name!",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold">Business / Organisation Type</p>}
              name="businessEntity"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select business / organisation type!",
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
              label={<p className="font-semibold">Business / Organisation registered in Sabah/Sarawak</p>}
              name="registered"
              hasFeedback
              rules={[
                {
                  required: selectEntity !== "GOVERNMENT" ? true : false,
                  message: "Please select business / organisation registered in Sabah/Sarawak!",
                },
              ]}
            >
              <Select disabled={selectEntity === "GOVERNMENT" ? true : false}>
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
                type="number"
                maxLength={24}
                placeholder={selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? "" : "201912345678"}
                disabled={selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}
                onChange={(value) => {
                  let val = value.target.value.replace(/[^0-9a-z]/gi, "");
                  add.setFieldsValue({
                    newSsmNum: val,
                  });
                }}
              />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Business / Organisation Registration File</p>} name="ssmFile" hasFeedback>
              <Upload {...pdfProps}>
                <Button className="text-white flex items-center py-2 px-4 Upload-btn hover:text-white focus:text-white">
                  <UploadOutlined className="text-xl text-white" />
                  Upload File
                </Button>
              </Upload>
            </Form.Item>

            <div className="1000:flex justify-between">
              <Form.Item
                label={<p className="font-semibold">State</p>}
                name="state"
                hasFeedback
                className="1000:w-49%"
                rules={[
                  {
                    required: true,
                    message: "Please input the State!",
                  },
                ]}
              >
                <Select
                  onChange={(value) => {
                    setSelectState(value.replace(/\s/g, ""));
                    add.setFieldsValue({ postCode: "" });
                  }}
                >
                  {STATE.map((val) => (
                    <Option value={val}>{val}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold">Postcode</p>}
                name="postCode"
                hasFeedback
                className="1000:w-49%"
                rules={[
                  {
                    required: true,
                    message: "Please input the Postcode!",
                  },
                ]}
              >
                <Select showSearch optionFilterProp="children" disabled={selectState === "" ? true : false}>
                  {selectState !== "" ? POSTCODE[selectState].map((val) => <Option value={val}>{val}</Option>) : null}
                </Select>
              </Form.Item>
            </div>
            <Form.Item
              label={<p className="font-semibold">MSIC</p>}
              name="msic"
              hasFeedback
              rules={[
                {
                  required: selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? false : true,
                  message: "Please select MSIC code!",
                },
              ]}
            >
              <Select showSearch optionFilterProp="children" style={{ width: "100%" }} disabled={selectEntity === "GOVERNMENT" || (selectEntity === "EDUCATIONAL_INSTITUTION" && selectEducation === "public") ? true : false}>
                {shopMSIC}
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Account Status</p>} name="status" hasFeedback className="max-w-120px ">
              <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" defaultChecked={true} className="switchButton" />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Verification PIC</p>} name="approvedBy" hasFeedback>
              <Select style={{ width: "100%" }}>
                {allAdminData.map((val) => (
                  <Option value={val.id}>{val.firstName + " " + val.lastName}</Option>
                ))}
              </Select>
            </Form.Item>
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

  const editSme = () => {
    return (
      <Modal visible={editSmeVisible} className="Modal-rounded" footer={null} onCancel={() => setEditSmeVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Edit Company</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-xl px-8 mt-8">Company Information</p>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitEditSmeCompany} form={edit}>
            <Form.Item label={<p className="font-semibold">Company Name</p>} name="name" hasFeedback>
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Business Entity</p>} name="businessEntity" hasFeedback>
              <Select onChange={(value) => setSelectEntity(value)}>
                {BUSINESSENTITY.map((val) => (
                  <Option value={val.key}>{val.data}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Business registered in Sabah/Sarawak</p>} name="registered" hasFeedback>
              <Select onChange={(value) => setSelectRegistered(value)}>
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Business Registration Number</p>} name="ssmNum" hasFeedback>
              <Input
                type={isSSM === 1 ? "number" : ""}
                maxLength={24}
                placeholder={isSSM === 2 ? "A123456, AA1234567A, 1234567A, 201912345678" : isSSM === 1 ? "201912345678" : isSSM === 0 ? "A123456, AA1234567A, 1234567A" : ""}
                onChange={(value) => {
                  let val = value.target.value.replace(/[^0-9a-z]/gi, "");
                  edit.setFieldsValue({
                    ssmNum: val,
                  });
                }}
              />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Business Registration File</p>} name="ssmFile" hasFeedback className={editUserData.ssmDoc !== "" ? "hidden" : "visible"}>
              <Upload {...pdfProps}>
                <Button className="text-white flex items-center py-2 px-4 Upload-btn hover:text-white focus:text-white">
                  <UploadOutlined className="text-xl text-white" />
                  Upload File
                </Button>
              </Upload>
            </Form.Item>
            <div className="1000:flex justify-between">
              <Form.Item label={<p className="font-semibold">State</p>} name="state" hasFeedback className="1000:w-49%">
                <Select
                  onChange={(value) => {
                    setSelectState(value.replace(/\s/g, ""));
                    edit.setFieldsValue({ postCode: "" });
                  }}
                >
                  {STATE.map((val) => (
                    <Option value={val}>{val}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label={<p className="font-semibold">Postcode</p>} name="postCode" hasFeedback className="1000:w-49%">
                <Select showSearch optionFilterProp="children" disabled={selectState === "" ? true : false}>
                  {selectState !== "" ? POSTCODE[selectState].map((val) => <Option value={val}>{val}</Option>) : null}
                </Select>
              </Form.Item>
            </div>
            <Form.Item label={<p className="font-semibold">MSIC</p>} name="msic" hasFeedback>
              <Select showSearch optionFilterProp="children" style={{ width: "100%" }}>
                {shopMSIC}
              </Select>
            </Form.Item>
            <div className="700:flex justify-between ">
              <Form.Item label={<p className="font-semibold">Account Status</p>} hasFeedback className="700:w-full 1000:max-w-full" name="status" valuePropName="checked">
                <Switch
                  checkedChildren="ACTIVE"
                  unCheckedChildren="INACTIVE"
                  className="switchButton max-w-120px"
                  onChange={(value) => {
                    editUserData.status = value === true ? "ACTIVE" : "INACTIVE";
                    setEditUserData(editUserData);
                  }}
                />
              </Form.Item>
            </div>
            <Form.Item label={<p className="font-semibold">Verification PIC</p>} name="approvedBy" hasFeedback>
              <Select style={{ width: "100%" }}>
                {allAdminData.map((val) => (
                  <Option value={val.id}>{val.firstName + " " + val.lastName}</Option>
                ))}
              </Select>
            </Form.Item>
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

  const addSubscription = () => {
    return (
      <Modal visible={addSubscriptionVisible} className="Modal-rounded" footer={null} onCancel={() => setAddSubscriptionVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }} closable={false}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Add Subscription Information</p>
        </div>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitAddSubscription}>
            <Form.Item
              label={<p className="font-semibold">Subscription Plan</p>}
              name="subscriptionPlan"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select subscription plan!",
                },
              ]}
            >
              <Select style={{ width: "100%" }}>
                {SUSBSCRIPTIONPLAN.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold">Subscription Period</p>}
              name="subscriptionPeriod"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select subscription period!",
                },
              ]}
            >
              <Select style={{ width: "100%" }}>
                {SUSBSCRIPTIONPERIOD.map((val) => (
                  <Option value={val.value}>{val.name}</Option>
                ))}
              </Select>
            </Form.Item>

            {/* <Form.Item label={<p className="font-semibold">Verification PIC</p>} name="approvedBy" hasFeedback>
              <Select style={{ width: "100%" }}>
                {allAdminData.map((val) => (
                  <Option value={val.value}>{val.name}</Option>
                ))}
              </Select>
            </Form.Item> */}

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

  const editSubscription = () => {
    return (
      <Modal visible={editSubscriptionVisible} className="Modal-rounded" footer={null} onCancel={() => setEditSubscriptionVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Edit Subscription Information</p>
        </div>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitEditSubscription} form={editSubs}>
            <Form.Item
              label={<p className="font-semibold">Subscription Plan</p>}
              name="subscriptionPlan"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select subscription plan!",
                },
              ]}
            >
              <Select style={{ width: "100%" }}>
                {SUSBSCRIPTIONPLAN.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold">Subscription Period</p>}
              name="subscriptionPeriod"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select subscription period!",
                },
              ]}
            >
              <Select style={{ width: "100%" }}>
                {SUSBSCRIPTIONPERIOD.map((val) => (
                  <Option value={val.value}>{val.name}</Option>
                ))}
              </Select>
            </Form.Item>
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

  const showSubscription = () => {
    return (
      <Modal visible={subscriptionVisible} className="Modal-rounded-subscription" footer={null} onCancel={() => setSubscriptionVisible(false)} width={1500} bodyStyle={{ overflowY: "scroll" }} closable={false}>
        <div className="flex flex-col 700:flex-row justify-between verticalGap">
          <p className="text-2xl font-semibold">Subscription Information</p>
          <div className="flex flex-row justify-end items-center gap-x-4">
            <Search
              className="self-end flex w-auto Connection-search"
              maxLength={20}
              onSearch={(value) => {
                setCorporateSubscription([]);
                SearchFilter(fullCorporateSubscription, value)
                  .then((res) => {
                    setCorporateSubscription(res);
                  })
                  .catch(() => {
                    setCorporateSubscription(fullCorporateSubscription);
                  });
              }}
            />
            <Button
              className="bg-viewButton hover:bg-viewButton focus:bg-viewButton text-white hover:text-white focus:text-white text-xl px-8 rounded-lg"
              onClick={() => {
                setAddSubscriptionVisible(true);
              }}
            >
              Add
            </Button>
          </div>
        </div>
        <Table
          className="titleRow mt-4"
          dataSource={[...corporateSubscription]}
          locale={{
            emptyText: <p className="text-black italic">There are no results that match your search.</p>,
          }}
          pagination={{ showSizeChanger: true, position: ["bottomLeft"] }}
          scroll={{ x: 800 }}
        >
          <Column title="Subscription Plan" dataIndex="subscriptionPlan" sorter={(a, b) => a.subscriptionPlan - b.subscriptionPlan} showSorterTooltip={false}></Column>
          <Column
            title="Subscription Period"
            dataIndex="subscriptionPeriod"
            sorter={(a, b) => a.subscriptionPeriod - b.subscriptionPeriod}
            showSorterTooltip={false}
            render={(row) => {
              return (
                <p>
                  {row}&ensp;{row > 1 ? "Years" : "Year"}
                </p>
              );
            }}
          />
          <Column title="Subscription Start Date" dataIndex="subscriptionStartDate" sorter={(a, b) => moment(a.subscriptionStartDate).unix() - moment(b.subscriptionStartDate).unix()} showSorterTooltip={false}></Column>
          <Column title="Subscription End Date" dataIndex="subscriptionEndDate" sorter={(a, b) => moment(a.subscriptionEndDate).unix() - moment(b.subscriptionEndDate).unix()} showSorterTooltip={false}></Column>
          <Column
            title=""
            render={(row) => {
              return (
                <div className="flex gap-x-4 items-center justify-center ">
                  <Button
                    className="rounded-2xl bg-viewButton hover:bg-viewButton focus:bg-viewButton text-white hover:text-white focus:text-white items-center flex"
                    onClick={() => {
                      setEditSubscriptionData(row);
                      setEditSubscriptionVisible(true);
                      editSubs.setFieldsValue({
                        subscriptionPlan: row.subscriptionPlan,
                        subscriptionPeriod: row.subscriptionPeriod,
                      });
                    }}
                  >
                    <EditOutlined />
                    Edit
                  </Button>
                </div>
              );
            }}
          ></Column>
        </Table>
      </Modal>
    );
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

  //drop down for msic
  const shopMSIC = msic.map((row) => {
    return <Option value={row.code}>{row.industry + " (" + row.code + ")"}</Option>;
  });

  return (
    <Layout className="min-h-full">
      <Header></Header>
      <Content className="bg-white px-8 1000:px-12 min-h-9/10 w-full pb-8">
        {/* <Row className="flex mt-4">
          <div className="px-2 cursor-default w-49% 700:w-auto">
            <img src={GlobalCompactLogo.src} width={250} className="h-16 700:h-full"></img>
          </div>
          <div className="px-2 cursor-default w-49% 700:w-auto">
            <img src={SmeCorpLogo.src} className="h-16  700:h-full"></img>
          </div>
        </Row> */}
        <Row className="flex justify-end items-center mt-8">
          <div
            className="flex justify-center items-center gap-x-2 cursor-pointer font-semibold text-gray-400 text-lg underline underline-offset-2 decoration-dotted"
            onClick={() => {
              sessionStorage.clear();
              router.push("/");
            }}
          >
            <p>Logout</p>
          </div>
        </Row>
        <Row className="mt-8 min-h-8/10 gap-x-8">
          <Col className="w-full">
            <div className="1000:flex 1000:justify-between">
              <p className="text-2xl font-semibold">Company Dashboard</p>
              <div className="flex flex-row justify-end items-center gap-x-4">
                <Search
                  className="self-end flex w-auto"
                  maxLength={20}
                  onSearch={(value) => {
                    setAllSme([]);
                    SearchFilter(fullAllSme, value)
                      .then((res) => {
                        setAllSme(res);
                      })
                      .catch(() => {
                        setAllSme(fullAllSme);
                      });
                  }}
                />
                <Button
                  className="bg-viewButton hover:bg-viewButton focus:bg-viewButton text-white hover:text-white focus:text-white text-xl px-8 rounded-lg"
                  onClick={() => {
                    setSelectState("");
                    setSelectEntity("");
                    setSelectRegistered(null);
                    setIsSSM(null);
                    setAddSmeVisible(true);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <Table
              className="titleRow mt-4 border-2"
              dataSource={[...allSme]}
              locale={{
                emptyText: <p className="text-black italic">There are no results that match your search. Please invite the company to register on CSI.</p>,
              }}
              onChange={() => {
                setAllSme([]);
                getAllSme();
              }}
              pagination={{ showSizeChanger: true, position: ["bottomLeft"] }}
              scroll={{ x: 800 }}
            >
              <Column title="Company Name" dataIndex="companyName" sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false} className="align-top"></Column>
              <Column title="Main User Name" dataIndex="owner" className="align-top" sorter={(a, b) => a.owner.localeCompare(b.owner)} showSorterTooltip={false}></Column>
              <Column
                title="Registration Number"
                sorter={(a, b) => a.ssmNumber.localeCompare(b.ssmNumber)}
                showSorterTooltip={false}
                className="align-top"
                render={(row) => {
                  return (
                    <a
                      className={row.ssmDoc !== "" ? "text-blue-500 underline" : "text-black cursor-default hover:text-black focus:text-black"}
                      href="#"
                      onClick={() => {
                        let data = WEBURL + "/storage/" + row.ssmDoc;
                        let fileName = row.ssmDoc;
                        let req = new XMLHttpRequest();
                        req.open("GET", data, true);
                        req.responseType = "blob";
                        req.onload = function () {
                          //Convert the Byte Data to BLOB object.
                          let blob = new Blob([req.response], { type: "application/octetstream" });
                          //Check the Browser type and download the File.
                          let isIE = false || !!document.documentMode;
                          if (isIE) {
                            window.navigator.msSaveBlob(blob, fileName);
                          } else {
                            let url = window.URL || window.webkitURL;
                            let link = url.createObjectURL(blob);
                            let a = document.createElement("a");
                            a.setAttribute("download", fileName);
                            a.target = "_blank";
                            a.setAttribute("href", link);
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }
                        };
                        req.send();
                      }}
                    >
                      {row.ssmNumber}
                    </a>
                  );
                }}
              ></Column>
              <Column
                title="Support Doc"
                className="align-top"
                render={(row) => {
                  if (row.isoList !== undefined) {
                    if (row.isoList.length > 0) {
                      return (
                        <div className="flex flex-col">
                          {row.isoList.map((val, index) => (
                            <a
                              className="text-blue-500 underline"
                              href="#"
                              onClick={() => {
                                let data = WEBURL + "/storage/" + row.isoDoc[index];
                                let fileName = row.isoDoc[index].split("/").at(-1);
                                let req = new XMLHttpRequest();
                                req.open("GET", data, true);
                                req.responseType = "blob";
                                req.onload = function () {
                                  //Convert the Byte Data to BLOB object.
                                  let blob = new Blob([req.response], { type: "application/octetstream" });
                                  //Check the Browser type and download the File.
                                  let isIE = false || !!document.documentMode;
                                  if (isIE) {
                                    window.navigator.msSaveBlob(blob, fileName);
                                  } else {
                                    let url = window.URL || window.webkitURL;
                                    let link = url.createObjectURL(blob);
                                    let a = document.createElement("a");
                                    a.setAttribute("download", fileName);
                                    a.target = "_blank";
                                    a.setAttribute("href", link);
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                  }
                                };
                                req.send();
                              }}
                            >
                              {val}
                            </a>
                          ))}
                        </div>
                      );
                    }
                  }
                }}
              ></Column>
              <Column
                title="Account Status"
                sorter={(a, b) => a.status.localeCompare(b.status)}
                showSorterTooltip={false}
                className="align-top  "
                render={(row) => {
                  return (
                    <div>
                      <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" defaultChecked={row.status === "ACTIVE" ? 1 : 0} className="switchButton" onChange={(checked) => updateStatus(checked, row)} />
                    </div>
                  );
                }}
              ></Column>
              <Column title="Verification PIC" dataIndex="approvedBy" className="align-top" sorter={(a, b) => a.approvedBy.localeCompare(b.approvedBy)} showSorterTooltip={false}></Column>
              <Column
                title=""
                className="align-top"
                render={(row) => {
                  return (
                    <div className="flex gap-x-4 items-center justify-center ">
                      <Dropdown
                        overlay={
                          <Menu
                            items={[
                              {
                                key: "1",
                                label: (
                                  <div
                                    className="flex items-center gap-x-2"
                                    onClick={() => {
                                      setSelectState(row.state.replace(/\s/g, ""));
                                      setSelectEntity(row.businessEntity);
                                      setSelectRegistered(row.registeredInEastMy);
                                      setEditSmeVisible(true);
                                      edit.setFieldsValue({
                                        status: row.status === "ACTIVE" ? 1 : 0,
                                        name: row.companyName,
                                        ssmNum: row.ssmNumber,
                                        businessEntity: row.businessEntity,
                                        registered: row.registeredInEastMY,
                                        smeCorpRegistrationNumber: row.ssmCorpRegistrationNumber,
                                        postCode: row.postCode,
                                        msic: row.msic,
                                        approvedBy: row.approvedBy === "-" ? "" : row.approvedBy,
                                        state: row.state,
                                      });
                                      setEditUserData(row);
                                    }}
                                  >
                                    <EditOutlined />
                                    Edit Company Profile
                                  </div>
                                ),
                              },
                              {
                                key: "2",
                                label: (
                                  <div
                                    className="flex items-center gap-x-2"
                                    onClick={() => {
                                      setCorporate(row.id);
                                      setCorporateSubscription(fullSubscription.filter((item) => item.corporateID === row.id));
                                      setFullCorporateSubscription(fullSubscription.filter((item) => item.corporateID === row.id));
                                      setSubscriptionVisible(true);
                                    }}
                                  >
                                    <EditOutlined />
                                    Edit Subscription Information
                                  </div>
                                ),
                              },
                            ]}
                          />
                        }
                      >
                        <Button className="rounded-2xl bg-viewButton hover:bg-viewButton focus:bg-viewButton text-white hover:text-white focus:text-white items-center flex">
                          <EditOutlined />
                          Edit
                        </Button>
                      </Dropdown>
                    </div>
                  );
                }}
              ></Column>
            </Table>
          </Col>
          {addSme()}
          {editSme()}
          {addSubscription()}
          {editSubscription()}
          {showSubscription()}
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
}

export default HomePage;
