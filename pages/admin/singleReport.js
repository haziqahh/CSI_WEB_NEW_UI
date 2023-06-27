import { Layout, Row, Col, Table, Tooltip, Tag, Input, Spin, Modal } from "antd";
import Header from "./header";
// import SmeCorpLogo from "../../assests/logo/SmeCorp.png";
// import GlobalCompactLogo from "../../assests/logo/globalCompact.png";
import Footer from "../footer";
import { DownloadOutlined, EyeOutlined, LoadingOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import APIHelpers from "../api/apiHelper";
import { ESGCalculation } from "../api/calculationHelper";
import { MSIC, REPORTURL, WEBURL } from "../../compenents/config";
import { useRouter } from "next/router";
import { SearchFilter } from "../api/searchHelper";
import moment from "moment";

const { Content } = Layout;
const { Column } = Table;
const { Search } = Input;

function HomePage() {
  const router = useRouter();
  const [allSmeCompanyData, setAllSmeCompanyData] = useState([]);
  const [assessment, setAssessment] = useState([]);
  const [fullAssessment, setFullAssessment] = useState([]);
  const [isDownload, setIsDownload] = useState(false);

  useEffect(() => {
    getAllSmeCompany();
  }, []);

  useEffect(() => {
    if (allSmeCompanyData.length > 0) {
      getAllAssessment();
    }
  }, [allSmeCompanyData]);

  const getAllSmeCompany = () => {
    APIHelpers.GET("v1/smes")
      .then((res) => {
        if (res.items !== null) {
          res.items.map((val) => {
            val.industry = MSIC.filter((item) => item.code === val.msic)[0].sector;
          });
          setAllSmeCompanyData(res.items);
        }
      })
      .catch(() => {});
  };

  const getAllAssessment = () => {
    APIHelpers.GET("v1/assessments")
      .then((res) => {
        if (res.items !== null) {
          res.items = res.items.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
          let complete = res.items.filter((item) => item.completionDate !== "0001-01-01T00:00:00Z");
          complete.map((val, index) => {
            APIHelpers.GET("v1/assessmentEntries?assessmentId=" + val.id)
              .then((res) => {
                ESGCalculation(res.items)
                  .then((res) => {
                    let date = new Date(val.completionDate);
                    val.oriDate = date;
                    val.formatCompletionDate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                    let smeCompany = allSmeCompanyData.filter((item) => item.id === val.smeID)[0];
                    val.companyName = smeCompany.companyName;
                    val.industry = smeCompany.industry;
                    val.Env = Math.round(res.Environmental);
                    val.Soc = Math.round(res.Social);
                    val.Gov = Math.round(res.Governance);
                    val.score = Math.round(res.overall);
                    val.approvedBy = smeCompany.approvedBy !== null ? true : false;
                    if (index === complete.length - 1) {
                      setTimeout(() => {
                        setAssessment(complete);
                        setFullAssessment(complete);
                      }, 1000);
                    }
                  })
                  .catch(() => {});
              })
              .catch(() => {});
          });
        }
      })
      .catch(() => {});
  };

  const getESGLevel = (value) => {
    if (value >= 0 && value < 25) {
      return "Beginner";
    } else if (value >= 25 && value < 45) {
      return "Fair";
    } else if (value >= 45 && value < 65) {
      return "Good";
    } else if (value >= 65 && value < 85) {
      return "Progressive";
    } else if (value >= 85 && value <= 100) {
      return "Exceptional";
    }
  };

  const showDownload = () => {
    return (
      <Modal visible={isDownload} className="" footer={null} closable={false} width={600}>
        <div className="flex justify-center items-center gap-x-4">
          <Spin indicator={<LoadingOutlined spin />} />
          <p className="font-semibold text-xl">Please wait for your report to be downloaded.</p>
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
            <div className="flex 1000:flex-row flex-col 1000:flex 1000:justify-between mt-2 overflow-auto verticalGap">
              <p className="text-2xl font-semibold">Single Business Report Dashboard</p>
              <Search
                className="self-end flex w-auto"
                maxLength={20}
                onSearch={(value) => {
                  setAssessment([]);
                  SearchFilter(fullAssessment, value)
                    .then((res) => {
                      setAssessment(res);
                    })
                    .catch(() => {
                      setAssessment(fullAssessment);
                    });
                }}
              />
            </div>
            <Table
              className="titleRow mt-4 border-2"
              dataSource={[...assessment]}
              pagination={{
                showSizeChanger: true,
                position: ["bottomLeft"],
                pageSize: 20,
              }}
              scroll={{ x: 800 }}
            >
              <Column
                title="Assestment ID"
                width={150}
                sorter={(a, b) => a.serialNo.localeCompare(b.serialNo)}
                showSorterTooltip={false}
                render={(row) => {
                  return <p>{row.approvedBy === true ? row.serialNo : "Unknown"}</p>;
                }}
              ></Column>
              <Column title="Company Name" dataIndex="companyName" width={150} sorter={(a, b) => a.companyName.localeCompare(b.companyName)} showSorterTooltip={false}></Column>
              <Column
                title="Sector"
                dataIndex="industry"
                width={150}
                ellipsis={{ showTitle: false }}
                sorter={(a, b) => a.industry.localeCompare(b.industry)}
                showSorterTooltip={false}
                render={(industry) => (
                  <Tooltip placement="topLeft" title={industry}>
                    {industry}
                  </Tooltip>
                )}
              ></Column>
              <Column
                title="Environmental"
                sorter={(a, b) => a.Env - b.Env}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div className="flex items-center">
                      {row.approvedBy === true ? row.Env + "%" : "Unknown"}&emsp;
                      {row.approvedBy === true ? getESGLevel(row.Env) : null}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title="Social"
                sorter={(a, b) => a.Soc - b.Soc}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div>
                      {row.approvedBy === true ? row.Soc + "%" : "Unknown"}&emsp;
                      {row.approvedBy === true ? getESGLevel(row.Soc) : null}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title="Governance"
                sorter={(a, b) => a.Gov - b.Gov}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div>
                      {row.approvedBy === true ? row.Gov + "%" : "Unknown"}&emsp;
                      {row.approvedBy === true ? getESGLevel(row.Gov) : null}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title="ESG Maturity Level"
                sorter={(a, b) => a.score - b.score}
                showSorterTooltip={false}
                width={150}
                render={(row) => {
                  return (
                    <div>
                      {row.approvedBy === true ? row.score + "%" : "Unknown"}&emsp;
                      {row.approvedBy === true ? getESGLevel(row.score) : null}
                    </div>
                  );
                }}
              ></Column>
              <Column
                title="Completion Date"
                width={150}
                sorter={(a, b) => moment(a.oriDate).unix() - moment(b.oriDate).unix()}
                showSorterTooltip={false}
                render={(row) => {
                  return <p>{row.approvedBy === true ? row.formatCompletionDate : "Unknown"}</p>;
                }}
              ></Column>
              <Column
                title=""
                width={150}
                render={(row) => {
                  return (
                    <div className="flex gap-x-4 items-center text-xl">
                      {row.approvedBy === true ? (
                        <Tooltip title="View">
                          <EyeOutlined
                            className="text-view cursor-pointer"
                            onClick={() => {
                              let link = document.createElement("a");
                              link.target = "_blank";
                              link.href = WEBURL + "/esg/indivReport?id=" + row.id + "&token=" + sessionStorage.getItem("accessToken");
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Pending verification">
                          <EyeOutlined className="text-gray-400 cursor-not-allowed" />
                        </Tooltip>
                      )}
                      {row.approvedBy === true ? (
                        <Tooltip title="Download">
                          <DownloadOutlined
                            className="text-share cursor-pointer"
                            onClick={() => {
                              setIsDownload(true);
                              let data = REPORTURL + "/esg?target=" + WEBURL + "/esg/indivPdf?id=" + row.id + "&accessToken=" + sessionStorage.getItem("accessToken") + "&role=admin";
                              let req = new XMLHttpRequest();
                              req.open("GET", data, true);
                              req.responseType = "blob";
                              req.onload = function () {
                                //Convert the Byte Data to BLOB object.
                                let blob = new Blob([req.response], { type: "application/octetstream" });
                                //Check the Browser type and download the File.
                                let isIE = false || !!document.documentMode;
                                if (isIE) {
                                  window.navigator.msSaveBlob(blob, row.companyName + ".pdf");
                                  setIsDownload(false);
                                } else {
                                  let url = window.URL || window.webkitURL;
                                  let link = url.createObjectURL(blob);
                                  let a = document.createElement("a");
                                  a.setAttribute("download", row.companyName + ".pdf");
                                  a.target = "_blank";
                                  a.setAttribute("href", link);
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  setIsDownload(false);
                                }
                              };
                              req.send();
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Pending verification">
                          <DownloadOutlined className="text-gray-400 cursor-not-allowed" />
                        </Tooltip>
                      )}
                    </div>
                  );
                }}
              ></Column>
            </Table>
          </Col>
        </Row>
        {showDownload()}
      </Content>
      <Footer />
    </Layout>
  );
}

export default HomePage;
