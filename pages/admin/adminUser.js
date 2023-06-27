import { Button, Layout, Row, Col, Table, Modal, Form, Input, Switch, Select, message } from "antd";
import Header from "./header";
// import SmeCorpLogo from "../../assests/logo/SmeCorp.png";
// import GlobalCompactLogo from "../../assests/logo/globalCompact.png";
import Footer from "../footer";
import { EditOutlined } from "@ant-design/icons";
import Search from "antd/lib/input/Search";
import React, { useState, useEffect } from "react";
import APIHelpers from "../api/apiHelper";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { SearchFilter } from "../api/searchHelper";
import { useRouter } from "next/router";
const { Content } = Layout;

//example data for table
const { Option } = Select;
const { Column } = Table;

function HomePage() {
  const router = useRouter();
  const [add] = Form.useForm();
  const [edit] = Form.useForm();
  const [addAdminVisible, setaddAdminVisible] = useState(false);
  const [editAdminVisible, setEditAdminVisible] = useState(false);
  const [data, setData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [allSmeCompanyData, setAllSmeCompanyData] = useState([]);
  const [allCorporateCompanyData, setAllCorporateCompanyData] = useState([]);
  const [editUserData, setEditUserData] = useState("");
  const [allCompanyData, setAllCompanyData] = useState([]);
  const [allAdminData, setAllAdminData] = useState([]);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    getAllSmeCompany();
    getAllCorporateCompany();
  }, []);

  useEffect(() => {
    if (allSmeCompanyData.length > 0 && allCorporateCompanyData.length > 0) {
      getAllAdminUser();
      setAllCompanyData([].concat(allSmeCompanyData, allCorporateCompanyData));
    }
  }, [allSmeCompanyData, allCorporateCompanyData]);

  useEffect(() => {
    if (allData.length > 0) {
      let admin = allData.filter((item) => item.role === "ADMIN" || item.role === "USER");
      let data = allData.filter((item) => item.role === "SME_VENDOR" || item.role === "CORPORATE_VENDOR");
      admin.map((val) => {
        val.contact = "+" + val.contact;
        val.approvedBy = val.approvedBy !== null ? (allData.filter((item) => item.id === val.approvedBy).length > 0 ? allData.filter((item) => item.id === val.approvedBy)[0].firstName + " " + allData.filter((item) => item.id === val.approvedBy)[0].lastName : "-") : "-";
      });
      data.map((row) => {
        row.companyId = row.companyName;
        if (row.role === "SME_VENDOR") {
          row.companyName = allSmeCompanyData.filter((item) => item.id === row.companyName)[0].companyName;
        } else {
          row.companyName = allCorporateCompanyData.filter((item) => item.id === row.companyName)[0].companyName;
        }
        row.role = row.role === "SME_VENDOR" ? "SME Main User" : "Corporate Main User";
        row.contact = "+" + row.contact;
        row.approvedBy = admin.filter((item) => item.id === row.approvedBy)[0].firstName + " " + admin.filter((item) => item.id === row.approvedBy)[0].lastName;
      });
      setAllAdminData(admin);
      setData(data.sort((a, b) => a.companyName.localeCompare(b.companyName)));
      setFullData(data.sort((a, b) => a.companyName.localeCompare(b.companyName)));
    }
  }, [allData]);

  const getAllAdminUser = () => {
    APIHelpers.GET("v1/admins")
      .then((res) => {
        if (res.items !== null) {
          setAllData(res.items);
        }
      })
      .catch(() => {});
  };

  const getAllSmeCompany = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items !== null) {
          res.items.map((val) => {
            val.type = "SME_VENDOR";
          });
          setAllSmeCompanyData(res.items);
        }
      })
      .catch(() => {});
  };

  const getAllCorporateCompany = () => {
    APIHelpers.GET("v1/corporates")
      .then((res) => {
        if (res.items !== null) {
          res.items.map((val) => {
            val.type = "CORPORATE_VENDOR";
          });
          setAllCorporateCompanyData(res.items);
        }
      })
      .catch(() => {});
  };

  const submitAddSmeUser = (values) => {
    if (values.status === null || values.status === "") {
      values.status = "INACTIVE";
    } else {
      if (values.status === true || values.status === "true") {
        values.status = "ACTIVE";
      } else {
        values.status = "INACTIVE";
      }
    }
    let data = {
      companyName: values.companyName,
      firstName: values.firstName,
      lastName: values.lastName,
      position: values.position,
      contact: values.contact.slice(1).trim(),
      email: values.email,
      role: values.role,
      status: values.status,
      password: values.password,
      approvedBy: values.approvedBy,
    };

    APIHelpers.POST("v1/admin", data)
      .then(() => {
        setaddAdminVisible(false);
        add.resetFields();
        message.success({
          content: "Admin User added successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 5,
        });
        setData([]);
        getAllAdminUser();
      })
      .catch(() => {
        message.error({
          content: "Fail to add Admin User.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 8,
        });
      });
  };

  const submitEditSmeUser = (values) => {
    if (values.status === null || values.status === "") {
      values.status = "INACTIVE";
    } else {
      if (values.status === true || values.status === "true") {
        values.status = "ACTIVE";
      } else {
        values.status = "INACTIVE";
      }
    }

    let data = {
      companyName: editUserData.companyId,
      firstName: values.firstName,
      lastName: values.lastName,
      position: values.position,
      contact: values.contact,
      email: values.email,
      role: values.role,
      status: editUserData.status,
    };

    values.password !== undefined ? (data.password = values.password) : null;

    APIHelpers.PUT("v1/admin?id=" + editUserData.id, data)
      .then(() => {
        setEditAdminVisible(false);
        edit.resetFields();
        message.success({
          content: "Edit Admin User successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 5,
        });
        setData([]);
        getAllAdminUser();
      })
      .catch(() => {
        message.error({
          content: "Fail to edit Admin User.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 8,
        });
      });
  };

  // update status on table
  const updateStatus = (status, id) => {
    if (status === null || status === "") {
      status = "INACTIVE";
    } else {
      if (status === true || status === "true") {
        status = "ACTIVE";
      } else {
        status = "INACTIVE";
      }
    }
    let data = { id: id, status: status };
    APIHelpers.PUT("v1/admin?id=" + id, data)
      .then(() => {
        getAllAdminUser();
        message.success({
          content: "Status updated successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 5,
        });
      })
      .catch(() => {
        message.error({
          content: "Fail to update status.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 8,
        });
      });
  };

  const showCompanyOption = allCompanyData.map((row) => {
    return <Option value={row.id}>{row.companyName + " - " + row.ssmNumber}</Option>;
  });

  const addAdmin = () => {
    return (
      <Modal visible={addAdminVisible} className="Modal-rounded" footer={null} onCancel={() => setaddAdminVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Add Admin User</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-xl px-8 mt-8">User Information</p>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitAddSmeUser} form={add}>
            <Form.Item
              label={<p className="font-semibold">Company Name</p>}
              name="companyName"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select the Company Name!",
                },
              ]}
            >
              <Select
                onChange={(value) => {
                  let type = allCompanyData.filter((item) => item.id === value)[0].type;
                  add.setFieldsValue({
                    role: type,
                  });
                }}
              >
                {showCompanyOption}
              </Select>
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold">First Name</p>}
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
              label={<p className="font-semibold">Last Name</p>}
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
              label={<p className="font-semibold">Role/Position in Company</p>}
              name="position"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Role or Position in Company",
                },
              ]}
            >
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold">Contact No</p>}
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
              label={<p className="font-semibold">Email</p>}
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
            <Form.Item
              name="password"
              label={<p className="font-semibold">Password</p>}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Password!",
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
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirm"
              label={<p className="font-semibold">Confirm Password</p>}
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
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
              <Input.Password />
            </Form.Item>
            <div className="1000:flex justify-between">
              <Form.Item
                label={<p className="font-semibold">User Classification</p>}
                name="role"
                hasFeedback
                className="1000:w-49%"
                rules={[
                  {
                    required: true,
                    message: "Please select User Classification!",
                  },
                ]}
              >
                <Select style={{ width: 200 }} disabled>
                  <Option value="SME_VENDOR">SME Main User</Option>
                  <Option value="CORPORATE_VENDOR">Corporate Main User</Option>
                </Select>
              </Form.Item>
              <Form.Item label={<p className="font-semibold">Account Status</p>} name="status" hasFeedback className="w-full 1000:w-49%" valuePropName="checked">
                <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" className="switchButton max-w-120px " />
              </Form.Item>
            </div>
            <Form.Item
              label={<p className="font-semibold">Approved By</p>}
              name="approvedBy"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please select approved by which admin!",
                },
              ]}
            >
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

  const editAdmin = () => {
    edit.setFieldsValue({
      companyName: editUserData.companyName,
      firstName: editUserData.firstName,
      lastName: editUserData.lastName,
      status: editUserData.status === "ACTIVE" ? 1 : 0,
      contact: editUserData.contact,
      mobile: editUserData.mobileContact !== "-" ? editUserData.mobileContact : "",
      email: editUserData.email,
      position: editUserData.position,
      role: editUserData.role,
    });
    return (
      <Modal visible={editAdminVisible} className="Modal-rounded" footer={null} onCancel={() => setEditAdminVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Edit SME User</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-xl px-8 mt-8">User Information</p>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitEditSmeUser} form={edit}>
            <Form.Item label={<p className="font-semibold">Company Name</p>} name="companyName" hasFeedback>
              <Input disabled></Input>
            </Form.Item>
            <Form.Item label={<p className="font-semibold">First Name</p>} name="firstName" hasFeedback>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Last Name</p>} name="lastName" hasFeedback>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Role/Position in Company</p>} name="position" hasFeedback>
              <Input maxLenght={50} />
            </Form.Item>
            <Form.Item
              label={<p className="font-semibold">Contact No.</p>}
              name="contact"
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
            <Form.Item label={<p className="font-semibold">Email</p>} name="email" hasFeedback>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
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
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={["password"]}
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
              <Input.Password />
            </Form.Item>
            <div className="1000:flex justify-between">
              <Form.Item label={<p className="font-semibold">User Classification</p>} name="role" hasFeedback className="1000:w-49%">
                <Select style={{ width: 200 }} placeholder="Select User Classification" disabled>
                  <Option value="SME_VENDOR">SME Main User</Option>
                  <Option value="CORPORATE_VENDOR">Corporate Main User</Option>
                </Select>
              </Form.Item>
              <Form.Item label={<p className="font-semibold">Account Status</p>} name="status" hasFeedback className="1000:w-49%" valuePropName="checked">
                <Switch
                  checkedChildren="ACTIVE"
                  unCheckedChildren="INACTIVE"
                  defaultChecked={false}
                  className="switchButton"
                  onChange={(value) => {
                    editUserData.status = value === true ? "ACTIVE" : "INACTIVE";
                    setEditAdminData(editUserData);
                  }}
                />
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

  return (
    <Layout className="min-h-full">
      <Header></Header>
      <Content className="bg-white px-8 1000:px-12 min-h-9/10 w-full pb-8">
        {/* <Row className="flex mt-4">
          <div className="px-2 cursor-default w-49% 700:w-auto">
            <img src={GlobalCompactLogo.src} width={250} className="h-16 700:h-full"></img>
          </div>
          <div className="px-2 cursor-default w-49% 700:w-auto">
            <img src={SmeCorpLogo.src} className="h-16 700:h-full"></img>
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
            <div className="flex flex-col 700:flex-row justify-between verticalGap">
              <p className="text-2xl font-semibold">Admin User Dashboard</p>
              <div className="flex flex-row justify-end items-center gap-x-4">
                <Search
                  className="self-end flex w-auto"
                  maxLength={20}
                  onSearch={(value) => {
                    setData([]);
                    SearchFilter(fullData, value)
                      .then((res) => {
                        setData(res);
                      })
                      .catch(() => {
                        setData(fullData);
                      });
                  }}
                />
                <Button
                  className="bg-viewButton hover:bg-viewButton focus:bg-viewButton text-white hover:text-white focus:text-white text-xl px-8 rounded-lg"
                  onClick={() => {
                    setaddAdminVisible(true);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <Table
              className="titleRow mt-4 border-2"
              dataSource={[...data]}
              locale={{
                emptyText: <p className="text-black italic">There are no results that match your search. Please invite the company to register on CSI.</p>,
              }}
              onChange={() => {
                setData([])
                getAllAdminUser()
              }}
              pagination={{ showSizeChanger: true, position: ["bottomLeft"] }}
              scroll={{ x: 800 }}
            >
              <Column title="Company Name" dataIndex="companyName" sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false}></Column>
              <Column title="First Name" dataIndex="firstName" sorter={(a, b) => a.firstName.localeCompare(b.firstName)} showSorterTooltip={false}></Column>
              <Column title="Last Name" dataIndex="lastName" sorter={(a, b) => a.lastName.localeCompare(b.lastName)} showSorterTooltip={false}></Column>
              <Column title="Role/Position in Company" dataIndex="position" sorter={(a, b) => a.position.localeCompare(b.position)} showSorterTooltip={false}></Column>
              <Column title="Contact No." dataIndex="contact" sorter={(a, b) => a.contact.localeCompare(b.contact)} showSorterTooltip={false}></Column>
              <Column title="Email" dataIndex="email" sorter={(a, b) => a.email.localeCompare(b.email)} showSorterTooltip={false}></Column>
              <Column title="User Classification" dataIndex="role" sorter={(a, b) => a.role.localeCompare(b.role)} showSorterTooltip={false}></Column>
              <Column
              className=""
                title="Account Status"
                sorter={(a, b) => a.status.localeCompare(b.status)}
                showSorterTooltip={false}
                render={(row) => {
                  return (
                    <div>
                      <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" defaultChecked={row.status} className="switchButton " onChange={(checked) => updateStatus(checked, row.id)} />
                    </div>
                  );
                }}
              ></Column>
              <Column title="Approved By" sorter={(a, b) => a.approvedBy.localeCompare(b.approvedBy)} showSorterTooltip={false} dataIndex="approvedBy"></Column>
              <Column
                title=""
                render={(row) => {
                  return (
                    <div className="flex gap-x-4 items-center justify-center ">
                      <Button
                        className="rounded-2xl bg-viewButton hover:bg-viewButton focus:bg-viewButton text-white hover:text-white focus:text-white items-center flex"
                        onClick={() => {
                          setEditUserData(row);
                          setEditAdminVisible(true);
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
          </Col>
          {addAdmin()}
          {editAdmin()}
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
}

export default HomePage;
