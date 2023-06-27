import { Button, Layout, Row, Col, Table, Modal, Form, Input, Switch, message, Select } from "antd";
import Header from "./header";
// import SmeCorpLogo from "../../assests/logo/SmeCorp.png";
// import GlobalCompactLogo from "../../assests/logo/globalCompact.png";
import Footer from "../footer";
import { EditOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import APIHelpers from "../api/apiHelper";
import { SearchFilter } from "../api/searchHelper";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useRouter } from "next/router";

const { Content } = Layout;
const { Column } = Table;
const { Search } = Input;
const { Option } = Select;

function HomePage() {
  const router = useRouter();
  const [add] = Form.useForm();
  const [edit] = Form.useForm();
  const [addAdminVisible, setaddAdminVisible] = useState(false);
  const [editAdminVisible, setEditAdminVisible] = useState(false);
  const [allAdminData, setAllAdminData] = useState([]);
  const [fullAllAdminData, setFullAllAdminData] = useState([]);
  const [editAdminData, setEditAdminData] = useState({});

  useEffect(() => {
    getAllAdmin();
  }, []);

  const getAllAdmin = () => {
    APIHelpers.GET("v1/admins")
      .then((res) => {
        if (res.items !== null) {
          let data = res.items.filter((item) => item.role === "ADMIN" || item.role === "USER");
          data.map((val) => {
            val.contact = "+" + val.contact;
            val.approvedBy = val.approvedBy !== null ? res.items.filter((item) => item.id === val.approvedBy).length > 0 ? (res.items.filter((item) => item.id === val.approvedBy)[0].firstName + " " + res.items.filter((item) => item.id === val.approvedBy)[0].lastName) : "-" : "-";
          });
          setAllAdminData(data.sort((a, b) => a.firstName.localeCompare(b.firstName)));
          setFullAllAdminData(data.sort((a, b) => a.firstName.localeCompare(b.firstName)));
        }
      })
      .catch(() => {});
  };

  //add sme admin data to api
  const submitAddSmeAdmin = (values) => {
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
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      contact: values.contact.slice(1),
      companyName: values.companyName,
      position: values.role,
      password: values.password,
      status: values.status,
      role: "USER",
      approvedBy: values.approvedBy,
    };
    APIHelpers.POST("v1/admin", data)
      .then(() => {
        setaddAdminVisible(false);
        add.resetFields();
        getAllAdmin();
        message.success({
          content: "New Super Admin added successfully.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 5,
        });
      })
      .catch(() => {
        message.error({
          content: "Fail to add new Super Admin. Please try again.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 8,
        });
      });
  };

  //edit sme admin data to api
  const submitEditSmeAdmin = (values) => {
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
    if (editAdminData) {
      values.firstName !== undefined ? form.append("firstName", values.firstName) : null;
      values.lastName !== undefined ? form.append("lastName", values.lastName) : null;
      values.email !== undefined ? form.append("email", values.email) : null;
      values.contact !== undefined ? form.append("contact", values.contact.slice(1)) : null;
      values.companyName !== undefined ? form.append("companyName", values.companyName) : null;
      values.role !== undefined ? form.append("position", values.role) : null;
      values.password !== undefined ? form.append("password", values.password) : null;
      values.status !== undefined ? form.append("status", editAdminData.status) : null;
      values.approvedBy !== undefined ? form.append("approvedBy", values.approvedBy) : null
      APIHelpers.PUT("v1/admin?id=" + editAdminData.id, form, {
        "Content-Type": "multipart/form-data",
      })
        .then(() => {
          setEditAdminVisible(false);
          message.success({
            content: "Edit Super Admin successfully.",
            style: {
              fontSize: "20px",
              marginTop: "100px"
            },
            duration: 5,
          });
          setAllAdminData([]);
          getAllAdmin();
        })
        .catch(() => {
          message.error({
            content: "Fail to edit Super Admin. Please try again.",
            style: {
              fontSize: "20px",
              marginTop: "100px"
            },
            duration: 8,
          });
        });
    }
  };

  //update status on table
  const updateStatus = (checked, row) => {
    if (checked === true || checked === "true") {
      checked = "ACTIVE";
    } else {
      checked = "INACTIVE";
    }
    let data = { id: row.id, email: row.email, status: checked };
    APIHelpers.PUT("v1/admin?id=" + row.id, data)
      .then(() => {
        getAllAdmin();
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
          content: "Fail to update status. Please try again.",
          style: {
            fontSize: "20px",
            marginTop: "100px"
          },
          duration: 8,
        });
      });
  };

  //add admin modal
  const addAdmin = () => {
    return (
      <Modal visible={addAdminVisible} className="Modal-rounded" footer={null} onCancel={() => setaddAdminVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Add Super Admin</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-xl px-8 mt-8">Personal Information</p>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitAddSmeAdmin} form={add}>
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
              name="lastname"
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
            <div className="1000:flex 1000:justify-between">
              <Form.Item
                label={<p className="font-semibold">Email</p>}
                name="email"
                hasFeedback
                className="1000:w-49%"
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
                <Input maxLength={50} />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold">Contact No.</p>}
                name="contact"
                hasFeedback
                className="1000:w-49%"
                rules={[
                  {
                    required: true,
                    message: "Please input the Contact No!",
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
            </div>
            <div className="1000:flex justify-between">
              <Form.Item
                label={<p className="font-semibold">Company Name</p>}
                name="companyName"
                hasFeedback
                className="1000:w-49%"
                rules={[
                  {
                    required: true,
                    message: "Please input the Company Name!",
                  },
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold">Role/Position in Company</p>}
                name="role"
                hasFeedback
                className="1000:w-49%"
                rules={[
                  {
                    required: true,
                    message: "Please input the Role or Position in Company!",
                  },
                ]}
              >
                <Input maxLength={50} />
              </Form.Item>
            </div>
            <Form.Item
              name="password"
              label={<p className="font-semibold">Password</p>}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please input the password!",
                },
                {
                  validator(_, value) {
                    if ((value && (value.length < 8 || value.length > 12)) || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[a-z]/.test(value)) {
                      return Promise.reject(
                        new Error(
                          "Password must contain 8 to 12 characters with at least 1 uppercase letter, lowercase letter and 1 number"
                        )
                      );
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
              <Form.Item label={<p className="font-semibold">Account Status</p>} name="status" hasFeedback className="">
                <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" defaultChecked={false} className="switchButton" />
              </Form.Item>

              <Form.Item label={<p className="font-semibold">Approved By</p>} name="approvedBy" hasFeedback className="1000:w-49%" rules={[
                {
                  required: true,
                  message: "Please select approved by which admin!",
                }
              ]}>
                <Select style={{ width: "100%" }}>
                  {allAdminData.map((val) => (
                    <Option value={val.id}>{val.firstName + " " + val.lastName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item className="mb-2 text-right ">
              <Button
                htmlType="submit"
                className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white"
              >
                SAVE
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  };

  //edit admin modal
  const editAdmin = () => {
    edit.setFieldsValue({
      firstName: editAdminData.firstName,
      lastName: editAdminData.lastName,
      email: editAdminData.email,
      companyName: editAdminData.companyName,
      role: editAdminData.position,
      status: editAdminData.status === "ACTIVE" ? 1 : 0,
      contact: editAdminData.contact
    });
    return (
      <Modal visible={editAdminVisible} className="Modal-rounded" footer={null} onCancel={() => setEditAdminVisible(false)} width={700} bodyStyle={{ overflowY: "scroll" }}>
        <div className="bg-darkprimary px-8 py-8 text-white rounded-t-xl">
          <p className="font-bold text-2xl">Edit Super Admin</p>
        </div>
        <p className="text-formTitleGreen font-semibold text-xl px-8 mt-8">Personal Information</p>
        <div className="px-8 py-8">
          <Form layout="vertical" onFinish={submitEditSmeAdmin} form={edit}>
            <Form.Item label={<p className="font-semibold">First Name</p>} name="firstName" hasFeedback>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item label={<p className="font-semibold">Last Name</p>} name="lastName" hasFeedback>
              <Input maxLength={50} />
            </Form.Item>
            <div className="1000:flex justify-between">
              <Form.Item
                label={<p className="font-semibold">Email</p>}
                name="email"
                hasFeedback
                className="1000:w-49%"
                rules={[
                  {
                    type: "email",
                    message: "Please input valid Email!",
                  },
                ]}
              >
                <Input maxLength={50} />
              </Form.Item>
              <Form.Item
                label={<p className="font-semibold">Contact No.</p>}
                name="contact"
                hasFeedback
                className="1000:w-49%"
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
            </div>
            <div className="1000:flex justify-between">
              <Form.Item label={<p className="font-semibold">Company Name</p>} name="companyName" hasFeedback className="1000:w-49%">
                <Input maxLength={100} />
              </Form.Item>
              <Form.Item label={<p className="font-semibold">Role/Position in Company</p>} name="role" hasFeedback className="1000:w-49%">
                <Input maxLength={50} />
              </Form.Item>
            </div>
            <Form.Item
              name="password"
              label="Password"
              hasFeedback
              rules={[
                {
                  validator(_, value) {
                    if (value) {
                      if (value.length < 8 || value.length > 12 || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[a-z]/.test(value)) {
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
              <Form.Item label={<p className="font-semibold">Account Status</p>} name="status" hasFeedback className="w-3/5 1000:w-49%" valuePropName="checked">
                <Switch checkedChildren="ACTIVE" unCheckedChildren="INACTIVE" className="switchButton" onChange={(value) => {
                  editAdminData.status = value === true ? "ACTIVE" : "INACTIVE"
                  setEditAdminData(editAdminData)
                }} />
              </Form.Item>

              <Form.Item label={<p className="font-semibold">Approved By</p>} name="approvedBy" hasFeedback className="1000:w-49%">
                <Select style={{ width: "100%" }}>
                  {allAdminData.map((val) => (
                    <Option value={val.id}>{val.firstName + " " + val.lastName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item className="mb-2 text-right ">
              <Button
                htmlType="submit"
                className="px-8 rounded-lg bg-gradient-to-t from-#DF3B57 to-#DF3B57CC text-white hover:bg-gradient-to-t focus:bg-gradient-to-t hover:text-white focus:text-white"
              >
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
              <p className="text-2xl font-semibold">Super Admin Dashboard</p>
              <div className="flex flex-row justify-end items-center gap-x-4">
                <Search
                  className="self-end flex w-auto"
                  maxLength={20}
                  onSearch={(value) => {
                    setAllAdminData([]);
                    SearchFilter(fullAllAdminData, value)
                      .then((res) => {
                        setAllAdminData(res);
                      })
                      .catch(() => {
                        setAllAdminData(fullAllAdminData);
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
              dataSource={[...allAdminData]}
              locale={{
                emptyText: <p className="text-black italic">There are no results that match your search. Please invite the company to register on CSI.</p>
              }}
              onChange={() => {
                setAllAdminData([])
                getAllAdmin()
              }}
              pagination={{ showSizeChanger: true, position: ["bottomLeft"] }}
              scroll={{ x: 800 }}
            >
              <Column title="First Name" dataIndex="firstName" sorter={(a, b) => a.firstName.localeCompare(b.firstName)} showSorterTooltip={false}></Column>
              <Column title="Last Name" dataIndex="lastName" sorter={(a, b) => a.lastName.localeCompare(b.lastName)} showSorterTooltip={false}></Column>
              <Column title="Email" dataIndex="email" sorter={(a, b) => a.email.localeCompare(b.email)} showSorterTooltip={false}></Column>
              <Column title="Contact No" dataIndex="contact" sorter={(a, b) => a.contact.localeCompare(b.contact)} showSorterTooltip={false}></Column>
              <Column
                title="Company Name"
                dataIndex="companyName"
                sorter={(a, b) => a.companyName.localeCompare(b.companyName)}
                showSorterTooltip={false}
              ></Column>
              <Column
                title="Role/Position in Company"
                dataIndex="position"
                sorter={(a, b) => a.position.localeCompare(b.position)}
                showSorterTooltip={false}
              ></Column>
              <Column
                title="Status"
                sorter={(a, b) => a.status.localeCompare(b.status)}
                showSorterTooltip={false}
                className=""
                render={(row) => {
                  return (
                    <Switch
                      checkedChildren="ACTIVE"
                      unCheckedChildren="INACTIVE"
                      className="switchButton "
                      disabled={row.role === "ADMIN" ? true : false}
                      defaultChecked={row.status === "ACTIVE" ? 1 : 0}
                      onChange={(checked) => updateStatus(checked, row)}
                    />
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
                        className="rounded-2xl text-white hover:text-white focus:text-white bg-viewButton hover:bg-viewButton focus:bg-viewButton items-center flex"
                        disabled={row.role === "ADMIN" ? true : false}
                        onClick={() => {
                          setEditAdminData(row);
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
