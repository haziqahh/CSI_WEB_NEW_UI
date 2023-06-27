import { Button, Layout, Row, Col, Table, Modal, Form, Input, Switch, Select, message } from "antd";
import Header from "./header";
// import SmeCorpLogo from "../../assests/logo/SmeCorp.png";
// import GlobalCompactLogo from "../../assests/logo/globalCompact.png";
import Footer from "../footer";
import { EditOutlined } from "@ant-design/icons";
import Search from "antd/lib/input/Search";
import React, { useState, useEffect } from "react";
import APIHelpers from "../api/apiHelper";
import { DEPARTMENT, POSITIONLEVEL, TITLE } from "../../compenents/config";
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
  const [editUserData, setEditUserData] = useState("");
  const [totalActiveUser, setTotalActiveUser] = useState({});
  const [selectCompany, setSelectCompany] = useState("");

  useEffect(() => {
    getAllSmeCompany();
  }, []);

  useEffect(() => {
    if (allSmeCompanyData.length > 0) {
      getAllSmeUser();
    }
  }, [allSmeCompanyData]);

  const getAllSmeUser = () => {
    APIHelpers.GET("v1/smeUsers")
      .then((res) => {
        if (res.items !== null) {
          let activeUser = new Object();
          let data = res.items;
          data.map((row) => {
            row.companyName = allSmeCompanyData.filter((item) => item.id === row.companyID)[0].companyName;
            row.role = row.role === "ADMIN" ? "Main User" : "Normal User";
            row.contact = "+" + row.contact;
            if (row.mobileContact !== "") {
              row.mobileContact = "+" + row.mobileContact;
            } else {
              row.mobileContact = "-";
            }
            let designation = row.position.split("_");
            row.department = designation[0];
            row.position = designation[1];
            if (row.status === "ACTIVE") {
              if (!(row.companyID in activeUser)) {
                activeUser[row.companyID] = 0;
              }
              activeUser[row.companyID] += 1;
            }
          });
          data.sort((a, b) => a.companyName.localeCompare(b.companyName));
          setTotalActiveUser(activeUser);
          setData(data);
          setFullData(data);
        }
      })
      .catch(() => {});
  };

  const getAllSmeCompany = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items !== null) {
          setAllSmeCompanyData(res.items);
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
    let role = "ADMIN";
    let existAdmin = fullData.findIndex((item) => item.companyID === values.companyID && item.role === "ADMIN");
    if (existAdmin !== -1) {
      role = "USER";
    }
    let data = {
      companyID: values.companyID,
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      position: values.department + "_" + values.position,
      contact: values.contact.slice(1).trim(),
      email: values.email,
      status: values.status,
      password: values.password,
      role: role,
    };

    values.mobile !== undefined ? (data.mobileContact = values.mobile.slice(1).trim()) : null;

    APIHelpers.POST("v1/smeUser", data)
      .then(() => {
        setaddAdminVisible(false);
        add.resetFields();
        message.success({
          content: "Company User added successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        getAllSmeUser();
      })
      .catch((err) => {
        if ("response" in err) {
          if ("data" in err.response) {
            if ("error" in err.response.data) {
              if ("code" in err.response.data.error) {
                if (err.response.data.error.code.includes("email_found")) {
                  message.warning({
                    content: "The email already exists.",
                    style: {
                      fontSize: "20px",
                      marginTop: "100px",
                    },
                    duration: 8,
                  });
                } else {
                  message.error({
                    content: "Fail to add Company User.",
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
        }
        // message.error({
        //   content: "Fail to add Company User.",
        //   style: {
        //     fontSize: "20px",
        //     marginTop: "100px"
        //   },
        //   duration: 8,
        // });
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
      companyID: editUserData.companyID,
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      position: values.department + "_" + values.position,
      contact: values.contact.slice(1).trim(),
      email: values.email,
      status: editUserData.status,
    };

    values.mobile !== undefined ? (data.mobileContact = values.mobile.slice(1).trim()) : null;
    values.password !== undefined ? (data.password = values.password) : null;

    APIHelpers.PUT("v1/smeUser?id=" + editUserData.id, data)
      .then(() => {
        setEditAdminVisible(false);
        edit.resetFields();
        message.success({
          content: "Edit Company User successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        setData([]);
        getAllSmeUser();
      })
      .catch(() => {
        message.error({
          content: "Fail to edit Company User.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
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
    APIHelpers.PUT("v1/smeUser?id=" + id, data)
      .then(() => {
        message.success({
          content: "Status updated successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px",
          },
          duration: 5,
        });
        setData([]);
        getAllSmeUser();
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

  const showCompanyOption = allSmeCompanyData.map((row) => {
    return <Option value={row.id}>{row.companyName + " - " + row.ssmNumber}</Option>;
  });

  const addAdmin = () => {
    return (
      <Modal visible={addAdminVisible} className="Modal-rounded" footer={null} onCancel={() => setaddAdminVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Add Company User</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-xl px-8 mt-8">User Information</p>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitAddSmeUser} form={add}>
            <Form.Item
              label={<p className="font-semibold">Company Name</p>}
              name="companyID"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the Company Name!",
                },
              ]}
            >
              <Select
                onChange={(value) => {
                  setSelectCompany(value);
                  add.setFieldsValue({
                    status: 0,
                  });
                }}
              >
                {showCompanyOption}
              </Select>
            </Form.Item>
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
              label={<p className="font-semibold">Department</p>}
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
              label={<p className="font-semibold">Designation Level</p>}
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
              label={<p className="font-semibold">Mobile No (Optional)</p>}
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
            <Form.Item label={<p className="font-semibold">Account Status</p>} name="status" hasFeedback className="min-w-120px max-w-120px" valuePropName="checked">
              <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" className="switchButton" disabled={totalActiveUser[selectCompany] >= 3 ? true : false} />
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
      firstName: editUserData.firstName,
      lastName: editUserData.lastName,
      status: editUserData.status === "ACTIVE" ? 1 : 0,
      contact: editUserData.contact,
      mobile: editUserData.mobileContact !== "-" ? editUserData.mobileContact : "",
      email: editUserData.email,
      companyID: editUserData.companyName,
      title: editUserData.title,
      department: editUserData.department,
      position: editUserData.position,
    });
    return (
      <Modal visible={editAdminVisible} className="Modal-rounded" footer={null} onCancel={() => setEditAdminVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Edit Company User</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-xl px-8 mt-8">User Information</p>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitEditSmeUser} form={edit}>
            <Form.Item label={<p className="font-semibold">Company Name</p>} name="companyID" hasFeedback>
              <Input disabled></Input>
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Title</p>} name="title" hasFeedback>
              <Select>
                {TITLE.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold">First Name</p>} name="firstName" hasFeedback>
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Last Name</p>} name="lastName" hasFeedback>
              <Input maxLength={100} />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Department</p>} name="department" hasFeedback>
              <Select>
                {DEPARTMENT.map((val) => (
                  <Option value={val}>{val}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Designation Level</p>} name="position" hasFeedback>
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
                      return Promise.reject(new Error("Please input valid mobile contact no!"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <PhoneInput defaultCountry="MY" international />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Email</p>} name="email" hasFeedback>
              <Input maxLength={100} />
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
            <Form.Item label={<p className="font-semibold">Account Status</p>} name="status" hasFeedback className="min-w-120px max-w-120px" valuePropName="checked">
              <Switch
                checkedChildren="ACTIVE"
                unCheckedChildren="INACTIVE"
                className="switchButton"
                disabled={editUserData.status === "INACTIVE" && totalActiveUser[selectCompany] >= 3 ? true : false}
                onChange={(value) => {
                  editUserData.status = value === true ? "ACTIVE" : "INACTIVE";
                  setEditUserData(editUserData);
                }}
              />
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
              <p className="text-2xl font-semibold">Company User Dashboard</p>
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
                    setSelectCompany("");
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
                setData([]);
                getAllSmeUser();
              }}
              pagination={{ showSizeChanger: true, position: ["bottomLeft"] }}
              scroll={{ x: 800 }}
            >
              <Column title="Company Name" dataIndex="companyName" sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false}></Column>
              <Column title="First Name" dataIndex="firstName" sorter={(a, b) => a.firstName.localeCompare(b.firstName)} showSorterTooltip={false}></Column>
              <Column title="Last Name" dataIndex="lastName" sorter={(a, b) => a.lastName.localeCompare(b.lastName)} showSorterTooltip={false}></Column>
              <Column title="Department" dataIndex="department" sorter={(a, b) => a.department.localeCompare(b.department)} showSorterTooltip={false}></Column>
              <Column title="Designation Level" dataIndex="position" sorter={(a, b) => a.position.localeCompare(b.position)} showSorterTooltip={false}></Column>
              <Column title="Contact No." dataIndex="contact" sorter={(a, b) => a.contact.localeCompare(b.contact)} showSorterTooltip={false}></Column>
              <Column title="Mobile Contact No." dataIndex="mobileContact" sorter={(a, b) => a.mobileContact.localeCompare(b.mobileContact)} showSorterTooltip={false}></Column>
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
                      <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" defaultChecked={row.status === "ACTIVE" ? 1 : 0} className="switchButton " onChange={(checked) => updateStatus(checked, row.id)} disabled={row.status === "INACTIVE" && totalActiveUser[row.companyID] >= 3 ? true : false} />
                    </div>
                  );
                }}
              ></Column>
              <Column
                title=""
                render={(row) => {
                  return (
                    <div className="flex gap-x-4 items-center justify-center ">
                      <Button
                        className="rounded-2xl bg-viewButton hover:bg-viewButton focus:bg-viewButton text-white hover:text-white focus:text-white items-center flex"
                        onClick={() => {
                          setSelectCompany(row.companyID);
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
